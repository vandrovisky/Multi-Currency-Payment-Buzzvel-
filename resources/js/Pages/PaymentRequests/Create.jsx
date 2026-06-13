import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Button from '@/Components/UI/Button';
import Card from '@/Components/UI/Card';
import CurrencyInput from '@/Components/UI/CurrencyInput';
import PageHeader from '@/Components/UI/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { __, useTranslations } from '@/utils/i18n';
import { formatMoney, formatRate } from '@/utils/money';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Create() {
    useTranslations();
    const { auth } = usePage().props;
    const currency = auth.user.currency;

    const { data, setData, post, processing, errors } = useForm({
        description: '',
        amount_local: '',
    });

    const [rate, setRate] = useState(null);
    const [rateError, setRateError] = useState(false);

    useEffect(() => {
        let cancelled = false;

        fetch(route('payment-requests.rate'), {
            headers: { Accept: 'application/json' },
        })
            .then((response) => {
                if (!response.ok) throw new Error('rate unavailable');
                return response.json();
            })
            .then((payload) => {
                if (!cancelled) setRate(payload.rate);
            })
            .catch(() => {
                if (!cancelled) setRateError(true);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const amount = parseFloat(data.amount_local);
    const eurPreview = rate && amount > 0 ? amount / rate : null;

    const submit = (e) => {
        e.preventDefault();
        post(route('payment-requests.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <PageHeader
                    title={__('New payment request')}
                    subtitle={__(
                        "Submitted in your local currency (:currency); converted to EUR at today's rate.",
                        { currency },
                    )}
                />
            }
        >
            <Head title={__('New payment request')} />

            <div className="mx-auto max-w-2xl px-4 pb-16 sm:px-6 lg:px-8">
                <Card className="mt-2 p-8">
                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="description" value={__('Description')} />
                        <TextInput
                            id="description"
                            className="mt-1 block w-full"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="e.g. Team offsite dinner"
                            isFocused
                            required
                        />
                        <InputError message={errors.description} className="mt-2" />
                    </div>

                    <div className="mt-6">
                        <InputLabel htmlFor="amount_local" value={__('Amount (:currency)', { currency })} />
                        <CurrencyInput
                            id="amount_local"
                            currency={currency}
                            className="mt-1 block w-full"
                            value={data.amount_local}
                            onChange={(next) => setData('amount_local', next)}
                        />
                        <InputError message={errors.amount_local} className="mt-2" />
                    </div>

                    {/* Conversion preview */}
                    <div className="mt-6 rounded-md border border-zinc-200 bg-zinc-50 px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
                        {rateError ? (
                            <p className="text-sm text-red-600 dark:text-red-400">
                                {__('Exchange rate service unavailable — you can try again later.')}
                            </p>
                        ) : !rate ? (
                            <p className="animate-pulse text-sm text-zinc-400">
                                {__("Fetching today's exchange rate…")}
                            </p>
                        ) : (
                            <div className="flex items-baseline justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        {__('Estimated in EUR')}
                                    </p>
                                    <p className="mt-1 text-2xl font-bold tabular-nums text-zinc-900 dark:text-zinc-100">
                                        {eurPreview ? formatMoney(eurPreview, 'EUR') : '—'}
                                    </p>
                                </div>
                                <p className="text-right text-xs text-zinc-500 dark:text-zinc-400">
                                    1 EUR = {formatRate(rate)} {currency}
                                    <br />
                                    {__('Final rate is locked at submission.')}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex items-center justify-end gap-4">
                        <Link
                            href={route('dashboard')}
                            className="text-sm text-zinc-500 underline-offset-4 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
                        >
                            {__('Cancel')}
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {__('Submit request')}
                        </Button>
                    </div>
                </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
