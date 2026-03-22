#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, contractclient,
    Address, Env, Symbol, Vec, symbol_short,
};

// Minimal client to call mint on the GRT token contract
#[contractclient(name = "GRTTokenClient")]
pub trait GRTTokenInterface {
    fn mint(env: Env, to: Address, amount: i128);
}

// Storage keys
const BATCH_COUNTER: Symbol = symbol_short!("B_CTR");
const TOKEN_CONTRACT: Symbol = symbol_short!("TOKEN");
const ADMIN: Symbol = symbol_short!("ADMIN");

// Batch states
const STATE_PENDIENTE: Symbol = symbol_short!("pendiente");
const STATE_TRANSITO: Symbol = symbol_short!("transito");
const STATE_ACOPIO: Symbol = symbol_short!("acopio");
const STATE_RECICLADO: Symbol = symbol_short!("reciclado");
const STATE_COMPRADO: Symbol = symbol_short!("comprado");

// Roles
const ROL_EMPRESA: Symbol = symbol_short!("empresa");
const ROL_TRANSPORT: Symbol = symbol_short!("transport");
const ROL_ACOPIO: Symbol = symbol_short!("acopio");
const ROL_RECICLA: Symbol = symbol_short!("reciclado");
const ROL_COMPRA: Symbol = symbol_short!("comprador");

#[derive(Clone)]
#[contracttype]
pub struct BatchData {
    pub batch_id: u128,
    pub tipo_residuo: Symbol,  // PET, vidrio, carton, metal
    pub peso_kg: u32,
    pub peso_recibido: u32,
    pub kg_reciclados: u32,
    pub estado: Symbol,
    pub owner_actual: Address,
    pub empresa_origen: Address,
    pub tokens_grt: i128,
    pub created_at: u64,
    pub updated_at: u64,
}

#[contracttype]
pub enum DataKey {
    BatchCounter,
    Batch(u128),
    Role(Address),
    Admin,
    TokenContract,
}

#[contract]
pub struct BatchRegistry;

