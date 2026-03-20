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
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Volver
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Info */}
        <div className="rounded-lg border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Detalle del lote</h3>
            <EstadoBadge estado={lote.estado} />
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs">Batch ID</dt>
              <dd className="font-mono text-xs mt-0.5">{lote.batch_id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Tipo</dt>
              <dd className="mt-0.5">{lote.tipo_residuo}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Peso original</dt>
              <dd className="mt-0.5 tabular-nums">{lote.peso_kg} kg</dd>
            </div>
            {lote.peso_recibido && (
              <div>
                <dt className="text-muted-foreground text-xs">Peso recibido</dt>
                <dd className="mt-0.5 tabular-nums">{lote.peso_recibido} kg</dd>
              </div>
            )}
            {lote.kg_reciclados && (
              <div>
                <dt className="text-muted-foreground text-xs">Kg reciclados</dt>
                <dd className="mt-0.5 tabular-nums">{lote.kg_reciclados} kg</dd>
              </div>
            )}
            {lote.tokens_grt > 0 && (
              <div>
                <dt className="text-muted-foreground text-xs">Tokens GRT</dt>
                <dd className="mt-0.5 font-semibold text-token-foreground tabular-nums">{lote.tokens_grt}</dd>
              </div>
            )}
          </dl>
          {lote.tx_hash && (
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${lote.tx_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Ver última TX en Stellar Explorer
            </a>
          )}
          {actionButton && <div className="pt-2">{actionButton}</div>}
        </div>

        {/* Timeline */}
        <div className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold mb-4">Trazabilidad</h3>
          {transferencias.length > 0 ? (
            <LoteTimeline
              transferencias={transferencias}
              estadoActual={lote.estado}
              tokensGrt={lote.tokens_grt}
            />
          ) : (
            <p className="text-sm text-muted-foreground">Sin historial de transferencias</p>
          )}
        </div>
      </div>
    </div>
  );
}
