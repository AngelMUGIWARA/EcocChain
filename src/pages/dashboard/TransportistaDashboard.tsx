import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { Truck, Package, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Lote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBatches } from '@/hooks/useBatches';
import { useBatchOperations } from '@/lib/stellar/hooks/useBatchOperations';

export function TransportistaDashboard() {
  const { user } = useAuth();
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const { acceptPickup, isLoading: isAccepting } = useBatchOperations();

  // Fetch available batches (pendiente state)
  const { data: disponibles = [], isLoading: loadingDisponibles } = useBatches({
    estado: 'pendiente',
  });

  // Fetch my batches in transit
  const { data: enTransito = [], isLoading: loadingEnTransito } = useBatches({
    owner: user?.wallet_address,
    estado: 'en_transito',
  });

  const handleAcceptPickup = async () => {
    if (!selectedLote) return;

    try {
      await acceptPickup(selectedLote.batch_id);
      setSelectedLote(null); // Close detail view
    } catch (err) {
      console.error('Failed to accept pickup:', err);
    }
  };

  if (selectedLote) {
    return (
      <LoteDetail
        lote={selectedLote}
        onBack={() => setSelectedLote(null)}
        actionButton={
          selectedLote.estado === 'pendiente' ? (
            <Button
              size="sm"
              className="w-full"
              onClick={handleAcceptPickup}
              disabled={isAccepting}
            >
              {isAccepting ? 'Procesando...' : 'Aceptar recolección y firmar'}
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-ecochain-primary">Dashboard</h2>
        <p className="text-sm text-ecochain-muted mt-1">Transportista</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Disponibles" value={disponibles.length} icon={<Package className="h-4 w-4" />} delay={0} />
        <StatCard label="En tránsito" value={enTransito.length} icon={<Truck className="h-4 w-4" />} delay={80} />
        <StatCard label="Entregas hoy" value={1} icon={<MapPin className="h-4 w-4" />} delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Lotes para recoger</h3>
        {loadingDisponibles ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <LoteTable lotes={disponibles} onSelect={setSelectedLote} />
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Mis entregas en curso</h3>
        {loadingEnTransito ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <LoteTable lotes={enTransito} onSelect={setSelectedLote} />
        )}
      </div>
    </div>
  );
}
