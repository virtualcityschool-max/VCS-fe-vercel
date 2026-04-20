import React, { useState, useRef, useEffect } from "react";

const MultiSelect = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  label,
  error,
  showErrorMessage = true,
  className = "",
  containerClassName = "",
  disabled = false,
  loading = false,
  displayField = "email",
  searchField = "email",
  searchPlaceholder = "Search...",
  emptyMessage = "No options available",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    (option[searchField] || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Toggle option selection
  const handleToggleOption = (option) => {
    if (disabled) return;

    const isSelected = value.some((selected) => selected.id === option.id);
    let newValue;

    if (isSelected) {
      newValue = value.filter((selected) => selected.id !== option.id);
    } else {
      newValue = [...value, option];
    }

    onChange(newValue);
  };

  // Remove selected item
  const handleRemoveItem = (optionToRemove) => {
    if (disabled) return;
    onChange(value.filter((option) => option.id !== optionToRemove.id));
  };

  const selectedItems = value || [];

  return (
    <div
      className={`relative ${containerClassName || (label ? "mb-4" : "")}`}
      ref={dropdownRef}
    >
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Selected items display */}
        <div
          className={`w-full bg-slate-800 border text-white rounded-lg px-3 py-2 min-h-10 cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
              : "border-slate-700 focus:border-indigo-500 focus:ring-indigo-500"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedItems.length === 0 ? (
            <span className="text-slate-400">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1">
              {selectedItems.map((item) => (
                <span
                  key={item.id}
                  className="inline-flex items-center gap-1 bg-indigo-600 text-white text-xs px-2 py-1 rounded-md"
                >
                  {item[displayField] || item.email}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item);
                      }}
                      className="hover:text-red-300 transition-colors"
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <i
            className={`fas fa-chevron-down text-slate-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          ></i>
        </div>
      </div>

      {/* Dropdown menu */}
      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-slate-700">
            <div className="relative">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-slate-400 text-sm"></i>
              </div>
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-slate-400">
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Loading...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-slate-400">
                {searchTerm ? "No results found" : emptyMessage}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedItems.some(
                  (selected) => selected.id === option.id,
                );
                return (
                  <div
                    key={option.id}
                    onClick={() => handleToggleOption(option)}
                    className={`px-3 py-2 cursor-pointer transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <span className="text-sm">{option[displayField] || option.email}</span>
                    {isSelected && <i className="fas fa-check text-xs"></i>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {error && showErrorMessage && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-2 animate-pulse">
          <i className="fas fa-exclamation-circle text-sm"></i>
          {error}
        </p>
      )}
    </div>
  );
};

export default MultiSelect;
