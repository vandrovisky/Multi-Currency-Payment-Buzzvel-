import { router, usePage } from '@inertiajs/react';

/**
 * Translate a string using the messages shared from Laravel's lang/*.json.
 *
 * Mirrors Laravel's `__()` helper: falls back to the key itself when no
 * translation exists, and replaces `:placeholder` tokens.
 *
 * Pulls translations from `window` so it works outside React components too
 * (the shared Inertia prop keeps it in sync on every visit).
 */
export function __(key, replacements = {}) {
    const translations = window.__translations ?? {};
    let line = translations[key] ?? key;

    for (const [token, value] of Object.entries(replacements)) {
        line = line.replace(new RegExp(`:${token}`, 'g'), value);
    }

    return line;
}

/**
 * Switch the active locale; Laravel persists it in the session and every
 * subsequent Inertia response carries the new translations.
 */
export function setLocale(locale) {
    router.post(
        route('locale.update'),
        { locale },
        { preserveScroll: true },
    );
}

/**
 * Hook that keeps `window.__translations` in sync with the shared Inertia
 * props and returns the current locale for components that need it.
 */
export function useTranslations() {
    const { translations, locale } = usePage().props;
    window.__translations = translations ?? {};

    return { __, locale };
}
