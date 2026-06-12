import StatusBadge from '@/Components/StatusBadge';
import Card from '@/Components/UI/Card';
import EmptyState from '@/Components/UI/EmptyState';
import PageHeader from '@/Components/UI/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { formatMoney } from '@/utils/money';
import { PlusIcon } from '@heroicons/react/20/solid';
import { Head, Link, router, usePage } from '@inertiajs/react';

const FILTERS = [
    { value: null, label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
];

export default function Dashboard({ paymentRequests, filters }) {
    const { auth } = usePage().props;
    const isFinance = auth.user.role === 'finance';

    const applyFilter = (status) => {
        router.get(
            route('dashboard'),
            status ? { status } : {},
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title="Payment requests"
                    subtitle={
                        isFinance
                            ? 'Every request across the company, ready for review.'
                            : `Your requests, submitted in ${auth.user.currency}.`
                    }
                    actions={
                        <Link
                            href={route('payment-requests.create')}
                            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                        >
                            <PlusIcon className="h-4 w-4" />
                            New request
                        </Link>
                    }
                />
            }
        >
            <Head title="Dashboard" />

            <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
                {/* Status filter */}
                <div className="border-b border-zinc-200 dark:border-zinc-800">
                    <div className="-mb-px flex gap-1">
                        {FILTERS.map((filter) => {
                            const active = filters.status === filter.value || (!filters.status && !filter.value);
                            return (
                                <button
                                    key={filter.label}
                                    onClick={() => applyFilter(filter.value)}
                                    className={`border-b-2 px-3.5 py-2.5 text-sm font-medium transition ${
                                        active
                                            ? 'border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100'
                                            : 'border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-100'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Request list */}
                <Card className="mt-6 overflow-hidden">
                    {paymentRequests.data.length === 0 ? (
                        <EmptyState
                            title="Nothing here yet"
                            description={
                                filters.status
                                    ? `No ${filters.status} requests right now.`
                                    : 'Submit your first payment request to get started.'
                            }
                        />
                    ) : (
                        <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                    <th className="px-6 py-4 font-medium">Description</th>
                                    {isFinance && (
                                        <th className="px-6 py-4 font-medium">Requested by</th>
                                    )}
                                    <th className="px-6 py-4 text-right font-medium">Amount</th>
                                    <th className="px-6 py-4 text-right font-medium">EUR</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {paymentRequests.data.map((request) => (
                                    <tr
                                        key={request.id}
                                        onClick={() => router.visit(route('payment-requests.show', request.id))}
                                        className="group cursor-pointer transition hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                    >
                                        <td className="max-w-xs truncate px-6 py-4 font-medium text-zinc-900 group-hover:underline group-hover:underline-offset-4 dark:text-zinc-100">
                                            {request.description}
                                        </td>
                                        {isFinance && (
                                            <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                                                {request.user?.name}
                                            </td>
                                        )}
                                        <td className="whitespace-nowrap px-6 py-4 text-right tabular-nums text-zinc-600 dark:text-zinc-300">
                                            {formatMoney(request.amount_local, request.currency)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
                                            {formatMoney(request.amount_eur, 'EUR')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={request.status} />
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                                            {new Date(request.created_at).toLocaleDateString('en-GB', {
                                                day: 'numeric',
                                                month: 'short',
                                            })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>

                {/* Pagination */}
                {paymentRequests.meta.last_page > 1 && (
                    <nav className="mt-6 flex items-center justify-center gap-1">
                        {paymentRequests.meta.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url ?? '#'}
                                preserveScroll
                                className={`rounded-md px-3 py-1.5 text-sm transition ${
                                    link.active
                                        ? 'bg-zinc-900 font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900'
                                        : link.url
                                          ? 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
                                          : 'cursor-default text-zinc-300 dark:text-zinc-700'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </nav>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
