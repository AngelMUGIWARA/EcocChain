import { useAuth } from '@/contexts/AuthContext';
import { Rol, ROL_LABELS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '@/components/ui/popover';
import {
  Factory, Truck, Warehouse, Recycle, ShoppingCart,
  LayoutDashboard, Package, LogOut, Wallet, ChevronDown, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const ROL_ICONS: Record<Rol, React.ReactNode> = {
  empresa:      <Factory className="h-4 w-4" />,
  transportista: <Truck className="h-4 w-4" />,
  acopio:       <Warehouse className="h-4 w-4" />,
  recicladora:  <Recycle className="h-4 w-4" />,
  compradora:   <ShoppingCart className="h-4 w-4" />,
};

const ALL_ROLES: Rol[] = ['empresa', 'transportista', 'acopio', 'recicladora', 'compradora'];

export function FloatingNavbar() {
  const { user, switchRole, disconnect } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);

  if (!user) return null;

  return (
    <div className={cn(
      'fixed left-0 top-0 h-screen flex flex-col justify-between transition-all duration-300 z-40',
      isExpanded ? 'w-64' : 'w-20'
    )}>
      {/* Floating Container — glassmorphism */}
      <div className="flex flex-col h-full m-4 rounded-2xl transition-all duration-300 bg-[#09291D]/80 backdrop-blur-[20px] border border-white/10">

        {/* Logo — brand header */}
        <div className="flex flex-col items-center pt-4 pb-3 border-b border-white/5">
          <div
            className="flex h-14 w-14 items-center justify-center p-1.5 transition-transform duration-300 hover:scale-105"
            aria-label="Ir al inicio"
          >
            <img
              src="/logo_ecotracer.svg"
              alt="EcoTracer"
              className="h-full w-full object-contain"
            />
          </div>
          {isExpanded && (
            <p className="mt-2 text-[15px] font-mono tracking-widest text-white/40 uppercase opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
              EcoTracer
            </p>
          )}
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center py-2 border-b border-white/10">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg transition-all text-white/60 hover:text-white"
            aria-label="Toggle menu"
          >
            {isExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          {isExpanded && (
            <span className="ml-1 text-xs text-white/40 opacity-0 animate-fade-up select-none" style={{ animationFillMode: 'forwards' }}>
              Menú
            </span>
          )}
        </div>

        {/* User Section */}
        <div className={cn(
          'flex flex-col items-center transition-all duration-300',
          isExpanded ? 'px-3 pt-4 pb-2' : 'px-2.5 py-2'
        )}>
          <button
            onClick={() => isExpanded && setShowRoleSwitcher(!showRoleSwitcher)}
            className={cn(
              'rounded-lg transition-all text-white/60 hover:text-white',
              isExpanded ? 'w-full px-2.5 py-2 text-left text-sm' : 'p-2'
            )}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white flex-shrink-0 mx-auto bg-[#C8A97A]/20 border border-[#C8A97A]/30">
              {ROL_ICONS[user.rol]}
            </span>
            {isExpanded && (
              <div className="mt-2 flex items-center justify-between opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-white">{user.nombre}</p>
                  <p className="truncate text-[10px] text-white/40">{ROL_LABELS[user.rol]}</p>
                </div>
                <ChevronDown className={cn('h-3.5 w-3.5 text-white/50 transition-transform flex-shrink-0', showRoleSwitcher && 'rotate-180')} />
              </div>
            )}
          </button>

          {isExpanded && showRoleSwitcher && (
            <div className="mt-2 w-full space-y-1 rounded-lg border p-2 animate-scale-in bg-[#C8A97A]/10 border-[#C8A97A]/20">
              <p className="px-2 py-1 text-[9px] uppercase tracking-wider text-white/50">Cambiar rol</p>
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
                  <span className="truncate">{ROL_LABELS[r]}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={cn(
          'flex-1 transition-all duration-300',
          isExpanded ? 'px-3 py-3 space-y-1' : 'px-2.5 py-2 space-y-1 flex flex-col items-center'
        )}>
          <NavItem icon={<LayoutDashboard className="h-5 w-5" />} label="Dashboard" isExpanded={isExpanded} active />
          <NavItem icon={<Package className="h-5 w-5" />}         label="Lotes"     isExpanded={isExpanded} />
          <NavItem icon={<Wallet className="h-5 w-5" />}          label="Wallet"    isExpanded={isExpanded} />
        </nav>

        {/* Footer — Logout con Popover de confirmación */}
        <div className={cn(
          'border-t border-white/10 transition-all duration-300',
          isExpanded ? 'px-3 py-3' : 'px-2.5 py-2 flex justify-center'
        )}>
          <LogoutPopover isExpanded={isExpanded} onConfirm={disconnect} />
        </div>
      </div>
    </div>
  );
}

function LogoutPopover({ isExpanded, onConfirm }: { isExpanded: boolean; onConfirm: () => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'rounded-lg transition-all border-transparent border-2 text-white/60 hover:border-red-600 hover:text-red-500 flex items-center gap-2',
            isExpanded ? 'w-full px-2.5 py-2 text-xs' : 'p-2 justify-center'
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {isExpanded && (
            <span className="opacity-0 animate-fade-up duration-400" style={{ animationFillMode: 'forwards' }}>
              Desconectar
            </span>
          )}
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
              onClick={onConfirm}
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
  );
}

function NavItem({
  icon, label, active = false, isExpanded = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  isExpanded?: boolean;
}) {
  return (
    <button
      className={cn(
        'transition-all',
        isExpanded
          ? cn(
              'w-full flex items-center gap-2.5 py-2 text-sm rounded-lg',
              active
                ? 'border-l-[3px] border-[#C8A97A] pl-[9px] pr-3 font-medium text-[#C8A97A]'
                : 'border-l-[3px] border-transparent pl-[9px] pr-3 text-white/60 hover:text-white'
            )
          : cn(
              'p-2.5 flex justify-center rounded-lg',
              active
                ? 'text-[#C8A97A]'
                : 'text-white/60 hover:text-white'
            )
      )}
    >
      {icon}
      {isExpanded && (
        <span className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
          {label}
        </span>
      )}
    </button>
  );
}
