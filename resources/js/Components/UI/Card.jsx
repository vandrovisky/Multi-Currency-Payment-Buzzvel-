export default function Card({ className = '', children, ...props }) {
    return (
        <div
            {...props}
            className={`rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
        >
            {children}
        </div>
    );
}
