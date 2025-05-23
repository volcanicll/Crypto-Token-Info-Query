import { NextResponse } from "next/server";
import { TokenQuery, TokenResponse, BasicTokenInfo } from "@/types"; // Added BasicTokenInfo
import { supabaseAdmin } from "@/utils/supabase";
import { APIError, handleError } from "@/utils/error";
import config from "@/config";
import { analyzeTwitter } from "@/services/twitterAnalysis";
import { getTokenBasicInfo } from "@/services/tokenAnalysis";
import { getAISummaryForToken } from "@/services/aiTokenSummarizer"; // Import the new AI summarizer

export async function POST(
  request: Request
): Promise<NextResponse<TokenResponse>> {
  try {
    const body: TokenQuery = await request.json();
    const { contract_address, blockchain, analysis_type } = body;

    if (!contract_address) {
      throw new APIError("Contract address is required", 400);
    }

    if (!config.validation.supportedBlockchains.includes(blockchain as any)) {
      throw new APIError("Invalid blockchain specified", 400);
    }

    let tokenInfo: string | undefined; // This will hold the AI summary
    let twitterAnalysis:
      | { search_summary?: string; account_summary?: string }
      | undefined;
    let basicInfo: BasicTokenInfo | undefined = undefined; // Explicitly type
    let analysisProcessError: string | undefined = undefined; // Renamed to avoid conflict

    try {
      if (analysis_type === "ai") {
        // 1. Get basic token information
        basicInfo = await getTokenBasicInfo(contract_address, blockchain);

        // 2. Get AI summary based on basicInfo
        if (basicInfo && Object.keys(basicInfo).length > 0 && (basicInfo.price !== "0" || basicInfo.id_coingecko)) { // Ensure basicInfo is meaningful
          tokenInfo = await getAISummaryForToken(basicInfo);
        } else {
          tokenInfo = "Could not retrieve sufficient basic token data to generate AI summary.";
          if (!basicInfo || Object.keys(basicInfo).length === 0 || (basicInfo.price === "0" && !basicInfo.id_coingecko)) {
             analysisProcessError = "Failed to fetch meaningful basic data for AI summary.";
          }
        }
        
        // 3. Get Twitter analysis (can run in parallel if desired, but sequential for now)
        // Use token symbol from basicInfo if available, otherwise fallback to a slice of contract_address
        const searchSymbolForTwitter = basicInfo?.symbol || contract_address.slice(0, 8);
        twitterAnalysis = await analyzeTwitter(
          searchSymbolForTwitter,
          contract_address 
        );

      } else { // analysis_type === "basic"
        basicInfo = await getTokenBasicInfo(contract_address, blockchain);
        if (!basicInfo || Object.keys(basicInfo).length === 0 || (basicInfo.price === "0" && !basicInfo.id_coingecko)) {
            analysisProcessError = "Failed to fetch basic token information.";
        }
        // tokenInfo remains undefined for "basic" analysis
      }
    } catch (err: any) {
      console.error("Error during analysis data fetching:", err);
      analysisProcessError = err.message || "An unexpected error occurred during analysis data fetching.";
      // If basicInfo was partially fetched before an error, it might be returned.
      // If AI summary failed, tokenInfo might hold an error message from getAISummaryForToken.
    }

    // Store query in Supabase (this should always happen)
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
      console.error("Error logging query to Supabase:", queryError);
      // Decide if this is a critical error. For now, proceeding to store results if queryData exists.
      if (!queryData?.query_id) { // If query_id is essential for linking results
         throw new APIError("Failed to log query, cannot store results.", 500);
      }
    }
    
    // Ensure queryData is defined before proceeding (it should be if no error thrown)
    const currentQueryId = queryData?.query_id;

    if (currentQueryId) {
        // Store analysis results
        const { error: resultError } = await supabaseAdmin
        .from("analysis_results")
        .insert([
            {
            query_id: currentQueryId,
            analysis_type,
            ai_summary: tokenInfo, // This now correctly stores the AI summary string
            twitter_analysis: twitterAnalysis
                ? JSON.stringify(twitterAnalysis)
                : null,
            basic_metrics: basicInfo ? JSON.stringify(basicInfo) : null,
            error: analysisProcessError, // Store any error from the analysis process
            completed_at: new Date().toISOString(),
            },
        ]);

        if (resultError) {
        console.error("Error storing analysis results in Supabase:", resultError);
        // Not throwing here, as the main data might still be returnable to the user.
        }
    } else {
        console.warn("query_id is undefined, skipping storage of analysis_results.");
        // This case should ideally not be reached if query logging is successful or throws.
    }
    

    // If there was an analysis process error significant enough to not return data:
    if (analysisProcessError && !basicInfo && !tokenInfo) {
        // This condition might need refinement based on how partial errors are handled
        throw new APIError(analysisProcessError, 500);
    }

    return NextResponse.json({
      success: true,
      data: {
        tokenInfo, // AI summary for "ai" type, undefined for "basic"
        twitterAnalysis,
        basicInfo, // Basic info for both "ai" and "basic" types
        blockchain,
        contractAddress: contract_address,
        // query_id: currentQueryId, // query_id is not part of TokenResponse data structure in types.ts
      },
    });
  } catch (error) { // This is the main catch block for the entire POST function
    const { message, status } = handleError(error); // handleError should manage APIError vs generic Error
    console.error("Error processing POST request in catch block:", message, error); 

    return NextResponse.json({ success: false, error: message }, { status });
  }
}
