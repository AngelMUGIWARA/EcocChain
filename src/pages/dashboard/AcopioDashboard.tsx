import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { ExpandableActionButton } from '@/components/ExpandableActionButton';
import { MOCK_LOTES } from '@/lib/mock-data';
import { Warehouse, Truck, Package } from 'lucide-react';
import { useState } from 'react';
import { Lote } from '@/lib/types';

export function AcopioDashboard() {
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const enCamino = MOCK_LOTES.filter(l => l.estado === 'en_transito');
  const enAcopio = MOCK_LOTES.filter(l => l.estado === 'en_acopio');

  if (selectedLote) {
    return (
      <LoteDetail
        lote={selectedLote}
        onBack={() => setSelectedLote(null)}
        actionButton={
          selectedLote.estado === 'en_transito' ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Peso recibido (kg)</label>
                <input type="number" placeholder={String(selectedLote.peso_kg)} className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
              </div>
              <ExpandableActionButton
                variant="full"
                icon={<Warehouse className="h-4 w-4" />}
                label="Confirmar recepción y firmar"
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
        <p className="text-sm text-EcoTracer-muted mt-1">Centro de Acopio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="En camino" value={enCamino.length} icon={<Truck className="h-4 w-4" />} delay={0} />
        <StatCard label="En inventario" value={enAcopio.length} icon={<Warehouse className="h-4 w-4" />} delay={80} />
        <StatCard label="Procesados hoy" value={2} icon={<Package className="h-4 w-4" />} delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-bold mb-4 text-EcoTracer-primary">Lotes en camino</h3>
        <LoteTable lotes={enCamino} onSelect={setSelectedLote} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3 text-EcoTracer-primary">Inventario actual</h3>
        <LoteTable lotes={enAcopio} onSelect={setSelectedLote} />
      </div>
    </div>
  );
}
