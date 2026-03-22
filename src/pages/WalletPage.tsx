import { useAuth } from '@/contexts/AuthContext';
import { useGRTBalance, useGRTTotalSupply } from '@/lib/stellar/hooks/useGRTBalance';
import { Coins, Wallet, ExternalLink } from 'lucide-react';

export function WalletPage() {
  const { user } = useAuth();
  const { data: balance = 0, isLoading: loadingBalance } = useGRTBalance(user?.wallet_address ?? null);
  const { data: totalSupply = 0, isLoading: loadingSupply } = useGRTTotalSupply();

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
    </div>
  );
}
