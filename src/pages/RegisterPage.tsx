import { useAuth } from '@/contexts/AuthContext';
import { Rol, ROL_LABELS } from '@/lib/types';
import { Leaf, Wallet, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { requestAccess } from '@stellar/freighter-api';

const ROLES: { rol: Rol; desc: string }[] = [
  { rol: 'empresa',       desc: 'Genero residuos reciclables' },
  { rol: 'transportista', desc: 'Transporto residuos a centros de acopio' },
  { rol: 'acopio',        desc: 'Recibo y clasifico materiales' },
  { rol: 'recicladora',   desc: 'Proceso y reciclo materiales' },
  { rol: 'compradora',    desc: 'Compro material reciclado certificado' },
];

export function RegisterPage() {
  const { register, user, isConnecting, error, clearError, connectedWallet } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre]             = useState('');
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [walletAddress, setWalletAddress] = useState(connectedWallet ?? '');
  const [selectedRol, setSelectedRol]   = useState<Rol>('empresa');
  const [loadingWallet, setLoadingWallet] = useState(false);

  useEffect(() => {
    if (connectedWallet && !walletAddress) setWalletAddress(connectedWallet);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedWallet]);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password) return;
    await register(nombre, selectedRol, email, password, walletAddress || undefined);
  };

  const handleLoadWallet = async () => {
    setLoadingWallet(true);
    try {
      const result = await requestAccess();
      const publicKey =
        typeof result === 'string'
          ? result
          : (result as { address?: string; publicKey?: string })?.address
          ?? (result as { address?: string; publicKey?: string })?.publicKey;
      if (publicKey) setWalletAddress(publicKey);
    } catch {
      // Freighter no disponible o usuario rechazó
    } finally {
      setLoadingWallet(false);
    }
  };

  const busy = isConnecting || loadingWallet;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">

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

        {/* Card */}
        <form
          onSubmit={handleRegister}
          className="rounded-xl border bg-card p-6 shadow-sm space-y-4 opacity-0 animate-fade-up"
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          <div>
            <h2 className="text-base font-semibold">Crear cuenta</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Los campos con <span className="text-primary">*</span> son obligatorios
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 px-3.5 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
              <button type="button" onClick={clearError} className="ml-auto text-destructive/60 hover:text-destructive">✕</button>
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Nombre / Empresa <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Envases del Bajío S.A."
                required
                disabled={busy}
                className="w-full rounded-md border bg-background pl-9 pr-3 py-2.5 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Correo electrónico <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                required
                disabled={busy}
                className="w-full rounded-md border bg-background pl-9 pr-3 py-2.5 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Contraseña <span className="text-primary">*</span>
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={busy}
                className="w-full rounded-md border bg-background pl-9 pr-10 py-2.5 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">
              Rol <span className="text-primary">*</span>
            </label>
            <div className="space-y-1.5">
              {ROLES.map(({ rol, desc }) => (
                <button
                  key={rol}
                  type="button"
                  onClick={() => setSelectedRol(rol)}
                  disabled={busy}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg border px-3.5 py-3 text-left text-sm transition-all disabled:opacity-50',
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

          {/* Wallet address */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Dirección Wallet{' '}
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">Opcional</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Wallet className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={walletAddress}
                  onChange={e => setWalletAddress(e.target.value)}
                  placeholder="G... (Stellar public key)"
                  disabled={busy}
                  className="w-full rounded-md border bg-background pl-9 pr-3 py-2.5 text-sm font-mono transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadWallet}
                disabled={busy}
                className="shrink-0 px-3"
                title="Cargar desde Freighter"
              >
                {loadingWallet ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground pl-1">
              Haz clic en el ícono para importar desde Freighter.
            </p>
          </div>

          <Button
            type="submit"
            disabled={busy || !nombre || !email || !password}
            className="w-full gap-2"
            size="lg"
          >
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {isConnecting ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground opacity-0 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-primary hover:underline"
          >
            Inicia sesión
          </button>
        </p>

      </div>
    </div>
  );
}
