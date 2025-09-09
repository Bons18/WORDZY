"use client"

import { forwardRef } from "react"
import { FiSearch } from "react-icons/fi"

const SearchInput = forwardRef(
  ({ value, onChange, onFocus, placeholder = "Ej: ADSO-2024-01, 2691851...", className = "" }, ref) => {
    return (
      <div className={`relative ${className}`}>
        <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg transition-colors duration-200" />
        <input
          ref={ref}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          className="w-full pl-4 pr-12 py-3 text-sm border-2 border-gray-200 rounded-xl bg-gradient-to-r from-gray-50 to-blue-50 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all duration-300 placeholder-gray-500 shadow-sm hover:shadow-md"
        />
      </div>
    )
  },
)

SearchInput.displayName = "SearchInput"

export default SearchInput
