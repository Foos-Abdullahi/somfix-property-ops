<?php

namespace App\Http\Controllers\Finance;

use App\Http\Controllers\Controller;
use App\Services\Finance\Numbering;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Shared list / create / view / edit / delete behaviour for the finance ledgers.
 * Each ledger supplies its model, validation rules and any derived figures;
 * permissions are enforced by the EnforceAccess middleware from the route name.
 */
abstract class ResourceController extends Controller
{
    /** Route segment and front-end resource key, e.g. "expenses". */
    protected string $key;

    /** @var class-string<Model> */
    protected string $modelClass;

    protected string $label;

    protected string $dateColumn;

    /** @var list<string> */
    protected array $with = [];

    /** [prefix, column] used to generate a reference number on create. */
    protected ?array $number = null;

    /** @return array<string, mixed> */
    abstract protected function rules(Request $request, ?Model $record): array;

    /** @return array<string, mixed> */
    protected function options(?Model $record = null): array
    {
        return [];
    }

    /**
     * @param  Collection<int, Model>  $records
     * @return array<string, mixed>
     */
    protected function stats(Collection $records): array
    {
        return [];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    protected function prepare(array $data, ?Model $record, Request $request): array
    {
        return $data;
    }

    protected function saved(Model $record, bool $created): void {}

    protected function deleted(Model $record): void {}

    /** @return array<string, mixed> */
    protected function defaults(Request $request): array
    {
        return [];
    }

    /** @return array<string, mixed> */
    protected function detail(Model $record): array
    {
        return [];
    }

    public function index(Request $request): Response
    {
        $records = $this->modelClass::query()->with($this->with)->orderByDesc($this->dateColumn)->orderByDesc('id')->get();

        return Inertia::render('finance/resource/index', [
            'resource' => $this->key,
            'records' => $records,
            'stats' => $this->stats($records),
            'options' => $this->options(),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('finance/resource/form', [
            'resource' => $this->key,
            'record' => null,
            'defaults' => $this->defaults($request),
            'options' => $this->options(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->prepare($request->validate($this->rules($request, null)), null, $request);
        if ($this->number) {
            $data[$this->number[1]] = Numbering::next($this->number[0], (new $this->modelClass)->getTable(), $this->number[1]);
        }
        $record = DB::transaction(function () use ($data) {
            $record = $this->modelClass::create($data);
            $this->saved($record, true);

            return $record;
        });

        return $this->done($record, $this->label.' recorded successfully.');
    }

    public function show(Request $request, string $id): Response
    {
        $record = $this->find($id);

        return Inertia::render('finance/resource/show', [
            'resource' => $this->key,
            'record' => $record,
            'detail' => $this->detail($record),
            'options' => $this->options($record),
        ]);
    }

    public function edit(Request $request, string $id): Response
    {
        $record = $this->find($id);

        return Inertia::render('finance/resource/form', [
            'resource' => $this->key,
            'record' => $record,
            'defaults' => [],
            'options' => $this->options($record),
        ]);
    }

    public function update(Request $request, string $id): RedirectResponse
    {
        $record = $this->find($id);
        $data = $this->prepare($request->validate($this->rules($request, $record)), $record, $request);
        DB::transaction(function () use ($record, $data): void {
            $record->update($data);
            $this->saved($record, false);
        });

        return $this->done($record, $this->label.' updated successfully.');
    }

    public function destroy(Request $request, string $id): RedirectResponse
    {
        $record = $this->find($id);
        DB::transaction(function () use ($record): void {
            $record->delete();
            $this->deleted($record);
        });
        Inertia::flash('toast', ['type' => 'success', 'message' => $this->label.' deleted.']);

        return to_route('finance.'.$this->key.'.index');
    }

    protected function find(string $id): Model
    {
        return $this->modelClass::query()->with($this->with)->findOrFail($id);
    }

    protected function done(Model $record, string $message): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return to_route('finance.'.$this->key.'.show', $record->getKey());
    }

    protected function methodRule(): array
    {
        return ['required', 'in:'.implode(',', array_keys(config('finance.payment_methods')))];
    }

    /** @return list<array<string, mixed>> */
    protected function jobOptions(): array
    {
        return \App\Models\Job::query()->orderByDesc('id')->get(['id', 'job_number', 'title'])->all();
    }
}
