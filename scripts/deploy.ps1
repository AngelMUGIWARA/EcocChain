$ErrorActionPreference = "Stop"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Despliegue de Green Loop Ledger        " -ForegroundColor Cyan
Write-Host "=========================================`n" -ForegroundColor Cyan

# 1. Verificar dependencias
Write-Host "Verificando dependencias..."
if (-not (Get-Command "soroban" -ErrorAction SilentlyContinue)) {
    Write-Host "Error: No se encontró 'soroban' CLI." -ForegroundColor Red
    Write-Host "Por favor, instálalo ejecutando: cargo install --locked soroban-cli" -ForegroundColor Yellow
    exit 1
}

# 2. Configurar Testnet y cuenta Admin
Write-Host "`n1. Configurando cuenta admin para Testnet..." -ForegroundColor Cyan
soroban config network add --global testnet --rpc-url https://soroban-testnet.stellar.org:443 --network-passphrase "Test SDF Network ; September 2015" | Out-Null

$identities = soroban config identity ls
if ($identities -notlike "*admin*") {
    Write-Host "Generando nueva identidad 'admin'..."
    soroban config identity generate admin --network testnet
}

$ADMIN_ADDRESS = soroban config identity address admin
Write-Host "Dirección de Admin: $ADMIN_ADDRESS" -ForegroundColor Green

# Fondear la cuenta admin usando friendbot
Write-Host "Fondeando cuenta en Testnet..."
soroban config identity fund admin --network testnet | Out-Null

# 3. Compilación
Write-Host "`n2. Compilando Contratos Inteligentes..." -ForegroundColor Cyan

Write-Host "Compilando Batch Registry..."
Push-Location contracts/batch-registry
soroban contract build
Pop-Location

Write-Host "Compilando GRT Token..."
Push-Location contracts/grt-token
soroban contract build
Pop-Location

# 4. Despliegue
Write-Host "`n3. Desplegando Contratos en Testnet..." -ForegroundColor Cyan

Write-Host "Desplegando Batch Registry..."
$REGISTRY_ID = soroban contract deploy `
    --wasm contracts/batch-registry/target/wasm32-unknown-unknown/release/hello_world.wasm `
    --source admin `
    --network testnet
Write-Host "Batch Registry ID: $REGISTRY_ID" -ForegroundColor Green

Write-Host "Desplegando GRT Token..."
$TOKEN_ID = soroban contract deploy `
    --wasm contracts/grt-token/target/wasm32-unknown-unknown/release/hello_world.wasm `
    --source admin `
    --network testnet
Write-Host "GRT Token ID:      $TOKEN_ID" -ForegroundColor Green

# 5. Inicialización
Write-Host "`n4. Inicializando Contratos..." -ForegroundColor Cyan

Write-Host "Inicializando GRT Token..."
# IMPORTANTE: El admin del token es el contrato Batch Registry,
# así solo el contrato registry podrá emitir (mint) los tokens cuando se confirme reciclaje.
soroban contract invoke `
    --id $TOKEN_ID `
    --source admin `
    --network testnet `
    -- `
    initialize `
    --admin $REGISTRY_ID `
    --decimals 7 `
    --name "Green Recycle Token" `
    --symbol "GRT"

Write-Host "Inicializando Batch Registry..."
soroban contract invoke `
    --id $REGISTRY_ID `
    --source admin `
    --network testnet `
    -- `
    initialize `
    --admin $ADMIN_ADDRESS `
    --token_contract $TOKEN_ID

# 6. Guardar variables de entorno
Write-Host "`n5. Actualizando .env.local..." -ForegroundColor Cyan
$envFile = ".env.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    $envContent = $envContent -replace "(?m)^VITE_BATCH_REGISTRY_CONTRACT_ID=.*", "VITE_BATCH_REGISTRY_CONTRACT_ID=$REGISTRY_ID"
    $envContent = $envContent -replace "(?m)^VITE_GRT_TOKEN_CONTRACT_ID=.*", "VITE_GRT_TOKEN_CONTRACT_ID=$TOKEN_ID"
    Set-Content -Path $envFile -Value $envContent
    Write-Host "Archivo .env.local actualizado correctamente." -ForegroundColor Green
} else {
    Write-Host "Archivo .env.local no encontrado, creándolo..." -ForegroundColor Yellow
    $newEnvConfig = @"
VITE_STELLAR_NETWORK=testnet
VITE_BATCH_REGISTRY_CONTRACT_ID=$REGISTRY_ID
VITE_GRT_TOKEN_CONTRACT_ID=$TOKEN_ID
"@
    Set-Content -Path $envFile -Value $newEnvConfig
}

Write-Host "`n¡Todo listo! Despliegue e Inicialización Completados ✅" -ForegroundColor Green
