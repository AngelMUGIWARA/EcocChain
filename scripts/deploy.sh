#!/bin/bash
set -e

echo "========================================="
echo "  Green Loop Ledger - Contract Deploy"
echo "  Using Stellar CLI v25+"
echo "========================================="
echo ""

# ─── 0. Resolve project root ──────────────────────────────────────
# Works whether called as `bash scripts/deploy.sh` or from any CWD
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"
echo "Project root: $PROJECT_ROOT"

# ─── 1. Verify dependencies ───────────────────────────────────────
echo ""
echo "[1/5] Verifying dependencies..."

if ! command -v stellar &> /dev/null; then
    echo "ERROR: Stellar CLI not found."
    echo "       Install from: https://github.com/stellar/cli/releases"
    exit 1
fi

if ! command -v cargo &> /dev/null; then
    echo "ERROR: Rust cargo not found."
    echo "       Install from: https://rustup.rs/"
    exit 1
fi

STELLAR_VERSION=$(stellar --version 2>&1 | grep -oP '\d+\.\d+\.\d+' | head -1)
echo "OK  Stellar CLI: $STELLAR_VERSION"
echo "OK  Cargo found: $(cargo --version)"

# ─── 2. Configure network ─────────────────────────────────────────
echo ""
echo "[2/5] Configuring testnet network..."

# FIX: v25+ syntax — positional arg `testnet`, not --name testnet
stellar network add \
    --global \
    testnet \
    --rpc-url "https://soroban-testnet.stellar.org" \
    --network-passphrase "Test SDF Network ; September 2015" \
    2>/dev/null && echo "OK  Network 'testnet' configured" \
    || echo "    Network 'testnet' already exists (OK)"

# ─── 3. Admin keypair ─────────────────────────────────────────────
echo ""
echo "[3/5] Setting up admin keypair..."

# FIX: `stellar keys ls` to check existence; no `stellar keys show`
if stellar keys ls 2>/dev/null | grep -q "^admin$"; then
    echo "    Using existing admin key"
else
    echo "    Generating new admin key..."
    stellar keys generate admin --network testnet
    echo "    Funding admin account via Friendbot..."
    # FIX: `stellar keys fund` is a separate subcommand in v25+
    stellar keys fund admin --network testnet
fi

# FIX: `stellar keys address` replaces `stellar keys show --testnet --format json`
ADMIN_ADDRESS=$(stellar keys address admin)
echo "OK  Admin address: $ADMIN_ADDRESS"

# ─── 4. Build contracts ───────────────────────────────────────────
echo ""
echo "[4/5] Building contracts..."

# ── 4a. Batch Registry ──────────────────────────────────────────
# Workspace root (Cargo.toml [workspace]) is at contracts/batch-registry/
# Inner crate is at contracts/batch-registry/contracts/hello-world/
# stellar contract build must run from the WORKSPACE root
REGISTRY_WORKSPACE="$PROJECT_ROOT/contracts/batch-registry"

if [ ! -f "$REGISTRY_WORKSPACE/Cargo.toml" ]; then
    echo "ERROR: Batch Registry workspace Cargo.toml not found at:"
    echo "       $REGISTRY_WORKSPACE/Cargo.toml"
    exit 1
fi

echo "    Building batch-registry..."
cd "$REGISTRY_WORKSPACE"
stellar contract build
cd "$PROJECT_ROOT"
echo "OK  Batch Registry built"

# WASM lands at contracts/batch-registry/target/.../hello_world.wasm
# (package name "hello-world" → hyphen becomes underscore in filename)
REGISTRY_WASM=$(find "$REGISTRY_WORKSPACE/target/wasm32v1-none/release/" -name "*.wasm" 2>/dev/null | head -1)
if [ -z "$REGISTRY_WASM" ]; then
    REGISTRY_WASM=$(find "$REGISTRY_WORKSPACE/target/wasm32-unknown-unknown/release/" -name "*.wasm" 2>/dev/null | head -1)
fi

if [ -z "$REGISTRY_WASM" ] || [ ! -f "$REGISTRY_WASM" ]; then
    echo "ERROR: WASM file not found after build in $REGISTRY_WORKSPACE/target/"
    exit 1
fi
echo "    WASM: $REGISTRY_WASM"

# ── 4b. GRT Token ───────────────────────────────────────────────
# Workspace root is at contracts/grt-token/
GRT_TOKEN_WORKSPACE="$PROJECT_ROOT/contracts/grt-token"
TOKEN_ID=""
TOKEN_WASM=""

