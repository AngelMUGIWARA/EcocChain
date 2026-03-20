import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { MOCK_LOTES } from '@/lib/mock-data';
import { Truck, Package, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Lote } from '@/lib/types';
import { Button } from '@/components/ui/button';

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
            <Button size="sm" className="w-full">Aceptar recolección y firmar</Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Transportista</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Disponibles" value={disponibles.length} icon={<Package className="h-4 w-4" />} delay={0} />
        <StatCard label="En tránsito" value={enTransito.length} icon={<Truck className="h-4 w-4" />} delay={80} />
        <StatCard label="Entregas hoy" value={1} icon={<MapPin className="h-4 w-4" />} delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Lotes para recoger</h3>
        <LoteTable lotes={disponibles} onSelect={setSelectedLote} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Mis entregas en curso</h3>
        <LoteTable lotes={enTransito} onSelect={setSelectedLote} />
      </div>
    </div>
  );
}
