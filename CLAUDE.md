# CLAUDE.md — green-loop-ledger

## What this project is

A supply-chain tracking app for recyclable waste in Mexico. Five actor types (empresa, transportista, acopio, recicladora, compradora) move physical batches through a lifecycle. Each state transition is recorded on Stellar/Soroban as an on-chain transaction. Supabase acts as a read-optimized mirror of on-chain state so the UI never queries the blockchain directly for lists.

---

## Stack (real, verified)

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React 18 + Vite (SWC) | React 18.3, Vite 5.4 |
| Language | TypeScript | 5.8 |
| Routing | React Router v6 | 6.30 |
| State/Fetch | TanStack Query v5 | 5.83 |
| UI components | shadcn/ui (Radix primitives) | see package.json |
| Styling | Tailwind CSS v3 | 3.4 |
| Forms | react-hook-form + zod | 7.x / 3.x |
| Blockchain | Stellar/Soroban via @stellar/stellar-sdk | 14.6 |
| Wallet | Freighter browser extension (@stellar/freighter-api) | 6.0 |
| Database | Supabase (Postgres + RLS) | @supabase/supabase-js 2.99 |
| Tests (unit) | Vitest + @testing-library/react | 3.2 / 16.0 |
| Tests (e2e) | Playwright | 1.57 |
| Dev server port | 8080 | — |

**This is NOT Next.js.** The folder is named "Next.js projects" but the app is pure Vite/React SPA with no SSR, no app router, no server components, no API routes.

---

## Commands

```bash
# Install
npm install

# Dev server (localhost:8080)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Unit tests (single run)
npm run test

# Unit tests (watch)
npm run test:watch

# Lint
npm run lint
```

No `npm run migrate`. Supabase migrations are applied manually via the Supabase dashboard or Supabase CLI (`supabase db push`).

---

## Environment variables

File: `.env` at project root. All must be prefixed `VITE_` to be available in the browser.

```env
# Supabase (already configured and working)
VITE_SUPABASE_URL=https://aaamxafbiaehkytjzqpe.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJ...
VITE_SUPABASE_PROJECT_ID=aaamxafbiaehkytjzqpe

# Stellar — REQUIRED before any contract feature works
VITE_STELLAR_NETWORK=testnet          # or: standalone
VITE_BATCH_REGISTRY_CONTRACT_ID=      # Soroban contract address (C...)
VITE_GRT_TOKEN_CONTRACT_ID=           # Soroban contract address (C...)
```

`VITE_BATCH_REGISTRY_CONTRACT_ID` and `VITE_GRT_TOKEN_CONTRACT_ID` are currently empty. Any code path that instantiates `BatchRegistryContract` or `GRTTokenContract` will throw at module load time until these are set.

---

## Project structure

