import { Loader2, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { StellarError } from '@/lib/stellar/contracts/contract-types';
import { CONFIG } from '@/lib/stellar/config';

interface TransactionStatusProps {
  status: 'signing' | 'submitting' | 'confirming' | 'success' | 'error';
  txHash?: string;
  error?: StellarError;
  onRetry?: () => void;
  message?: string;
}

export function TransactionStatus({
  status,
  txHash,
  error,
  onRetry,
  message,
}: TransactionStatusProps) {
  if (status === 'signing') {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Esperando firma</AlertTitle>
        <AlertDescription>
          {message || 'Por favor firma la transacción en Freighter Wallet'}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'submitting') {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Enviando transacción</AlertTitle>
        <AlertDescription>
          {message || 'Enviando a la red Stellar...'}
          {txHash && (
            <a
              href={`${CONFIG.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline flex items-center gap-1 mt-2"
            >
              Ver en Explorer <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'confirming') {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Esperando confirmación</AlertTitle>
        <AlertDescription>
          {message || 'La transacción está siendo confirmada en la blockchain...'}
          {txHash && (
            <a
              href={`${CONFIG.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline flex items-center gap-1 mt-2"
            >
              Ver en Explorer <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'success') {
    return (
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-green-500">Transacción exitosa</AlertTitle>
        <AlertDescription>
          {message || 'La operación se completó correctamente'}
          {txHash && (
            <a
              href={`${CONFIG.explorerUrl}/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs underline flex items-center gap-1 mt-2"
            >
              Ver en Explorer <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (status === 'error' && error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          <p>{error.userMessage}</p>
          {error.recoverable && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3"
            >
              Reintentar
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
