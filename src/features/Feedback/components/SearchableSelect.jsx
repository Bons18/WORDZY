"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Search, X } from "lucide-react"

const SearchableSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Seleccionar...",
  label,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const dropdownRef = useRef(null)
  const searchInputRef = useRef(null)

  // Filtrar opciones basado en el término de búsqueda
  const filteredOptions = options.filter(
    (option) => {
      const label = option.label || option.value || ''
      const value = option.value || ''
      return (
        label.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
  )

  // Encontrar la opción seleccionada
  const selectedOption = options.find((option) => option.value === value)

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Enfocar el input de búsqueda cuando se abre el dropdown
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen)
      setSearchTerm("")
    }
  }

  const handleSelect = (option) => {
    onChange(option.value)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleClear = (e) => {
    e.stopPropagation()
    onChange("")
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

      <div
        onClick={handleToggle}
        className={`
          relative w-full px-3 py-2 border rounded-md cursor-pointer transition-colors
          ${
            disabled
              ? "bg-gray-100 border-gray-300 cursor-not-allowed"
              : "bg-white border-gray-300 hover:border-gray-400 focus-within:border-[#1f384c] focus-within:ring-1 focus-within:ring-[#1f384c]"
          }
          ${isOpen ? "border-[#1f384c] ring-1 ring-[#1f384c]" : ""}
        `}
      >
        <div className="flex items-center justify-between">
          <span className={`block truncate ${selectedOption ? "text-gray-900" : "text-gray-500"}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <div className="flex items-center gap-1">
            {selectedOption && !disabled && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                type="button"
              >
                <X className="w-3 h-3 text-gray-400" />
              </button>
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Campo de búsqueda */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-8 pr-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#1f384c] focus:ring-1 focus:ring-[#1f384c]"
              />
            </div>
          </div>

          {/* Lista de opciones */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-3 py-2 cursor-pointer transition-colors
                    ${option.value === value ? "bg-[#1f384c] text-white" : "hover:bg-gray-100 text-gray-900"}
                  `}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    {option.programa && (
                      <span className={`text-xs ${option.value === value ? "text-gray-200" : "text-gray-500"}`}>
                        {option.programa}
                      </span>
                    )}
                    {option.especialidad && (
                      <span className={`text-xs ${option.value === value ? "text-gray-200" : "text-gray-500"}`}>
                        {option.especialidad}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">No se encontraron resultados</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchableSelect
