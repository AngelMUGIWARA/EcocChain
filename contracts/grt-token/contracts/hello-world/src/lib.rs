#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token::Interface as TokenInterface,
    Address, Env, String,
};

// ─── Storage Keys ─────────────────────────────────────────────────────────────

#[contracttype]
pub enum DataKey {
    Admin,
    Decimals,
    Name,
    Symbol,
    Balance(Address),
    Allowance(Address, Address),
    TotalSupply,
}

// ─── Contract ─────────────────────────────────────────────────────────────────

#[contract]
pub struct GRTToken;

// ─── Internal helpers ─────────────────────────────────────────────────────────

impl GRTToken {
    fn get_admin(env: &Env) -> Address {
        env.storage()
            .instance()
            .get::<DataKey, Address>(&DataKey::Admin)
            .expect("Not initialized")
    }

    fn get_balance(env: &Env, id: &Address) -> i128 {
        env.storage()
            .persistent()
            .get::<DataKey, i128>(&DataKey::Balance(id.clone()))
            .unwrap_or(0)
    }

    fn set_balance(env: &Env, id: &Address, amount: i128) {
        env.storage()
            .persistent()
            .set(&DataKey::Balance(id.clone()), &amount);
    }

    fn get_allowance(env: &Env, from: &Address, spender: &Address) -> i128 {
        env.storage()
            .temporary()
            .get::<DataKey, i128>(&DataKey::Allowance(from.clone(), spender.clone()))
            .unwrap_or(0)
    }

    fn set_allowance(
        env: &Env,
        from: &Address,
        spender: &Address,
        amount: i128,
        expiration_ledger: u32,
    ) {
        if amount > 0 {
            env.storage().temporary().set(
                &DataKey::Allowance(from.clone(), spender.clone()),
                &amount,
            );
            env.storage().temporary().extend_ttl(
                &DataKey::Allowance(from.clone(), spender.clone()),
                expiration_ledger,
                expiration_ledger,
            );
        } else {
            env.storage()
                .temporary()
                .remove(&DataKey::Allowance(from.clone(), spender.clone()));
        }
    }

    fn get_total_supply(env: &Env) -> i128 {
        env.storage()
            .instance()
            .get::<DataKey, i128>(&DataKey::TotalSupply)
            .unwrap_or(0)
    }

    fn set_total_supply(env: &Env, amount: i128) {
        env.storage()
            .instance()
            .set(&DataKey::TotalSupply, &amount);
    }

    fn do_transfer(env: &Env, from: &Address, to: &Address, amount: i128) {
        if amount < 0 {
            panic!("amount must be positive");
        }

        let from_balance = Self::get_balance(env, from);
        if from_balance < amount {
            panic!("insufficient balance");
        }

        Self::set_balance(env, from, from_balance - amount);
        let to_balance = Self::get_balance(env, to);
        Self::set_balance(env, to, to_balance + amount);
    }
}

// ─── TokenInterface implementation ────────────────────────────────────────────

#[contractimpl]
impl TokenInterface for GRTToken {
    // ── Metadata ──────────────────────────────────────────────────────────────

    fn decimals(env: Env) -> u32 {
        env.storage()
            .instance()
            .get::<DataKey, u32>(&DataKey::Decimals)
            .expect("Not initialized")
    }

    fn name(env: Env) -> String {
        env.storage()
            .instance()
            .get::<DataKey, String>(&DataKey::Name)
            .expect("Not initialized")
    }

    fn symbol(env: Env) -> String {
        env.storage()
            .instance()
            .get::<DataKey, String>(&DataKey::Symbol)
            .expect("Not initialized")
    }

    // ── Balance ───────────────────────────────────────────────────────────────

    fn balance(env: Env, id: Address) -> i128 {
        Self::get_balance(&env, &id)
    }

    // ── Allowances ────────────────────────────────────────────────────────────

    fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        Self::get_allowance(&env, &from, &spender)
    }

    fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        from.require_auth();

        if amount < 0 {
            panic!("amount must be positive");
        }

        Self::set_allowance(&env, &from, &spender, amount, expiration_ledger);

        // Emit approve event
        let topics = (soroban_sdk::symbol_short!("approve"), from, spender);
        env.events().publish(topics, (amount, expiration_ledger));
    }

    // ── Transfers ─────────────────────────────────────────────────────────────

    fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        Self::do_transfer(&env, &from, &to, amount);

        // Emit transfer event
        let topics = (soroban_sdk::symbol_short!("transfer"), from, to);
        env.events().publish(topics, amount);
    }

    fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();

        let allowance = Self::get_allowance(&env, &from, &spender);
        if allowance < amount {
            panic!("insufficient allowance");
        }

        // Reduce allowance
        // Use 0 for expiration since we're reducing; we pass current ledger as noop TTL
        let new_allowance = allowance - amount;
        if new_allowance == 0 {
            env.storage()
                .temporary()
                .remove(&DataKey::Allowance(from.clone(), spender.clone()));
        } else {
            env.storage()
                .temporary()
                .set(&DataKey::Allowance(from.clone(), spender.clone()), &new_allowance);
        }

        Self::do_transfer(&env, &from, &to, amount);

        // Emit transfer event
        let topics = (soroban_sdk::symbol_short!("transfer"), from, to);
        env.events().publish(topics, amount);
    }

    // ── Burn ──────────────────────────────────────────────────────────────────

    fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();

        if amount < 0 {
            panic!("amount must be positive");
        }

        let balance = Self::get_balance(&env, &from);
        if balance < amount {
            panic!("insufficient balance");
        }

        Self::set_balance(&env, &from, balance - amount);

        let supply = Self::get_total_supply(&env);
        Self::set_total_supply(&env, supply - amount);

        // Emit burn event
        let topics = (soroban_sdk::symbol_short!("burn"), from);
        env.events().publish(topics, amount);
    }

    fn burn_from(env: Env, spender: Address, from: Address, amount: i128) {
        spender.require_auth();

        let allowance = Self::get_allowance(&env, &from, &spender);
        if allowance < amount {
            panic!("insufficient allowance");
        }

        let new_allowance = allowance - amount;
        if new_allowance == 0 {
            env.storage()
                .temporary()
                .remove(&DataKey::Allowance(from.clone(), spender.clone()));
        } else {
            env.storage()
                .temporary()
                .set(&DataKey::Allowance(from.clone(), spender.clone()), &new_allowance);
        }

        let balance = Self::get_balance(&env, &from);
        if balance < amount {
            panic!("insufficient balance");
        }

        Self::set_balance(&env, &from, balance - amount);

        let supply = Self::get_total_supply(&env);
        Self::set_total_supply(&env, supply - amount);

        // Emit burn event
        let topics = (soroban_sdk::symbol_short!("burn"), from);
        env.events().publish(topics, amount);
    }

    // ── Mint (admin only) ─────────────────────────────────────────────────────

    fn mint(env: Env, to: Address, amount: i128) {
        let admin = Self::get_admin(&env);
        admin.require_auth();

        if amount < 0 {
            panic!("amount must be positive");
        }

        let balance = Self::get_balance(&env, &to);
        Self::set_balance(&env, &to, balance + amount);

        let supply = Self::get_total_supply(&env);
        Self::set_total_supply(&env, supply + amount);

        // Emit mint event
        let topics = (soroban_sdk::symbol_short!("mint"), admin, to);
        env.events().publish(topics, amount);
    }

    // ── Admin ─────────────────────────────────────────────────────────────────

    fn set_admin(env: Env, new_admin: Address) {
        let current_admin = Self::get_admin(&env);
        current_admin.require_auth();

        env.storage()
            .instance()
            .set(&DataKey::Admin, &new_admin);

        // Emit set_admin event
        let topics = (soroban_sdk::symbol_short!("set_admin"), current_admin);
        env.events().publish(topics, new_admin);
    }

    fn admin(env: Env) -> Address {
        Self::get_admin(&env)
    }
}

// ─── Extra entrypoint: initialize ─────────────────────────────────────────────
// (No forma parte de TokenInterface pero es necesaria para el setup)

#[contractimpl]
impl GRTToken {
    /// Initialize the GRT Token. Can only be called once.
    /// - `admin`: address that can call `mint` and `set_admin`
    /// - `decimals`: number of decimal places (use 7 to match Stellar convention)
    /// - `name`: full token name, e.g. "Green Recycle Token"
    /// - `symbol`: ticker, e.g. "GRT"
    pub fn initialize(env: Env, admin: Address, decimals: u32, name: String, symbol: String) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }

        admin.require_auth();

        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Decimals, &decimals);
        env.storage().instance().set(&DataKey::Name, &name);
        env.storage().instance().set(&DataKey::Symbol, &symbol);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
    }

    /// Read total supply (convenience — not part of SEP-41 spec but useful)
    pub fn total_supply(env: Env) -> i128 {
        Self::get_total_supply(&env)
    }
}

mod test;
