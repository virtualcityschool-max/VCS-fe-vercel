import React from "react";

const PasswordInput = ({
  value,
  onChange,
  placeholder,
  error,
  showPassword,
  onTogglePassword,
  showErrorMessage = true,
  className = "",
  ...props
}) => {
  const baseClasses =
    "block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const inputClasses = `${baseClasses} ${
    error
      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
      : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
  } bg-slate-800 text-white px-4 py-2 text-sm pr-10 placeholder-slate-400 ${className}`;

  return (
    <div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className={inputClasses}
          placeholder={placeholder}
          {...props}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
        >
          <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
        </button>
      </div>
      {error && showErrorMessage && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-2 animate-pulse">
          <i className="fas fa-exclamation-circle text-sm"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default PasswordInput;
