import { useAuth } from '@/contexts/AuthContext';
import { useGRTBalance, useGRTTotalSupply } from '@/lib/stellar/hooks/useGRTBalance';
import { batchService } from '@/lib/stellar/services/batch-service';
import { Rol, ROL_LABELS } from '@/lib/types';
import { Coins, Wallet, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ALL_ROLES: Rol[] = ['empresa', 'transportista', 'acopio', 'recicladora', 'compradora'];

export function WalletPage() {
  const { user } = useAuth();
  const { data: balance = 0, isLoading: loadingBalance } = useGRTBalance(user?.wallet_address ?? null);
  const { data: totalSupply = 0, isLoading: loadingSupply } = useGRTTotalSupply();

  const [adminWallet, setAdminWallet] = useState('');
  const [adminRol, setAdminRol] = useState<Rol>('transportista');
  const [registering, setRegistering] = useState(false);

  const handleRegisterRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminWallet) return;
    setRegistering(true);
    try {
      await batchService.registerUserRole(adminWallet, adminRol);
      toast.success(`Rol "${ROL_LABELS[adminRol]}" registrado on-chain para ${adminWallet.slice(0, 8)}…`);
      setAdminWallet('');
    } catch (err: any) {
      toast.error(err.message ?? 'Error al registrar rol');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Wallet</h2>
        <p className="text-sm text-muted-foreground">Balance y actividad de tu cuenta Stellar</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border bg-card p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Coins className="h-3.5 w-3.5" />
            Balance GRT
          </div>
          <p className="text-2xl font-semibold tabular-nums text-token-foreground">
            {loadingBalance ? '—' : balance.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Green Recycle Tokens</p>
        </div>

        <div className="rounded-lg border bg-card p-5 space-y-1">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Coins className="h-3.5 w-3.5" />
            Supply total GRT
          </div>
          <p className="text-2xl font-semibold tabular-nums">
            {loadingSupply ? '—' : totalSupply.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Tokens emitidos en total</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-5 space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Wallet className="h-4 w-4" />
          Dirección de wallet
        </div>
        <p className="font-mono text-xs text-muted-foreground break-all">{user?.wallet_address}</p>
        <a
          href={`https://stellar.expert/explorer/testnet/account/${user?.wallet_address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ExternalLink className="h-3 w-3" />
          Ver en Stellar Expert
        </a>
      </div>
      {/* Admin: registrar rol on-chain */}
      <details className="rounded-lg border bg-card">
        <summary className="flex cursor-pointer items-center gap-2 px-5 py-4 text-sm font-medium select-none">
          <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          Admin — Registrar rol en contrato
        </summary>
        <form onSubmit={handleRegisterRole} className="border-t px-5 py-4 space-y-3">
          <p className="text-xs text-muted-foreground">
            Tu wallet conectada debe ser el <strong>admin</strong> del contrato. Freighter pedirá firma.
          </p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Wallet a registrar</label>
            <input
              value={adminWallet}
              onChange={e => setAdminWallet(e.target.value)}
              placeholder="G... (Stellar public key)"
              required
              disabled={registering}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Rol</label>
            <select
              value={adminRol}
              onChange={e => setAdminRol(e.target.value as Rol)}
              disabled={registering}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/20 disabled:opacity-50"
            >
              {ALL_ROLES.map(r => (
                <option key={r} value={r}>{ROL_LABELS[r]}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={registering || !adminWallet}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {registering ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {registering ? 'Registrando...' : 'Registrar rol on-chain'}
          </button>
        </form>
      </details>
    </div>
  );
}
