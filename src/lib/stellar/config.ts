import { Networks } from '@stellar/stellar-sdk';

export const STELLAR_NETWORKS = {
  standalone: {
    networkPassphrase: Networks.STANDALONE,
    horizonUrl: 'http://localhost:8000',
    sorobanRpcUrl: 'http://localhost:8000/soroban/rpc',
    friendbotUrl: 'http://localhost:8000/friendbot',
    explorerUrl: 'http://localhost:8000',
  },
  testnet: {
    networkPassphrase: Networks.TESTNET,
    horizonUrl: 'https://horizon-testnet.stellar.org',
    sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
    friendbotUrl: 'https://friendbot.stellar.org',
    explorerUrl: 'https://stellar.expert/explorer/testnet',
  }
} as const;

export type StellarNetwork = keyof typeof STELLAR_NETWORKS;

export const CURRENT_NETWORK = (import.meta.env.VITE_STELLAR_NETWORK || 'standalone') as StellarNetwork;
export const CONFIG = STELLAR_NETWORKS[CURRENT_NETWORK];

export const CONTRACT_IDS = {
  batchRegistry: import.meta.env.VITE_BATCH_REGISTRY_CONTRACT_ID,
  grtToken: import.meta.env.VITE_GRT_TOKEN_CONTRACT_ID,
};

// Validate config on load (will throw if contracts not configured)
export function validateConfig() {
  if (!CONTRACT_IDS.batchRegistry || !CONTRACT_IDS.grtToken) {
    console.warn('⚠️ Contract IDs not configured. Set VITE_BATCH_REGISTRY_CONTRACT_ID and VITE_GRT_TOKEN_CONTRACT_ID in .env');
  }
}
