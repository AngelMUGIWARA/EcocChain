-- Users table (off-chain user profiles)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('empresa', 'transportista', 'acopio', 'recicladora', 'compradora')),
  email TEXT,
  company_name TEXT,
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_rol ON users(rol);

-- Batches table (indexed from blockchain)
CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT UNIQUE NOT NULL,
  tipo_residuo TEXT NOT NULL CHECK (tipo_residuo IN ('PET', 'vidrio', 'cartón', 'metal')),
  peso_kg INTEGER NOT NULL,
  peso_recibido INTEGER DEFAULT 0,
  kg_reciclados INTEGER DEFAULT 0,
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'en_transito', 'en_acopio', 'reciclado', 'comprado')),
  owner_actual TEXT NOT NULL,
  empresa_origen TEXT NOT NULL,
  tokens_grt INTEGER DEFAULT 0,
  creation_tx_hash TEXT NOT NULL,
  last_tx_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  indexed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_batches_batch_id ON batches(batch_id);
CREATE INDEX idx_batches_owner ON batches(owner_actual);
CREATE INDEX idx_batches_estado ON batches(estado);
CREATE INDEX idx_batches_empresa ON batches(empresa_origen);
CREATE INDEX idx_batches_created ON batches(created_at DESC);

-- Transfers table (indexed from blockchain events)
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id TEXT NOT NULL,
  de TEXT NOT NULL,
  para TEXT NOT NULL,
  accion TEXT NOT NULL CHECK (accion IN ('creado', 'transferido', 'confirmado', 'comprado')),
  peso_recibido INTEGER,
  kg_reciclados INTEGER,
  tokens_emitidos INTEGER,
  tx_hash TEXT NOT NULL,
  ledger_number BIGINT,
  timestamp TIMESTAMPTZ NOT NULL,
  indexed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) REFERENCES batches(batch_id) ON DELETE CASCADE
);

CREATE INDEX idx_transfers_batch ON transfers(batch_id);
CREATE INDEX idx_transfers_de ON transfers(de);
CREATE INDEX idx_transfers_para ON transfers(para);
CREATE INDEX idx_transfers_tx_hash ON transfers(tx_hash);
CREATE INDEX idx_transfers_timestamp ON transfers(timestamp DESC);

-- Sync status (for blockchain indexer)
CREATE TABLE sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_synced_ledger BIGINT NOT NULL DEFAULT 1,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sync_errors INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial sync status
INSERT INTO sync_status (last_synced_ledger, last_synced_at) VALUES (1, NOW());

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Policies: Allow public read access (blockchain data is public)
CREATE POLICY users_read_all ON users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY batches_read_all ON batches
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY transfers_read_all ON transfers
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policies: Allow users to insert their own record
CREATE POLICY users_insert_own ON users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Note: Updates to batches/transfers should come from indexer service
-- For now, allow inserts for development
CREATE POLICY batches_insert ON batches
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY transfers_insert ON transfers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER batches_updated_at
  BEFORE UPDATE ON batches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
