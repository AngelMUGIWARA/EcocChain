import { EstadoLote, ESTADO_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';

const ESTADO_STYLES: Record<EstadoLote, string> = {
  pendiente: 'bg-muted text-muted-foreground',
  en_transito: 'bg-blue-50 text-blue-700 border-blue-200',
  en_acopio: 'bg-amber-50 text-amber-700 border-amber-200',
  reciclado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  comprado: 'bg-primary/10 text-primary border-primary/20',
};

export function EstadoBadge({ estado }: { estado: EstadoLote }) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
      ESTADO_STYLES[estado]
    )}>
      {ESTADO_LABELS[estado]}
    </span>
  );
}