```
src/
  App.tsx                        # Root: QueryClientProvider > AuthProvider > Router
  main.tsx                       # Entry point
  contexts/
    AuthContext.tsx               # Auth context — wraps useStellarAuth
  pages/
    Index.tsx                    # Role router → picks dashboard by user.rol
    LoginPage.tsx                # Freighter connect + new user registration
    NotFound.tsx
    dashboard/
      EmpresaDashboard.tsx       # Creates batches
      TransportistaDashboard.tsx # Accepts pickup
      AcopioDashboard.tsx        # Confirms reception
      RecicladoraDashboard.tsx   # Confirms recycling, mints GRT
      CompradoraDashboard.tsx    # Purchases batches
  hooks/
    useBatches.ts                # Reads from Supabase `batches` table
  components/
    AppSidebar.tsx
    LoteTable.tsx
    LoteDetail.tsx
    LoteTimeline.tsx
    StatCard.tsx
    EstadoBadge.tsx
    NavLink.tsx
    ui/                          # shadcn/ui generated components — do not edit by hand
  lib/
    types.ts                     # Canonical domain types (Rol, EstadoLote, Lote, etc.)
    mock-data.ts                 # Static test data — still present, not wired to any page
    utils.ts                     # cn() helper only
    stellar/
      config.ts                  # Network selection + CONTRACT_IDS from env
      client/
        freighter.ts             # FreighterService — wraps @stellar/freighter-api
        soroban-client.ts        # SorobanClient — wraps rpc.Server
      contracts/
        contract-types.ts        # StellarError, TransactionResult, BatchData, etc.
        batch-registry.ts        # BatchRegistryContract — builds + submits txs
        grt-token.ts             # GRTTokenContract — balance, transfer, total_supply
      services/
        batch-service.ts         # BatchService — orchestrates wallet+contract calls
      hooks/
        useStellarAuth.ts        # Freighter connect → Supabase user lookup/register
        useBatchOperations.ts    # React hook used by dashboards for write operations
        useGRTBalance.ts         # Reads GRT balance + total supply from contract
      utils/
        error-handler.ts         # classifyError() → StellarError
        friendbot.ts             # Auto-fund accounts on testnet/standalone
  integrations/
    supabase/
      client.ts                  # createClient singleton
      types.ts                   # Generated Supabase types — CURRENTLY EMPTY SCHEMA
supabase/
  config.toml                    # project_id only
  migrations/
    001_initial_schema_mvp.sql   # USE THIS ONE — correct schema with all tables
    001_initial_schema.sql       # Older/alternate version — do not apply both
```

---

## Path alias

`@/` maps to `src/`. Use it everywhere. Never use relative `../../` imports.

---

## Naming conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| React components | PascalCase files and exports | `LoteTable.tsx`, `EmpresaDashboard.tsx` |
| Hooks | camelCase, prefix `use` | `useBatchOperations.ts` |
| Services/clients | PascalCase class, camelCase singleton export | `class BatchService`, `export const batchService` |
| Types | PascalCase interfaces/types | `BatchData`, `StellarError` |
| Domain fields | snake_case matching Supabase columns | `batch_id`, `owner_actual`, `tipo_residuo` |
| Env vars | SCREAMING_SNAKE, prefixed `VITE_` | `VITE_BATCH_REGISTRY_CONTRACT_ID` |
| Contract method names | snake_case matching Soroban contract | `create_batch`, `accept_pickup` |

---

## Data flow architecture

```
User action (click)
  → dashboard component
    → useBatchOperations hook
      → BatchService (src/lib/stellar/services/batch-service.ts)
        → FreighterService.getPublicKey()
        → BatchRegistryContract.build*Tx()   ← builds XDR
        → SorobanClient.simulateTransaction() ← gets accurate fee
        → FreighterService.signTransaction()  ← Freighter popup
        → BatchRegistryContract.submitSignedTx()
        → [MISSING] → INSERT result into Supabase batches table
  → TanStack Query invalidates ['batches'] key
    → useBatches() refetches from Supabase
      → UI updates
```

**Read path**: UI always reads from Supabase, never from the contract directly (except GRT balance).
**Write path**: UI writes to the Soroban contract, then must mirror result to Supabase.

The sync from contract → Supabase is the missing bridge. It belongs in `batch-service.ts` after each `submitSignedTx` call.

---

## Supabase schema

The canonical migration is `supabase/migrations/001_initial_schema_mvp.sql`. Tables:

- `users` — wallet_address (unique), nombre, rol
- `batches` — mirrors on-chain batch state; `batch_id` is the on-chain u128 as string; `creation_tx_hash` and `last_tx_hash` track Stellar tx hashes
- `transfers` — append-only log of each state transition with tx_hash and ledger_number
- `sync_status` — single-row table tracking last indexed ledger (for future indexer)

RLS is enabled. All tables have open SELECT for anon and authenticated. INSERT is also open for anon. There are no UPDATE policies — updates to `batches` must use a Supabase service role key from a backend/edge function, or the RLS policy needs to be extended.

`src/integrations/supabase/types.ts` is auto-generated and currently empty (no tables defined). After applying the migration, regenerate it with:
```bash
npx supabase gen types typescript --project-id aaamxafbiaehkytjzqpe > src/integrations/supabase/types.ts
```

