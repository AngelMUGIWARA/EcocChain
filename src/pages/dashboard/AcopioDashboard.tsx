import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { Warehouse, Truck, Package } from 'lucide-react';
import { useState } from 'react';
import { Lote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBatches } from '@/hooks/useBatches';
import { useBatchOperations } from '@/lib/stellar/hooks/useBatchOperations';

export function AcopioDashboard() {
  const { user } = useAuth();
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [pesoRecibido, setPesoRecibido] = useState<string>('');
  const { confirmReception, isLoading: isConfirming } = useBatchOperations();

  // Fetch batches in transit (available to receive)
  const { data: enCamino = [], isLoading: loadingEnCamino } = useBatches({
    estado: 'en_transito',
  });

  // Fetch batches in storage (owned by this acopio)
  const { data: enAcopio = [], isLoading: loadingEnAcopio } = useBatches({
    owner: user?.wallet_address,
    estado: 'en_acopio',
  });

  const handleConfirmReception = async () => {
    if (!selectedLote || !pesoRecibido) return;

    try {
      await confirmReception(selectedLote.batch_id, parseFloat(pesoRecibido));
      setSelectedLote(null);
      setPesoRecibido('');
    } catch (err) {
      console.error('Failed to confirm reception:', err);
    }
  };

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
                <input
                  type="number"
                  placeholder={String(selectedLote.peso_kg)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={pesoRecibido}
                  onChange={e => setPesoRecibido(e.target.value)}
                  min="1"
                />
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleConfirmReception}
                disabled={isConfirming || !pesoRecibido || parseFloat(pesoRecibido) <= 0}
              >
                {isConfirming ? 'Procesando...' : 'Confirmar recepción y firmar'}
              </Button>
            </div>
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-ecochain-primary">Dashboard</h2>
        <p className="text-sm text-ecochain-muted mt-1">Centro de Acopio</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="En camino" value={enCamino.length} icon={<Truck className="h-4 w-4" />} delay={0} />
        <StatCard label="En inventario" value={enAcopio.length} icon={<Warehouse className="h-4 w-4" />} delay={80} />
        <StatCard label="Procesados hoy" value={2} icon={<Package className="h-4 w-4" />} delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Lotes en camino</h3>
        {loadingEnCamino ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <LoteTable lotes={enCamino} onSelect={setSelectedLote} />
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Inventario actual</h3>
        {loadingEnAcopio ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <LoteTable lotes={enAcopio} onSelect={setSelectedLote} />
        )}
      </div>
    </div>
  );
}
