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
        'rounded-lg border bg-card p-5 shadow-sm transition-shadow duration-200 hover:shadow-md',
        'opacity-0 animate-fade-up',
        variant === 'token' && 'border-token/30 bg-token/5'
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md',
          variant === 'token' ? 'bg-token/15 text-token' : 'bg-secondary text-primary'
        )}>
          {icon}
        </span>
      </div>
      <p className={cn(
        'mt-2 text-2xl font-semibold tabular-nums tracking-tight',
        variant === 'token' && 'text-token-foreground'
      )}>
        {value}
      </p>
    </div>
  );
}
