"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ButtonSpinner } from "@/components/LoadingSpinner";
import { FAQ } from "@/components/FAQ";
import { formatTokenInfo, truncateAddress } from "@/utils/formatters";
import * as z from "zod";
import type { TokenResponse } from "@/types";
import config from "@/config";

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
      analysisType: "basic",
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
          Authorization: accessCode,
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

      setSearchResults(result);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessCode = (code: string) => {
    setAccessCode(code);
    if (code === config.env.accessCode) {
      setIsLoggedIn(true);
      setError(null);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter access code"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={(e) => handleAccessCode(e.target.value)}
            />
            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Crypto Token Info Query
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Contract Address
              </label>
              <input
                type="text"
                {...register("contractAddress")}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter contract address"
                disabled={isLoading}
              />
              {errors.contractAddress && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.contractAddress.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium">
                Blockchain
              </label>
              <select
                {...register("blockchain")}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
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
              <label className="block mb-2 text-sm font-medium">
                Analysis Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register("analysisType")}
                    value="basic"
                    className="mr-2"
                  />
                  Basic Info
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    {...register("analysisType")}
                    value="ai"
                    className="mr-2"
                  />
                  AI Analysis
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
              className={`w-full py-2 rounded-lg transition-colors ${
                isLoading || isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {isLoading || isSubmitting ? <ButtonSpinner /> : "Search"}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {searchResults && searchResults.data && (
          <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Results</h2>
              <button
                onClick={() => setSearchResults(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              <div className="space-y-2">
                <p className="font-medium">
                  Contract:{" "}
                  <span className="font-mono">
                    {truncateAddress(searchResults.data.contractAddress)}
                  </span>
                </p>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap bg-transparent p-0 text-sm">
                    {formatTokenInfo(searchResults.data)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12">
          <FAQ />
        </div>
      </div>
    </div>
  );
}
