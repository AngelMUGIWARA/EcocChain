import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useBatches } from '@/hooks/useBatches';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import type { Lote } from '@/lib/types';

export function LotesPage() {
  const { user } = useAuth();
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);

  const { data: lotes = [], isLoading } = useBatches(
    user?.rol === 'empresa'
      ? { empresa_origen: user.wallet_address }
      : { owner: user?.wallet_address }
  );

  if (selectedLote) {
    return <LoteDetail lote={selectedLote} onBack={() => setSelectedLote(null)} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Lotes</h2>
        <p className="text-sm text-muted-foreground">Todos los lotes asociados a tu cuenta</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Cargando lotes...</div>
      ) : (
        <LoteTable lotes={lotes} onSelect={setSelectedLote} showTokens />
      )}
    </div>
  );
}
