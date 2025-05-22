import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center text-gray-800">
            404 - Page Not Found
          </h2>
          <p className="text-gray-600 text-center">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="text-center">
            <Link
              href="/"
              className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Return Home
            </Link>
          </div>
          <p className="text-sm text-gray-500 text-center mt-4">
            If you believe this is a mistake, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}

// Add metadata
export const metadata = {
  title: "404 Not Found - Token Analysis Tool",
  description: "The requested page could not be found.",
};
