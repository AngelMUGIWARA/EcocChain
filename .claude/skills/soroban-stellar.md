# Skill: Soroban & Stellar Expert
Description: Mejores prácticas para Smart Contracts en Rust y transacciones en Stellar.

## Reglas de Desarrollo
- **Seguridad Rust:** Verifica siempre los `Address` y usa `panic!` controlados en Soroban.
- **Optimización de Fees:** Mantén el almacenamiento (storage) al mínimo para reducir costos de microtransacciones.
- **Asincronía:** Usa `StellarSDK` manejando correctamente las promesas y el estado de la red (Mainnet vs Testnet).
- **Tipado:** Asegúrate de que los argumentos de los contratos coincidan con los tipos de Soroban (Symbol, i128, etc.).