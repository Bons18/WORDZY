"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, X } from "lucide-react"

const FilterDropdown = ({ options, selectedValue, onSelect, placeholder, displayKey, valueKey, loading }) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = (value) => {
    onSelect(value)
    setIsOpen(false)
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onSelect("")
  }

  const selectedOption = options.find((option) => option[valueKey] === selectedValue)
  const displayText = selectedOption ? selectedOption[displayKey] : placeholder

  if (loading) {
    return (
      <div className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-md text-sm animate-pulse">
        Cargando...
      </div>
    )
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-200 rounded-md text-sm hover:bg-gray-50 transition-colors"
      >
        <span className={selectedValue ? "text-gray-900" : "text-gray-500"}>{displayText}</span>
        <div className="flex items-center gap-1">
          {selectedValue && (
            <button onClick={handleClear} className="p-0.5 hover:bg-gray-200 rounded text-gray-400 hover:text-gray-600">
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option[valueKey]}
                onClick={() => handleSelect(option[valueKey])}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                  selectedValue === option[valueKey] ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                }`}
              >
                {option[displayKey]}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">No hay opciones disponibles</div>
          )}
        </div>
      )}
    </div>
  )
}

export default FilterDropdown
