export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-line/70 rounded-xl ${className}`} aria-hidden />;
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="card p-10 text-center space-y-2">
      <p className="font-semibold">{title}</p>
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
      {action ? <div className="pt-3">{action}</div> : null}
    </div>
  );
}
