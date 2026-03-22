# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Project Essence

**green-loop-ledger** is a web dApp (not a self-custody wallet) for tracking recycled waste through multiple supply chain actors. Records go on-chain via Stellar/Soroban. Hackathon focus: stable end-to-end demo.

## Non-Negotiable Rules

### Blockchain Integration
- Web dApp only—**do not redesign into a browser wallet**
- Freighter wallet for signing (via `freighterService.signTransaction()`)
- Use `SorobanClient` for RPC calls (wraps `@stellar/stellar-sdk`)
- Always simulate before sending: simulate → assemble → sign → submit
- Poll for transaction result—`submitTransaction()` returns immediately; poll with `waitForTransaction()`
- No fake blockchain interactions; all contract calls must be real
- Contract service modules handle TX building; components stay clean

### Code Changes
- **Propose a plan before editing**—describe what files change and why
- Minimize refactors; preserve current routes, names, structure
- Keep contract logic isolated (services/modules, not in components)
- Tests for pure logic; mock data in `src/lib/mock-data.ts`

### Secrets & Configuration
- **Do NOT invent** secret keys, contract IDs, RPC URLs, env vars
- **Leave clear TODOs** if missing (e.g., `// TODO: add contract ID from deploy`)
- Use mock data during dev; `useWalletSession` for real Freighter
- Network: Soroban testnet (`https://soroban-testnet.stellar.org`)

### Priorities (in order)
1. End-to-end happy path (works start-to-finish)
2. Demo stability (no crashes, graceful errors)
3. Clear UX states (loading, success, error messages)
4. Tests for logic
5. Polish (animations, nice-to-haves)

## Tech Stack & Commands

| What | How |
|------|-----|
| **Framework** | React 18 + Vite + TypeScript + TailwindCSS + shadcn/ui |
| **State** | React Context + TanStack React Query |
| **DB** | Supabase (PostgreSQL) |
| **Blockchain** | Stellar SDK v14.6.1 + Soroban (Rust contracts) |
| **Wallet** | Freighter (browser extension) |
| **Deployment** | Stellar CLI v25.2.0 (not soroban-cli) |
| **Testing** | Vitest + React Testing Library |

**Commands**:
```bash
npm run dev          # Start dev server (localhost:8080)
npm run build        # Production build
npm run lint         # Check code
npm test             # Run tests
npm run test:watch   # Watch mode
```

## Directory Map

```
src/
├── pages/
│   ├── Index.tsx                 # Main router → dashboard based on user.rol
│   ├── LoginPage.tsx             # Auth flow (mock + Freighter connect)
│   └── dashboard/
│       ├── EmpresaDashboard.tsx      # Waste generator
│       ├── TransportistaDashboard.tsx # Transporter
│       ├── AcopioDashboard.tsx       # Collection center
│       ├── RecicladoraDashboard.tsx  # Recycling plant
│       └── CompradoraDashboard.tsx   # Buyer company
├── components/
│   ├── ui/                        # shadcn/ui components
│   ├── AppSidebar.tsx            # Navigation
│   ├── LoteTable.tsx             # Batch listing
│   ├── LoteDetail.tsx            # Batch detail
│   └── LoteTimeline.tsx          # Transaction log
├── contexts/
│   ├── AuthContext.tsx           # User login & rol
│   └── SessionContext.tsx        # Wallet session state
├── hooks/
│   ├── useLotesRealtime.ts       # Supabase realtime batches
│   ├── useWalletSession.ts       # Freighter / wallet connect
│   └── use-toast.ts              # Notifications
├── lib/
│   ├── supabase/                 # DB queries & client
│   ├── stellar/
│   │   ├── config.ts             # Network config, contract IDs, validation
│   │   ├── client/
│   │   │   ├── freighter.ts      # Freighter wallet adapter
│   │   │   └── soroban-client.ts # RPC client wrapper
│   │   └── contracts/
│   │       ├── contract-types.ts # TypeScript types for contracts
│   │       └── batch-registry.ts # BatchRegistryContract class
│   ├── mock-data.ts              # Test users & lotes
│   ├── types.ts                  # Type re-exports (→ src/types/database.ts)
│   └── utils.ts                  # Helpers
└── types/
    └── database.ts               # Authoritative schema types
```

## Data Model (Quick Ref)

```typescript
type Rol = 'empresa' | 'transportista' | 'acopio' | 'recicladora' | 'compradora'
type EstadoLote = 'pendiente' | 'en_transito' | 'en_acopio' | 'reciclado' | 'comprado'
type TipoResiduo = 'PET' | 'vidrio' | 'carton' | 'metal'

interface Lote {
  id, batch_id, tipo_residuo, peso_kg, estado, owner_actual,
  tokens_grt, tx_hash, created_at, updated_at
}

interface Transferencia {
  id, lote_id, de, para, accion, tx_hash, timestamp
}
```

