import StatusBadge from '@/Components/StatusBadge';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { __, useTranslations } from '@/utils/i18n';
import { formatMoney, formatRate } from '@/utils/money';
import { Head, Link, router, usePage } from '@inertiajs/react';

function Row({ label, children }) {
    return (
        <div className="flex items-baseline justify-between gap-6 py-3.5">
            <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
            <dd className="text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">{children}</dd>
        </div>
    );
}

export default function Show({ paymentRequest }) {
    useTranslations();
    const request = paymentRequest.data;
    const { auth } = usePage().props;
    const isFinance = auth.user.role === 'finance';
    const canDecide = isFinance && request.status === 'pending';

    const decide = (action) => {
        router.patch(
            route(`payment-requests.${action}`, request.id),
            {},
            { preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link
                            href={route('dashboard')}
                            className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            ← {__('Back to requests')}
                        </Link>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {request.description}
                        </h2>
                    </div>
                    <StatusBadge status={request.status} />
                </div>
            }
        >
            <Head title={request.description} />

            <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 lg:px-8">
                {/* Amounts */}
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                    <Card className="p-6">
                        <p className="text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            {__('Requested amount')}
                        </p>
                        <p className="mt-2 text-3xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                            {formatMoney(request.amount_local, request.currency)}
                        </p>
                    </Card>
                    <div className="rounded-lg border border-zinc-900 bg-zinc-900 p-6 text-white dark:border-zinc-700">
                        <p className="text-xs uppercase tracking-wider text-zinc-400">
                            {__('Converted to EUR')}
                        </p>
                        <p className="mt-2 text-3xl font-bold tabular-nums">
                            {formatMoney(request.amount_eur, 'EUR')}
                        </p>
                    </div>
                </div>

                {/* Details */}
                <Card className="mt-6">
                <dl className="divide-y divide-zinc-100 dark:divide-zinc-800 px-6 py-2">
                    <Row label={__('Requested by')}>
                        {request.user?.name}
                        <span className="ml-1.5 text-zinc-400">
                            ({request.user?.country} · {request.user?.currency})
                        </span>
                    </Row>
                    <Row label={__('Exchange rate (locked at creation)')}>
                        1 EUR = {formatRate(request.exchange_rate)} {request.currency}
                    </Row>
                    <Row label={__('Rate source')}>{request.rate_source}</Row>
                    <Row label={__('Rate fetched at')}>
                        {new Date(request.rate_fetched_at).toLocaleString('en-GB')}
                    </Row>
                    <Row label={__('Created at')}>
                        {new Date(request.created_at).toLocaleString('en-GB')}
                    </Row>
                    {request.approved_by && (
                        <Row label={request.status === 'approved' ? __('Approved by') : __('Decided by')}>
                            {request.approved_by.name}
                            <span className="ml-1.5 text-zinc-400">
                                on {new Date(request.approved_at).toLocaleString('en-GB')}
                            </span>
                        </Row>
                    )}
                </dl>
                </Card>

                {/* Finance actions */}
                {canDecide && (
                    <Card className="mt-6 flex items-center justify-end gap-3 p-5">
                        <p className="mr-auto text-sm text-zinc-500 dark:text-zinc-400">
                            {__('Review this request as finance:')}
                        </p>
                        <Button variant="danger" size="sm" onClick={() => decide('reject')}>
                            {__('Reject')}
                        </Button>
                        <Button size="sm" onClick={() => decide('approve')}>
                            {__('Approve')}
                        </Button>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
