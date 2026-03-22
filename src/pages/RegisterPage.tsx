import { useAuth } from '@/contexts/AuthContext';
import { Rol, ROL_LABELS } from '@/lib/types';
import { Wallet, Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { requestAccess } from '@stellar/freighter-api';

const ROLES: { rol: Rol; desc: string; icon: string }[] = [
  { rol: 'empresa',       desc: 'Genero residuos reciclables',              icon: '🏭' },
  { rol: 'transportista', desc: 'Transporto residuos a centros de acopio',  icon: '🚛' },
  { rol: 'acopio',        desc: 'Recibo y clasifico materiales',            icon: '🏬' },
  { rol: 'recicladora',   desc: 'Proceso y reciclo materiales',             icon: '♻️' },
  { rol: 'compradora',    desc: 'Compro material reciclado certificado',    icon: '🛒' },
];

export function RegisterPage() {
  const { register, user, isConnecting, error, clearError, connectedWallet } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre]               = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [showPassword, setShowPassword]   = useState(false);
  const [walletAddress, setWalletAddress] = useState(connectedWallet ?? '');
  const [selectedRol, setSelectedRol]     = useState<Rol>('empresa');
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest p-4 py-8">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-[#C8A97A]/8 blur-[100px] animate-pulse-glow" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-[400px] w-[400px] rounded-full bg-[#1d6644]/20 blur-[80px]" />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(#FCFAEB 1px, transparent 1px), linear-gradient(90deg, #FCFAEB 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[420px] space-y-5">

        {/* Brand */}
        <div
          className="text-center opacity-0 animate-fade-up"
          style={{ animationFillMode: 'forwards' }}
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C8A97A]/30 bg-[#C8A97A]/10 shadow-lg shadow-black/30 backdrop-blur-sm">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z" stroke="#C8A97A" strokeWidth="1.5" fill="none" />
              <path d="M16 8c-2.5 3-4 6-4 8a4 4 0 0 0 8 0c0-2-1.5-5-4-8z" fill="#C8A97A" fillOpacity="0.7" />
              <path d="M12 14c-2 1-3 2.5-3 4" stroke="#C8A97A" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
              <path d="M20 14c2 1 3 2.5 3 4" stroke="#C8A97A" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#FCFAEB]">Crear cuenta</h1>
          <p className="mt-1.5 text-sm text-[#FCFAEB]/50 font-normal">
            Únete a la red de trazabilidad EcoChain
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleRegister}
          className="glass-strong rounded-2xl p-6 space-y-4 opacity-0 animate-fade-up shadow-2xl shadow-black/40"
          style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}
        >
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

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#FCFAEB]/60">
              Nombre / Empresa <span className="text-[#C8A97A]">*</span>
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FCFAEB]/30" />
              <input
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej. Envases del Bajío S.A."
                required
                disabled={busy}
                className="w-full rounded-xl border border-[#FCFAEB]/12 bg-[#FCFAEB]/6 pl-9 pr-3 py-2.5 text-sm text-[#FCFAEB] placeholder:text-[#FCFAEB]/25 transition-all focus:outline-none focus:border-[#C8A97A]/50 focus:bg-[#FCFAEB]/10 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#FCFAEB]/60">
              Correo electrónico <span className="text-[#C8A97A]">*</span>
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FCFAEB]/30" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
                required
                disabled={busy}
                className="w-full rounded-xl border border-[#FCFAEB]/12 bg-[#FCFAEB]/6 pl-9 pr-3 py-2.5 text-sm text-[#FCFAEB] placeholder:text-[#FCFAEB]/25 transition-all focus:outline-none focus:border-[#C8A97A]/50 focus:bg-[#FCFAEB]/10 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#FCFAEB]/60">
              Contraseña <span className="text-[#C8A97A]">*</span>
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FCFAEB]/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                disabled={busy}
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

          {/* Rol selector */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#FCFAEB]/60">
              Rol <span className="text-[#C8A97A]">*</span>
            </label>
            <div className="space-y-1.5">
              {ROLES.map(({ rol, desc, icon }) => (
                <button
                  key={rol}
                  type="button"
                  onClick={() => setSelectedRol(rol)}
                  disabled={busy}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all disabled:opacity-50',
                    selectedRol === rol
                      ? 'border-[#C8A97A]/50 bg-[#C8A97A]/10 shadow-sm'
                      : 'border-[#FCFAEB]/10 hover:border-[#C8A97A]/25 hover:bg-[#FCFAEB]/5'
                  )}
                >
                  <span className="text-base shrink-0 w-6 text-center">{icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'font-medium text-sm',
                      selectedRol === rol ? 'text-[#C8A97A]' : 'text-[#FCFAEB]/80'
                    )}>
                      {ROL_LABELS[rol]}
                    </p>
                    <p className="text-[11px] text-[#FCFAEB]/35 font-normal">{desc}</p>
                  </div>
                  {selectedRol === rol && (
                    <CheckCircle2 className="h-4 w-4 text-[#C8A97A] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Wallet */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#FCFAEB]/60 flex items-center gap-2">
              Dirección Wallet
              <span className="rounded-full border border-[#FCFAEB]/15 px-1.5 py-0.5 text-[10px] text-[#FCFAEB]/35">
                Opcional
              </span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Wallet className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FCFAEB]/30" />
                <input
                  value={walletAddress}
                  onChange={e => setWalletAddress(e.target.value)}
                  placeholder="G... (Stellar public key)"
                  disabled={busy}
                  className="w-full rounded-xl border border-[#FCFAEB]/12 bg-[#FCFAEB]/6 pl-9 pr-3 py-2.5 text-sm font-mono text-[#FCFAEB] placeholder:text-[#FCFAEB]/25 placeholder:font-sans transition-all focus:outline-none focus:border-[#C8A97A]/50 focus:bg-[#FCFAEB]/10 disabled:opacity-50"
                />
              </div>
              <button
                type="button"
                onClick={handleLoadWallet}
                disabled={busy}
                title="Cargar desde Freighter"
                className="flex items-center justify-center rounded-xl border border-[#FCFAEB]/12 bg-[#FCFAEB]/6 px-3 text-[#FCFAEB]/50 transition-all hover:border-[#C8A97A]/40 hover:bg-[#C8A97A]/10 hover:text-[#C8A97A] disabled:opacity-50 shrink-0"
              >
                {loadingWallet
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <Wallet className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[11px] text-[#FCFAEB]/30 pl-1 font-normal">
              Haz clic en el ícono para importar desde Freighter.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy || !nombre || !email || !password}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8A97A] px-4 py-2.5 text-sm font-semibold text-[#09291D] shadow-lg shadow-[#C8A97A]/20 transition-all hover:bg-[#dfc49c] hover:shadow-[#C8A97A]/30 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isConnecting
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <ArrowRight className="h-4 w-4" />}
            {isConnecting ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        {/* Footer */}
        <p
          className="text-center text-sm text-[#FCFAEB]/40 opacity-0 animate-fade-up"
          style={{ animationDelay: '240ms', animationFillMode: 'forwards' }}
        >
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => navigate('/login')}
            className="font-medium text-[#C8A97A] hover:text-[#dfc49c] transition-colors hover:underline underline-offset-2"
          >
            Inicia sesión
          </button>
        </p>

      </div>
    </div>
  );
}
