import { InboxIcon } from '@heroicons/react/24/outline';

export default function EmptyState({ title, description, action }) {
    return (
        <div className="px-6 py-20 text-center">
            <InboxIcon className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-4 text-lg font-semibold text-zinc-500 dark:text-zinc-400">
                {title}
            </p>
            {description && (
                <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
                    {description}
                </p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