---

## How to add a new Stellar contract interaction

1. Add the method to the relevant contract class in `src/lib/stellar/contracts/`
2. Add the orchestration call in `src/lib/stellar/services/batch-service.ts`
3. After `submitSignedTx`, INSERT/UPDATE the result in Supabase
4. Expose it in `src/lib/stellar/hooks/useBatchOperations.ts`
5. Call the hook in the dashboard component

Do not add new contract classes unless there is a new deployed contract. Do not add new services — put everything in `BatchService` unless it clearly belongs to a separate domain.

---

## Delicate files — read before touching

| File | Why it's delicate |
|------|------------------|
| `src/lib/stellar/contracts/batch-registry.ts` | ScVal encoding must match the Soroban contract exactly. Wrong types cause silent simulation failures, not compile errors. `cartón` maps to `carton` (no accent) on-chain. |
| `src/lib/stellar/contracts/grt-token.ts` | GRT balance uses i128 with 10^7 decimals. Arithmetic on this as a JS number will lose precision for large balances — use BigInt path if amounts exceed 10^8. |
| `src/lib/stellar/config.ts` | Instantiated at module load time as singleton. Adding a `validateConfig()` call anywhere that runs at startup will throw if env vars are missing. Currently the singletons at the bottom of `batch-registry.ts` and `grt-token.ts` throw on import if CONTRACT_IDs are empty. |
| `src/integrations/supabase/types.ts` | Auto-generated. Do not edit by hand. Regenerate after schema changes. |
| `supabase/migrations/001_initial_schema_mvp.sql` | The correct migration. Do not apply `001_initial_schema.sql` on top of it — they define the same tables. |
| `src/lib/types.ts` | Single source of truth for domain types. `EstadoLote` values must match both Supabase CHECK constraints and Soroban symbol mapping in `batch-registry.ts`. Changing a value here requires changing all three places. |
| `src/contexts/AuthContext.tsx` | `switchRole` is intentionally a no-op with a console.warn. Do not implement it — one wallet = one role is a core design constraint. |

---

## What a future agent must NOT assume

- **Not Next.js**. No `app/`, no `pages/` with file-based routing, no `getServerSideProps`, no API routes, no server components. This is a plain Vite SPA.
- **Contracts are not deployed yet**. `VITE_BATCH_REGISTRY_CONTRACT_ID` and `VITE_GRT_TOKEN_CONTRACT_ID` are empty. Do not assume contract IDs exist anywhere in the repo.
- **Supabase schema is not applied yet**. The `types.ts` is empty. `useBatches` and `useBatch` will fail with a Supabase error until the migration is run.
- **mock-data.ts is not wired to any page**. It exists but is not imported by any dashboard. Do not treat it as the current data source.
- **There is no backend/server**. No Express, no Edge Functions, no worker. All Supabase writes happen from the browser with the anon key. This means no service-role operations are possible without adding an Edge Function.
- **The batchId returned after createBatch is a placeholder**. `batch-service.ts:35` uses `Date.now()` as a temporary ID. The real batch ID should come from parsing the contract's return value or events after submission. This is a known gap.
- **Freighter is a browser extension**. It cannot be used in Node.js, Vitest, or any test environment. Do not write tests that call freighterService directly.
- **TanStack Query v5 API**. The `useQuery` / `useMutation` API changed in v5. Do not use v4 patterns (`onSuccess` in options, `isLoading` without the `status` check, etc.).
- **Two migration files exist but only one is correct**. Use `001_initial_schema_mvp.sql`. Ignore `001_initial_schema.sql`.
- **Supabase RLS has no UPDATE policy**. Calling `.update()` from the browser with the anon key will silently return 0 rows updated. Batch state updates from the frontend must go through INSERT + a trigger, or require a service-role Edge Function.
- **`cartón` vs `carton`**: The UI type uses `cartón` (with accent). The Soroban contract uses `carton` (no accent). The mapping lives in `batch-registry.ts:mapTipoResiduoToSymbol`. Do not "fix" either side without updating both.
