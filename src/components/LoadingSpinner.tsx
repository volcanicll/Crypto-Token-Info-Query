interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = "medium",
  text = "Processing...",
  className = "",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "h-4 w-4",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`animate-spin rounded-full border-b-2 border-blue-500 ${sizeClasses[size]}`}
      ></div>
      {text && <span className="ml-2 text-gray-600">{text}</span>}
    </div>
  );
}

export function ButtonSpinner() {
  return (
    <div className="flex items-center justify-center">
      <LoadingSpinner size="small" text="Please wait..." />
    </div>
  );
}
