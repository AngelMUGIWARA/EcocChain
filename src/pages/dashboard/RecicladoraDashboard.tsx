import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { Recycle, Warehouse, Coins } from 'lucide-react';
import { useState } from 'react';
import { Lote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBatches } from '@/hooks/useBatches';
import { useBatchOperations } from '@/lib/stellar/hooks/useBatchOperations';
import { useGRTBalance } from '@/lib/stellar/hooks/useGRTBalance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function RecicladoraDashboard() {
  const { user } = useAuth();
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [kgReciclados, setKgReciclados] = useState<string>('');
  const { confirmRecycling, isLoading: isConfirming } = useBatchOperations();

  // Fetch GRT balance
  const { data: grtBalance = 0 } = useGRTBalance(user?.wallet_address || null);

  // Fetch batches to process (en_acopio state)
  const { data: porReciclar = [], isLoading: loadingPorReciclar } = useBatches({
    estado: 'en_acopio',
  });

  // Fetch recycled batches (owned by this recicladora)
  const { data: reciclados = [], isLoading: loadingReciclados } = useBatches({
    owner: user?.wallet_address,
    estado: 'reciclado',
  });

  const totalTokensEmitted = reciclados.reduce((s, l) => s + l.tokens_grt, 0);

  const handleConfirmRecycling = async () => {
    if (!selectedLote || !kgReciclados) return;

    try {
      await confirmRecycling(selectedLote.batch_id, parseFloat(kgReciclados));
      setSelectedLote(null);
      setKgReciclados('');
    } catch (err) {
      console.error('Failed to confirm recycling:', err);
    }
  };

  if (selectedLote) {
    return (
      <LoteDetail
        lote={selectedLote}
        onBack={() => setSelectedLote(null)}
        actionButton={
          selectedLote.estado === 'en_acopio' ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground">Kg reales reciclados</label>
                <input
                  type="number"
                  placeholder={String(selectedLote.peso_recibido || selectedLote.peso_kg)}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                  value={kgReciclados}
                  onChange={e => setKgReciclados(e.target.value)}
                  min="1"
                />
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={handleConfirmRecycling}
                disabled={isConfirming || !kgReciclados || parseFloat(kgReciclados) <= 0}
              >
                {isConfirming ? 'Procesando...' : 'Confirmar reciclaje y emitir tokens'}
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
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Planta Recicladora</p>
      </div>

      <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Balance de Tokens GRT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{grtBalance.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">GRT</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            1 kg reciclado = 1 token GRT
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Por reciclar" value={porReciclar.length} icon={<Warehouse className="h-4 w-4" />} delay={0} />
        <StatCard label="Reciclados" value={reciclados.length} icon={<Recycle className="h-4 w-4" />} delay={80} />
        <StatCard label="Tokens emitidos" value={totalTokensEmitted} icon={<Coins className="h-4 w-4" />} variant="token" delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Lotes por procesar</h3>
        {loadingPorReciclar ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <LoteTable lotes={porReciclar} onSelect={setSelectedLote} />
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Historial de reciclaje</h3>
        {loadingReciclados ? (
          <div className="text-center py-8 text-sm text-muted-foreground">Cargando...</div>
        ) : (
          <LoteTable lotes={reciclados} onSelect={setSelectedLote} showTokens />
        )}
      </div>
    </div>
  );
}
