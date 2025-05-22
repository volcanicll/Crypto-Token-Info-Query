import { NextResponse } from "next/server";
import { TokenQuery, TokenResponse } from "@/types";
import { supabaseAdmin } from "@/utils/supabase";
import { APIError, handleError } from "@/utils/error";
import config from "@/config";
import { analyzeTwitter } from "@/services/twitterAnalysis";
import { getTokenBasicInfo } from "@/services/tokenAnalysis";

export async function POST(
  request: Request
): Promise<NextResponse<TokenResponse>> {
  try {
    // Validate request body
    const body: TokenQuery = await request.json();
    const { contract_address, blockchain, analysis_type } = body;

    if (!contract_address) {
      throw new APIError("Contract address is required", 400);
    }

    if (!config.validation.supportedBlockchains.includes(blockchain as any)) {
      throw new APIError("Invalid blockchain specified", 400);
    }

    // Store query in Supabase
    const { error: logError } = await supabaseAdmin
      .from("token_queries")
      .insert([
        {
          contract_address,
          blockchain,
          analysis_type,
          queried_at: new Date().toISOString(),
        },
      ]);

    if (logError) {
      console.error("Error logging query:", logError);
      throw new APIError("Failed to log query", 500);
    }

    let tokenInfo: string | undefined;
    let twitterAnalysis:
      | { search_summary?: string; account_summary?: string }
      | undefined;
    let basicInfo = undefined;

    if (analysis_type === "ai") {
      // Get Twitter analysis
      twitterAnalysis = await analyzeTwitter(
        contract_address.slice(0, 8), // Use first 8 chars as symbol
        contract_address
      );
    } else {
      // Get basic token information
      basicInfo = await getTokenBasicInfo(contract_address, blockchain);
    }

    return NextResponse.json({
      success: true,
      data: {
        tokenInfo,
        twitterAnalysis,
        basicInfo,
        blockchain,
        contractAddress: contract_address,
      },
    });
  } catch (error) {
    const { message, status } = handleError(error);
    console.error("Error processing request:", error);

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
