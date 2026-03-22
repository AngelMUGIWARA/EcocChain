import { cn } from '@/lib/utils';

interface ExpandableActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  /** expand: circular icon-only → grows on hover (header CTAs)
   *  full:   w-full with icon + text always visible (detail panel actions) */
  variant?: 'expand' | 'full';
  className?: string;
}

export function ExpandableActionButton({
  icon,
  label,
  onClick,
  variant = 'expand',
  className,
}: ExpandableActionButtonProps) {
  if (variant === 'full') {
    return (
      <button
        onClick={onClick}
        className={cn(
          'group flex w-full items-center justify-center gap-2 rounded-xl',
          'bg-[#09291D]/80 backdrop-blur-xl border border-white/10',
          'px-4 py-2.5 text-sm font-semibold text-[#ceb795]',
          'transition-[border-color,background-color] duration-300',
          'hover:border-white/30 hover:bg-[#09291D]/90 active:scale-[0.98]',
          className,
        )}
      >
        <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
        <span>{label}</span>
      </button>
    );
  }

  // variant === 'expand'
  return (
    <button
      onClick={onClick}
      className={cn(
        // Base — perfect circle
        'group flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden',
        'rounded-2xl bg-[#09291D]/80 backdrop-blur-xl border border-white/10',
        'text-[#C8A97A]',
        // Expansion transition — only width & border-radius so backdrop-filter stays stable
        'transition-[width,border-radius,border-color] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
        // Expanded state
        'hover:w-44 hover:rounded-2xl hover:border-white/30 active:scale-[0.97]',
        className,
      )}
    >
      {/* Icon — rotates 90° on expand */}
      <span className="flex-shrink-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:rotate-90">
        {icon}
      </span>

      {/* Text — max-width expands immediately, opacity fades in with a 200ms delay
          so the text only becomes visible once the button has grown enough */}
      <span
        className={cn(
          'max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0',
          'transition-[max-width,opacity] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]',
          'group-hover:max-w-[140px] group-hover:opacity-100 group-hover:ml-2.5',
        )}
        style={{ transitionDelay: '0ms, 180ms' }}
      >
        {label}
      </span>
    </button>
  );
}
