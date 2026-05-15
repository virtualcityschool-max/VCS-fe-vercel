import React from "react";

const LoadingSpinner = ({
  size = "md",
  className = "",
  text = null,
  overlay = false,
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const containerClasses = overlay
    ? `fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[200] ${className}`
    : `flex items-center justify-center ${className}`;

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div
          className={`${sizes[size]} bg-blue-600/20 rounded-full flex items-center justify-center mx-auto ${text ? "mb-4" : ""}`}
        >
          <i
            className={`fas fa-spinner text-blue-500 ${size === "sm" ? "text-xs" : size === "md" ? "text-sm" : size === "lg" ? "text-lg" : "text-2xl"} animate-spin`}
          ></i>
        </div>
        {text && <p className="text-white text-sm font-medium">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
