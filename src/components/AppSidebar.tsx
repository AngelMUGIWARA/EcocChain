import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Rol, ROL_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Factory, Truck, Warehouse, Recycle, ShoppingCart,
  LayoutDashboard, Package, LogOut, Wallet, ChevronDown, Leaf, Loader2, CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

const ROL_ICONS: Record<Rol, React.ReactNode> = {
  empresa: <Factory className="h-4 w-4" />,
  transportista: <Truck className="h-4 w-4" />,
  acopio: <Warehouse className="h-4 w-4" />,
  recicladora: <Recycle className="h-4 w-4" />,
  compradora: <ShoppingCart className="h-4 w-4" />,
};

const ALL_ROLES: Rol[] = ['empresa', 'transportista', 'acopio', 'recicladora', 'compradora'];

export function AppSidebar() {
  const { user, switchRole, disconnect, connectWallet, connectedWallet, isConnecting } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  if (!user) return null;

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
        <button
          onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-sidebar-accent"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-accent text-sidebar-accent-foreground">
            {ROL_ICONS[user.rol]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium">{user.nombre}</p>
            <p className="truncate text-[11px] text-sidebar-foreground/50">{ROL_LABELS[user.rol]}</p>
          </div>
          <ChevronDown className={cn('h-3.5 w-3.5 transition-transform text-sidebar-foreground/40', showRoleSwitcher && 'rotate-180')} />
        </button>

        {/* Role switcher (demo) */}
        {showRoleSwitcher && (
          <div className="mt-1 space-y-0.5 rounded-md border border-sidebar-border bg-sidebar-accent/50 p-1.5 animate-scale-in">
            <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-sidebar-foreground/40">Demo — cambiar rol</p>
            {ALL_ROLES.map(r => (
              <button
                key={r}
                onClick={() => { switchRole(r); setShowRoleSwitcher(false); }}
                className={cn(
                  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-colors',
                  r === user.rol
                    ? 'bg-sidebar-primary/20 text-sidebar-primary'
                    : 'hover:bg-sidebar-accent text-sidebar-foreground/70'
                )}
              >
                {ROL_ICONS[r]}
                {ROL_LABELS[r]}
              </button>
            ))}
          </div>
        )}

        {/* Wallet connect */}
        {connectedWallet || user.wallet_address ? (
          <div className="flex items-center gap-1.5 px-2.5 mt-1">
            <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
            <p className="font-mono text-[10px] text-sidebar-foreground/40 truncate">
              {(connectedWallet ?? user.wallet_address)!.slice(0, 6)}…{(connectedWallet ?? user.wallet_address)!.slice(-4)}
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
