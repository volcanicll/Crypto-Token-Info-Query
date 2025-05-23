import { OKXDexClient } from "@okx-dex/okx-dex-sdk";
import config from "@/config";

const {
  okxApiKey,
  okxSecretKey,
  okxPassphrase,
  okxProjectId,
  // Optional: Add chain-specific RPCs if needed by other SDK features
  // SOLANA_RPC_URL,
  // EVM_RPC_URL
} = config.env;

if (!okxApiKey || !okxSecretKey || !okxPassphrase || !okxProjectId) {
  throw new Error(
    "Missing required OKX API credentials in .env file (OKX_API_KEY, OKX_SECRET_KEY, OKX_API_PASSPHRASE, OKX_PROJECT_ID)"
  );
}

// Initialize the client
// Note: The SDK's client constructor might require chain-specific configs
// depending on the operations. For getQuote, API keys are primary.
// Adjust solana/evm config if other SDK functionalities are used later.
export const okxDexClient = new OKXDexClient({
  apiKey: okxApiKey,
  secretKey: okxSecretKey,
  apiPassphrase: okxPassphrase,
  projectId: okxProjectId,
  // Example for Solana configuration, if needed for other functions or more specific quote contexts
  // solana: {
  //   connection: {
  //     rpcUrl: SOLANA_RPC_URL!,
  //   },
  //   walletAddress: process.env.SOLANA_WALLET_ADDRESS!, // Not strictly needed for getQuote
  //   privateKey: process.env.SOLANA_PRIVATE_KEY!, // Not strictly needed for getQuote
  // },
  // Example for EVM (Base chain would be an EVM chain)
  // evm: {
  //   rpcUrl: EVM_RPC_URL!,
  //   walletAddress: process.env.EVM_WALLET_ADDRESS!, // Not strictly needed for getQuote
  //   privateKey: process.env.EVM_PRIVATE_KEY!, // Not strictly needed for getQuote
  // }
});

console.log("OKX DEX Client Initialized"); // For verification
