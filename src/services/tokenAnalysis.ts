import { BasicTokenInfo } from "@/types";
import axios from "axios";
import config from "@/config";
import {
  buildOKXRequestPath,
  generateRequestHeaders,
  handleOKXResponse,
} from "@/utils/okx";

interface OKXTokenInfo {
  volume24h?: string;
  holdersCount?: number;
  topHolders?: {
    address: string;
    balance: string;
    percentage: string;
  }[];
}

interface ChainApiResponse {
  volume24h?: string;
  holders?: {
    total: number;
    whales: {
      count: number;
      percentage: number;
    };
  };
}

async function fetchOKXData(
  address: string,
  chain: string
): Promise<OKXTokenInfo> {
  try {
    const endpoint = "/token/info";
    const params = {
      token: address,
      chainId: chain === "SOL" ? "solana" : "base",
    };

    const requestPath = buildOKXRequestPath(endpoint, params);
    const headers = generateRequestHeaders("GET", requestPath);

    const response = await axios.get(
      `${config.api.okx.baseUrl}${requestPath}`,
      {
        headers,
      }
    );

    return handleOKXResponse<OKXTokenInfo>(response.data);
  } catch (error) {
    console.error(`Error fetching OKX data for ${chain}:`, error);
    throw error;
  }
}

async function fetchSolanaTokenInfo(
  address: string
): Promise<ChainApiResponse> {
  try {
    const tokenData = await fetchOKXData(address, "SOL");

    // Calculate whale metrics
    const whales = (tokenData.topHolders || []).filter(
      (holder) => parseFloat(holder.percentage) >= 1 // 1% or more
    );

    return {
      volume24h: tokenData.volume24h || "0",
      holders: {
        total: tokenData.holdersCount || 0,
        whales: {
          count: whales.length,
          percentage: whales.reduce(
            (acc, whale) => acc + parseFloat(whale.percentage),
            0
          ),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching Solana token info:", error);
    return {
      volume24h: "0",
      holders: {
        total: 0,
        whales: {
          count: 0,
          percentage: 0,
        },
      },
    };
  }
}

async function fetchBaseTokenInfo(address: string): Promise<ChainApiResponse> {
  try {
    const tokenData = await fetchOKXData(address, "BASE");

    // Calculate whale metrics
    const whales = (tokenData.topHolders || []).filter(
      (holder) => parseFloat(holder.percentage) >= 1 // 1% or more
    );

    return {
      volume24h: tokenData.volume24h || "0",
      holders: {
        total: tokenData.holdersCount || 0,
        whales: {
          count: whales.length,
          percentage: whales.reduce(
            (acc, whale) => acc + parseFloat(whale.percentage),
            0
          ),
        },
      },
    };
  } catch (error) {
    console.error("Error fetching Base token info:", error);
    return {
      volume24h: "0",
      holders: {
        total: 0,
        whales: {
          count: 0,
          percentage: 0,
        },
      },
    };
  }
}

export async function getTokenBasicInfo(
  contract: string,
  blockchain: string
): Promise<BasicTokenInfo> {
  try {
    let chainData: ChainApiResponse;

    switch (blockchain.toUpperCase()) {
      case "SOL":
        chainData = await fetchSolanaTokenInfo(contract);
        break;
      case "BASE":
        chainData = await fetchBaseTokenInfo(contract);
        break;
      default:
        throw new Error("Unsupported blockchain");
    }

    return {
      volume24h: chainData.volume24h,
      holders: chainData.holders?.total,
      whales: chainData.holders?.whales,
    };
  } catch (error) {
    console.error("Error fetching token info:", error);
    return {};
  }
}
