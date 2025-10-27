import React, { useState, useEffect } from "react";
import { FiSearch, FiX } from "react-icons/fi";

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  value,
  onChange,
  className = "",
}) => {
  // Internal state for uncontrolled mode
  const [inputValue, setInputValue] = useState(value || "");

  // Sync internal state when value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearch) {
        onSearch(inputValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, onSearch]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleClear = () => {
    setInputValue("");
    if (onChange) {
      onChange("");
    }
    if (onSearch) {
      onSearch("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && onSearch) {
      e.preventDefault();
      onSearch(inputValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <FiSearch className="text-gray-400" size={18} />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        className="appearance-none rounded-lg relative block w-full pl-10 pr-10 py-2 px-4 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
      />

      {/* Clear Button */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
