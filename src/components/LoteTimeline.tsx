import { Transferencia, EstadoLote, ESTADO_LABELS } from '@/lib/types';
import { Check, Clock, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEP_ORDER: EstadoLote[] = ['pendiente', 'en_transito', 'en_acopio', 'reciclado', 'comprado'];

const STEP_LABELS: Record<string, string> = {
  creado:      'Lote creado',
  transferido: 'Transferido',
  confirmado:  'Reciclaje confirmado',
  comprado:    'Material comprado',
};

interface LoteTimelineProps {
  transferencias: Transferencia[];
  estadoActual: EstadoLote;
  tokensGrt?: number;
}

export function LoteTimeline({ transferencias, estadoActual, tokensGrt }: LoteTimelineProps) {
  const currentIdx = STEP_ORDER.indexOf(estadoActual);

  return (
    <div className="space-y-0">
      {transferencias.map((t, i) => {
        const isLast = i === transferencias.length - 1;
        return (
          <div
            key={t.id}
            className="flex gap-3 opacity-0 animate-fade-up"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'forwards' }}
          >
            {/* Connector */}
            <div className="flex flex-col items-center">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-EcoTracer-primary bg-EcoTracer-primary text-white">
                <Check className="h-3.5 w-3.5" />
              </div>
              {!isLast && <div className="w-0.5 flex-1 min-h-[32px] bg-EcoTracer-accent/30" />}
            </div>

            {/* Content */}
            <div className={cn('pb-6', isLast && 'pb-0')}>
              <p className="text-sm font-medium leading-tight text-EcoTracer-primary">
                {STEP_LABELS[t.accion] || t.accion}
                {t.accion === 'confirmado' && tokensGrt ? (
                  <span className="ml-2 inline-flex items-center rounded-full bg-EcoTracer-accent/15 border border-EcoTracer-accent/40 px-2 py-0.5 font-mono text-xs font-semibold text-EcoTracer-accent">
                    {tokensGrt} GRT
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-EcoTracer-muted mt-0.5">
                {t.de_nombre === t.para_nombre ? t.de_nombre : `${t.de_nombre} → ${t.para_nombre}`}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <time className="font-mono text-xs text-EcoTracer-muted tabular-nums">
                  {new Date(t.timestamp).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {' '}
                  {new Date(t.timestamp).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                </time>
                {t.tx_hash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${t.tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 font-mono text-xs text-EcoTracer-accent/70 hover:text-EcoTracer-accent transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    TX
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Pending step */}
      {estadoActual !== 'comprado' && (
        <div className="flex gap-3 opacity-0 animate-fade-up" style={{ animationDelay: `${transferencias.length * 80}ms`, animationFillMode: 'forwards' }}>
          <div className="flex flex-col items-center">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-EcoTracer-border bg-EcoTracer-surface text-EcoTracer-muted">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div>
            <p className="text-sm text-EcoTracer-muted">
              {ESTADO_LABELS[STEP_ORDER[currentIdx + 1]] || 'Siguiente paso'} — pendiente
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
