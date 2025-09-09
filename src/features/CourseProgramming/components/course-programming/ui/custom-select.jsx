"use client"

import { useState, useEffect, useRef } from "react"

export default function CustomSelect({ placeholder, options = [], value, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Cerrar el dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // ✅ Función para obtener el valor actual (maneja tanto string como objeto)
  const getCurrentValue = () => {
    if (!value) return null

    // Si value es un objeto con value y label
    if (typeof value === "object" && value.value) {
      return value.value
    }

    // Si value es un string
    if (typeof value === "string") {
      return value
    }

    return null
  }

  // ✅ Función para obtener el texto a mostrar
  const getDisplayText = () => {
    const currentValue = getCurrentValue()

    if (!currentValue) return placeholder

    // Si value es un objeto con label, usar ese label
    if (typeof value === "object" && value.label) {
      return value.label
    }

    // Buscar en las opciones disponibles
    const selectedOption = options.find((option) => option.value === currentValue)
    return selectedOption ? selectedOption.label : placeholder
  }

  const currentValue = getCurrentValue()
  const displayText = getDisplayText()

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="w-full flex items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={currentValue ? "text-gray-900" : "text-gray-500"}>{displayText}</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "transform rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border border-gray-200">
          <ul className="max-h-60 overflow-auto rounded-md py-1 text-base">
            {options && options.length > 0 ? (
              options.map((option) => (
                <li
                  key={option.value}
                  className={`cursor-pointer select-none text-sm px-3 py-2 hover:bg-gray-100 ${
                    currentValue === option.value ? "bg-blue-50 text-blue-600 font-medium" : ""
                  }`}
                  onClick={() => {
                    // ✅ Pasar el objeto completo en lugar de solo el valor
                    onChange(option)
                    setIsOpen(false)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {currentValue === option.value && (
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="text-sm px-3 py-2 text-gray-500">No hay opciones disponibles</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
