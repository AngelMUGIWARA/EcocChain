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
          ? 'border-ecochain-accent/30 bg-ecochain-primary text-white animate-pulse-token'
          : 'border-ecochain-accent/20 bg-ecochain-surface hover:border-ecochain-accent/40'
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center justify-between">
        <span className={cn(
          'text-sm font-medium',
          variant === 'token' ? 'text-white/60' : 'text-ecochain-muted'
        )}>
          {label}
        </span>
        <span className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          variant === 'token'
            ? 'bg-ecochain-accent/20 text-ecochain-accent'
            : 'bg-ecochain-primary/10 text-ecochain-primary'
        )}>
          {icon}
        </span>
      </div>

      {variant === 'token' ? (
        <p className="mt-3 font-mono text-5xl font-black tabular-nums tracking-tight text-ecochain-accent">
          {value}
          <span className="ml-2 text-sm font-semibold text-ecochain-accent/60">GRT</span>
        </p>
      ) : (
        <p className="mt-3 font-mono text-3xl font-bold tabular-nums tracking-tight text-ecochain-primary">
          {value}
        </p>
      )}
    </div>
  );
}
