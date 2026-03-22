import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'default' | 'token';
  delay?: number;
}

export function StatCard({ label, value, icon, variant = 'default', delay = 0 }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-6 transition-all duration-200',
        'opacity-0 animate-fade-up',
        variant === 'token'
          ? 'border-EcoTracer-accent/30 bg-EcoTracer-primary text-white animate-pulse-token'
          : 'border-EcoTracer-accent/20 bg-EcoTracer-surface hover:border-EcoTracer-accent/40'
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-sm font-medium',
          variant === 'token' ? 'text-white/60' : 'text-EcoTracer-muted'
        )}>
          {label}
        </span>
        <span className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          variant === 'token'
            ? 'bg-EcoTracer-accent/20 text-EcoTracer-accent'
            : 'bg-EcoTracer-primary/10 text-EcoTracer-primary'
        )}>
          {icon}
        </span>
      </div>

      {variant === 'token' ? (
        <p className="mt-3 font-mono text-5xl font-black tabular-nums tracking-tight text-EcoTracer-accent">
          {value}
          <span className="ml-2 text-sm font-semibold text-EcoTracer-accent/60">GRT</span>
        </p>
      ) : (
        <p className="mt-3 text-3xl font-bold tabular-nums tracking-tight text-EcoTracer-primary">
          {value}
        </p>
      )}
    </div>
  );
}
