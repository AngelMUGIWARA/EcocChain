import { StatCard } from '@/components/StatCard';
import { LoteTable } from '@/components/LoteTable';
import { LoteDetail } from '@/components/LoteDetail';
import { ExpandableActionButton } from '@/components/ExpandableActionButton';
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
          <h2 className="text-3xl font-bold tracking-tight text-EcoTracer-primary">Dashboard</h2>
          <p className="text-sm text-EcoTracer-muted mt-1">Empresa Generadora</p>
        </div>
        <ExpandableActionButton
          icon={<Plus className="h-4 w-4" />}
          label="Crear lote"
          onClick={() => setShowForm(!showForm)}
        />
      </div>

      {showForm && <CreateLoteForm onClose={() => setShowForm(false)} />}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Lotes creados" value={lotes.length}                icon={<Package className="h-4 w-4" />} delay={0} />
        <StatCard label="Kg totales"    value={totalKg.toLocaleString()}    icon={<Scale className="h-4 w-4" />}   delay={80} />
        <StatCard label="Tokens GRT"    value={totalGrt}                    icon={<Coins className="h-4 w-4" />}   variant="token" delay={160} />
      </div>

      <div>
        <h3 className="text-sm font-bold mb-4 text-EcoTracer-primary">Mis lotes</h3>
        <LoteTable lotes={lotes} onSelect={setSelectedLote} showTokens />
      </div>
    </div>
  );
}

function CreateLoteForm({ onClose }: { onClose: () => void }) {
  return (
    <div className="rounded-lg border border-EcoTracer-accent/20 bg-white p-6 space-y-4 opacity-0 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
      <h3 className="font-bold text-lg text-EcoTracer-primary">Nuevo lote de residuos</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-EcoTracer-muted">Tipo de residuo</label>
          <select className="mt-2 w-full rounded-lg border border-EcoTracer-accent/20 bg-white px-3 py-2.5 text-sm text-EcoTracer-primary transition-colors focus:outline-none focus:ring-2 focus:ring-EcoTracer-accent/30">
            {TIPO_RESIDUO_OPTIONS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-EcoTracer-muted">Peso (kg)</label>
          <input type="number" placeholder="250" className="mt-2 w-full rounded-lg border border-EcoTracer-accent/20 bg-white px-3 py-2.5 text-sm text-EcoTracer-primary transition-colors focus:outline-none focus:ring-2 focus:ring-EcoTracer-accent/30" />
        </div>
      </div>
      <div className="flex gap-2 justify-end pt-2 border-t border-EcoTracer-accent/15">
        <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
        <Button size="sm" onClick={onClose} className="gap-1.5">
          Crear y firmar con Freighter
        </Button>
      </div>
    </div>
  );
}
