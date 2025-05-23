import { BasicTokenInfo } from "@/types";
import { okxDexClient } from "./okxSdkClient";
// Native fetch is available in Node.js v18+ (LTS).
// No explicit import for 'fetch' is usually needed in modern Next.js backend services.

const DEFAULT_USDC_ADDRESSES: { [key: string]: string } = {
  SOL: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  BASE: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

const CHAIN_ID_MAP: { [key: string]: string } = {
  SOL: "501", // OKX Chain ID for Solana
  BASE: "8453", // OKX Chain ID for Base
};

const COINGECKO_PLATFORM_ID_MAP: { [key: string]: string } = {
  SOL: "solana",
  BASE: "base", // Confirmed: CoinGecko uses 'base' for Base Mainnet
};

// Interface for the data structure we expect from OKX
interface OkxMarketData {
  price: string;
  timestamp: string;
  symbol?: string;
  decimals?: number;
  name?: string;
  logoUrl?: string;
}

async function fetchOKXMarketData(
  address: string,
  chain: string
): Promise<OkxMarketData> {
  try {
    const upperChain = chain.toUpperCase();
    const toTokenAddress = DEFAULT_USDC_ADDRESSES[upperChain];
    const chainId = CHAIN_ID_MAP[upperChain];

    if (!toTokenAddress || !chainId) {
      throw new Error(`Unsupported chain for OKX SDK: ${chain}`);
    }

    console.log(
      `Fetching OKX quote for ${address} on chain ${chain} (ID: ${chainId}) against USDC (${toTokenAddress})`
    );

    const quote = await okxDexClient.dex.getQuote({
      chainId,
      fromTokenAddress: address,
      toTokenAddress,
      amount: "1", // Assuming 1 unit for price quote
      slippage: "0.5",
    });

    // console.log("OKX SDK getQuote response:", JSON.stringify(quote, null, 2));

    let extractedPrice: string | undefined;
    let extractedSymbol: string | undefined;
    let extractedDecimals: number | undefined;
    let extractedName: string | undefined;
    let extractedLogoUrl: string | undefined;

    if (quote?.data?.length > 0) {
      const quoteData = quote.data[0];
      if (quoteData?.fromToken) {
        extractedPrice = quoteData.fromToken.tokenUnitPrice;
        extractedSymbol = quoteData.fromToken.tokenSymbol;
        if (quoteData.fromToken.decimal) {
          extractedDecimals = parseInt(quoteData.fromToken.decimal, 10);
        }
        // OKX SDK might have name and logoURI in slightly different places or not at all for all tokens
        extractedName = (quoteData.fromToken as any).name || quoteData.fromToken.tokenSymbol; // Fallback to symbol if name is not present
        extractedLogoUrl = (quoteData.fromToken as any).logoURI;
      }
    }

    if (!extractedPrice) {
      console.warn(
        `Price information (fromToken.tokenUnitPrice) not found in OKX SDK response for ${address} on ${chain}.`
      );
      // Return default/error structure but still with a timestamp
      return {
        price: "0",
        timestamp: Date.now().toString(),
      };
    }

    return {
      price: extractedPrice,
      timestamp: Date.now().toString(), // Use current time as OKX SDK doesn't provide a quote timestamp
      symbol: extractedSymbol,
      decimals: extractedDecimals,
      name: extractedName,
      logoUrl: extractedLogoUrl,
    };
  } catch (error: any) {
    console.error(
      `Error fetching OKX market data via SDK for ${address} on ${chain}:`,
      error.message,
      error.stack ? "\nStack: " + error.stack : ""
    );
    return {
      price: "0",
      timestamp: Date.now().toString(),
    };
  }
}

async function fetchCoinGeckoTokenData(
  contractAddress: string,
  blockchain: string // e.g., "SOL", "BASE"
): Promise<Partial<BasicTokenInfo>> {
  const assetPlatformId = COINGECKO_PLATFORM_ID_MAP[blockchain.toUpperCase()];
  if (!assetPlatformId) {
    console.warn(`CoinGecko platform ID not found for blockchain: ${blockchain}. Cannot fetch CoinGecko data.`);
    return {};
  }

  const url = `https://api.coingecko.com/api/v3/coins/${assetPlatformId}/contract/${contractAddress}?localization=false&tickers=false&market_data=true&community_data=true&developer_data=true&sparkline=false`;
  console.log(`Fetching CoinGecko data from: ${url}`);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        `Error fetching CoinGecko data for ${contractAddress} on ${blockchain}. Status: ${response.status}. Body: ${errorBody}`
      );
      return {}; // Return empty if CoinGecko fetch fails
    }

    const data = await response.json();
    // console.log('CoinGecko API Response:', JSON.stringify(data, null, 2)); // For debugging

    const coingeckoInfo: Partial<BasicTokenInfo> = {
      id_coingecko: data.id,
      asset_platform_id: data.asset_platform_id,
      // CoinGecko description can be an object with language codes, or a simple string. Prefer English.
      description: typeof data.description === 'string' ? data.description : data.description?.en || undefined,
      links: {
        homepage: data.links?.homepage?.filter((link: string) => link),
        blockchain_explorers: data.links?.blockchain_site?.filter((link: string) => link),
        official_forum_url: data.links?.official_forum_url?.filter((link: string) => link),
        chat_url: data.links?.chat_url?.filter((link: string) => link),
        twitter_screen_name: data.links?.twitter_screen_name,
        facebook_username: data.links?.facebook_username,
        subreddit_url: data.links?.subreddit_url,
        github_repos: data.links?.repos_url?.github?.filter((link: string) => link),
      },
      image_coingecko: data.image ? {
        thumb: data.image.thumb,
        small: data.image.small,
        large: data.image.large,
      } : undefined,
      market_data_coingecko: data.market_data ? {
        current_price_coingecko: data.market_data.current_price,
        market_cap: data.market_data.market_cap,
        market_cap_rank: data.market_data.market_cap_rank,
        total_volume: data.market_data.total_volume,
        high_24h: data.market_data.high_24h,
        low_24h: data.market_data.low_24h,
        price_change_24h_in_currency: data.market_data.price_change_24h_in_currency,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h,
        price_change_percentage_7d: data.market_data.price_change_percentage_7d,
        price_change_percentage_14d: data.market_data.price_change_percentage_14d,
        price_change_percentage_30d: data.market_data.price_change_percentage_30d,
        price_change_percentage_60d: data.market_data.price_change_percentage_60d,
        price_change_percentage_200d: data.market_data.price_change_percentage_200d,
        price_change_percentage_1y: data.market_data.price_change_percentage_1y,
        market_cap_change_24h: data.market_data.market_cap_change_24h,
        market_cap_change_percentage_24h: data.market_data.market_cap_change_percentage_24h,
        total_supply: data.market_data.total_supply,
        circulating_supply: data.market_data.circulating_supply,
        ath: data.market_data.ath,
        ath_change_percentage: data.market_data.ath_change_percentage,
        ath_date: data.market_data.ath_date,
        atl: data.market_data.atl,
        atl_change_percentage: data.market_data.atl_change_percentage,
        atl_date: data.market_data.atl_date,
      } : undefined,
      community_data_coingecko: data.community_data ? {
        telegram_channel_user_count: data.community_data.telegram_channel_user_count,
      } : undefined,
      developer_data_coingecko: data.developer_data ? {
        forks: data.developer_data.forks,
        stars: data.developer_data.stars,
        subscribers: data.developer_data.subscribers,
        total_issues: data.developer_data.total_issues,
        closed_issues: data.developer_data.closed_issues,
        pull_requests_merged: data.developer_data.pull_requests_merged,
        pull_request_contributors: data.developer_data.pull_request_contributors,
        commit_count_4_weeks: data.developer_data.commit_count_4_weeks,
      } : undefined,
      // Populate top-level name, symbol, logoUrl from CoinGecko if available
      // These will be used as preferred source, fallback to OKX
      name: data.name,
      symbol: data.symbol?.toUpperCase(), // Standardize to uppercase
      logoUrl: data.image?.large || data.image?.small || data.image?.thumb,
      // Decimals are not reliably available at this CoinGecko endpoint's top level.
      // We will prioritize OKX for decimals.
    };

    // Clean up empty link objects
    if (coingeckoInfo.links && Object.keys(coingeckoInfo.links).every(key => coingeckoInfo.links![key as keyof typeof coingeckoInfo.links] === undefined || (Array.isArray(coingeckoInfo.links![key as keyof typeof coingeckoInfo.links]) && (coingeckoInfo.links![key as keyof typeof coingeckoInfo.links] as any[]).length === 0))) {
        delete coingeckoInfo.links;
    }
    
    return coingeckoInfo;
  } catch (error: any) {
    console.error(
      `Unexpected error fetching or processing CoinGecko data for ${contractAddress} on ${blockchain}:`,
      error.message,
      error.stack ? "\nStack: " + error.stack : ""
    );
    return {}; // Return empty on unexpected errors
  }
}

