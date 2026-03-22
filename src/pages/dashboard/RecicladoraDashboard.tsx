import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { ExpandableActionButton } from '@/components/ExpandableActionButton';
import { MOCK_LOTES } from '@/lib/mock-data';
import { Recycle, Warehouse, Coins } from 'lucide-react';
import { useState } from 'react';
import { Lote } from '@/lib/types';

export function RecicladoraDashboard() {
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const porReciclar = MOCK_LOTES.filter(l => l.estado === 'en_acopio');
  const reciclados = MOCK_LOTES.filter(l => l.estado === 'reciclado' || l.estado === 'comprado');
  const totalTokens = reciclados.reduce((s, l) => s + l.tokens_grt, 0);

  if (selectedLote) {
    return (
      <LoteDetail
        lote={selectedLote}
        onBack={() => setSelectedLote(null)}
        actionButton={
          selectedLote.estado === 'en_acopio' ? (
            <div className="space-y-3">
              <div>
        <label className="text-xs text-EcoTracer-muted">Kg reales reciclados</label>
                <input type="number" placeholder={String(selectedLote.peso_recibido || selectedLote.peso_kg)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <ExpandableActionButton
                variant="full"
                icon={<Recycle className="h-4 w-4" />}
                label="Confirmar reciclaje y emitir tokens"
              />
            </div>
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-EcoTracer-primary">Dashboard</h2>
        <p className="text-sm text-EcoTracer-muted mt-1">Planta Recicladora</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Por reciclar" value={porReciclar.length} icon={<Warehouse className="h-4 w-4" />} delay={0} />
        <StatCard label="Reciclados" value={reciclados.length} icon={<Recycle className="h-4 w-4" />} delay={80} />
        <StatCard label="Tokens emitidos" value={totalTokens} icon={<Coins className="h-4 w-4" />} variant="token" delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-bold mb-4 text-EcoTracer-primary">Lotes por procesar</h3>
        <LoteTable lotes={porReciclar} onSelect={setSelectedLote} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3 text-EcoTracer-primary">Historial de reciclaje</h3>
        <LoteTable lotes={reciclados} onSelect={setSelectedLote} showTokens />
      </div>
    </div>
  );
}
