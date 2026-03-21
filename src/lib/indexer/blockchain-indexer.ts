import { SorobanRpc, scValToNative } from '@stellar/stellar-sdk';
import { sorobanClient } from '../client/soroban-client';
import { CONTRACT_IDS } from '../config';
import { supabase } from '@/integrations/supabase/client';

export interface BlockchainEvent {
  type: 'BatchCreated' | 'BatchTransferred' | 'BatchRecycled' | 'BatchPurchased';
  batchId: string;
  data: any;
  txHash: string;
  ledger: number;
  timestamp: Date;
}

export class BlockchainIndexer {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start continuous synchronization
   */
  async start(intervalMs: number = 5000) {
    if (this.isRunning) {
      console.warn('Indexer already running');
      return;
    }

    this.isRunning = true;
    console.log('🔄 Blockchain indexer started');

    // Run immediately
    await this.sync();

    // Then poll periodically
    this.intervalId = setInterval(async () => {
      await this.sync();
    }, intervalMs);
  }

  /**
   * Stop synchronization
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Blockchain indexer stopped');
  }

  /**
   * Sync events from blockchain to Supabase
   */
  async sync() {
    try {
      // 1. Get last synced ledger
      const { data: syncStatus } = await supabase
        .from('sync_status')
        .select('last_synced_ledger')
        .single();

      const startLedger = syncStatus?.last_synced_ledger || 1;

      // 2. Get current ledger
      const latestLedger = await sorobanClient.getLatestLedger();
      const currentLedger = latestLedger.sequence;

      if (currentLedger <= startLedger) {
        // No new ledgers to process
        return;
      }

      console.log(`📦 Syncing ledgers ${startLedger} to ${currentLedger}`);

      // 3. Fetch events from contract
      const events = await sorobanClient.getEvents({
        contractIds: [CONTRACT_IDS.batchRegistry!],
        startLedger,
        limit: 200,
      });

      // 4. Process each event
      for (const event of events.events || []) {
        await this.processEvent(event);
      }

      // 5. Update sync status
      await supabase
        .from('sync_status')
        .update({
          last_synced_ledger: currentLedger,
          last_synced_at: new Date().toISOString(),
        })
        .eq('id', syncStatus?.id || '');

      if (events.events && events.events.length > 0) {
        console.log(`✅ Processed ${events.events.length} events`);
      }
    } catch (error) {
      console.error('❌ Indexer sync error:', error);

      // Increment error counter
      await supabase.rpc('increment_sync_errors').catch(() => {
        // Ignore if RPC doesn't exist
      });
    }
  }

  /**
   * Process a single blockchain event
   */
  private async processEvent(event: any) {
    try {
      // Parse event topic to determine type
      const topicStr = event.topic?.[0] || '';
      const eventType = this.parseEventType(topicStr);

      if (!eventType) {
        console.warn('Unknown event type:', topicStr);
        return;
      }

      // Extract common data
      const txHash = event.txHash || '';
      const ledger = event.ledger || 0;
      const timestamp = this.ledgerToTimestamp(ledger);

      // Parse event data based on type
      const parsedData = this.parseEventData(event);

      switch (eventType) {
        case 'BatchCreated':
          await this.handleBatchCreated(parsedData, txHash, ledger, timestamp);
          break;

        case 'BatchTransferred':
          await this.handleBatchTransferred(parsedData, txHash, ledger, timestamp);
          break;

        case 'BatchRecycled':
          await this.handleBatchRecycled(parsedData, txHash, ledger, timestamp);
          break;

        case 'BatchPurchased':
          await this.handleBatchPurchased(parsedData, txHash, ledger, timestamp);
          break;
      }
    } catch (error) {
      console.error('Failed to process event:', error, event);
    }
  }

  /**
   * Handle BatchCreated event
   */
  private async handleBatchCreated(data: any, txHash: string, ledger: number, timestamp: Date) {
    const { batch_id, empresa, tipo_residuo, peso_kg } = data;

    // Insert new batch
    const { error } = await supabase.from('batches').insert({
      batch_id: batch_id.toString(),
      tipo_residuo: this.mapTipoResiduo(tipo_residuo),
      peso_kg,
      estado: 'pendiente',
      owner_actual: empresa,
      empresa_origen: empresa,
      tokens_grt: 0,
      creation_tx_hash: txHash,
      last_tx_hash: txHash,
      created_at: timestamp.toISOString(),
      updated_at: timestamp.toISOString(),
    });

    if (error) {
      console.error('Failed to insert batch:', error);
    }

    // Insert transfer record
    await supabase.from('transfers').insert({
      batch_id: batch_id.toString(),
      de: empresa,
      para: empresa,
      accion: 'creado',
      tx_hash: txHash,
      ledger_number: ledger,
      timestamp: timestamp.toISOString(),
    });
  }

