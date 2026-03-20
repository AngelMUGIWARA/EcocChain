import { Lote } from '@/lib/types';
import { EstadoBadge } from './EstadoBadge';

interface LoteTableProps {
  lotes: Lote[];
  onSelect?: (lote: Lote) => void;
  showTokens?: boolean;
}

export function LoteTable({ lotes, onSelect, showTokens = false }: LoteTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50 text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Batch ID</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium text-right">Peso (kg)</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            {showTokens && <th className="px-4 py-3 font-medium text-right">GRT</th>}
          </tr>
        </thead>
        <tbody>
          {lotes.map((lote, i) => (
            <tr
              key={lote.id}
              onClick={() => onSelect?.(lote)}
              className="border-b last:border-0 transition-colors hover:bg-muted/30 cursor-pointer opacity-0 animate-fade-up"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'forwards' }}
            >
              <td className="px-4 py-3 font-mono text-xs">{lote.batch_id}</td>
              <td className="px-4 py-3">{lote.tipo_residuo}</td>
              <td className="px-4 py-3 text-right tabular-nums">{lote.peso_kg.toLocaleString()}</td>
              <td className="px-4 py-3"><EstadoBadge estado={lote.estado} /></td>
              {showTokens && (
                <td className="px-4 py-3 text-right tabular-nums font-medium text-token-foreground">
                  {lote.tokens_grt > 0 ? lote.tokens_grt : '—'}
                </td>
              )}
            </tr>
          ))}
          {lotes.length === 0 && (
            <tr>
              <td colSpan={showTokens ? 5 : 4} className="px-4 py-8 text-center text-muted-foreground">
                Sin lotes registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
