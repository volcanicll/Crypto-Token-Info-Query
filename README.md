# Crypto Token Info Query

A web application for querying and analyzing cryptocurrency tokens on various blockchains using AI-powered insights.

## Features

- Support for Solana (SOL) and Base (BASE) blockchains
- Real-time token analysis using OpenAI/GPT via OpenRouter
- Access code protection for API endpoints
- Query history tracking with Supabase
- Responsive design with Tailwind CSS
- Form validation with Zod
- TypeScript support

## Prerequisites

- Node.js 16.x or newer
- Bun (recommended) or npm
- Supabase account
- OpenRouter API key

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenRouter
OPENROUTER_API_KEY=

# Twitter API via RapidAPI
RAPID_API_KEY=

# OKX API
OKX_API_KEY=
OKX_SECRET_KEY=
OKX_PASSPHRASE=
PROJECT_ID=

# Access Code
NEXT_PUBLIC_ACCESS_CODE=

# Application URL
NEXT_PUBLIC_APP_URL=

# Note: For OKX API access
# 1. Register at OKX and create API keys at https://www.okx.com/account/my-api
# 2. Enable reading permissions for the API key
# 3. Store your API key, secret key, and passphrase securely
```

## Installation

1. Clone the repository:

```bash
git clone https://github.com/volcanicll/Crypto-Token-Info-Query
cd crypto-token-info
```

2. Install dependencies:

```bash
bun install
# or
npm install
```

3. Set up the database:

- Create a new Supabase project
- Run the SQL commands from `supabase.sql` in the SQL editor
- Copy your Supabase credentials to the `.env` file

4. Start the development server:

```bash
bun dev
# or
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
├── config/          # Configuration files
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## API Routes

### POST /api/query-token

Analyzes a token on a specified blockchain.

Request body:

```json
{
  "contract_address": "string",
  "blockchain": "SOL" | "BASE"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "tokenInfo": "string",
    "blockchain": "string",
    "contractAddress": "string"
  }
}
```

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
