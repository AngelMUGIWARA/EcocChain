import { EstadoLote, ESTADO_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

const ESTADO_STYLES: Record<EstadoLote, string> = {
  // Neutral/inactive — waiting, not yet in motion
  pendiente:   'bg-neutral-100 text-neutral-400 border border-neutral-200',

  // Amber/warm — actively in transit, in motion
  en_transito: 'bg-ecochain-accent/15 text-amber-800 border border-ecochain-accent/40',

  // Sage — received and stored, at rest in facility
  en_acopio:   'bg-emerald-50 text-emerald-800 border border-emerald-200',

  // Forest green — processed, environmental value realized
  reciclado:   'bg-ecochain-primary/10 text-ecochain-primary border border-ecochain-primary/30',

  // Solid primary — final state, transaction complete
  comprado:    'bg-ecochain-primary text-white border border-ecochain-primary',
};

export function EstadoBadge({ estado }: { estado: EstadoLote }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
      ESTADO_STYLES[estado]
    )}>
      {ESTADO_LABELS[estado]}
    </span>
  );
}