if [ -f "$GRT_TOKEN_WORKSPACE/Cargo.toml" ]; then
    echo "    Building grt-token..."
    cd "$GRT_TOKEN_WORKSPACE"
    stellar contract build
    cd "$PROJECT_ROOT"
    echo "OK  GRT Token built"

    TOKEN_WASM=$(find "$GRT_TOKEN_WORKSPACE/target/wasm32v1-none/release/" -name "*.wasm" 2>/dev/null | head -1)
    if [ -z "$TOKEN_WASM" ]; then
        TOKEN_WASM=$(find "$GRT_TOKEN_WORKSPACE/target/wasm32-unknown-unknown/release/" -name "*.wasm" 2>/dev/null | head -1)
    fi
else
    echo "WARN: contracts/grt-token/Cargo.toml not found — skipping token deployment"
fi

# ─── 5. Deploy contracts ──────────────────────────────────────────
echo ""
echo "[5/5] Deploying to testnet..."

# ── 5a. Deploy Batch Registry ──────────────────────────────────
echo "    Deploying Batch Registry..."
# FIX: v25+ outputs contract ID as plain text — no --format json, no JSON parsing
REGISTRY_ID=$(stellar contract deploy \
    --wasm "$REGISTRY_WASM" \
    --source-account admin \
    --network testnet)

if [ -z "$REGISTRY_ID" ]; then
    echo "ERROR: Batch Registry deploy returned empty contract ID"
    exit 1
fi
echo "OK  Batch Registry ID: $REGISTRY_ID"

# ── 5b. Deploy GRT Token (if contract exists) ──────────────────
if [ -n "$TOKEN_WASM" ] && [ -f "$TOKEN_WASM" ]; then
    echo "    Deploying GRT Token..."
    TOKEN_ID=$(stellar contract deploy \
        --wasm "$TOKEN_WASM" \
        --source-account admin \
        --network testnet)

    if [ -z "$TOKEN_ID" ]; then
        echo "ERROR: GRT Token deploy returned empty contract ID"
        exit 1
    fi
    echo "OK  GRT Token ID: $TOKEN_ID"
fi

# ─── 6. Initialize contracts ──────────────────────────────────────
echo ""
echo "Initializing contracts..."

if [ -n "$TOKEN_ID" ]; then
    echo "    Initializing GRT Token..."
    stellar contract invoke \
        --id "$TOKEN_ID" \
        --source-account admin \
        --network testnet \
        -- initialize \
        --admin "$ADMIN_ADDRESS" \
        --decimals 7 \
        --name "Green Recycle Token" \
        --symbol "GRT"
    echo "OK  GRT Token initialized"

    echo "    Initializing Batch Registry (with token contract)..."
    stellar contract invoke \
        --id "$REGISTRY_ID" \
        --source-account admin \
        --network testnet \
        -- initialize \
        --admin "$ADMIN_ADDRESS" \
        --token_contract "$TOKEN_ID"
else
    echo "WARN: Skipping contract initialization — token contract not deployed."
    echo "      Initialize manually after deploying grt-token:"
    echo "      stellar contract invoke --id $REGISTRY_ID --source-account admin --network testnet -- initialize --admin $ADMIN_ADDRESS --token_contract <TOKEN_ID>"
fi
echo "OK  Batch Registry initialized (or skipped)"

# ─── 7. Save .env.local ───────────────────────────────────────────
echo ""
echo "Saving .env.local..."

ENV_FILE="$PROJECT_ROOT/.env.local"

write_or_update_var() {
    local key="$1"
    local val="$2"
    local file="$3"
    if grep -q "^${key}=" "$file" 2>/dev/null; then
        # Use temp file to avoid sed -i issues on Windows Git Bash
        local tmp
        tmp=$(mktemp)
        sed "s|^${key}=.*|${key}=${val}|" "$file" > "$tmp"
        mv "$tmp" "$file"
    else
        echo "${key}=${val}" >> "$file"
    fi
}

if [ ! -f "$ENV_FILE" ]; then
    touch "$ENV_FILE"
fi

write_or_update_var "VITE_STELLAR_NETWORK" "testnet" "$ENV_FILE"
write_or_update_var "VITE_BATCH_REGISTRY_CONTRACT_ID" "$REGISTRY_ID" "$ENV_FILE"

if [ -n "$TOKEN_ID" ]; then
    write_or_update_var "VITE_GRT_TOKEN_CONTRACT_ID" "$TOKEN_ID" "$ENV_FILE"
else
    write_or_update_var "VITE_GRT_TOKEN_CONTRACT_ID" "PENDING_DEPLOY_GRT_TOKEN" "$ENV_FILE"
fi

echo "OK  Saved to $ENV_FILE"

# ─── Summary ──────────────────────────────────────────────────────
echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo ""
echo "Network : testnet"
echo "Admin   : $ADMIN_ADDRESS"
echo "Registry: $REGISTRY_ID"
if [ -n "$TOKEN_ID" ]; then
    echo "Token   : $TOKEN_ID"
else
    echo "Token   : NOT DEPLOYED (contracts/grt-token missing)"
fi
echo ""
echo "Contents of .env.local:"
cat "$ENV_FILE"
echo ""
