import { BasicTokenInfo } from "@/types";
import { okxDexClient } from "./okxSdkClient";

const DEFAULT_USDC_ADDRESSES: { [key: string]: string } = {
  SOL: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  BASE: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

const CHAIN_ID_MAP: { [key: string]: string } = {
  SOL: "501",
  BASE: "8453",
};

interface TokenMarketData {
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
): Promise<TokenMarketData> {
  try {
    const upperChain = chain.toUpperCase();
    const toTokenAddress = DEFAULT_USDC_ADDRESSES[upperChain];
    const chainId = CHAIN_ID_MAP[upperChain];

    if (!toTokenAddress || !chainId) {
      throw new Error(`Unsupported chain for OKX SDK: ${chain}`);
    }

    console.log(
      `Fetching quote via SDK for ${address} on chain ${chain} (ID: ${chainId}) against USDC (${toTokenAddress})`
    );

    const quote = await okxDexClient.dex.getQuote({
      chainId,
      fromTokenAddress: address,
      toTokenAddress,
      amount: "1",
      slippage: "0.5",
    });

    console.log("OKX SDK getQuote response:", JSON.stringify(quote, null, 2));

    let extractedPrice: string | undefined;
    let extractedSymbol: string | undefined;
    let extractedDecimals: number | undefined;
    let extractedName: string | undefined;
    let extractedLogoUrl: string | undefined;

    if (quote && quote.data && quote.data.length > 0) {
      const quoteData = quote.data[0];
      if (quoteData.fromToken) {
        if (quoteData.fromToken.tokenUnitPrice) {
          extractedPrice = quoteData.fromToken.tokenUnitPrice;
        }
        if (quoteData.fromToken.tokenSymbol) {
          extractedSymbol = quoteData.fromToken.tokenSymbol;
        }
        if (quoteData.fromToken.decimal) {
          extractedDecimals = parseInt(quoteData.fromToken.decimal, 10);
        }
        if ((quoteData.fromToken as any).name) {
          extractedName = (quoteData.fromToken as any).name;
        }
        if ((quoteData.fromToken as any).logoURI) {
          extractedLogoUrl = (quoteData.fromToken as any).logoURI;
        }
      }
    }

    if (!extractedPrice) {
      throw new Error(
        "Price information (fromToken.tokenUnitPrice) not found in OKX SDK getQuote response."
      );
    }

    return {
      price: extractedPrice,
      timestamp: Date.now().toString(),
      symbol: extractedSymbol,
      decimals: extractedDecimals,
      name: extractedName,
      logoUrl: extractedLogoUrl,
    };
  } catch (error: any) {
    console.error(
      `Error fetching OKX market data via SDK for ${address} on ${chain}:`,
      error.message,
      error.stack ? "\nStack: " + error.stack : "",
      error.response?.data
        ? "\nResponse Data: " + JSON.stringify(error.response.data)
        : ""
    );
    return {
      price: "0",
      timestamp: Date.now().toString(),
      symbol: undefined,
      decimals: undefined,
      name: undefined,
      logoUrl: undefined,
    };
  }
}

async function fetchSolanaTokenInfo(address: string): Promise<TokenMarketData> {
  try {
    return await fetchOKXMarketData(address, "SOL");
  } catch (error) {
    console.error("Error fetching Solana token info:", error);
    return {
      price: "0",
      timestamp: Date.now().toString(),
      symbol: undefined,
      decimals: undefined,
      name: undefined,
      logoUrl: undefined,
    };
  }
}

async function fetchBaseTokenInfo(address: string): Promise<TokenMarketData> {
  try {
    return await fetchOKXMarketData(address, "BASE");
  } catch (error) {
    console.error("Error fetching Base token info:", error);
    return {
      price: "0",
      timestamp: Date.now().toString(),
      symbol: undefined,
      decimals: undefined,
      name: undefined,
      logoUrl: undefined,
    };
  }
}

export async function getTokenBasicInfo(
  contract: string,
  blockchain: string
): Promise<BasicTokenInfo> {
  try {
    let marketData: TokenMarketData;

    switch (blockchain.toUpperCase()) {
      case "SOL":
        marketData = await fetchSolanaTokenInfo(contract);
        break;
      case "BASE":
        marketData = await fetchBaseTokenInfo(contract);
        break;
      default:
        throw new Error("Unsupported blockchain");
    }

    return {
      price: marketData.price,
      timestamp: marketData.timestamp,
      symbol: marketData.symbol,
      decimals: marketData.decimals,
      name: marketData.name,
      logoUrl: marketData.logoUrl,
    };
  } catch (error) {
    console.error("Error fetching token info:", error);
    return {};
  }
}
