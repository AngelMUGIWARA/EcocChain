import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { MOCK_LOTES } from '@/lib/mock-data';
import { ShoppingCart, Package, Leaf } from 'lucide-react';
import { useState } from 'react';
import { Lote } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function CompradoraDashboard() {
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const catalogo = MOCK_LOTES.filter(l => l.estado === 'reciclado');
  const comprados = MOCK_LOTES.filter(l => l.estado === 'comprado');

  if (selectedLote) {
    return (
      <LoteDetail
        lote={selectedLote}
        onBack={() => setSelectedLote(null)}
        actionButton={
          selectedLote.estado === 'reciclado' ? (
            <Button size="sm" className="w-full">Comprar material y firmar</Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Empresa Compradora</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Disponibles" value={catalogo.length} icon={<Package className="h-4 w-4" />} delay={0} />
        <StatCard label="Comprados" value={comprados.length} icon={<ShoppingCart className="h-4 w-4" />} delay={80} />
        <StatCard label="Certificados" value={comprados.length} icon={<Leaf className="h-4 w-4" />} delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Catálogo de material reciclado</h3>
        <LoteTable lotes={catalogo} onSelect={setSelectedLote} showTokens />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Mis compras</h3>
        <LoteTable lotes={comprados} onSelect={setSelectedLote} showTokens />
      </div>
    </div>
  );
}
