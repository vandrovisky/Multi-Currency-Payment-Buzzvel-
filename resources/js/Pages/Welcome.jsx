import BlurText from '@/Components/UI/BlurText';
import Brand from '@/Components/UI/Brand';
import DotGrid from '@/Components/UI/DotGrid';
import { __, setLocale, useTranslations } from '@/utils/i18n';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Head, Link } from '@inertiajs/react';

const COUNTRIES = [
    { currency: 'BRL', country: 'Brazil' },
    { currency: 'USD', country: 'United States' },
    { currency: 'EUR', country: 'Portugal' },
    { currency: 'JPY', country: 'Japan' },
    { currency: 'GBP', country: 'United Kingdom' },
];

function DarkLocaleSwitcher() {
    const { locale } = useTranslations();

    return (
        <div className="inline-flex items-center rounded-md border border-zinc-700 p-0.5">
            {[
                { value: 'en', label: 'EN' },
                { value: 'pt_BR', label: 'PT' },
            ].map(({ value, label }) => {
                const active = locale === value;
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => !active && setLocale(value)}
                        className={`rounded px-2 py-1 text-xs font-semibold transition ${
                            active
                                ? 'bg-zinc-100 text-zinc-900'
                                : 'text-zinc-400 hover:text-zinc-100'
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}

export default function Welcome({ auth }) {
    useTranslations();

    return (
        <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
            <Head title={__('Welcome')} />

            {/* Interactive dot grid background */}
            <div className="absolute inset-0">
                <DotGrid
                    dotSize={5}
                    gap={15}
                    baseColor="#27272a"
                    activeColor="#e4e4e7"
                    proximity={120}
                    shockRadius={250}
                    shockStrength={5}
                    resistance={750}
                    returnDuration={1.5}
                />
            </div>
            {/* Soften the grid behind the copy */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-950/40 to-transparent" />

            <div className="relative flex min-h-screen flex-col">
                {/* Nav */}
                <nav className="flex items-center justify-between px-6 py-6 sm:px-12">
                    <span className="text-xl text-white">
                        <Brand />
                    </span>

                    <div className="flex items-center gap-3">
                        <DarkLocaleSwitcher />
                        {auth.user ? (
                            <Link
                                href={route('dashboard')}
                                className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-300"
                            >
                                {__('Dashboard')}
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="rounded-md px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-white"
                                >
                                    {__('Sign in')}
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="rounded-md bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-300"
                                >
                                    {__('Get started')}
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero */}
                <main className="flex flex-1 items-center px-6 sm:px-12">
                    <div className="mx-auto w-full max-w-4xl">
                        <p className="animate-fade-up text-sm font-medium uppercase tracking-[0.2em] text-zinc-500">
                            {__('Multi-currency payment requests')}
                        </p>
                        <h1 className="mt-4 text-5xl font-semibold leading-tight tracking-tight text-white sm:text-7xl">
                            <BlurText
                                key={__('One ledger,')}
                                text={__('One ledger,')}
                                delay={120}
                                animateBy="words"
                                direction="top"
                            />
                            <BlurText
                                key={__('every currency.')}
                                text={__('every currency.')}
                                delay={120}
                                animateBy="words"
                                direction="top"
                                className="text-zinc-500"
                            />
                        </h1>
                        <p
                            className="mt-6 max-w-xl animate-fade-up text-base leading-relaxed text-zinc-400"
                            style={{ animationDelay: '0.16s' }}
                        >
                            {__(
                                'Submit payment requests in your local currency. The EUR exchange rate is fetched in real time and locked the moment you hit send — finance approves, the numbers never drift.',
                            )}
                        </p>

                        <div
                            className="mt-10 flex flex-wrap items-center gap-4 animate-fade-up"
                            style={{ animationDelay: '0.24s' }}
                        >
                            <Link
                                href={auth.user ? route('dashboard') : route('register')}
                                className="inline-flex items-center gap-2 rounded-md bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-300"
                            >
                                {auth.user ? __('Open dashboard') : __('Create your account')}
                                <ArrowRightIcon className="h-4 w-4" />
                            </Link>
                            {!auth.user && (
                                <Link
                                    href={route('login')}
                                    className="rounded-md px-5 py-2.5 text-sm font-medium text-zinc-300 ring-1 ring-inset ring-zinc-700 transition hover:bg-zinc-900 hover:text-white"
                                >
                                    {__('Sign in')}
                                </Link>
                            )}
                        </div>

                        {/* Currency strip */}
                        <div
                            className="mt-16 flex flex-wrap gap-x-8 gap-y-2 animate-fade-up text-sm tabular-nums text-zinc-600"
                            style={{ animationDelay: '0.32s' }}
                        >
                            {COUNTRIES.map(({ currency, country }) => (
                                <span key={currency}>
                                    {currency} · {__(country)}
                                </span>
                            ))}
                        </div>
                    </div>
                </main>

                <footer className="px-6 py-6 text-xs text-zinc-600 sm:px-12">
                    Buzzvel 2026 Dev Team Test
                </footer>
            </div>
        </div>
    );
}
