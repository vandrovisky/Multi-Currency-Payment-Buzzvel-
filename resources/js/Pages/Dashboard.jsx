import StatusBadge from '@/Components/StatusBadge';
import Card from '@/Components/UI/Card';
import EmptyState from '@/Components/UI/EmptyState';
import PageHeader from '@/Components/UI/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { __, useTranslations } from '@/utils/i18n';
import { formatMoney } from '@/utils/money';
import { MagnifyingGlassIcon, PlusIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

const FILTERS = [
    { value: null, label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
];

export default function Dashboard({ paymentRequests, filters }) {
    useTranslations();
    const { auth } = usePage().props;
    const isFinance = auth.user.role === 'finance';

    const [search, setSearch] = useState(filters.search ?? '');
    const isFirstRender = useRef(true);

    // Debounced search: reload the list 350ms after the user stops typing.
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const timer = setTimeout(() => {
            router.get(
                route('dashboard'),
                {
                    ...(filters.status ? { status: filters.status } : {}),
                    ...(search ? { search } : {}),
                },
                { preserveState: true, preserveScroll: true, replace: true },
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const applyFilter = (status) => {
        router.get(
            route('dashboard'),
            {
                ...(status ? { status } : {}),
                ...(search ? { search } : {}),
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title={__('Payment requests')}
                    subtitle={
                        isFinance
                            ? __('Every request across the company, ready for review.')
                            : __('Your requests, submitted in :currency.', {
                                  currency: auth.user.currency,
                              })
                    }
                    actions={
                        <Link
                            href={route('payment-requests.create')}
                            className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                        >
                            <PlusIcon className="h-4 w-4" />
                            {__('New request')}
                        </Link>
                    }
                />
            }
        >
            <Head title={__('Dashboard')} />

            <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
                {/* Toolbar: status filter + search */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800">
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
                                    {__(filter.label)}
                                </button>
                            );
                        })}
                    </div>

                    <div className="relative mb-2 w-full sm:mb-0 sm:w-64">
                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={
                                isFinance
                                    ? __('Search description or requester…')
                                    : __('Search description…')
                            }
                            className="block w-full rounded-md border-zinc-300 bg-white py-1.5 pl-9 pr-8 text-sm shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 [&::-webkit-search-cancel-button]:hidden"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                aria-label={__('Clear search')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Request list */}
                <Card className="mt-6 overflow-hidden">
                    {paymentRequests.data.length === 0 ? (
                        <EmptyState
                            title={filters.search ? __('No matches') : __('Nothing here yet')}
                            description={
                                filters.search
                                    ? __('No requests match ":search".', { search: filters.search })
                                    : filters.status
                                      ? __('No :status requests right now.', {
                                            status: __(
                                                filters.status.charAt(0).toUpperCase() +
                                                    filters.status.slice(1),
                                            ).toLowerCase(),
                                        })
                                      : __('Submit your first payment request to get started.')
                            }
                        />
                    ) : (
                        <table className="min-w-full divide-y divide-zinc-100 dark:divide-zinc-800">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                    <th className="px-6 py-4 font-medium">{__('Description')}</th>
                                    {isFinance && (
                                        <th className="px-6 py-4 font-medium">{__('Requested by')}</th>
                                    )}
                                    <th className="px-6 py-4 text-right font-medium">{__('Amount')}</th>
                                    <th className="px-6 py-4 text-right font-medium">EUR</th>
                                    <th className="px-6 py-4 font-medium">{__('Status')}</th>
                                    <th className="px-6 py-4 font-medium">{__('Created')}</th>
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
