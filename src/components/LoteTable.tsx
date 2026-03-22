import { Lote } from '@/lib/types';
import { EstadoBadge } from './EstadoBadge';

interface LoteTableProps {
  lotes: Lote[];
  onSelect?: (lote: Lote) => void;
  showTokens?: boolean;
}

export function LoteTable({ lotes, onSelect, showTokens = false }: LoteTableProps) {
  return (
    <div className="rounded-xl border border-ecochain-accent/20 bg-ecochain-surface overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ecochain-accent/15 bg-ecochain-surface/80 text-left text-xs font-semibold text-ecochain-muted">
            <th className="px-5 py-4 font-medium">Batch ID</th>
            <th className="px-5 py-4 font-medium">Tipo</th>
            <th className="px-5 py-4 font-medium text-right">Peso (kg)</th>
            <th className="px-5 py-4 font-medium">Estado</th>
            {showTokens && <th className="px-5 py-4 font-medium text-right">GRT</th>}
          </tr>
        </thead>
        <tbody>
          {lotes.map((lote, i) => (
            <tr
              key={lote.id}
              onClick={() => onSelect?.(lote)}
              className="border-b border-ecochain-accent/10 last:border-0 transition-colors hover:bg-ecochain-secondary cursor-pointer opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
            >
              <td className="px-5 py-4 font-mono text-xs font-semibold text-ecochain-primary">{lote.batch_id}</td>
              <td className="px-5 py-4 text-ecochain-primary">{lote.tipo_residuo}</td>
              <td className="px-5 py-4 text-right font-mono tabular-nums text-ecochain-primary">{lote.peso_kg.toLocaleString()}</td>
              <td className="px-5 py-4"><EstadoBadge estado={lote.estado} /></td>
              {showTokens && (
                <td className="px-5 py-4 text-right font-mono tabular-nums font-semibold text-ecochain-accent">
                  {lote.tokens_grt > 0 ? lote.tokens_grt : '—'}
                </td>
              )}
            </tr>
          ))}
          {lotes.length === 0 && (
            <tr>
              <td colSpan={showTokens ? 5 : 4} className="px-5 py-8 text-center text-ecochain-muted">
                Sin lotes registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
