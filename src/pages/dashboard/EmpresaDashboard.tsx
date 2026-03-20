import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { MOCK_LOTES } from '@/lib/mock-data';
import { Package, Scale, Coins, Plus } from 'lucide-react';
import { useState } from 'react';
import { Lote, TIPO_RESIDUO_OPTIONS } from '@/lib/types';
import { Button } from '@/components/ui/button';

export function EmpresaDashboard() {
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);
  const [showForm, setShowForm] = useState(false);
  const lotes = MOCK_LOTES.filter(l => l.empresa_origen === 'u1');
  const totalKg = lotes.reduce((s, l) => s + l.peso_kg, 0);
  const totalGrt = lotes.reduce((s, l) => s + l.tokens_grt, 0);

  if (selectedLote) {
    return <LoteDetail lote={selectedLote} onBack={() => setSelectedLote(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">Empresa Generadora</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-1.5" size="sm">
          <Plus className="h-4 w-4" />
          Crear lote
        </Button>
      </div>

      {showForm && <CreateLoteForm onClose={() => setShowForm(false)} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Lotes creados" value={lotes.length} icon={<Package className="h-4 w-4" />} delay={0} />
        <StatCard label="Kg totales" value={totalKg.toLocaleString()} icon={<Scale className="h-4 w-4" />} delay={80} />
        <StatCard label="Tokens GRT" value={totalGrt} icon={<Coins className="h-4 w-4" />} variant="token" delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Mis lotes</h3>
        <LoteTable lotes={lotes} onSelect={setSelectedLote} showTokens />
      </div>
    </div>
  );
}

function CreateLoteForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-4 opacity-0 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
      <h3 className="font-semibold text-sm">Nuevo lote de residuos</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs text-muted-foreground">Tipo de residuo</label>
          <select className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
            {TIPO_RESIDUO_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Peso (kg)</label>
          <input type="number" placeholder="250" className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
        <Button size="sm" onClick={onClose} className="gap-1.5">
          Crear y firmar con Freighter
        </Button>
      </div>
    </div>
  );
}
