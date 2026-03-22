#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, token, Address, Env, String};

#[test]
fn test_initialize_token() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let contract_id = env.register(GRTToken, ());
    let client = GRTTokenClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &7,
        &String::from_str(&env, "Green Recycle Token"),
        &String::from_str(&env, "GRT"),
    );

    // Token should be initialized successfully
    let token_client = token::Client::new(&env, &contract_id);
    let name = token_client.name();
    assert_eq!(name, String::from_str(&env, "Green Recycle Token"));
}

#[test]
fn test_token_mint_and_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user = Address::generate(&env);
    let contract_id = env.register(GRTToken, ());
    let client = GRTTokenClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &7,
        &String::from_str(&env, "Green Recycle Token"),
        &String::from_str(&env, "GRT"),
    );

    let token_client = token::Client::new(&env, &contract_id);

    // Mint tokens
    token_client.mint(&user, &1000_0000000); // 1000 tokens with 7 decimals

    // Check balance
    let balance = token_client.balance(&user);
    assert_eq!(balance, 1000_0000000);
}

#[test]
fn test_token_transfer() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    let contract_id = env.register(GRTToken, ());
    let client = GRTTokenClient::new(&env, &contract_id);

    client.initialize(
        &admin,
        &7,
        &String::from_str(&env, "Green Recycle Token"),
        &String::from_str(&env, "GRT"),
    );

    let token_client = token::Client::new(&env, &contract_id);

    // Mint to user1
    token_client.mint(&user1, &1000_0000000);

    // Transfer from user1 to user2
    token_client.transfer(&user1, &user2, &500_0000000);

    // Check balances
    assert_eq!(token_client.balance(&user1), 500_0000000);
    assert_eq!(token_client.balance(&user2), 500_0000000);
}
