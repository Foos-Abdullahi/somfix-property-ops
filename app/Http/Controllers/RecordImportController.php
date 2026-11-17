<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreServiceCatalogRequest;
use App\Http\Requests\StoreServiceTeamRequest;
use App\Http\Requests\StoreTenantRequest;
use App\Models\ServiceCatalog;
use App\Models\ServiceTeam;
use App\Models\Tenant;
use DateTimeInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use OpenSpout\Common\Entity\Row;
use OpenSpout\Reader\CSV\Reader as CsvReader;
use OpenSpout\Reader\XLSX\Options;
use OpenSpout\Reader\XLSX\Reader as ExcelReader;
use OpenSpout\Writer\XLSX\Writer as ExcelWriter;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;
use ZipArchive;

class RecordImportController extends Controller
{
    /** @return array<string, mixed> */
    private function rules(string $module): array
    {
        return match ($module) {
            'tenants' => (new StoreTenantRequest)->rules(),
            'service-list' => (new StoreServiceCatalogRequest)->rules(),
            default => (new StoreServiceTeamRequest)->rules(),
        };
    }

    /** @return list<string> */
    private function fields(string $module): array
    {
        return array_keys($this->rules($module));
    }

    /** @return class-string<\Illuminate\Database\Eloquent\Model> */
    private function model(string $module): string
    {
        return match ($module) {
            'tenants' => Tenant::class,
            'service-list' => ServiceCatalog::class,
            default => ServiceTeam::class,
        };
    }

    /** @return list<string> */
    private function requiredHeaders(string $module): array
    {
        return match ($module) {
            'tenants' => ['first_name', 'last_name', 'phone'],
            'service-list' => ['name', 'category'],
            default => ['name', 'specialization', 'phone', 'email'],
        };
    }

    public function template(Request $request): StreamedResponse
    {
        $module = $request->route('module');
        if ($module === 'service-list') {
            return response()->streamDownload(function () use ($module) {
                $writer = new ExcelWriter;
                $writer->openToFile('php://output');
                $writer->addRow(Row::fromValues($this->fields($module)));
                $writer->close();
            }, 'service-list-import-template.xlsx', ['Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']);
        }

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
                        $required = $this->requiredHeaders($module);
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
                    if (isset($data['price'])) {
                        $data['price'] = str_replace([',', '$', ' '], '', $data['price']);
                    }
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
                $model = $this->model($module);
                $rules = $this->rules($module);
                if ($module === 'service-list') {
                    // Duplicates are handled below by name, so the row is skipped rather than rejected.
                    $rules['name'] = ['required', 'string', 'max:255'];

                    return $this->importServices($rows, $rules);
                }
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

    /**
     * @param  list<array{row: int, data: array<string, mixed>}>  $rows
     * @param  array<string, mixed>  $rules
     * @return array{imported: int, duplicates: int, invalid: int, issues: list<array{row: int, message: string}>}
     */
    private function importServices(array $rows, array $rules): array
    {
        $names = [];
        foreach (ServiceCatalog::query()->pluck('name') as $name) {
            $names[$this->nameKey($name)] = true;
        }
        $result = ['imported' => 0, 'duplicates' => 0, 'invalid' => 0, 'issues' => []];
        foreach ($rows as $row) {
            $validator = Validator::make($row['data'], $rules);
            if ($validator->fails()) {
                $result['invalid']++;
                $result['issues'][] = ['row' => $row['row'], 'message' => implode(' ', $validator->errors()->all())];

                continue;
            }
            $key = $this->nameKey($row['data']['name']);
            if (isset($names[$key])) {
                $result['duplicates']++;
                $result['issues'][] = ['row' => $row['row'], 'message' => 'Service name already exists; existing record kept.'];

                continue;
            }
            ServiceCatalog::create($validator->validated());
            $names[$key] = true;
            $result['imported']++;
        }

        return $result;
    }

    private function nameKey(string $name): string
    {
        return mb_strtolower(preg_replace('/\s+/', ' ', trim($name)));
    }

    private function phoneKey(string $phone): string
    {
        return preg_replace('/\D/', '', preg_replace('/^00/', '', trim($phone)));
    }
}
