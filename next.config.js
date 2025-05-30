/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_ACCESS_CODE: process.env.NEXT_PUBLIC_ACCESS_CODE,
    RAPID_API_KEY: process.env.RAPID_API_KEY,
    OKX_PASSPHRASE: process.env.OKX_PASSPHRASE,
    OKX_SECRET_KEY: process.env.OKX_SECRET_KEY,
    OKX_API_KEY: process.env.OKX_API_KEY,
  },
};

module.exports = nextConfig;
