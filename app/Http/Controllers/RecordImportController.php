<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceTeamRequest;
use App\Http\Requests\StoreTenantRequest;
use App\Models\ServiceTeam;
use App\Models\Tenant;
use DateTimeInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use OpenSpout\Reader\CSV\Reader as CsvReader;
use OpenSpout\Reader\XLSX\Options;
use OpenSpout\Reader\XLSX\Reader as ExcelReader;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;
use ZipArchive;

class RecordImportController extends Controller
{
    /** @return list<string> */
    private function fields(string $module): array
    {
        return array_keys($module === 'tenants'
            ? (new StoreTenantRequest)->rules()
            : (new StoreServiceTeamRequest)->rules());
    }

    public function template(Request $request): StreamedResponse
    {
        $module = $request->route('module');

        return response()->streamDownload(function () use ($module) {
            $stream = fopen('php://output', 'w');
            if ($stream === false) {
                throw new \RuntimeException('Unable to open template output.');
            }
            fwrite($stream, "\xEF\xBB\xBF");
            fputcsv($stream, $this->fields($module), escape: '');
            fclose($stream);
        }, $module.'-import-template.csv', ['Content-Type' => 'text/csv; charset=UTF-8']);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['file' => ['required', 'file', 'max:5120', 'extensions:xlsx,csv', 'mimes:xlsx,csv,txt']]);
        $module = $request->route('module');
        $file = $request->file('file');
        $isExcel = strtolower($file->getClientOriginalExtension()) === 'xlsx';
        if ($isExcel) {
            $archive = new ZipArchive;
            if ($archive->open($file->getPathname()) !== true) {
                throw ValidationException::withMessages(['file' => 'This is not a valid Excel workbook.']);
            }
            $expandedSize = 0;
            for ($index = 0; $index < $archive->numFiles; $index++) {
                $entry = $archive->statIndex($index);
                if ($entry === false) {
                    $archive->close();
                    throw ValidationException::withMessages(['file' => 'Unable to read this workbook.']);
                }
                $expandedSize += $entry['size'];
            }
            $archive->close();
            if ($expandedSize > 50 * 1024 * 1024) {
                throw ValidationException::withMessages(['file' => 'This workbook is too large when expanded. Split it into smaller files.']);
            }
        }
        if ($isExcel) {
            $options = new Options;
            $options->SHOULD_PRESERVE_EMPTY_ROWS = true;
            $reader = new ExcelReader($options);
        } else {
            $options = new \OpenSpout\Reader\CSV\Options;
            $options->SHOULD_PRESERVE_EMPTY_ROWS = true;
            $reader = new CsvReader($options);
        }
        $fields = $this->fields($module);
        $rows = [];
        try {
            $reader->open($file->getPathname());
            foreach ($reader->getSheetIterator() as $sheet) {
                $headers = null;
                foreach ($sheet->getRowIterator() as $number => $row) {
                    $values = array_map(function ($value) {
                        if ($value instanceof DateTimeInterface) {
                            return $value->format('Y-m-d');
                        }
                        if ($value instanceof \DateInterval) {
                            return $value->format('%H:%I:%S');
                        }

                        return trim((string) $value);
                    }, $row->toArray());
                    if (! array_filter($values, fn ($value) => $value !== '')) {
                        continue;
                    }
                    if ($headers === null) {
                        $headers = array_map(fn ($value) => strtolower(preg_replace('/[\s-]+/', '_', ltrim($value, "\xEF\xBB\xBF"))), $values);
                        $required = $module === 'tenants' ? ['first_name', 'last_name', 'phone'] : ['name', 'specialization', 'phone', 'email'];
                        if (count(array_unique($headers)) !== count($headers) || array_diff($required, $headers) || array_diff($headers, $fields)) {
                            throw ValidationException::withMessages(['file' => 'Columns do not match the template. Use the template headers; status is optional and defaults to active.']);
                        }

                        continue;
                    }
                    if (count($rows) >= 2000) {
                        throw ValidationException::withMessages(['file' => 'Import up to 2,000 records at a time. Split this file into smaller uploads.']);
                    }
                    $data = [];
                    foreach ($headers as $index => $header) {
                        $data[$header] = ($values[$index] ?? '') === '' ? null : $values[$index];
                    }
                    $data['status'] = strtolower(str_replace(' ', '_', $data['status'] ?? 'active'));
                    if (! empty($data['email'])) {
                        $data['email'] = strtolower($data['email']);
                    }
                    $rows[] = ['row' => $number, 'data' => $data];
                }
                break; // Import only the first worksheet.
            }
        } catch (ValidationException $exception) {
            throw $exception;
        } catch (Throwable $exception) {
            report($exception);
            throw ValidationException::withMessages(['file' => 'Unable to read this file. Upload a valid Excel (.xlsx) or UTF-8 CSV file.']);
        } finally {
            $reader->close();
        }
        if ($rows === []) {
            throw ValidationException::withMessages(['file' => 'This file has no records to import.']);
        }
        $lock = Cache::lock('record-import-'.$module, 120);
        if (! $lock->get()) {
            throw ValidationException::withMessages(['file' => 'Another import is running. Please try again shortly.']);
        }
        try {
            $result = DB::transaction(function () use ($rows, $module) {
                $model = $module === 'tenants' ? Tenant::class : ServiceTeam::class;
                $rules = $module === 'tenants' ? (new StoreTenantRequest)->rules() : (new StoreServiceTeamRequest)->rules();
                $phones = [];
                $emails = [];
                foreach ($model::query()->get(['phone', 'email']) as $record) {
                    $phones[$this->phoneKey($record->phone)] = true;
                    if ($record->email) {
                        $emails[strtolower(trim($record->email))] = true;
                    }
                }
                $result = ['imported' => 0, 'duplicates' => 0, 'invalid' => 0, 'issues' => []];
                foreach ($rows as $row) {
                    $validator = Validator::make($row['data'], $rules);
                    $phone = $this->phoneKey($row['data']['phone'] ?? '');
                    $email = $row['data']['email'] ?? null;
                    if ($validator->fails() || $phone === '') {
                        $result['invalid']++;
                        $result['issues'][] = ['row' => $row['row'], 'message' => $validator->fails() ? implode(' ', $validator->errors()->all()) : 'Phone must contain digits.'];
                    } elseif (isset($phones[$phone]) || ($email && isset($emails[$email]))) {
                        $result['duplicates']++;
                        $result['issues'][] = ['row' => $row['row'], 'message' => 'Duplicate email or phone; existing record kept.'];
                    } else {
                        $model::create($validator->validated());
                        $phones[$phone] = true;
                        if ($email) {
                            $emails[$email] = true;
                        }
                        $result['imported']++;
                    }
                }

                return $result;
            });
        } catch (Throwable $exception) {
            report($exception);
            throw ValidationException::withMessages(['file' => 'Import could not be saved. No records from this upload were added. Please try again.']);
        } finally {
            $lock->release();
        }

        return response()->json($result);
    }

    private function phoneKey(string $phone): string
    {
        return preg_replace('/\D/', '', preg_replace('/^00/', '', trim($phone)));
    }
}
