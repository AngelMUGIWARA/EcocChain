import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Rol, ROL_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Factory, Truck, Warehouse, Recycle, ShoppingCart,
  LayoutDashboard, Package, LogOut, Wallet, Leaf, Loader2, CheckCircle2
} from 'lucide-react';

const ROL_ICONS: Record<Rol, React.ReactNode> = {
  empresa: <Factory className="h-4 w-4" />,
  transportista: <Truck className="h-4 w-4" />,
  acopio: <Warehouse className="h-4 w-4" />,
  recicladora: <Recycle className="h-4 w-4" />,
  compradora: <ShoppingCart className="h-4 w-4" />,
};

export function AppSidebar() {
  const { user, disconnect, connectWallet, connectedWallet, isConnecting } = useAuth();

  if (!user) return null;

  const walletAddress = connectedWallet ?? user.wallet_address;

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <Leaf className="h-4.5 w-4.5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-sidebar-foreground">EcoChain</h1>
          <p className="text-[11px] text-sidebar-foreground/50">Trazabilidad blockchain</p>
        </div>
      </div>

      {/* User */}
      <div className="px-3 pt-4 pb-2">
        <div className="flex items-center gap-2.5 rounded-md px-2.5 py-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
            {ROL_ICONS[user.rol]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium">{user.nombre}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/50">{ROL_LABELS[user.rol]}</p>
          </div>
        </div>

        {/* Wallet */}
        {walletAddress ? (
          <div className="flex items-center gap-1.5 px-2.5 mt-1">
            <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
            <p className="font-mono text-[10px] text-sidebar-foreground/40 truncate">
              {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
            </p>
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="mt-2 flex w-full items-center gap-2 rounded-md border border-dashed border-sidebar-border px-2.5 py-2 text-xs text-sidebar-foreground/50 transition-colors hover:border-sidebar-primary/50 hover:bg-sidebar-accent hover:text-sidebar-foreground disabled:opacity-50"
          >
            {isConnecting
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Wallet className="h-3.5 w-3.5" />}
            {isConnecting ? 'Conectando...' : 'Conectar Freighter'}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <NavItem to="/" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" end />
        <NavItem to="/lotes" icon={<Package className="h-4 w-4" />} label="Lotes" />
        <NavItem to="/wallet" icon={<Wallet className="h-4 w-4" />} label="Wallet" />
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <button
          onClick={disconnect}
          className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-3.5 w-3.5" />
          Desconectar wallet
        </button>
      </div>
    </aside>
  );
}

function NavItem({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => cn(
        'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
        isActive
          ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
          : 'text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
      )}
    >
      {icon}
      {label}
    </NavLink>
  );
}
