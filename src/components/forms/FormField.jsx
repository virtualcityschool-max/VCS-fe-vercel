import React from "react";
import { Input } from "../ui";

/**
 * Reusable form field component with integrated error handling
 * @param {Object} props - Component props
 * @param {string} props.label - Field label
 * @param {string} props.name - Field name
 * @param {string} props.type - Input type
 * @param {string} props.value - Field value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string|Array} props.error - Error message(s) for the field
 * @param {boolean} props.required - Whether field is required
 * @param {boolean} props.disabled - Whether field is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.inputProps - Additional input attributes
 */
export const FormField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = "",
  inputProps = {},
  children, // For custom input content (e.g., password toggle)
}) => {
  const hasError = !!error;
  const errorMessage = Array.isArray(error) ? error[0] : error;

  const handleChange = (e) => {
    // Clear toast notifications when user starts typing
    if (window.toastManager) {
      window.toastManager.dismiss();
    }
    onChange(e);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-[10px] font-black uppercase text-slate-500 tracking-widest block"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {children ? (
        // Custom input content (e.g., password field with toggle)
        <div className="relative">
          {React.cloneElement(children, {
            id: name,
            name,
            type,
            value,
            onChange: handleChange,
            placeholder,
            disabled,
            className: `w-full bg-slate-950 border ${
              hasError ? "border-red-500" : "border-white/5"
            } rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`,
            ...inputProps,
          })}
        </div>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-slate-950 border ${
            hasError ? "border-red-500" : "border-white/5"
          } rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          {...inputProps}
        />
      )}

      {hasError && (
        <div className="text-red-500 text-xs space-y-1">
          {Array.isArray(error) ? (
            error.map((msg, idx) => (
              <p key={idx} className="animate-shake">
                {msg}
              </p>
            ))
          ) : (
            <p className="animate-shake">{errorMessage}</p>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Password field component with toggle visibility
 */
export const PasswordField = (props) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <FormField {...props} type={showPassword ? "text" : "password"}>
      <input
        type={showPassword ? "text" : "password"}
        value={props.value || ""}
        onChange={props.onChange}
        placeholder={props.placeholder}
        disabled={props.disabled}
        className={`w-full bg-slate-950 border ${
          props.error ? "border-red-500" : "border-white/5"
        } rounded-2xl px-6 py-4 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm ${
          props.disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
        tabIndex="-1"
      >
        <i
          className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}
        />
      </button>
    </FormField>
  );
};

/**
 * Email field component
 */
export const EmailField = (props) => (
  <FormField
    {...props}
    type="email"
    inputProps={{
      autoComplete: "email",
      ...props.inputProps,
    }}
  />
);

/**
 * Select field component
 */
export const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  className = "",
  placeholder = "Select an option",
}) => {
  const handleChange = (e) => {
    // Clear toast notifications when user changes selection
    if (window.toastManager) {
      window.toastManager.dismiss();
    }
    onChange(e);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="text-[10px] font-black uppercase text-slate-500 tracking-widest block"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value || ""}
          onChange={handleChange}
          disabled={disabled}
          className={`w-full appearance-none bg-slate-950 border ${
            error ? "border-red-500" : "border-white/5"
          } rounded-2xl px-6 py-4 pr-12 focus:ring-2 focus:ring-indigo-500 outline-none text-white text-sm cursor-pointer ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <i className="fas fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 text-[10px] pointer-events-none" />
      </div>

      {error && (
        <div className="text-red-500 text-xs space-y-1">
          {Array.isArray(error) ? (
            error.map((msg, idx) => (
              <p key={idx} className="animate-shake">
                {msg}
              </p>
            ))
          ) : (
            <p className="animate-shake">{error}</p>
          )}
        </div>
      )}
    </div>
  );
};
