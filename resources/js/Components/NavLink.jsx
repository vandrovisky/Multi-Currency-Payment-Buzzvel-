import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'relative px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ' +
                (active
                    ? 'text-zinc-900 after:absolute after:inset-x-3 after:-bottom-[13px] after:h-px after:bg-zinc-900 dark:text-zinc-100 dark:after:bg-zinc-100'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100') +
                ' ' +
                className
            }
        >
            {children}
        </Link>
    );
}
