import React from "react";
import Button from "./Button";

const ErrorMessage = ({
  error,
  onRetry = null,
  className = "",
  variant = "default",
  title = "Something went wrong",
}) => {
  const variants = {
    default: "bg-red-50 border border-red-200 text-red-800",
    dark: "bg-red-900/20 border border-red-800/30 text-red-200",
    inline: "text-red-600 text-sm",
  };

  // Extract message from error object or use as-is if it's a string
  const errorMessage =
    typeof error === "object" && error?.message ? error.message : error;

  if (variant === "inline") {
    return <span className={variants[variant]}>{errorMessage}</span>;
  }

  return (
    <div className={`rounded-lg p-4 ${variants[variant]} ${className}`}>
      <div className="flex items-start">
        <div className="shrink-0">
          <i className="fas fa-exclamation-triangle text-lg"></i>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{title}</h3>
          <div className="mt-2 text-sm">
            <p>{errorMessage}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="border-red-300 text-red-700 hover:bg-red-100"
              >
                <i className="fas fa-redo mr-2"></i>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
