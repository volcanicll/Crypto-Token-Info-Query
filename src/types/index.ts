export interface TokenQuery {
  contract_address: string;
  blockchain: "SOL" | "BASE";
  queried_at: string;
  analysis_type: "ai" | "basic";
}

export interface TokenResponse {
  success: boolean;
  data?: {
    tokenInfo?: string;
    twitterAnalysis?: {
      search_summary?: string;
      account_summary?: string;
    };
    basicInfo?: {
      volume24h?: string;
      holders?: number;
      whales?: {
        count: number;
        percentage: number;
      };
    };
    blockchain: string;
    contractAddress: string;
  };
  error?: string;
}

export interface TwitterSummary {
  search_summary?: string;
  account_summary?: string;
}

export interface BasicTokenInfo {
  // Existing fields
  volume24h?: string;
  holders?: number;
  whales?: {
    count: number;
    percentage: number;
  };
  price?: string; // Current price, potentially from a primary source other than CoinGecko
  timestamp?: string; // Timestamp for the 'price' field
  symbol?: string;
  decimals?: number;
  name?: string;
  logoUrl?: string;

  // Fields below are primarily sourced from CoinGecko API and are optional
  id_coingecko?: string; // CoinGecko's internal ID for the token
  asset_platform_id?: string; // e.g., 'solana', 'base' (from CoinGecko)
  description?: string; // Token description (usually in English from CoinGecko)

  links?: {
    homepage?: string[];
    blockchain_explorers?: string[]; // Renamed from blockchain_site for clarity
    official_forum_url?: string[];
    chat_url?: string[]; // e.g., Telegram, Discord links
    twitter_screen_name?: string;
    facebook_username?: string;
    subreddit_url?: string;
    github_repos?: string[]; // Links to GitHub repositories
  };

  image_coingecko?: { // Renamed from 'image' to avoid potential naming conflicts and specify source
    thumb?: string;
    small?: string;
    large?: string;
  };

  // Detailed market data from CoinGecko
  market_data_coingecko?: {
    // The main 'price' field in BasicTokenInfo can hold the primary price.
    // CoinGecko's current_price is extensive, so it's nested here.
    current_price_coingecko?: { [currency: string]: number }; // e.g. { "usd": 123.45, "btc": 0.005 }
    market_cap?: { [currency: string]: number };
    market_cap_rank?: number;
    total_volume?: { [currency: string]: number }; // 24h volume, distinct from existing volume24h if sourced differently
    high_24h?: { [currency: string]: number };
    low_24h?: { [currency: string]: number };
    price_change_24h_in_currency?: { [currency: string]: number };
    price_change_percentage_24h?: number; // Overall percentage change in the last 24 hours
    price_change_percentage_7d?: number;
    price_change_percentage_14d?: number;
    price_change_percentage_30d?: number;
    price_change_percentage_60d?: number;
    price_change_percentage_200d?: number;
    price_change_percentage_1y?: number;
    market_cap_change_24h?: number;
    market_cap_change_percentage_24h?: number;
    total_supply?: number | null;
    circulating_supply?: number | null;
    ath?: { [currency: string]: number }; // All-Time High
    ath_change_percentage?: { [currency: string]: number };
    ath_date?: { [currency: string]: string }; // Date of ATH
    atl?: { [currency: string]: number }; // All-Time Low
    atl_change_percentage?: { [currency: string]: number };
    atl_date?: { [currency: string]: string }; // Date of ATL
  };

  community_data_coingecko?: {
    telegram_channel_user_count?: number | null;
    // twitter_followers is deprecated by CoinGecko and not included
  };

  developer_data_coingecko?: {
    forks?: number;
    stars?: number;
    subscribers?: number;
    total_issues?: number;
    closed_issues?: number;
    pull_requests_merged?: number;
    pull_request_contributors?: number;
    commit_count_4_weeks?: number; // Commits in the last 4 weeks on default branch
  };
}

export interface AnalysisRequest {
  contract_address: string;
  blockchain: string;
  analysis_type: "ai" | "basic";
  twitter_handle?: string;
}
