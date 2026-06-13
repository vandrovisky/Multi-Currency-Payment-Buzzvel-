import { useMemo } from 'react';

/**
 * Currency-formatted amount input.
 *
 * Uses a "cents accumulator": each digit typed shifts the integer amount of
 * minor units, so the field always shows a valid, grouped currency value and
 * there are no caret-position glitches. The form keeps a clean decimal string
 * (major units) that the backend validates as `numeric|gt:0`.
 */
function fractionDigits(currency) {
    try {
        return new Intl.NumberFormat('en', {
            style: 'currency',
            currency,
        }).resolvedOptions().maximumFractionDigits;
    } catch {
        return 2;
    }
}

export default function CurrencyInput({
    value,
    onChange,
    currency = 'EUR',
    className = '',
    ...props
}) {
    const digits = fractionDigits(currency);
    const factor = 10 ** digits;

    const cents = Math.round((parseFloat(value) || 0) * factor);

    const display = useMemo(
        () =>
            new Intl.NumberFormat('en', {
                style: 'currency',
                currency,
            }).format(cents / factor),
        [cents, currency, factor],
    );

    const setCents = (next) => {
        const clamped = Math.max(0, next);
        onChange(digits === 0 ? String(clamped) : (clamped / factor).toFixed(digits));
    };

    const onKeyDown = (e) => {
        if (e.metaKey || e.ctrlKey) return; // allow copy/paste/select-all

        if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            setCents(cents * 10 + Number(e.key));
        } else if (e.key === 'Backspace') {
            e.preventDefault();
            setCents(Math.floor(cents / 10));
        } else if (
            !['Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)
        ) {
            e.preventDefault();
        }
    };

    return (
        <input
            {...props}
            type="text"
            inputMode="numeric"
            value={display}
            onKeyDown={onKeyDown}
            onChange={() => {}}
            className={
                'rounded-md border-zinc-300 bg-white text-right tabular-nums shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 ' +
                className
            }
        />
    );
}
