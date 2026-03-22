import { useAuth } from '@/contexts/AuthContext';
import { Rol, ROL_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '@/components/ui/popover';
import {
  Factory, Truck, Warehouse, Recycle, ShoppingCart,
  LayoutDashboard, Package, LogOut, Wallet, ChevronDown, Leaf
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
  const { user, switchRole, disconnect } = useAuth();
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  if (!user) return null;

  return (
    <aside className="flex h-screen w-64 flex-col text-white border-r bg-[#09291D]/80 backdrop-blur-[20px] border-white/10">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg text-white bg-[#C8A97A]/20 border border-[#C8A97A]/40">
          <Leaf className="h-4 w-4" />
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight">EcoTracer</h1>
          <p className="text-[11px] text-white/40">Trazabilidad blockchain</p>
        </div>
      </div>

      {/* User */}
      <div className="px-3 pt-4 pb-2">
        <button
          onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-all text-white/60 hover:text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-md text-white bg-[#C8A97A]/20 border border-[#C8A97A]/30">
            {ROL_ICONS[user.rol]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-medium text-white">{user.nombre}</p>
            <p className="truncate text-[11px] text-white/40">{ROL_LABELS[user.rol]}</p>
          </div>
          <ChevronDown className={cn('h-3.5 w-3.5 text-white/50 transition-transform', showRoleSwitcher && 'rotate-180')} />
        </button>

        {/* Role switcher (demo) */}
        {showRoleSwitcher && (
          <div className="mt-1 space-y-0.5 rounded-md border p-1.5 animate-scale-in bg-[#C8A97A]/10 border-[#C8A97A]/20">
            <p className="px-2 py-1 text-[10px] uppercase tracking-wider text-white/50">Demo — cambiar rol</p>
            {ALL_ROLES.map(r => (
              <button
                key={r}
                onClick={() => { switchRole(r); setShowRoleSwitcher(false); }}
                className={cn(
                  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs transition-all',
                  r === user.rol
                    ? 'text-[#C8A97A] font-medium bg-[#C8A97A]/10 border border-[#C8A97A]/25'
                    : 'text-white/60 hover:text-white'
                )}
              >
                {ROL_ICONS[r]}
                {ROL_LABELS[r]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        <NavItem icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" active />
        <NavItem icon={<Package className="h-4 w-4" />} label="Lotes" />
        <NavItem icon={<Wallet className="h-4 w-4" />} label="Wallet" />
      </nav>

      {/* Footer — Logout con Popover de confirmación */}
      <div className="px-3 py-3 border-t border-white/10">
        <Popover>
          <PopoverTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-all text-white/60 hover:bg-red-600/20 hover:text-red-500">
              <LogOut className="h-3.5 w-3.5" />
              Desconectar wallet
            </button>
          </PopoverTrigger>
          <PopoverContent
            side="right"
            sideOffset={12}
            className="w-56 bg-[#09291D] border border-white/20 text-white p-4 rounded-xl shadow-2xl"
          >
            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold font-mono tracking-wide text-white/90 uppercase">
                  Cerrar sesión
                </p>
                <p className="mt-1 text-[11px] font-mono text-white/60 leading-relaxed">
                  ¿Estás seguro de que quieres desconectar tu wallet?
                </p>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={disconnect}
                  className="flex-1 rounded-md px-3 py-1.5 text-xs font-mono font-medium text-red-500 bg-transparent border border-red-500/50 transition-colors hover:bg-red-600 hover:border-red-600 hover:text-white"
                >
                  Confirmar
                </button>
                <PopoverClose asChild>
                  <button className="flex-1 rounded-md px-3 py-1.5 text-xs font-mono text-white/50 bg-transparent border border-white/10 transition-all hover:text-white/90 hover:border-white/20">
                    Cancelar
                  </button>
                </PopoverClose>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button className={cn(
      'flex w-full items-center gap-2.5 py-2 text-sm rounded-lg transition-all',
      active
        ? 'border-l-[3px] border-[#C8A97A] pl-[9px] pr-3 font-medium text-[#C8A97A]'
        : 'border-l-[3px] border-transparent pl-[9px] pr-3 text-white/60 hover:text-white'
    )}>
      {icon}
      {label}
    </button>
  );
}
