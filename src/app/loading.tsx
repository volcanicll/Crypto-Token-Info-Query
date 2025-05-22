import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="space-y-4">
          <LoadingSpinner />
          <p className="text-gray-600 text-center">Loading application...</p>
        </div>
      </div>
    </div>
  );
}

// Add metadata
export const metadata = {
  title: "Loading... - Token Analysis Tool",
  description: "Please wait while we load the application.",
};
