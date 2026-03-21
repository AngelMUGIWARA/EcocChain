#!/bin/bash
set -e

echo -e "\033[36m=========================================\033[0m"
echo -e "\033[36m  Despliegue de Green Loop Ledger        \033[0m"
echo -e "\033[36m=========================================\n\033[0m"

# 1. Verificar dependencias
echo "Verificando dependencias..."
if ! command -v soroban &> /dev/null; then
    echo -e "\033[31mError: No se encontró 'soroban' CLI.\033[0m"
    echo -e "\033[33mPor favor, instálalo ejecutando: cargo install --locked soroban-cli\033[0m"
    exit 1
fi

# 2. Configurar Testnet y cuenta Admin
echo -e "\n\033[36m1. Configurando cuenta admin para Testnet...\033[0m"
soroban config network add --global testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015" >/dev/null 2>&1 || true

if ! soroban config identity ls | grep -q "admin"; then
    echo "Generando nueva identidad 'admin'..."
    soroban config identity generate admin --network testnet
fi

ADMIN_ADDRESS=$(soroban config identity address admin)
echo -e "\033[32mDirección de Admin: $ADMIN_ADDRESS\033[0m"

# Fondear la cuenta admin usando friendbot
echo "Fondeando cuenta en Testnet..."
soroban config identity fund admin --network testnet >/dev/null 2>&1 || true

# 3. Compilación
echo -e "\n\033[36m2. Compilando Contratos Inteligentes...\033[0m"

echo "Compilando Batch Registry..."
cd contracts/batch-registry
soroban contract build
cd ../..

echo "Compilando GRT Token..."
cd contracts/grt-token
soroban contract build
cd ../..

# 4. Despliegue
echo -e "\n\033[36m3. Desplegando Contratos en Testnet...\033[0m"

echo "Desplegando Batch Registry..."
REGISTRY_ID=$(soroban contract deploy \
    --wasm contracts/batch-registry/target/wasm32-unknown-unknown/release/hello_world.wasm \
    --source admin \
    --network testnet)
echo -e "\033[32mBatch Registry ID: $REGISTRY_ID\033[0m"

echo "Desplegando GRT Token..."
TOKEN_ID=$(soroban contract deploy \
    --wasm contracts/grt-token/target/wasm32-unknown-unknown/release/hello_world.wasm \
    --source admin \
    --network testnet)
echo -e "\033[32mGRT Token ID:      $TOKEN_ID\033[0m"

# 5. Inicialización
echo -e "\n\033[36m4. Inicializando Contratos...\033[0m"

echo "Inicializando GRT Token..."
soroban contract invoke \
    --id "$TOKEN_ID" \
    --source admin \
    --network testnet \
    -- \
    initialize \
    --admin "$REGISTRY_ID" \
    --decimals 7 \
    --name "Green Recycle Token" \
    --symbol "GRT"

echo "Inicializando Batch Registry..."
soroban contract invoke \
    --id "$REGISTRY_ID" \
    --source admin \
    --network testnet \
    -- \
    initialize \
    --admin "$ADMIN_ADDRESS" \
    --token_contract "$TOKEN_ID"

# 6. Guardar variables de entorno
echo -e "\n\033[36m5. Actualizando .env.local...\033[0m"
ENV_FILE=".env.local"

if [ -f "$ENV_FILE" ]; then
    # Usando sed para reemplazar líneas en Mac/Linux/GitBash
    sed -i.bak -e "s/^VITE_BATCH_REGISTRY_CONTRACT_ID=.*/VITE_BATCH_REGISTRY_CONTRACT_ID=$REGISTRY_ID/" "$ENV_FILE"
    sed -i.bak -e "s/^VITE_GRT_TOKEN_CONTRACT_ID=.*/VITE_GRT_TOKEN_CONTRACT_ID=$TOKEN_ID/" "$ENV_FILE"
    rm -f "${ENV_FILE}.bak"
    echo -e "\033[32mArchivo .env.local actualizado correctamente.\033[0m"
else
    echo -e "\033[33mArchivo .env.local no encontrado, creándolo...\033[0m"
    cat <<EOF > "$ENV_FILE"
VITE_STELLAR_NETWORK=testnet
VITE_BATCH_REGISTRY_CONTRACT_ID=$REGISTRY_ID
VITE_GRT_TOKEN_CONTRACT_ID=$TOKEN_ID
EOF
fi

echo -e "\n\033[32m¡Todo listo! Despliegue e Inicialización Completados ✅\033[0m"
