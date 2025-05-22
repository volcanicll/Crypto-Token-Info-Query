declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    NEXT_PUBLIC_ACCESS_CODE: string;
    NEXT_PUBLIC_APP_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    OPENROUTER_API_KEY: string;
    RAPID_API_KEY: string;
    OKX_API_KEY: string;
    OKX_SECRET_KEY: string;
    OKX_PASSPHRASE: string;
    NODE_ENV: "development" | "production" | "test";
  }
}

declare module "crypto-browserify" {
  import * as crypto from "crypto";
  const createHash: typeof crypto.createHash;
  const createHmac: typeof crypto.createHmac;
  const randomBytes: typeof crypto.randomBytes;
  const cryptoModule: typeof crypto;
  export { createHash, createHmac, randomBytes };
  export default cryptoModule;
}

declare module "stream-browserify" {
  import * as stream from "stream";
  export = stream;
}

declare module "buffer" {
  const buffer: typeof Buffer & { Buffer: typeof Buffer };
  export = buffer;
}

declare module "util" {
  import * as utilModule from "util";
  export = utilModule;
}