export async function getTokenBasicInfo(
  contract: string,
  blockchain: string // e.g., "SOL", "BASE"
): Promise<BasicTokenInfo> {
  try {
    // Fetch data from OKX (primarily for price, timestamp, and decimals, fallback for name, symbol, logo)
    const okxMarketData: OkxMarketData = await fetchOKXMarketData(
      contract,
      blockchain
    );

    // Fetch data from CoinGecko (for detailed info, description, links, etc., and preferred name, symbol, logo)
    const coingeckoData: Partial<BasicTokenInfo> =
      await fetchCoinGeckoTokenData(contract, blockchain);

    // Initialize with all possible fields from BasicTokenInfo as undefined
    const mergedInfo: BasicTokenInfo = {
      volume24h: undefined, // This field is not populated by current sources
      holders: undefined,   // This field is not populated by current sources
      whales: undefined,    // This field is not populated by current sources

      // Prioritize OKX for price and timestamp
      price: okxMarketData.price !== "0" ? okxMarketData.price : (coingeckoData.market_data_coingecko?.current_price_coingecko?.usd?.toString() || "0"),
      timestamp: okxMarketData.timestamp, // OKX timestamp is for its price data

      // For name, symbol, logoUrl: Prefer CoinGecko, fallback to OKX
      name: coingeckoData.name || okxMarketData.name,
      symbol: (coingeckoData.symbol || okxMarketData.symbol)?.toUpperCase(),
      logoUrl: coingeckoData.logoUrl || okxMarketData.logoUrl,
      
      // For decimals: Prioritize OKX.
      decimals: okxMarketData.decimals,
      
      // Populate CoinGecko specific fields directly
      id_coingecko: coingeckoData.id_coingecko,
      asset_platform_id: coingeckoData.asset_platform_id,
      description: coingeckoData.description,
      links: coingeckoData.links,
      image_coingecko: coingeckoData.image_coingecko,
      market_data_coingecko: coingeckoData.market_data_coingecko,
      community_data_coingecko: coingeckoData.community_data_coingecko,
      developer_data_coingecko: coingeckoData.developer_data_coingecko,
    };
    
    // If price is still "0" from OKX and CoinGecko didn't provide a USD price, it remains "0".
    // If it became undefined (e.g. CoinGecko USD price was also undefined), ensure it's "0".
    if (mergedInfo.price === undefined) {
        mergedInfo.price = "0";
    }

    // console.log("Final Merged Token Info:", JSON.stringify(mergedInfo, null, 2)); // For debugging
    return mergedInfo;

  } catch (error: any) {
    console.error(
      `Error in getTokenBasicInfo for ${contract} on ${blockchain}:`,
      error.message,
      error.stack ? "\nStack: " + error.stack : ""
    );
    // Return a minimal structure with error indication or default values, ensuring all fields are present
    const errorReturn: BasicTokenInfo = {
      price: "0",
      timestamp: Date.now().toString(),
      symbol: undefined,
      decimals: undefined,
      name: undefined,
      logoUrl: undefined,
      id_coingecko: undefined,
      asset_platform_id: undefined,
      description: undefined,
      links: undefined,
      image_coingecko: undefined,
      market_data_coingecko: undefined,
      community_data_coingecko: undefined,
      developer_data_coingecko: undefined,
      volume24h: undefined,
      holders: undefined,
      whales: undefined,
    };
    return errorReturn;
  }
}
