import { useEffect } from 'react';
import { blockchainIndexer } from './blockchain-indexer';

/**
 * Hook to start blockchain indexer in the browser (development only)
 *
 * IMPORTANT: This should only be used in development.
 * In production, run the indexer as a separate Node.js service.
 *
 * Usage: Call this hook once in your App.tsx or main component
 */
export function useBlockchainIndexer(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    // Start indexer
    blockchainIndexer.start(5000);

    // Cleanup on unmount
    return () => {
      blockchainIndexer.stop();
    };
  }, [enabled]);
}
