import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Organic network background — rendered as SVG, no external assets needed
function MycelliumBackground() {
  // Deterministic node positions (no random — avoids hydration mismatches)
  const nodes = [
    { cx: 80,  cy: 120 }, { cx: 200, cy: 60  }, { cx: 340, cy: 180 },
    { cx: 460, cy: 90  }, { cx: 580, cy: 200 }, { cx: 700, cy: 80  },
    { cx: 820, cy: 160 }, { cx: 950, cy: 110 }, { cx: 1100, cy: 200 },
    { cx: 140, cy: 320 }, { cx: 280, cy: 400 }, { cx: 420, cy: 300 },
    { cx: 560, cy: 420 }, { cx: 680, cy: 310 }, { cx: 800, cy: 400 },
    { cx: 920, cy: 280 }, { cx: 1060, cy: 380 }, { cx: 60, cy: 500 },
    { cx: 200, cy: 580 }, { cx: 360, cy: 520 }, { cx: 500, cy: 600 },
    { cx: 650, cy: 540 }, { cx: 780, cy: 610 }, { cx: 900, cy: 560 },
    { cx: 1080, cy: 520 }, { cx: 150, cy: 700 }, { cx: 300, cy: 760 },
    { cx: 450, cy: 720 }, { cx: 600, cy: 800 }, { cx: 750, cy: 740 },
    { cx: 880, cy: 800 }, { cx: 1020, cy: 720 }, { cx: 1140, cy: 680 },
  ];

  // Connect nodes by proximity
  const edges: [number, number][] = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].cx - nodes[j].cx;
      const dy = nodes[i].cy - nodes[j].cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 220) edges.push([i, j]);
    }
  }

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 900"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C8A97A" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#C8A97A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke="#C8A97A"
          strokeWidth="0.5"
          strokeOpacity="0.15"
        />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={i} className="mycellium-node">
          <circle cx={n.cx} cy={n.cy} r="8" fill="url(#nodeGlow)" />
          <circle cx={n.cx} cy={n.cy} r="2" fill="#C8A97A" fillOpacity="0.5" />
        </g>
      ))}
    </svg>
  );
}

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest p-4">
      {/* Ambient glow spots */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#C8A97A]/8 blur-[100px] animate-pulse-glow" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#1d6644]/20 blur-[80px]" />

      {/* Mycellium SVG */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <MycelliumBackground />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-[400px] space-y-6">

        {/* Brand */}
        <div
          className="text-center opacity-0 animate-fade-up"
          style={{ animationFillMode: 'forwards' }}
        >
          {/* Logo mark */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C8A97A]/30 bg-[#C8A97A]/10 shadow-lg shadow-black/30 backdrop-blur-sm">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z" stroke="#C8A97A" strokeWidth="1.5" fill="none" />
              <path d="M16 8c-2.5 3-4 6-4 8a4 4 0 0 0 8 0c0-2-1.5-5-4-8z" fill="#C8A97A" fillOpacity="0.7" />
              <path d="M12 14c-2 1-3 2.5-3 4" stroke="#C8A97A" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
              <path d="M20 14c2 1 3 2.5 3 4" stroke="#C8A97A" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-[#FCFAEB]">
            EcoChain
          </h1>
          <p className="mt-2 text-sm text-[#FCFAEB]/50 font-normal">
            Trazabilidad de residuos reciclables en blockchain
          </p>
        </div>

        {/* Glassmorphism card */}
        <form
          onSubmit={handleSubmit}
          className="glass-strong rounded-2xl p-6 space-y-4 opacity-0 animate-fade-up shadow-2xl shadow-black/40"
          style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}
        >
          <div>
            <h2 className="text-base font-semibold text-[#FCFAEB]">Iniciar sesión</h2>
            <p className="text-sm text-[#FCFAEB]/50 mt-0.5 font-normal">
              Ingresa con tu correo y contraseña
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-3.5 py-3 text-sm text-red-300">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="ml-auto text-red-300/60 hover:text-red-300 transition-colors"
              >
                ✕
              </button>
            </div>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#FCFAEB]/60">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FCFAEB]/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                required
                disabled={isConnecting}
                className="w-full rounded-xl border border-[#FCFAEB]/12 bg-[#FCFAEB]/6 pl-9 pr-3 py-2.5 text-sm text-[#FCFAEB] placeholder:text-[#FCFAEB]/25 transition-all focus:outline-none focus:border-[#C8A97A]/50 focus:bg-[#FCFAEB]/10 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#FCFAEB]/60">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FCFAEB]/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                required
                disabled={isConnecting}
                className="w-full rounded-xl border border-[#FCFAEB]/12 bg-[#FCFAEB]/6 pl-9 pr-10 py-2.5 text-sm text-[#FCFAEB] placeholder:text-[#FCFAEB]/25 transition-all focus:outline-none focus:border-[#C8A97A]/50 focus:bg-[#FCFAEB]/10 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#FCFAEB]/30 hover:text-[#FCFAEB]/70 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isConnecting || !email || !password}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8A97A] px-4 py-2.5 text-sm font-semibold text-[#09291D] shadow-lg shadow-[#C8A97A]/20 transition-all hover:bg-[#dfc49c] hover:shadow-[#C8A97A]/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isConnecting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ArrowRight className="h-4 w-4" />}
            {isConnecting ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-center text-sm text-[#FCFAEB]/40 opacity-0 animate-fade-up"
          style={{ animationDelay: '240ms', animationFillMode: 'forwards' }}
        >
          ¿No tienes cuenta?{' '}
          <button
            onClick={() => navigate('/register')}
            className="font-medium text-[#C8A97A] hover:text-[#dfc49c] transition-colors hover:underline underline-offset-2"
          >
            Regístrate
          </button>
        </p>

      </div>
    </div>
  );
}
