#![cfg(test)]

use super::*;
use soroban_sdk::{
    symbol_short, testutils::{Address as _, Ledger}, token, Address, Env, Symbol,
};

// Helper: Create token contract for testing
fn create_token_contract<'a>(env: &Env) -> (Address, token::Client<'a>) {
    let token_id = env.register_stellar_asset_contract_v2(env.register(token::Client::new(env, &env.register(token::StellarAssetContract::new(), ()), ()), ()));
    let token_client = token::Client::new(env, &token_id);
    (token_id.clone(), token_client)
}

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);

    // Should not panic, initialization successful
}

#[test]
#[should_panic(expected = "Already initialized")]
fn test_cannot_initialize_twice() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);
    client.initialize(&admin, &token_id); // Should panic
}

#[test]
fn test_register_role() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let empresa = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);
    client.register_role(&admin, &empresa, &symbol_short!("empresa"));

    let role = client.get_role(&empresa);
    assert_eq!(role, Some(symbol_short!("empresa")));
}

#[test]
fn test_create_batch_as_empresa() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let empresa = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);
    client.register_role(&admin, &empresa, &symbol_short!("empresa"));

    let batch_id = client.create_batch(&empresa, &symbol_short!("PET"), &250);

    assert_eq!(batch_id, 1);

    let batch = client.get_batch(&batch_id);
    assert_eq!(batch.tipo_residuo, symbol_short!("PET"));
    assert_eq!(batch.peso_kg, 250);
    assert_eq!(batch.estado, symbol_short!("pendiente"));
    assert_eq!(batch.owner_actual, empresa);
    assert_eq!(batch.empresa_origen, empresa);
}

#[test]
#[should_panic(expected = "Unauthorized: incorrect role")]
fn test_create_batch_wrong_role() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let transportista = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);
    client.register_role(&admin, &transportista, &symbol_short!("transport"));

    // Transportista tries to create batch - should panic
    client.create_batch(&transportista, &symbol_short!("PET"), &250);
}

#[test]
fn test_accept_pickup() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let empresa = Address::generate(&env);
    let transportista = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);
    client.register_role(&admin, &empresa, &symbol_short!("empresa"));
    client.register_role(&admin, &transportista, &symbol_short!("transport"));

    let batch_id = client.create_batch(&empresa, &symbol_short!("vidrio"), &300);
    client.accept_pickup(&transportista, &batch_id);

    let batch = client.get_batch(&batch_id);
    assert_eq!(batch.estado, symbol_short!("transito"));
    assert_eq!(batch.owner_actual, transportista);
}

#[test]
#[should_panic(expected = "Invalid state")]
fn test_accept_pickup_invalid_state() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let empresa = Address::generate(&env);
    let transportista = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);
    client.register_role(&admin, &empresa, &symbol_short!("empresa"));
    client.register_role(&admin, &transportista, &symbol_short!("transport"));

    let batch_id = client.create_batch(&empresa, &symbol_short!("metal"), &150);

    // Accept pickup twice - should panic on second attempt
    client.accept_pickup(&transportista, &batch_id);
    client.accept_pickup(&transportista, &batch_id); // Should panic
}

#[test]
fn test_confirm_reception() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let empresa = Address::generate(&env);
    let transportista = Address::generate(&env);
    let acopio = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);
    client.register_role(&admin, &empresa, &symbol_short!("empresa"));
    client.register_role(&admin, &transportista, &symbol_short!("transport"));
    client.register_role(&admin, &acopio, &symbol_short!("acopio"));

    let batch_id = client.create_batch(&empresa, &symbol_short!("carton"), &200);
    client.accept_pickup(&transportista, &batch_id);
    client.confirm_reception(&acopio, &batch_id, &195);

    let batch = client.get_batch(&batch_id);
    assert_eq!(batch.estado, symbol_short!("acopio"));
    assert_eq!(batch.owner_actual, acopio);
    assert_eq!(batch.peso_recibido, 195);
}

