import { BasicTokenInfo } from "@/types";
import axios from "axios";
import config from "@/config";
import {
  buildOKXRequestPath,
  generateRequestHeaders,
  handleOKXResponse,
} from "@/utils/okx";

interface OKXMarketTickerData {
  instId: string;
  last: string;
  lastSz: string;
  vol24h: string;
  volCcy24h: string;
  ts: string;
}

interface OKXMarketResponse {
  code: string;
  msg: string;
  data: OKXMarketTickerData[];
}

interface TokenMarketData {
  volume24h: string;
  price: string;
  timestamp: string;
}

async function fetchOKXMarketData(
  address: string,
  chain: string
): Promise<TokenMarketData> {
  try {
    const endpoint = "/ticker";
    // Format: token_blockchain_spot
    const chainId = chain.toUpperCase() === "SOL" ? "solana" : "base";
    const instId = `${address.toLowerCase()}_${chainId}_spot`;
    const params = {
      instId,
    };

    const requestPath = buildOKXRequestPath(endpoint, params);
    const maxRetries = 3;
    const timeout = 5000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios.get<OKXMarketResponse>(
          `${config.api.okx.baseUrl}${requestPath}`
        );

        if (response.data.code === "0" && response.data.data.length > 0) {
          const tickerData = response.data.data[0];
          return {
            volume24h: tickerData.vol24h,
            price: tickerData.last,
            timestamp: tickerData.ts,
          };
        }
        throw new Error(`Invalid response from OKX API: ${response.data.msg}`);
      } catch (retryError: any) {
        if (attempt === maxRetries) {
          throw retryError;
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }

    return {
      volume24h: "0",
      price: "0",
      timestamp: Date.now().toString(),
    };
  } catch (error) {
    console.error(`Error fetching OKX market data for ${chain}:`, error);
    return {
      volume24h: "0",
      price: "0",
      timestamp: Date.now().toString(),
    };
  }
}

async function fetchSolanaTokenInfo(address: string): Promise<TokenMarketData> {
  try {
    return await fetchOKXMarketData(address, "SOL");
  } catch (error) {
    console.error("Error fetching Solana token info:", error);
    return {
      volume24h: "0",
      price: "0",
      timestamp: Date.now().toString(),
    };
  }
}

async function fetchBaseTokenInfo(address: string): Promise<TokenMarketData> {
  try {
    return await fetchOKXMarketData(address, "BASE");
  } catch (error) {
    console.error("Error fetching Base token info:", error);
    return {
      volume24h: "0",
      price: "0",
      timestamp: Date.now().toString(),
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
      volume24h: marketData.volume24h,
    };
  } catch (error) {
    console.error("Error fetching token info:", error);
    return {};
  }
}
