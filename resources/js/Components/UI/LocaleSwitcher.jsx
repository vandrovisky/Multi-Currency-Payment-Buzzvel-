import { useTranslations, setLocale } from '@/utils/i18n';

const LOCALES = [
    { value: 'en', label: 'EN' },
    { value: 'pt_BR', label: 'PT' },
];

export default function LocaleSwitcher() {
    const { locale } = useTranslations();

    return (
        <div className="inline-flex items-center rounded-md border border-zinc-200 p-0.5 dark:border-zinc-800">
            {LOCALES.map(({ value, label }) => {
                const active = locale === value;
                return (
                    <button
                        key={value}
                        type="button"
                        onClick={() => !active && setLocale(value)}
                        className={`rounded px-2 py-1 text-xs font-semibold transition ${
                            active
                                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
}
