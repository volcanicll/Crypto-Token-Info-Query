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
  volume24h?: string;
  holders?: number;
  whales?: {
    count: number;
    percentage: number;
  };
  price?: string;
  timestamp?: string;
  symbol?: string;
  decimals?: number;
  name?: string;
  logoUrl?: string;
}

export interface AnalysisRequest {
  contract_address: string;
  blockchain: string;
  analysis_type: "ai" | "basic";
  twitter_handle?: string;
}
