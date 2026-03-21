import { useAuth } from '@/contexts/AuthContext';
import {
  Leaf, Wallet, Loader2, Eye, EyeOff,
  Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function truncateWallet(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function maskEmail(email: string) {
  const [user, domain] = email.split('@');
  const visible = user.slice(0, 2);
  return `${visible}${'•'.repeat(Math.min(user.length - 2, 6))}@${domain}`;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function LoginPage() {
  const {
    connectWallet, clearWallet,
    login,
    isConnecting, isRegistering,
    user, error, clearError,
    connectedWallet, walletEmail,
  } = useAuth();

  const navigate = useNavigate();
  const passwordRef = useRef<HTMLInputElement>(null);

  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Navegación automática ───────────────────────────────────────────────
  useEffect(() => { if (user)          navigate('/', { replace: true }); }, [user, navigate]);
  useEffect(() => { if (isRegistering) navigate('/register'); },           [isRegistering, navigate]);

  // ── Cuando se conecta la wallet, enfocar contraseña ────────────────────
  useEffect(() => {
    if (connectedWallet) {
      setPassword('');
      setTimeout(() => passwordRef.current?.focus(), 100);
    }
  }, [connectedWallet]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  const handleWalletLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!walletEmail || !password) return;
    await login(walletEmail, password);
  };

  const handleBack = () => {
    clearWallet();
    clearError();
    setPassword('');
  };

  // ── Modo wallet conectada ───────────────────────────────────────────────
  if (connectedWallet) {
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

          {/* Card — modo wallet */}
          <form
            onSubmit={handleWalletLogin}
            className="rounded-xl border bg-card p-6 shadow-sm space-y-4 opacity-0 animate-fade-up"
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            <div>
              <h2 className="text-base font-semibold">Wallet reconocida</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Ingresa tu contraseña para continuar</p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 px-3.5 py-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
                <button type="button" onClick={clearError} className="ml-auto text-destructive/60 hover:text-destructive">✕</button>
              </div>
            )}

            {/* Wallet badge */}
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Freighter · Stellar Testnet</p>
                <p className="text-sm font-mono font-medium truncate">{truncateWallet(connectedWallet)}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
            </div>

            {/* Email vinculado (enmascarado, solo informativo) */}
            {walletEmail && (
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 px-3.5 py-2.5">
                <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm text-muted-foreground">{maskEmail(walletEmail)}</span>
              </div>
            )}

            {/* Sin email asociado */}
            {!walletEmail && (
              <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                Esta wallet no tiene correo asociado. Inicia sesión con tu correo manualmente.
              </p>
            )}

            {/* Contraseña */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isConnecting || !walletEmail}
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

            <Button
              type="submit"
              disabled={isConnecting || !password || !walletEmail}
              className="w-full gap-2"
              size="lg"
            >
              {isConnecting
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <ArrowRight className="h-4 w-4" />}
              {isConnecting ? 'Verificando...' : 'Entrar'}
            </Button>

            {/* Volver al modo email */}
            <button
              type="button"
              onClick={handleBack}
              className="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Usar correo y contraseña
            </button>
          </form>

        </div>
      </div>
    );
  }

  // ── Modo normal (email + password) ─────────────────────────────────────
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
          onSubmit={handleEmailLogin}
          className="rounded-xl border bg-card p-6 shadow-sm space-y-4 opacity-0 animate-fade-up"
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          <div>
            <h2 className="text-base font-semibold">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Bienvenido de vuelta</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-lg bg-destructive/10 border border-destructive/20 px-3.5 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
              <button type="button" onClick={clearError} className="ml-auto text-destructive/60 hover:text-destructive">✕</button>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Correo electrónico</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                required
                disabled={isConnecting}
                className="w-full rounded-md border bg-background pl-9 pr-3 py-2.5 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Contraseña</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isConnecting}
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

          <Button
            type="submit"
            disabled={isConnecting || !email || !password}
            className="w-full gap-2"
            size="lg"
          >
            {isConnecting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ArrowRight className="h-4 w-4" />}
            {isConnecting ? 'Verificando...' : 'Entrar'}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] text-muted-foreground">o continúa con</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Freighter */}
          <Button
            type="button"
            variant="outline"
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full gap-2"
            size="lg"
          >
            {isConnecting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <Wallet className="h-4 w-4" />}
            {isConnecting ? 'Conectando wallet...' : 'Freighter Wallet'}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">Red: Stellar Testnet</p>
        </form>

        {/* Footer */}
        <p
          className="text-center text-sm text-muted-foreground opacity-0 animate-fade-up"
          style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
        >
          ¿No tienes cuenta?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-medium text-primary hover:underline"
          >
            Regístrate
          </button>
        </p>

      </div>
    </div>
  );
}