  /**
   * Handle BatchTransferred event (accept_pickup or confirm_reception)
   */
  private async handleBatchTransferred(data: any, txHash: string, ledger: number, timestamp: Date) {
    const { batch_id, from, to, new_estado } = data;

    // Update batch
    const { error } = await supabase
      .from('batches')
      .update({
        estado: this.mapEstado(new_estado),
        owner_actual: to,
        last_tx_hash: txHash,
        updated_at: timestamp.toISOString(),
      })
      .eq('batch_id', batch_id.toString());

    if (error) {
      console.error('Failed to update batch:', error);
    }

    // Insert transfer record
    await supabase.from('transfers').insert({
      batch_id: batch_id.toString(),
      de: from,
      para: to,
      accion: 'transferido',
      tx_hash: txHash,
      ledger_number: ledger,
      timestamp: timestamp.toISOString(),
    });
  }

  /**
   * Handle BatchRecycled event
   */
  private async handleBatchRecycled(data: any, txHash: string, ledger: number, timestamp: Date) {
    const { batch_id, recicladora, kg_reciclados, tokens_minted } = data;

    // Update batch
    const { error } = await supabase
      .from('batches')
      .update({
        estado: 'reciclado',
        owner_actual: recicladora,
        kg_reciclados,
        tokens_grt: Math.floor(tokens_minted / 10_000_000), // Convert from token units
        last_tx_hash: txHash,
        updated_at: timestamp.toISOString(),
      })
      .eq('batch_id', batch_id.toString());

    if (error) {
      console.error('Failed to update batch for recycling:', error);
    }

    // Insert transfer record
    await supabase.from('transfers').insert({
      batch_id: batch_id.toString(),
      de: '', // Previous owner (could be parsed from batch)
      para: recicladora,
      accion: 'confirmado',
      kg_reciclados,
      tokens_emitidos: Math.floor(tokens_minted / 10_000_000),
      tx_hash: txHash,
      ledger_number: ledger,
      timestamp: timestamp.toISOString(),
    });
  }

  /**
   * Handle BatchPurchased event
   */
  private async handleBatchPurchased(data: any, txHash: string, ledger: number, timestamp: Date) {
    const { batch_id, compradora } = data;

    // Update batch
    const { error } = await supabase
      .from('batches')
      .update({
        estado: 'comprado',
        owner_actual: compradora,
        last_tx_hash: txHash,
        updated_at: timestamp.toISOString(),
      })
      .eq('batch_id', batch_id.toString());

    if (error) {
      console.error('Failed to update batch for purchase:', error);
    }

    // Insert transfer record
    await supabase.from('transfers').insert({
      batch_id: batch_id.toString(),
      de: '', // Previous owner
      para: compradora,
      accion: 'comprado',
      tx_hash: txHash,
      ledger_number: ledger,
      timestamp: timestamp.toISOString(),
    });
  }

  // Helper methods

  private parseEventType(topic: string): BlockchainEvent['type'] | null {
    if (topic.includes('created')) return 'BatchCreated';
    if (topic.includes('transfer')) return 'BatchTransferred';
    if (topic.includes('recycled')) return 'BatchRecycled';
    if (topic.includes('purchased')) return 'BatchPurchased';
    return null;
  }

  private parseEventData(event: any): any {
    // Parse ScVal data from event
    try {
      const value = event.value;
      if (!value) return {};

      return scValToNative(value);
    } catch (error) {
      console.error('Failed to parse event data:', error);
      return {};
    }
  }

  private mapTipoResiduo(symbol: string): string {
    const map: Record<string, string> = {
      'PET': 'PET',
      'vidrio': 'vidrio',
      'carton': 'cartón',
      'metal': 'metal',
    };
    return map[symbol] || symbol;
  }

  private mapEstado(symbol: string): string {
    const map: Record<string, string> = {
      'pendiente': 'pendiente',
      'transito': 'en_transito',
      'acopio': 'en_acopio',
      'reciclado': 'reciclado',
      'comprado': 'comprado',
    };
    return map[symbol] || symbol;
  }

  private ledgerToTimestamp(ledger: number): Date {
    // Stellar genesis timestamp + ledger * 5 seconds (approximate)
    // Genesis: July 31, 2015 16:00:00 UTC
    const genesisTime = 1438358400000;
    const ledgerTime = genesisTime + (ledger * 5000);
    return new Date(ledgerTime);
  }
}

// Export singleton instance
export const blockchainIndexer = new BlockchainIndexer();
