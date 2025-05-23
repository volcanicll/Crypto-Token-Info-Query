"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonSpinner } from "@/components/LoadingSpinner";
import { FAQ } from "@/components/FAQ";
import { truncateAddress } from "@/utils/formatters"; // formatTokenInfo removed
import * as z from "zod";
import type { TokenResponse } from "@/types";
import config from "@/config";

// Import the new display components
import { TokenSummaryDisplay } from '@/components/TokenSummaryDisplay';
import { TokenBasicInfoDisplay } from '@/components/TokenBasicInfoDisplay';
import { TokenMarketDataDisplay } from '@/components/TokenMarketDataDisplay';
import { TokenLinksDisplay } from '@/components/TokenLinksDisplay';
import { TokenCommunityDisplay } from '@/components/TokenCommunityDisplay';
import { TokenDeveloperDisplay } from '@/components/TokenDeveloperDisplay';

const searchSchema = z.object({
  contractAddress: z
    .string()
    .min(config.validation.minContractLength, "Contract address is required")
    .trim(),
  blockchain: z.enum(config.validation.supportedBlockchains, {
    errorMap: () => ({ message: "Please select a valid blockchain" }),
  }),
  analysisType: z.enum(["ai", "basic"], {
    errorMap: () => ({ message: "Please select an analysis type" }),
  }),
});

type SearchFormData = z.infer<typeof searchSchema>;

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [searchResults, setSearchResults] = useState<TokenResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      analysisType: "basic", // Default to basic analysis
    },
  });

  const onSubmit = async (data: SearchFormData) => {
    setIsLoading(true);
    setError(null);
    setSearchResults(null);

    try {
      const response = await fetch("/api/query-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessCode, // Pass access code for backend validation
        },
        body: JSON.stringify({
          contract_address: data.contractAddress,
          blockchain: data.blockchain,
          analysis_type: data.analysisType,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch data");
      }
      if (!result.success) {
        throw new Error(result.error || "API returned an error");
      }
      setSearchResults(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessCode = (code: string) => {
    // Directly compare with the access code from config
    if (code === config.env.accessCode) {
      setIsLoggedIn(true);
      setError(null); // Clear any previous login errors
      setAccessCode(code); // Store for API calls
    } else {
      // Optionally, provide immediate feedback for incorrect code if desired
      // For now, it just won't log in.
      // setError("Invalid access code."); // Example immediate feedback
    }
  };
  
  // Simpler handler for the input field if direct comparison is enough
  const onAccessCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const currentCode = e.target.value;
    // You could call handleAccessCode here directly or manage state differently
    // For this example, let's assume the button click is the primary "login attempt"
    // Or, for immediate validation:
    if (currentCode === config.env.accessCode) {
        handleAccessCode(currentCode);
    } else {
        setIsLoggedIn(false); // Ensure logged out if code is changed and incorrect
    }
  };


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-700">Access Required</h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter access code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={onAccessCodeChange} // Use the new handler
            />
            {/* Error display can be added here if needed for login attempts */}
             {/* {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )} */}
          </div>
          {/* A button to attempt login might be better UX if not validating on change */}
          {/* <button 
            onClick={() => handleAccessCode(accessCode)} // Assuming accessCode state is updated by input's onChange
            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </button> */}
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
          Crypto Token Info Query
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="contractAddress" className="block mb-2 text-sm font-medium text-gray-700">
                Contract Address
              </label>
              <input
                id="contractAddress"
                type="text"
                {...register("contractAddress")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contract address (e.g., for SOL or BASE)"
                disabled={isLoading || isSubmitting}
              />
              {errors.contractAddress && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.contractAddress.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="blockchain" className="block mb-2 text-sm font-medium text-gray-700">
                Blockchain
              </label>
              <select
                id="blockchain"
                {...register("blockchain")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading || isSubmitting}
              >
                <option value="">Select a blockchain</option>
                {config.validation.supportedBlockchains.map((chain) => (
                  <option key={chain} value={chain}>
                    {chain}
                  </option>
                ))}
              </select>
              {errors.blockchain && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.blockchain.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Analysis Type
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("analysisType")}
                    value="basic"
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  Basic Info
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    {...register("analysisType")}
                    value="ai"
                    className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  AI Enhanced Analysis
                </label>
              </div>
              {errors.analysisType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.analysisType.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || isSubmitting}
              className={`w-full py-2.5 px-4 rounded-lg text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading || isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isLoading || isSubmitting ? <ButtonSpinner /> : "Search Token"}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {/* Results Section - Modified */}
        {searchResults && searchResults.data && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Results for {truncateAddress(searchResults.data.contractAddress)} on {searchResults.data.blockchain.toUpperCase()}
              </h2>
              <button
                onClick={() => setSearchResults(null)}
                className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1 rounded-md border border-gray-300 hover:border-gray-400 transition-colors"
              >
                Clear Results
              </button>
            </div>

            {/* AI Summary Display - if analysis type was 'ai' and summary exists */}
            {searchResults.data.tokenInfo && searchResults.data.tokenInfo.trim() !== "" && 
             !searchResults.data.tokenInfo.startsWith("Could not retrieve") && // Check for specific error message
             !searchResults.data.tokenInfo.startsWith("AI summary generation failed") && // Check for API failure
             !searchResults.data.tokenInfo.startsWith("AI summary not available") && // Check for missing API key
            (
                <TokenSummaryDisplay summary={searchResults.data.tokenInfo} />
            )}

            {/* Display basic info which now contains CoinGecko data */}
            {searchResults.data.basicInfo && (
              <div className="space-y-6 mt-4"> {/* Added spacing for component sections */}
                <TokenBasicInfoDisplay info={searchResults.data.basicInfo} />
                <TokenMarketDataDisplay 
                    marketData={searchResults.data.basicInfo.market_data_coingecko} 
                    tokenPrice={searchResults.data.basicInfo.price} 
                />
                <TokenLinksDisplay links={searchResults.data.basicInfo.links} />
                <TokenCommunityDisplay communityData={searchResults.data.basicInfo.community_data_coingecko} />
                <TokenDeveloperDisplay devData={searchResults.data.basicInfo.developer_data_coingecko} />
              </div>
            )}
            
            {/* Optional: Display raw Twitter analysis if still desired */}
            {searchResults.data.twitterAnalysis && (
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Twitter Mentions Analysis (Raw)</h3>
                <pre className="text-xs whitespace-pre-wrap bg-gray-100 p-3 rounded-md">
                  {JSON.stringify(searchResults.data.twitterAnalysis, null, 2)}
                </pre>
              </div>
            )}

            {/* Display error from AI summary if it exists and is an error message */}
            {searchResults.data.tokenInfo && 
             (searchResults.data.tokenInfo.startsWith("Could not retrieve") ||
              searchResults.data.tokenInfo.startsWith("AI summary generation failed") ||
              searchResults.data.tokenInfo.startsWith("AI summary not available")) &&
             (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-md font-semibold mb-1 text-yellow-700">AI Summary Notice</h3>
                    <p className="text-sm text-yellow-600">{searchResults.data.tokenInfo}</p>
                </div>
            )}

          </div>
        )}

        <div className="mt-12">
          <FAQ />
        </div>
      </div>
    </div>
  );
}
