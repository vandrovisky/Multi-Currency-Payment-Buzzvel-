import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import Brand from '@/Components/UI/Brand';
import FlashToaster from '@/Components/UI/FlashToaster';
import LocaleSwitcher from '@/Components/UI/LocaleSwitcher';
import ThemeToggle from '@/Components/UI/ThemeToggle';
import { __, useTranslations } from '@/utils/i18n';
import {
    Bars3Icon,
    ChevronDownIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

function Logo() {
    return (
        <Link
            href={route('dashboard')}
            className="text-xl text-zinc-900 dark:text-zinc-100"
        >
            <Brand />
        </Link>
    );
}

export default function AuthenticatedLayout({ header, children }) {
    useTranslations();
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-white dark:bg-zinc-950">
            <FlashToaster />

            <nav className="sticky top-0 z-40 border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-8">
                            <Logo />

                            <div className="hidden items-center gap-1 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    {__('Dashboard')}
                                </NavLink>
                                <NavLink
                                    href={route('payment-requests.create')}
                                    active={route().current('payment-requests.create')}
                                >
                                    {__('New request')}
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden items-center gap-2 sm:flex">
                            <LocaleSwitcher />
                            <ThemeToggle />

                            <Dropdown>
                                <Dropdown.Trigger>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                    >
                                        {user.name}
                                        {user.role === 'finance' && (
                                            <span className="rounded border border-zinc-300 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600 dark:border-zinc-700 dark:text-zinc-300">
                                                Finance
                                            </span>
                                        )}
                                        <ChevronDownIcon className="h-4 w-4 text-zinc-400" />
                                    </button>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href={route('profile.edit')}>
                                        {__('Profile')}
                                    </Dropdown.Link>
                                    <Dropdown.Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                    >
                                        {__('Log Out')}
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>

                        <div className="-me-2 flex items-center gap-1 sm:hidden">
                            <ThemeToggle />
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-500 focus:outline-none dark:hover:bg-zinc-800"
                            >
                                {showingNavigationDropdown ? (
                                    <XMarkIcon className="h-6 w-6" />
                                ) : (
                                    <Bars3Icon className="h-6 w-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' border-t border-zinc-200 dark:border-zinc-800 sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            {__('Dashboard')}
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={route('payment-requests.create')}
                            active={route().current('payment-requests.create')}
                        >
                            {__('New request')}
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-zinc-200 pb-1 pt-4 dark:border-zinc-800">
                        <div className="px-4">
                            <div className="text-base font-medium text-zinc-800 dark:text-zinc-200">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-zinc-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                {__('Profile')}
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                {__('Log Out')}
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="animate-fade-up">
                    <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main
                className="animate-fade-up"
                style={{ animationDelay: '0.08s' }}
            >
                {children}
            </main>
        </div>
    );
}
