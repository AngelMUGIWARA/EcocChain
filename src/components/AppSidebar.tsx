import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Rol, ROL_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Factory, Truck, Warehouse, Recycle, ShoppingCart,
  LayoutDashboard, Package, LogOut, Wallet, Loader2, CheckCircle2,
} from 'lucide-react';

const ROL_ICONS: Record<Rol, React.ReactNode> = {
  empresa:       <Factory className="h-3.5 w-3.5" />,
  transportista: <Truck className="h-3.5 w-3.5" />,
  acopio:        <Warehouse className="h-3.5 w-3.5" />,
  recicladora:   <Recycle className="h-3.5 w-3.5" />,
  compradora:    <ShoppingCart className="h-3.5 w-3.5" />,
};

export function AppSidebar() {
  const { user, disconnect, connectWallet, connectedWallet, isConnecting } = useAuth();

  if (!user) return null;

  const walletAddress = connectedWallet ?? user.wallet_address;

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-[#09291D] text-[#FCFAEB] border-r border-[#FCFAEB]/8">

      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#FCFAEB]/8">
        {/* Logo */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#C8A97A]/30 bg-[#C8A97A]/10">
          <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
            <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4z" stroke="#C8A97A" strokeWidth="1.5" fill="none" />
            <path d="M16 8c-2.5 3-4 6-4 8a4 4 0 0 0 8 0c0-2-1.5-5-4-8z" fill="#C8A97A" fillOpacity="0.7" />
          </svg>
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-[#FCFAEB]">EcoTracer</h1>
          <p className="text-[10px] text-[#FCFAEB]/35 font-normal">Trazabilidad blockchain</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-3 pt-4 pb-2 space-y-1">
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          {/* Role icon badge */}
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#C8A97A]/15 text-[#C8A97A] border border-[#C8A97A]/20">
            {ROL_ICONS[user.rol]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-[#FCFAEB]">{user.nombre}</p>
            <p className="truncate text-[10px] text-[#FCFAEB]/40 font-normal">{ROL_LABELS[user.rol]}</p>
          </div>
        </div>

        {/* Wallet status */}
        {walletAddress ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1">
            <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-400" />
            <p className="font-mono text-[10px] text-[#FCFAEB]/35 truncate">
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </p>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="mt-1 flex w-full items-center gap-2 rounded-lg border border-dashed border-[#FCFAEB]/12 px-2.5 py-2 text-xs text-[#FCFAEB]/40 transition-all hover:border-[#C8A97A]/40 hover:bg-[#C8A97A]/8 hover:text-[#C8A97A] disabled:opacity-50"
          >
            {isConnecting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Wallet className="h-3.5 w-3.5" />}
            <span className="font-normal">{isConnecting ? 'Conectando...' : 'Conectar Freighter'}</span>
          </button>
        )}
      </div>

      {/* Divider */}
      <div className="mx-4 border-t border-[#FCFAEB]/6 my-1" />

      {/* Nav links */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <NavItem to="/"       icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" end />
        <NavItem to="/lotes"  icon={<Package className="h-4 w-4" />}         label="Lotes" />
        <NavItem to="/wallet" icon={<Wallet className="h-4 w-4" />}          label="Wallet" />
      </nav>

      {/* Footer */}
      <div className="border-t border-[#FCFAEB]/8 px-3 py-3">
        <button
          onClick={disconnect}
          className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-[#FCFAEB]/35 transition-all hover:bg-red-900/20 hover:text-red-300 font-normal"
        >
          <LogOut className="h-3.5 w-3.5" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-all',
          isActive
            ? 'bg-[#C8A97A]/12 text-[#C8A97A] font-medium border border-[#C8A97A]/20'
            : 'text-[#FCFAEB]/50 font-normal hover:bg-[#FCFAEB]/5 hover:text-[#FCFAEB]/80'
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  );
}
