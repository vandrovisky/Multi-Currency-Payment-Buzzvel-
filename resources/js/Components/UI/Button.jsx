const VARIANTS = {
    primary:
        'bg-zinc-900 text-white hover:bg-zinc-700 focus-visible:ring-zinc-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300',
    secondary:
        'bg-white text-zinc-900 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 focus-visible:ring-zinc-400 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700 dark:hover:bg-zinc-800',
    danger:
        'text-red-600 ring-1 ring-inset ring-red-200 hover:bg-red-50 focus-visible:ring-red-400 dark:text-red-400 dark:ring-red-900 dark:hover:bg-red-950',
    ghost:
        'text-zinc-500 hover:text-zinc-900 focus-visible:ring-zinc-400 dark:text-zinc-400 dark:hover:text-zinc-100',
};

const SIZES = {
    sm: 'px-3.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
};

export default function Button({
    variant = 'primary',
    size = 'md',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 ${VARIANTS[variant]} ${SIZES[size]} ${
                disabled ? 'cursor-not-allowed opacity-50' : ''
            } ${className}`}
        >
            {children}
        </button>
    );
}
