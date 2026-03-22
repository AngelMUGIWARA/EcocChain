import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { ExpandableActionButton } from '@/components/ExpandableActionButton';
import { Package, Scale, Coins, Plus } from 'lucide-react';
import { useState } from 'react';
import { Lote, TIPO_RESIDUO_OPTIONS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useBatches } from '@/hooks/useBatches';
import { useBatchOperations } from '@/lib/stellar/hooks/useBatchOperations';

export function EmpresaDashboard() {
  const { user } = useAuth();
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Fetch batches from Supabase (filtered by empresa_origen)
  const { data: lotes = [], isLoading } = useBatches({
    empresa_origen: user?.wallet_address,
  });

  const totalKg = lotes.reduce((s, l) => s + l.peso_kg, 0);
  const totalGrt = lotes.reduce((s, l) => s + l.tokens_grt, 0);

  if (selectedLote) {
    return <LoteDetail lote={selectedLote} onBack={() => setSelectedLote(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-ecochain-primary">Dashboard</h2>
          <p className="text-sm text-ecochain-muted mt-1">Empresa Generadora</p>
        </div>
        <ExpandableActionButton
          icon={<Plus className="h-4 w-4" />}
          label="Crear lote"
          onClick={() => setShowForm(!showForm)}
        />
      </div>

      {showForm && <CreateLoteForm onClose={() => setShowForm(false)} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Lotes creados" value={lotes.length} icon={<Package className="h-4 w-4" />} delay={0} />
        <StatCard label="Kg totales" value={totalKg.toLocaleString()} icon={<Scale className="h-4 w-4" />} delay={80} />
        <StatCard label="Tokens GRT" value={totalGrt} icon={<Coins className="h-4 w-4" />} variant="token" delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-bold mb-4 text-ecochain-primary">Mis lotes</h3>
        {isLoading ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Cargando lotes...
          </div>
        ) : lotes.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No hay lotes creados. Crea tu primer lote arriba.
          </div>
        ) : (
          <LoteTable lotes={lotes} onSelect={setSelectedLote} showTokens />
        )}
      </div>
    </div>
  );
}

function CreateLoteForm({ onClose }: { onClose: () => void }) {
  const [tipoResiduo, setTipoResiduo] = useState(TIPO_RESIDUO_OPTIONS[0]);
  const [pesoKg, setPesoKg] = useState<string>('');
  const { createBatch, isLoading, error } = useBatchOperations();

  const handleSubmit = async () => {
    if (!pesoKg || parseFloat(pesoKg) <= 0) {
      return;
    }

    try {
      await createBatch(tipoResiduo, parseFloat(pesoKg));
      onClose();
    } catch (err) {
      // Error is already handled by the hook (toast shown)
      console.error('Failed to create batch:', err);
    }
  };

  return (
    <div className="rounded-xl border border-ecochain-accent/20 bg-white p-6 space-y-4 opacity-0 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
      <h3 className="font-bold text-lg text-ecochain-primary">Nuevo lote de residuos</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-ecochain-muted">Tipo de residuo</label>
          <select
            className="mt-2 w-full rounded-lg border border-ecochain-accent/20 bg-white px-3 py-2.5 text-sm text-ecochain-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ecochain-accent/30"
            value={tipoResiduo}
            onChange={e => setTipoResiduo(e.target.value as any)}
          >
            {TIPO_RESIDUO_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-ecochain-muted">Peso (kg)</label>
          <input
            type="number"
            placeholder="250"
            className="mt-2 w-full rounded-lg border border-ecochain-accent/20 bg-white px-3 py-2.5 text-sm text-ecochain-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ecochain-accent/30"
            value={pesoKg}
            onChange={e => setPesoKg(e.target.value)}
            min="1"
          />
        </div>
      </div>
      {error && (
        <div className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded">
          {error.userMessage}
        </div>
      )}
      <div className="flex gap-2 justify-end pt-2 border-t border-ecochain-accent/15">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          size="sm"
          onClick={handleSubmit}
          className="gap-1.5"
          disabled={isLoading || !pesoKg || parseFloat(pesoKg) <= 0}
        >
          {isLoading ? 'Procesando...' : 'Crear y firmar con Freighter'}
        </Button>
      </div>
    </div>
  );
}
