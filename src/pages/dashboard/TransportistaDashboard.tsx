import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { ExpandableActionButton } from '@/components/ExpandableActionButton';
import { MOCK_LOTES } from '@/lib/mock-data';
import { Truck, Package, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Lote } from '@/lib/types';

export function TransportistaDashboard() {
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const disponibles = MOCK_LOTES.filter(l => l.estado === 'pendiente');
  const enTransito = MOCK_LOTES.filter(l => l.estado === 'en_transito' && l.owner_actual === 'u2');

  if (selectedLote) {
    return (
      <LoteDetail
        lote={selectedLote}
        onBack={() => setSelectedLote(null)}
        actionButton={
          selectedLote.estado === 'pendiente' ? (
            <ExpandableActionButton
              variant="full"
              icon={<Truck className="h-4 w-4" />}
              label="Aceptar recolección y firmar"
            />
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-EcoTracer-primary">Dashboard</h2>
        <p className="text-sm text-EcoTracer-muted mt-1">Transportista</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Disponibles" value={disponibles.length} icon={<Package className="h-4 w-4" />} delay={0} />
        <StatCard label="En tránsito" value={enTransito.length} icon={<Truck className="h-4 w-4" />} delay={80} />
        <StatCard label="Entregas hoy" value={1} icon={<MapPin className="h-4 w-4" />} delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-bold mb-4 text-EcoTracer-primary">Lotes para recoger</h3>
        <LoteTable lotes={disponibles} onSelect={setSelectedLote} />
      </div>

      <div>
        <h3 className="text-sm font-bold mb-4 text-EcoTracer-primary">Mis entregas en curso</h3>
        <LoteTable lotes={enTransito} onSelect={setSelectedLote} />
      </div>
    </div>
  );
}
