const config = {
  api: {
    openrouter: {
      baseUrl: "https://openrouter.ai/api/v1",
      model: "deepseek/deepseek-prover-v2:free",
    },
    twitter: {
      host: "twitter-api45.p.rapidapi.com",
    },
    okx: {
      baseUrl: "https://www.okx.com/api/v5/market",
    },
  },
  env: {
    isProduction: process.env.NODE_ENV === "production",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    openrouterApiKey: process.env.OPENROUTER_API_KEY,
    rapidApiKey: process.env.RAPID_API_KEY,
    okxApiKey: process.env.OKX_API_KEY,
    okxSecretKey: process.env.OKX_SECRET_KEY,
    okxPassphrase: process.env.OKX_PASSPHRASE,
    accessCode: process.env.NEXT_PUBLIC_ACCESS_CODE,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  },
  validation: {
    minContractLength: 1,
    supportedBlockchains: ["SOL", "BASE"] as const,
  },
};

export type SupportedBlockchain =
  (typeof config.validation.supportedBlockchains)[number];

// Validate environment variables
if (!config.env.supabaseUrl || !config.env.supabaseAnonKey) {
  throw new Error("Missing required Supabase environment variables");
}

if (!config.env.openrouterApiKey) {
  throw new Error("Missing required OpenRouter API key");
}

if (!config.env.rapidApiKey) {
  throw new Error("Missing required Rapid API key");
}

if (!config.env.okxApiKey) {
  throw new Error("Missing required OKX API key");
}

if (!config.env.accessCode) {
  throw new Error("Missing required access code");
}

export default config;