#[contractimpl]
impl BatchRegistry {
    /// Initialize the contract with admin and token contract addresses
    pub fn initialize(env: Env, admin: Address, token_contract: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TokenContract, &token_contract);
        env.storage().instance().set(&DataKey::BatchCounter, &0u128);
    }

    /// Register a role for an address (admin only)
    pub fn register_role(env: Env, admin: Address, address: Address, role: Symbol) {
        admin.require_auth();

        let stored_admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if admin != stored_admin {
            panic!("Unauthorized: only admin can register roles");
        }

        // Validate role
        Self::validate_role(&role);

        env.storage().persistent().set(&DataKey::Role(address.clone()), &role);

        // Emit event
        env.events().publish((symbol_short!("role_reg"), address), role);
    }

    /// Get role for an address
    pub fn get_role(env: Env, address: Address) -> Option<Symbol> {
        env.storage().persistent().get(&DataKey::Role(address))
    }

    /// Create new batch (empresa only)
    pub fn create_batch(
        env: Env,
        caller: Address,
        tipo_residuo: Symbol,
        peso_kg: u32,
    ) -> u128 {
        caller.require_auth();
        Self::require_role(&env, &caller, &ROL_EMPRESA);

        // Get next batch ID
        let mut counter: u128 = env.storage().instance().get(&DataKey::BatchCounter).unwrap_or(0);
        counter += 1;
        env.storage().instance().set(&DataKey::BatchCounter, &counter);

        let now = env.ledger().timestamp();

        // Create batch
        let batch = BatchData {
            batch_id: counter,
            tipo_residuo: tipo_residuo.clone(),
            peso_kg,
            peso_recibido: 0,
            kg_reciclados: 0,
            estado: STATE_PENDIENTE.clone(),
            owner_actual: caller.clone(),
            empresa_origen: caller.clone(),
            tokens_grt: 0,
            created_at: now,
            updated_at: now,
        };

        env.storage().persistent().set(&DataKey::Batch(counter), &batch);

        // Emit event
        env.events().publish(
            (symbol_short!("created"), counter),
            (caller, tipo_residuo, peso_kg, now),
        );

        counter
    }

    /// Accept pickup (transportista only)
    pub fn accept_pickup(env: Env, caller: Address, batch_id: u128) {
        caller.require_auth();
        Self::require_role(&env, &caller, &ROL_TRANSPORT);

        let mut batch: BatchData = env
            .storage()
            .persistent()
            .get(&DataKey::Batch(batch_id))
            .expect("Batch not found");

        // Validate state
        if batch.estado != STATE_PENDIENTE {
            panic!("Invalid state: batch must be pendiente");
        }

        let previous_owner = batch.owner_actual.clone();
        batch.owner_actual = caller.clone();
        batch.estado = STATE_TRANSITO.clone();
        batch.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Batch(batch_id), &batch);

        // Emit event
        env.events().publish(
            (symbol_short!("transfer"), batch_id),
            (previous_owner, caller, STATE_TRANSITO.clone()),
        );
    }

    /// Confirm reception (acopio only)
    pub fn confirm_reception(
        env: Env,
        caller: Address,
        batch_id: u128,
        peso_recibido: u32,
    ) {
        caller.require_auth();
        Self::require_role(&env, &caller, &ROL_ACOPIO);

        let mut batch: BatchData = env
            .storage()
            .persistent()
            .get(&DataKey::Batch(batch_id))
            .expect("Batch not found");

        // Validate state
        if batch.estado != STATE_TRANSITO {
            panic!("Invalid state: batch must be en_transito");
        }

        let previous_owner = batch.owner_actual.clone();
        batch.owner_actual = caller.clone();
        batch.estado = STATE_ACOPIO.clone();
        batch.peso_recibido = peso_recibido;
        batch.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Batch(batch_id), &batch);

        // Emit event
        env.events().publish(
            (symbol_short!("reception"), batch_id),
            (previous_owner, caller, peso_recibido),
        );
    }

    /// Confirm recycling and mint GRT tokens (recicladora only)
    pub fn confirm_recycling(
        env: Env,
        caller: Address,
        batch_id: u128,
        kg_reciclados: u32,
    ) {
        caller.require_auth();
        Self::require_role(&env, &caller, &ROL_RECICLA);

        let mut batch: BatchData = env
            .storage()
            .persistent()
            .get(&DataKey::Batch(batch_id))
            .expect("Batch not found");

        // Validate state
        if batch.estado != STATE_ACOPIO {
            panic!("Invalid state: batch must be en_acopio");
        }

        // Calculate GRT tokens (1 kg = 1 token, using 7 decimals for token)
        let tokens_to_mint = (kg_reciclados as i128) * 10_000_000i128;

        // Mint GRT tokens to recicladora
        let token_contract_addr: Address = env
            .storage()
            .instance()
            .get(&DataKey::TokenContract)
            .expect("Token contract not set");

        let token_client = GRTTokenClient::new(&env, &token_contract_addr);
        token_client.mint(&caller, &tokens_to_mint);

        let previous_owner = batch.owner_actual.clone();
        batch.owner_actual = caller.clone();
        batch.estado = STATE_RECICLADO.clone();
        batch.kg_reciclados = kg_reciclados;
        batch.tokens_grt = tokens_to_mint;
        batch.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Batch(batch_id), &batch);

        // Emit event
        env.events().publish(
            (symbol_short!("recycled"), batch_id),
            (caller, kg_reciclados, tokens_to_mint),
        );
    }

    /// Purchase batch (compradora only)
    pub fn purchase_batch(env: Env, caller: Address, batch_id: u128) {
        caller.require_auth();
        Self::require_role(&env, &caller, &ROL_COMPRA);

        let mut batch: BatchData = env
            .storage()
            .persistent()
            .get(&DataKey::Batch(batch_id))
            .expect("Batch not found");

        // Validate state
        if batch.estado != STATE_RECICLADO {
            panic!("Invalid state: batch must be reciclado");
        }

        let previous_owner = batch.owner_actual.clone();
        batch.owner_actual = caller.clone();
        batch.estado = STATE_COMPRADO.clone();
        batch.updated_at = env.ledger().timestamp();

        env.storage().persistent().set(&DataKey::Batch(batch_id), &batch);

        // Emit event
        env.events().publish(
            (symbol_short!("purchased"), batch_id),
            (previous_owner, caller),
        );
    }

    /// Get batch data (read-only)
    pub fn get_batch(env: Env, batch_id: u128) -> BatchData {
        env.storage()
            .persistent()
            .get(&DataKey::Batch(batch_id))
            .expect("Batch not found")
    }

    /// Get all batch IDs owned by an address (read-only)
    pub fn get_batches_by_owner(env: Env, owner: Address) -> Vec<u128> {
        let counter: u128 = env.storage().instance().get(&DataKey::BatchCounter).unwrap_or(0);
        let mut result = Vec::new(&env);

        for i in 1..=counter {
            if let Some(batch) = env.storage().persistent().get::<DataKey, BatchData>(&DataKey::Batch(i)) {
                if batch.owner_actual == owner {
                    result.push_back(i);
                }
            }
        }

        result
    }

    /// Get all batch IDs by state (read-only)
    pub fn get_batches_by_state(env: Env, estado: Symbol) -> Vec<u128> {
        let counter: u128 = env.storage().instance().get(&DataKey::BatchCounter).unwrap_or(0);
        let mut result = Vec::new(&env);

        for i in 1..=counter {
            if let Some(batch) = env.storage().persistent().get::<DataKey, BatchData>(&DataKey::Batch(i)) {
                if batch.estado == estado {
                    result.push_back(i);
                }
            }
        }

        result
    }

    // Helper functions

    fn require_role(env: &Env, address: &Address, expected_role: &Symbol) {
        let role: Option<Symbol> = env.storage().persistent().get(&DataKey::Role(address.clone()));

        match role {
            Some(r) if r == *expected_role => {},
            _ => panic!("Unauthorized: incorrect role"),
        }
    }

    fn validate_role(role: &Symbol) {
        let valid_roles = [
            ROL_EMPRESA,
            ROL_TRANSPORT,
            ROL_ACOPIO,
            ROL_RECICLA,
            ROL_COMPRA,
        ];

        if !valid_roles.contains(role) {
            panic!("Invalid role");
        }
    }
}

mod test;
