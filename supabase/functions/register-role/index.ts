import {
  Keypair,
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Address,
  nativeToScVal,
  rpc,
  Contract,
} from "npm:@stellar/stellar-sdk@14";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Mapeo frontend rol → símbolo en el contrato Soroban
const ROLE_CONTRACT_SYMBOLS: Record<string, string> = {
  empresa: "empresa",
  transportista: "transport",
  acopio: "acopio",
  recicladora: "reciclado",
  compradora: "comprador",
};

const VALID_ROLES = Object.keys(ROLE_CONTRACT_SYMBOLS);

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { wallet_address, nombre, rol } = await req.json();

    // Validar inputs
    if (!wallet_address || !nombre || !rol) {
      return new Response(
        JSON.stringify({ error: "wallet_address, nombre y rol son requeridos" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!VALID_ROLES.includes(rol)) {
      return new Response(
        JSON.stringify({ error: `Rol inválido. Debe ser uno de: ${VALID_ROLES.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const adminSecret = Deno.env.get("STELLAR_ADMIN_SECRET_KEY");
    const contractId = Deno.env.get("BATCH_REGISTRY_CONTRACT_ID");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!adminSecret || !contractId) {
      throw new Error("STELLAR_ADMIN_SECRET_KEY o BATCH_REGISTRY_CONTRACT_ID no configurados como secrets");
    }

    // Supabase con service role (bypass RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Si el usuario ya existe, devolverlo sin error
    const { data: existingUser } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", wallet_address)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ user: existingUser }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Registrar rol on-chain ──────────────────────────────────────────
    const adminKeypair = Keypair.fromSecret(adminSecret);
    const server = new rpc.Server("https://soroban-testnet.stellar.org");
    const contract = new Contract(contractId);

    const adminAccount = await server.getAccount(adminKeypair.publicKey());

    const roleSymbol = ROLE_CONTRACT_SYMBOLS[rol];
    const tx = new TransactionBuilder(adminAccount, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        contract.call(
          "register_role",
          new Address(adminKeypair.publicKey()).toScVal(),
          new Address(wallet_address).toScVal(),
          nativeToScVal(roleSymbol, { type: "symbol" }),
        )
      )
      .setTimeout(30)
      .build();

    // Simular
    const simResult = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simResult)) {
      throw new Error(`Simulation failed: ${simResult.error}`);
    }

    // Ensamblar y firmar
    const assembledTx = rpc.assembleTransaction(tx, simResult).build();
    assembledTx.sign(adminKeypair);

    // Enviar
    const sendResult = await server.sendTransaction(assembledTx);
    if (sendResult.status === "ERROR") {
      throw new Error(`Transaction send failed: ${JSON.stringify(sendResult.errorResult)}`);
    }

    // Esperar confirmación (máx 20 segundos)
    let confirmed = false;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const txResult = await server.getTransaction(sendResult.hash);
      if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        confirmed = true;
        break;
      }
      if (txResult.status === rpc.Api.GetTransactionStatus.FAILED) {
        throw new Error("Transaction failed on-chain");
      }
    }

    if (!confirmed) {
      throw new Error("Transaction confirmation timeout — el rol puede haberse registrado igualmente, intenta conectarte de nuevo");
    }

    // ── Guardar usuario en Supabase ─────────────────────────────────────
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert({ wallet_address, nombre, rol })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save user: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ user: newUser }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("register-role error:", error);
    return new Response(
      JSON.stringify({ error: error.message ?? "Error interno del servidor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
