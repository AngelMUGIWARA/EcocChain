import { useAuth } from '@/contexts/AuthContext';
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const { login, user, isConnecting, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

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
          onSubmit={handleSubmit}
          className="rounded-xl border bg-card p-6 shadow-sm space-y-4 opacity-0 animate-fade-up"
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          <div>
            <h2 className="text-base font-semibold">Iniciar sesión</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Ingresa con tu correo y contraseña
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
                placeholder="Tu contraseña"
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
            {isConnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {isConnecting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground opacity-0 animate-fade-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
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
