export default function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {subtitle}
                    </p>
                )}
            </div>
            {actions}
        </div>
    );
}