#[test]
fn test_confirm_recycling_mints_tokens() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let empresa = Address::generate(&env);
    let transportista = Address::generate(&env);
    let acopio = Address::generate(&env);
    let recicladora = Address::generate(&env);
    let (token_id, token_client) = create_token_contract(&env);

    // Initialize token
    token_client.initialize(&admin, &7, &String::from_str(&env, "GreenToken"), &String::from_str(&env, "GRT"));

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    // Set admin of token to the BatchRegistry contract
    token_client.set_admin(&contract_id);

    client.initialize(&admin, &token_id);
    client.register_role(&admin, &empresa, &symbol_short!("empresa"));
    client.register_role(&admin, &transportista, &symbol_short!("transport"));
    client.register_role(&admin, &acopio, &symbol_short!("acopio"));
    client.register_role(&admin, &recicladora, &symbol_short!("reciclado"));

    let batch_id = client.create_batch(&empresa, &symbol_short!("PET"), &250);
    client.accept_pickup(&transportista, &batch_id);
    client.confirm_reception(&acopio, &batch_id, &245);

    // Check balance before recycling
    let balance_before = token_client.balance(&recicladora);
    assert_eq!(balance_before, 0);

    // Confirm recycling - should mint tokens
    client.confirm_recycling(&recicladora, &batch_id, &230);

    // Check balance after - should have 230 * 10^7 tokens
    let balance_after = token_client.balance(&recicladora);
    assert_eq!(balance_after, 230 * 10_000_000);

    let batch = client.get_batch(&batch_id);
    assert_eq!(batch.estado, symbol_short!("reciclado"));
    assert_eq!(batch.kg_reciclados, 230);
    assert_eq!(batch.tokens_grt, 230 * 10_000_000);
}

#[test]
fn test_purchase_batch() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let empresa = Address::generate(&env);
    let transportista = Address::generate(&env);
    let acopio = Address::generate(&env);
    let recicladora = Address::generate(&env);
    let compradora = Address::generate(&env);
    let (token_id, token_client) = create_token_contract(&env);

    token_client.initialize(&admin, &7, &String::from_str(&env, "GreenToken"), &String::from_str(&env, "GRT"));

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    token_client.set_admin(&contract_id);

    client.initialize(&admin, &token_id);
    client.register_role(&admin, &empresa, &symbol_short!("empresa"));
    client.register_role(&admin, &transportista, &symbol_short!("transport"));
    client.register_role(&admin, &acopio, &symbol_short!("acopio"));
    client.register_role(&admin, &recicladora, &symbol_short!("reciclado"));
    client.register_role(&admin, &compradora, &symbol_short!("comprador"));

    let batch_id = client.create_batch(&empresa, &symbol_short!("metal"), &180);
    client.accept_pickup(&transportista, &batch_id);
    client.confirm_reception(&acopio, &batch_id, &175);
    client.confirm_recycling(&recicladora, &batch_id, &170);

    client.purchase_batch(&compradora, &batch_id);

    let batch = client.get_batch(&batch_id);
    assert_eq!(batch.estado, symbol_short!("comprado"));
    assert_eq!(batch.owner_actual, compradora);
}

#[test]
fn test_get_batches_by_owner() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let empresa = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);
    client.register_role(&admin, &empresa, &symbol_short!("empresa"));

    // Create multiple batches
    client.create_batch(&empresa, &symbol_short!("PET"), &100);
    client.create_batch(&empresa, &symbol_short!("vidrio"), &200);
    client.create_batch(&empresa, &symbol_short!("carton"), &150);

    let batches = client.get_batches_by_owner(&empresa);
    assert_eq!(batches.len(), 3);
}

#[test]
fn test_get_batches_by_state() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let empresa = Address::generate(&env);
    let transportista = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);
    client.register_role(&admin, &empresa, &symbol_short!("empresa"));
    client.register_role(&admin, &transportista, &symbol_short!("transport"));

    // Create 2 batches, move one to transito
    let batch_id_1 = client.create_batch(&empresa, &symbol_short!("PET"), &100);
    let batch_id_2 = client.create_batch(&empresa, &symbol_short!("vidrio"), &200);

    client.accept_pickup(&transportista, &batch_id_1);

    // Check pendiente state
    let pendiente_batches = client.get_batches_by_state(&symbol_short!("pendiente"));
    assert_eq!(pendiente_batches.len(), 1);
    assert_eq!(pendiente_batches.get(0).unwrap(), batch_id_2);

    // Check transito state
    let transito_batches = client.get_batches_by_state(&symbol_short!("transito"));
    assert_eq!(transito_batches.len(), 1);
    assert_eq!(transito_batches.get(0).unwrap(), batch_id_1);
}

#[test]
#[should_panic(expected = "Batch not found")]
fn test_get_nonexistent_batch() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let (token_id, _) = create_token_contract(&env);

    let contract_id = env.register(BatchRegistry, ());
    let client = BatchRegistryClient::new(&env, &contract_id);

    client.initialize(&admin, &token_id);

    client.get_batch(&999); // Should panic
}
