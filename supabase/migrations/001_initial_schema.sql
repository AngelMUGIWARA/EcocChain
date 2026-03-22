-- ============================================================
-- Green Loop Ledger — Initial Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── Tabla: users ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT NOT NULL UNIQUE,
  nombre         TEXT NOT NULL,
  rol            TEXT NOT NULL CHECK (rol = ANY (ARRAY['empresa','transportista','acopio','recicladora','compradora'])),
  email          TEXT,
  company_name   TEXT,
  tx_hash        TEXT,
  created_at     TIMESTAMPTZ DEFAULT now(),
  updated_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read users"   ON public.users FOR SELECT USING (true);
CREATE POLICY "Public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update users" ON public.users FOR UPDATE USING (true);

-- ─── Tabla: batches ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.batches (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id         TEXT NOT NULL UNIQUE,
  tipo_residuo     TEXT NOT NULL CHECK (tipo_residuo = ANY (ARRAY['PET','vidrio','cartón','metal'])),
  peso_kg          INTEGER NOT NULL,
  peso_recibido    INTEGER DEFAULT 0,
  kg_reciclados    INTEGER DEFAULT 0,
  estado           TEXT NOT NULL CHECK (estado = ANY (ARRAY['pendiente','en_transito','en_acopio','reciclado','comprado'])),
  owner_actual     TEXT NOT NULL,
  empresa_origen   TEXT NOT NULL,
  tokens_grt       INTEGER DEFAULT 0,
  creation_tx_hash TEXT NOT NULL,
  last_tx_hash     TEXT,
  created_at       TIMESTAMPTZ NOT NULL,
  updated_at       TIMESTAMPTZ NOT NULL,
  indexed_at       TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read batches"   ON public.batches FOR SELECT USING (true);
CREATE POLICY "Public insert batches" ON public.batches FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update batches" ON public.batches FOR UPDATE USING (true);

-- ─── Tabla: transfers ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.transfers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id        TEXT NOT NULL,
  de              TEXT NOT NULL,
  para            TEXT NOT NULL,
  accion          TEXT NOT NULL CHECK (accion = ANY (ARRAY['creado','transferido','confirmado','comprado'])),
  peso_recibido   INTEGER,
  kg_reciclados   INTEGER,
  tokens_emitidos INTEGER,
  tx_hash         TEXT NOT NULL,
  ledger_number   BIGINT,
  timestamp       TIMESTAMPTZ NOT NULL,
  indexed_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT fk_batch FOREIGN KEY (batch_id) REFERENCES public.batches(batch_id)
);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read transfers"   ON public.transfers FOR SELECT USING (true);
CREATE POLICY "Public insert transfers" ON public.transfers FOR INSERT WITH CHECK (true);

-- ─── Tabla: sync_status ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.sync_status (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  last_synced_ledger  BIGINT NOT NULL DEFAULT 1,
  last_synced_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_errors         INTEGER DEFAULT 0,
  updated_at          TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.sync_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read sync_status"   ON public.sync_status FOR SELECT USING (true);
CREATE POLICY "Public update sync_status" ON public.sync_status FOR UPDATE USING (true);

-- Seed one row for sync_status
INSERT INTO public.sync_status (last_synced_ledger) VALUES (1)
ON CONFLICT DO NOTHING;

-- ─── Vista: v_timeline_batch ──────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.v_timeline_batch AS
SELECT
  t.id,
  t.batch_id,
  b.tipo_residuo,
  b.peso_kg,
  b.tokens_grt,
  t.de,
  t.para,
  t.accion,
  t.peso_recibido,
  t.kg_reciclados,
  t.tokens_emitidos,
  t.tx_hash,
  t.ledger_number,
  t.timestamp
FROM public.transfers t
JOIN public.batches b ON b.batch_id = t.batch_id
ORDER BY t.timestamp ASC;
