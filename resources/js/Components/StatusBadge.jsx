import { __ } from '@/utils/i18n';

const STYLES = {
    pending:
        'bg-amber-50 text-amber-800 ring-amber-600/30 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800',
    approved:
        'bg-emerald-50 text-emerald-700 ring-emerald-600/30 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800',
    rejected:
        'bg-red-50 text-red-700 ring-red-600/30 dark:bg-red-950 dark:text-red-300 dark:ring-red-900',
    expired:
        'bg-zinc-100 text-zinc-500 ring-zinc-400/30 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-700',
};

const DOTS = {
    pending: 'bg-amber-500',
    approved: 'bg-emerald-500',
    rejected: 'bg-red-500',
    expired: 'bg-zinc-400',
};

const LABELS = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
};

export default function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${STYLES[status]}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${DOTS[status]}`} />
            {__(LABELS[status])}
        </span>
    );
}
