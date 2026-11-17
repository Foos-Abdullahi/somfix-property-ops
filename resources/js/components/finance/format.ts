export function formatMoney(value: number | string | null | undefined, currency = 'USD', opts: { compact?: boolean; signed?: boolean } = {}): string {
    const n = Number(value ?? 0);
    const safe = Number.isFinite(n) ? n : 0;
    const base = new Intl.NumberFormat('en', {
        style: 'currency',
        currency,
        notation: opts.compact && Math.abs(safe) >= 10000 ? 'compact' : 'standard',
        maximumFractionDigits: opts.compact && Math.abs(safe) >= 10000 ? 1 : 2,
        minimumFractionDigits: opts.compact && Math.abs(safe) >= 10000 ? 0 : 2,
    }).format(Math.abs(safe));
    const sign = safe < 0 ? '-' : opts.signed && safe > 0 ? '+' : '';
    return sign + base;
}

export function formatDate(value: string | null | undefined, withYear = true): string {
    if (!value) return '—';
    const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return '—';
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', ...(withYear ? { year: 'numeric' } : {}) }).format(d);
}

export function formatMonth(value: string | null | undefined): string {
    if (!value) return '—';
    const m = String(value).match(/^(\d{4})-(\d{2})/);
    if (!m) return '—';
    return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(new Date(Number(m[1]), Number(m[2]) - 1, 1));
}

export function humanize(value: string | null | undefined): string {
    if (!value) return '—';
    return value.replaceAll('_', ' ').replaceAll('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const METHOD_LABELS: Record<string, string> = {
    cash: 'Cash',
    evc_plus: 'EVC Plus',
    zaad: 'ZAAD',
    edahab: 'eDahab',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
    other: 'Other',
};

export function methodLabel(value: string | null | undefined): string {
    return value ? (METHOD_LABELS[value] ?? humanize(value)) : '—';
}

export function personName(p: { first_name?: string; last_name?: string } | null | undefined): string {
    return p ? `${p.first_name ?? ''} ${p.last_name ?? ''}`.trim() : '';
}

export const today = () => new Date().toISOString().slice(0, 10);