See `src/lib/mock-data.ts` for examples.

## Workflow: How to Add a Feature

### Step 1: Propose
Write a plan (text or file) describing:
- What user flow or contract interaction this enables
- Exactly which files will be created/edited
- Where secrets/TODOs go (if needed)
- Risk: refactor size, data model changes, new dependencies

Example:
```
Plan: Add batch transfer to transportista
Files to touch:
  - src/components/LoteTable.tsx (add Transfer button)
  - src/hooks/useLotesRealtime.ts (new transfer mutation)
  - src/lib/soroban/transferService.ts (NEW—contract call)
  - src/pages/dashboard/EmpresaDashboard.tsx (import & use)

Contract call: Read owner, simulate, assemble, send to Freighter for sign.
Poll lote.owner_actual change via Supabase realtime.

Risk: Low. No schema change. Uses existing Freighter hook.
TODO: Add contract ID when deployed.
```

### Step 2: Implement
1. Create/edit files in the exact order listed
2. Keep component logic simple; move contract calls to service modules
3. Use existing UI components (shadcn/ui)
4. Test with mock data first

### Step 3: Test & Verify
- Dev server works: `npm run dev`
- No TypeScript errors: `npm run lint`
- End-to-end flow completes (happy path)

## Contract Integration (Real)

### Setup
1. Deploy contracts: `scripts/deploy.sh` (uses Stellar CLI v25+)
2. Copy contract IDs to `.env.local`:
   ```env
   VITE_STELLAR_NETWORK=testnet
   VITE_BATCH_REGISTRY_CONTRACT_ID=<contract-id-from-deploy>
   VITE_GRT_TOKEN_CONTRACT_ID=<contract-id-from-deploy>
   ```
3. Config auto-loads from `src/lib/stellar/config.ts`

### Building & Submitting a Transaction
```typescript
// src/lib/stellar/contracts/batch-registry.ts (already implemented)
import { batchRegistryContract } from '@/lib/stellar/contracts/batch-registry'
import { freighterService } from '@/lib/stellar/client/freighter'
import { sorobanClient } from '@/lib/stellar/client/soroban-client'

// 1. Build unsigned TX
const xdr = await batchRegistryContract.buildCreateBatchTx(publicKey, tipoResiduo, pesoKg)

// 2. Sign with Freighter
const signedXdr = await freighterService.signTransaction(xdr)

// 3. Submit & poll for result
const result = await batchRegistryContract.submitSignedTx(signedXdr)
// Returns: { success: boolean, tx_hash: string, batch_id?: string }
```

### Reading from Contract (No Signature)
```typescript
// In component:
import { batchRegistryContract } from '@/lib/stellar/contracts/batch-registry'

const batch = await batchRegistryContract.getBatch(batchId)
// Returns: { id, owner, estado, peso_kg, tokens_grt, ... }
```

### Supabase Realtime Update
```typescript
// Hook in src/hooks/useLotesRealtime.ts
const subscription = supabase
  .from('lotes')
  .on('*', payload => {
    // Update local state when lote changes on-chain
    refetch()
  })
  .subscribe()
```

## Key Files & Owners

| File | Owns | Notes |
|------|------|-------|
| `src/lib/stellar/config.ts` | Network config | Contract IDs from env; validates on load |
| `src/lib/stellar/client/freighter.ts` | Wallet connection | `freighterService.signTransaction(xdr)` |
| `src/lib/stellar/client/soroban-client.ts` | RPC calls | `sorobanClient.submitTransaction()`, poll via `waitForTransaction()` |
| `src/lib/stellar/contracts/batch-registry.ts` | create_batch, transfers | Returns unsigned XDR strings |
| `src/pages/LoginPage.tsx` | Auth + Freighter connect | Real wallet check; error messages in Spanish |
| `src/contexts/AuthContext.tsx` | User login, rol | Mock-based (preserve) |
| `src/pages/Index.tsx` | Route to dashboard | `DASHBOARD_MAP` by rol |
| `src/lib/supabase/*` | DB layer | Use React Query hooks |
| `scripts/deploy.sh` | Contract deployment | Uses Stellar CLI v25.2.0; updates .env.local |
| `vite.config.ts` | Build & dev server | Port 8080 |

## Anti-Patterns: What NOT to Do

