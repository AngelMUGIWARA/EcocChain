import { useAuth } from '@/contexts/AuthContext';
import { Rol, ROL_LABELS, TIPO_RESIDUO_OPTIONS } from '@/lib/types';
import { Leaf, Wallet, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MycelliumBackground } from '@/components/MycelliumBackground';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const ROLES: { rol: Rol; desc: string }[] = [
  { rol: 'empresa',       desc: 'Genero residuos reciclables' },
  { rol: 'transportista', desc: 'Transporto residuos a centros de acopio' },
  { rol: 'acopio',        desc: 'Recibo y clasifico materiales' },
  { rol: 'recicladora',   desc: 'Proceso y reciclo materiales' },
  { rol: 'compradora',    desc: 'Compro material reciclado certificado' },
];

export function LoginPage() {
  const { connectWallet, register, isConnecting, isRegistering } = useAuth();
  const [nombre, setNombre] = useState('');
  const [selectedRol, setSelectedRol] = useState<Rol>('empresa');

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-EcoTracer-secondary p-4 overflow-hidden">
      <MycelliumBackground />
      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-white">
            <img src="/logo_ecotracer.svg" alt="EcoTracer Logo" className="" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-EcoTracer-primary">EcoTracer</h1>
          <p className="mt-2 text-sm text-EcoTracer-muted">
            El bloque que faltaba en la cadena del reciclaje
          </p>
        </div>

        {!isRegistering ? (
          /* Connect wallet */
          <div
            className="rounded-xl border border-EcoTracer-accent/20 bg-EcoTracer-surface p-6 opacity-0 animate-fade-up"
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            <p className="text-sm text-center text-EcoTracer-muted mb-6">
              Conecta tu wallet Freighter para comenzar
            </p>
            <Button onClick={connectWallet} disabled={isConnecting} className="w-full gap-2" variant="secondary" size="lg">
              {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              {isConnecting ? 'Conectando...' : 'Conectar Freighter'}
            </Button>
            <p className="mt-4 text-center font-mono text-xs text-EcoTracer-muted">
              Red: Stellar Testnet
            </p>
          </div>
        ) : (
          /* Register */
          <div
            className="rounded-xl border border-EcoTracer-accent/20 bg-EcoTracer-surface p-6 space-y-5 opacity-0 animate-scale-in"
            style={{ animationFillMode: 'forwards' }}
          >
            <div>
              <label className="text-xs font-semibold text-EcoTracer-primary">Nombre / Empresa</label>
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Envases del Bajío S.A."
                className="mt-2 w-full rounded-lg border border-EcoTracer-accent/20 bg-white px-4 py-2.5 text-sm text-EcoTracer-primary transition-shadow focus:outline-none focus:ring-2 focus:ring-EcoTracer-accent/30"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-EcoTracer-primary">Selecciona tu rol</label>
              <div className="mt-3 space-y-2">
                {ROLES.map(({ rol, desc }) => (
                  <button
                    key={rol}
                    onClick={() => setSelectedRol(rol)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all',
                      selectedRol === rol
                        ? 'border-EcoTracer-accent bg-EcoTracer-accent/5'
                        : 'border-EcoTracer-border hover:border-EcoTracer-accent/40 hover:bg-EcoTracer-secondary'
                    )}
                  >
                    <div className={cn(
                      'mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 transition-colors',
                      selectedRol === rol ? 'border-EcoTracer-accent bg-EcoTracer-accent' : 'border-EcoTracer-border'
                    )} />
                    <div>
                      <p className="font-semibold text-sm text-EcoTracer-primary">{ROL_LABELS[rol]}</p>
                      <p className="text-xs text-EcoTracer-muted">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={() => register(nombre || ROL_LABELS[selectedRol], selectedRol)} className="w-full" variant="secondary" size="lg">
              Registrarme
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
