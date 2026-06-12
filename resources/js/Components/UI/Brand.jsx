export default function Brand({ className = '' }) {
    return (
        <span className={`inline-flex items-baseline gap-0.5 font-semibold tracking-tight ${className}`}>
            ledger
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-60" />
        </span>
    );
}