❌ **Do NOT**:
- **Use soroban-cli** (outdated; use `stellar` CLI v25+)
- **Invent contract IDs, RPC URLs, or deploy fake contracts** (leave TODO or run deploy.sh)
- **Put contract logic in components** (use service modules like batch-registry.ts)
- **Assume `submitTransaction()` = success** (always poll with `waitForTransaction()`)
- **Make mock contract calls** (use real Freighter + Soroban testnet or use mock-data for tests)
- **Refactor unrelated code** during feature work
- **Commit .env.local or secret keys**
- **Bypass Freighter signing** (don't build alternate wallets)

✅ **DO**:
- Use `stellar contract build`, `stellar contract deploy`, `stellar contract invoke`
- Run `scripts/deploy.sh` once to generate real contract IDs
- Import from `src/lib/stellar/contracts/` for contract calls
- Poll for transaction result before claiming success
- Test happy path: build TX → sign → submit → poll → verify state
- Use `freighterService.signTransaction()` for user confirmation
- Keep components clean; logic in service modules
- Leave clear TODOs if contract IDs missing

## Deployment (Stellar Testnet)

### Prerequisites
- Stellar CLI v25.2.0: `stellar --version`
- Rust toolchain: `rustc --version`
- Bash shell (for deploy.sh)

### Deploy Contracts
```bash
cd green-loop-ledger
bash scripts/deploy.sh
```

**What it does**:
1. Checks for Stellar CLI & Rust cargo
2. Configures testnet network & admin account
3. Funds admin account via Friendbot
4. Builds `contracts/batch-registry` → WASM
5. Builds `contracts/grt-token` → WASM
6. Deploys both to testnet, extracts contract IDs
7. Initializes contracts with admin role & token metadata
8. **Saves contract IDs to `.env.local`** automatically

### Verify Deployment
```bash
cat .env.local | grep VITE_
# Should see:
# VITE_STELLAR_NETWORK=testnet
# VITE_BATCH_REGISTRY_CONTRACT_ID=C...
# VITE_GRT_TOKEN_CONTRACT_ID=C...
```

## Testing

```bash
npm test                                    # Run all tests
npm test -- src/test/example.test.ts        # Single test
npm run test:watch                          # Watch mode
```

Tests go in `src/test/` or alongside components (`.test.ts` / `.spec.ts`).

## Debugging

- **Network**: DevTools Network tab + console logs
- **Blockchain**: Log `tx_hash`, poll status, check testnet explorer
- **State**: React DevTools → Contexts
- **Build**: `rm -rf node_modules dist && npm install && npm run build`
- **Types**: Check `src/types/database.ts` (source of truth)

## Next Steps: Connecting create_batch

### Phase 1: Empresa Creates Batch (Ready to Implement)
**Files to touch**:
- `src/pages/dashboard/EmpresaDashboard.tsx` (form input for tipo_residuo + peso_kg)
- `src/lib/supabase/batches.ts` (new mutation: `createBatch()`)
- Components use `batchRegistryContract.buildCreateBatchTx()` + `freighterService.signTransaction()` + `submitSignedTx()`

**Flow**:
1. User enters tipo_residuo + peso_kg
2. Click "Crear Lote" → calls `buildCreateBatchTx(publicKey, tipo, peso)`
3. Freighter popup → user reviews & signs
4. TX submitted, polling begins
5. On SUCCESS: fetch batch_id, save to Supabase via `criarLote()`
6. Display tx_hash + batch_id to user

**Code example**:
```typescript
const handleCreateBatch = async (tipo: TipoResiduo, peso: number) => {
  const xdr = await batchRegistryContract.buildCreateBatchTx(publicKey, tipo, peso)
  const signed = await freighterService.signTransaction(xdr)
  const result = await batchRegistryContract.submitSignedTx(signed)
  if (result.success) {
    await supabase.from('lotes').insert({ batch_id: result.batch_id, tx_hash: result.tx_hash, ... })
    showToast(`Lote creado: ${result.batch_id}`)
  }
}
```

## Hackathon Checklist

- [ ] Contracts deployed, .env.local populated
- [ ] Login flow works (mock + Freighter-ready)
- [ ] Create batch (empresa role) ← **NEXT PRIORITY**
- [ ] Transfer batch (to transportista)
- [ ] Receive batch (transportista → acopio)
- [ ] Complete cycle (end state = reciclado or comprado)
- [ ] No crashes or hangs
- [ ] Error messages are clear (Spanish)
- [ ] Timestamps & tx hashes logged
- [ ] Demo runs locally without manual setup

---

**Remember**: Propose → Implement → Verify. Small, stable steps. Freighter for signing. Supabase for state. Move fast.
