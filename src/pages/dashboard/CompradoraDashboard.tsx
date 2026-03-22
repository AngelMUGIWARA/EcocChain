import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { ShoppingCart, Package, Leaf } from 'lucide-react';
import { useState } from 'react';
import { Lote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBatches } from '@/hooks/useBatches';
import { useBatchOperations } from '@/lib/stellar/hooks/useBatchOperations';

export function CompradoraDashboard() {
  const { user } = useAuth();
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const { purchaseBatch, isLoading: isPurchasing } = useBatchOperations();

  // Fetch available recycled batches (catálogo)
  const { data: catalogo = [], isLoading: loadingCatalogo } = useBatches({
    estado: 'reciclado',
  });

  // Fetch purchased batches (owned by this compradora)
  const { data: comprados = [], isLoading: loadingComprados } = useBatches({
    owner: user?.wallet_address,
    estado: 'comprado',
  });

  const handlePurchase = async () => {
    if (!selectedLote) return;

    try {
      await purchaseBatch(selectedLote.batch_id);
      setSelectedLote(null);
    } catch (err) {
      console.error('Failed to purchase batch:', err);
    }
  };

  if (selectedLote) {
    return (
      <LoteDetail
        lote={selectedLote}
        onBack={() => setSelectedLote(null)}
        actionButton={
          selectedLote.estado === 'reciclado' ? (
            <Button
              size="sm"
              className="w-full"
              onClick={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? 'Procesando...' : 'Comprar material y firmar'}
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
        <p className="text-sm text-ecochain-muted mt-1">Empresa Compradora</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Disponibles" value={catalogo.length} icon={<Package className="h-4 w-4" />} delay={0} />
        <StatCard label="Comprados" value={comprados.length} icon={<ShoppingCart className="h-4 w-4" />} delay={80} />
        <StatCard label="Certificados" value={comprados.length} icon={<Leaf className="h-4 w-4" />} delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Catálogo de material reciclado</h3>
        {loadingCatalogo ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <LoteTable lotes={catalogo} onSelect={setSelectedLote} showTokens />
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Mis compras</h3>
        {loadingComprados ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <LoteTable lotes={comprados} onSelect={setSelectedLote} showTokens />
        )}
      </div>
    </div>
  );
}
