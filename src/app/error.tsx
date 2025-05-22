"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-red-600">
          Something went wrong!
        </h2>
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            {error.message || "An unexpected error occurred"}
          </p>
          <div className="text-center">
            <button
              onClick={reset}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try again
            </button>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">
            If the problem persists, please try refreshing the page or contact
            support.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-400 text-center">
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
