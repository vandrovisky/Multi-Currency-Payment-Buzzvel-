import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [dark, setDark] = useState(
        () => document.documentElement.classList.contains('dark'),
    );

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark);
        localStorage.theme = dark ? 'dark' : 'light';
    }, [dark]);

    return (
        <button
            type="button"
            onClick={() => setDark((value) => !value)}
            aria-label="Toggle theme"
            className="rounded-md p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
        >
            {dark ? (
                <SunIcon className="h-5 w-5" />
            ) : (
                <MoonIcon className="h-5 w-5" />
            )}
        </button>
    );
}
