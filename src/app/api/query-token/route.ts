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

    let tokenInfo: string | undefined;
    let twitterAnalysis:
      | { search_summary?: string; account_summary?: string }
      | undefined;
    let basicInfo = undefined;
    let error = undefined;

    try {
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
    } catch (err) {
      error = err instanceof Error ? err.message : "Analysis failed";
    }

    // Store query and results in Supabase
    const { data: queryData, error: queryError } = await supabaseAdmin
      .from("token_queries")
      .insert([
        {
          contract_address,
          blockchain,
          analysis_type,
          queried_at: new Date().toISOString(),
        },
      ])
      .select("query_id")
      .single();

    if (queryError) {
      console.error("Error logging query:", queryError);
      throw new APIError("Failed to log query", 500);
    }

    // Store analysis results
    const { error: resultError } = await supabaseAdmin
      .from("analysis_results")
      .insert([
        {
          query_id: queryData.query_id,
          analysis_type,
          twitter_analysis: twitterAnalysis
            ? JSON.stringify(twitterAnalysis)
            : null,
          basic_metrics: basicInfo ? JSON.stringify(basicInfo) : null,
          error: error,
          completed_at: new Date().toISOString(),
        },
      ]);

    if (resultError) {
      console.error("Error storing results:", resultError);
      // Continue execution as the analysis was successful
    }

    return NextResponse.json({
      success: true,
      data: {
        tokenInfo,
        twitterAnalysis,
        basicInfo,
        blockchain,
        contractAddress: contract_address,
        query_id: queryData.query_id,
      },
    });
  } catch (error) {
    const { message, status } = handleError(error);
    console.error("Error processing request:", error);

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
