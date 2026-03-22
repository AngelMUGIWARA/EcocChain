import { Lote } from '@/lib/types';
import { MOCK_TRANSFERENCIAS } from '@/lib/mock-data';
import { LoteTimeline } from './LoteTimeline';
import { EstadoBadge } from './EstadoBadge';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';

interface LoteDetailProps {
  lote: Lote;
  onBack: () => void;
  actionButton?: React.ReactNode;
}

export function LoteDetail({ lote, onBack, actionButton }: LoteDetailProps) {
  const transferencias = MOCK_TRANSFERENCIAS.filter(t => t.lote_id === lote.id);

  return (
    <div className="space-y-6 opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-EcoTracer-muted hover:text-EcoTracer-primary transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Info */}
        <div className="rounded-xl border border-EcoTracer-accent/20 bg-EcoTracer-surface p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-EcoTracer-primary">Detalle del lote</h3>
            <EstadoBadge estado={lote.estado} />
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs font-semibold text-EcoTracer-muted">Batch ID</dt>
              <dd className="font-mono text-xs font-semibold mt-1.5 text-EcoTracer-primary">{lote.batch_id}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-EcoTracer-muted">Tipo</dt>
              <dd className="mt-1.5 text-EcoTracer-primary">{lote.tipo_residuo}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold text-EcoTracer-muted">Peso original</dt>
              <dd className="mt-1.5 font-mono tabular-nums text-EcoTracer-primary">{lote.peso_kg} kg</dd>
            </div>
            {lote.peso_recibido && (
              <div>
                <dt className="text-xs font-semibold text-EcoTracer-muted">Peso recibido</dt>
                <dd className="mt-1.5 font-mono tabular-nums text-EcoTracer-primary">{lote.peso_recibido} kg</dd>
              </div>
            )}
            {lote.kg_reciclados && (
              <div>
                <dt className="text-xs font-semibold text-EcoTracer-muted">Kg reciclados</dt>
                <dd className="mt-1.5 font-mono tabular-nums text-EcoTracer-primary">{lote.kg_reciclados} kg</dd>
              </div>
            )}
            {lote.tokens_grt > 0 && (
              <div>
                <dt className="text-xs font-semibold text-EcoTracer-muted">Tokens GRT</dt>
                <dd className="mt-1.5 font-mono font-bold text-EcoTracer-accent tabular-nums">{lote.tokens_grt} GRT</dd>
              </div>
            )}
          </dl>
          {lote.tx_hash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${lote.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-mono text-xs text-EcoTracer-accent/80 hover:text-EcoTracer-accent transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Ver última TX en Stellar Explorer
            </a>
          )}
          {actionButton && <div className="pt-4 border-t border-EcoTracer-accent/20">{actionButton}</div>}
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-EcoTracer-accent/20 bg-EcoTracer-surface p-6">
          <h3 className="font-bold text-lg text-EcoTracer-primary mb-5">Trazabilidad</h3>
          {transferencias.length > 0 ? (
            <LoteTimeline
              transferencias={transferencias}
              estadoActual={lote.estado}
              tokensGrt={lote.tokens_grt}
            />
          ) : (
            <p className="text-sm text-EcoTracer-muted">Sin historial de transferencias</p>
          )}
        </div>
      </div>
    </div>
  );
}
