/**
 * Start the blockchain indexer
 * This script should be run as a separate Node.js process
 * or as part of the main application in development
 */

import { blockchainIndexer } from './blockchain-indexer';

// Start indexer with 5-second polling interval
blockchainIndexer.start(5000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down indexer...');
  blockchainIndexer.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  blockchainIndexer.stop();
  process.exit(0);
});

console.log('✅ Indexer service started');
console.log('📡 Polling Stellar network every 5 seconds');
console.log('Press Ctrl+C to stop\n');
