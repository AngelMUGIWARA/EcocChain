import { useAuth } from '@/contexts/AuthContext';
import { Rol, ROL_LABELS } from '@/lib/types';
import { Leaf, Wallet, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { freighterService } from '@/lib/stellar/client/freighter';

const ROLES: { rol: Rol; desc: string }[] = [
  { rol: 'empresa', desc: 'Genero residuos reciclables' },
  { rol: 'transportista', desc: 'Transporto residuos a centros de acopio' },
  { rol: 'acopio', desc: 'Recibo y clasifico materiales' },
  { rol: 'recicladora', desc: 'Proceso y reciclo materiales' },
  { rol: 'compradora', desc: 'Compro material reciclado certificado' },
];

export function LoginPage() {
  const { connectWallet, register, isConnecting, isRegistering, error } = useAuth();
  const [nombre, setNombre] = useState('');
  const [selectedRol, setSelectedRol] = useState<Rol>('empresa');
  const [freighterInstalled, setFreighterInstalled] = useState<boolean | null>(null);

  // Check if Freighter is installed on mount
  useEffect(() => {
    freighterService.isInstalled().then(setFreighterInstalled);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Brand */}
        <div className="text-center opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <Leaf className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">EcoChain</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Trazabilidad de residuos reciclables en blockchain
          </p>
        </div>

        {!isRegistering ? (
          /* Connect wallet */
          <div className="rounded-xl border bg-card p-6 shadow-sm opacity-0 animate-fade-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
            {freighterInstalled === false && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Freighter Wallet no instalado</AlertTitle>
                <AlertDescription>
                  Necesitas instalar la extensión Freighter Wallet para usar esta aplicación.
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 mt-2 text-sm underline"
                  >
                    Descargar Freighter <ExternalLink className="h-3 w-3" />
                  </a>
                </AlertDescription>
              </Alert>
            )}

            <p className="text-sm text-center text-muted-foreground mb-5">
              Conecta tu wallet Freighter para comenzar
            </p>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              onClick={connectWallet}
              disabled={isConnecting || freighterInstalled === false}
              className="w-full gap-2"
              size="lg"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wallet className="h-4 w-4" />
              )}
              {isConnecting ? 'Conectando...' : 'Conectar Freighter'}
            </Button>
            <p className="mt-3 text-center text-[11px] text-muted-foreground">
              Red: Stellar Testnet
            </p>
          </div>
        ) : (
          /* Register */
          <div className="rounded-xl border bg-card p-6 shadow-sm space-y-5 opacity-0 animate-scale-in" style={{ animationFillMode: 'forwards' }}>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Nombre / Empresa</label>
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Envases del Bajío S.A."
                className="mt-1.5 w-full rounded-md border bg-background px-3 py-2.5 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground">Selecciona tu rol</label>
              <div className="mt-2 space-y-1.5">
                {ROLES.map(({ rol, desc }) => (
                  <button
                    key={rol}
                    onClick={() => setSelectedRol(rol)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-sm transition-all',
                      selectedRol === rol
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/30 hover:bg-muted/50'
                    )}
                  >
                    <div className={cn(
                      'mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 transition-colors',
                      selectedRol === rol ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                    )} />
                    <div>
                      <p className="font-medium text-sm">{ROL_LABELS[rol]}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={() => register(nombre || ROL_LABELS[selectedRol], selectedRol)}
              className="w-full"
              size="lg"
              disabled={!nombre.trim() || isConnecting}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Registrando...
                </>
              ) : (
                'Registrarme'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
