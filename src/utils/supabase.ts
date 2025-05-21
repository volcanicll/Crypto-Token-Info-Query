import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable");
}

// Create Supabase client for client-side
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Create Supabase admin client for server-side
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export type Database = {
  public: {
    Tables: {
      token_queries: {
        Row: {
          id: number;
          contract_address: string;
          blockchain: string;
          queried_at: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["token_queries"]["Row"],
          "id" | "created_at"
        >;
      };
    };
  };
};
