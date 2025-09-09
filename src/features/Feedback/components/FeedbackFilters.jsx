"use client"

import { useState } from "react"
import { Search, RotateCcw } from "lucide-react"
import SearchableSelect from "./SearchableSelect"

const FeedbackFilters = ({ fichas, instructors, niveles, onSearch, loading }) => {
  const [selectedFicha, setSelectedFicha] = useState("")
  const [selectedNivel, setSelectedNivel] = useState("")
  const [selectedInstructor, setSelectedInstructor] = useState("")

  // Convertir arrays a formato de opciones para SearchableSelect
  const fichaOptions = fichas.map((ficha) => ({
    value: ficha.value,
    label: ficha.label,
    programa: ficha.programa,
  }))

  const instructorOptions = instructors.map((instructor) => ({
    value: instructor.value || instructor.nombre || instructor._id,
    label: instructor.label || instructor.nombre || 'Sin nombre',
    especialidad: instructor.especialidad,
    fichas: instructor.fichas
  }))

  const nivelOptions = niveles.map((nivel) => ({
    value: nivel.value || nivel,
    label: nivel.label || `Nivel ${nivel}`,
  }))

  const handleSearch = () => {
    const filters = {
      ficha: selectedFicha,
      nivel: selectedNivel,
      instructor: selectedInstructor,
    }

    // Verificar que al menos un filtro esté seleccionado
    if (!selectedFicha && !selectedNivel && !selectedInstructor) {
      alert("Por favor selecciona al menos un filtro para realizar la búsqueda")
      return
    }

    console.log("Aplicando filtros:", filters)
    onSearch(filters)
  }

  const handleReset = () => {
    setSelectedFicha("")
    setSelectedNivel("")
    setSelectedInstructor("")
  }

  const hasActiveFilters = selectedFicha || selectedNivel || selectedInstructor
  const canSearch = hasActiveFilters && !loading

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-[#1f384c]">Filtros de Búsqueda</h3>
        {hasActiveFilters && (
          <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            {[selectedFicha, selectedNivel, selectedInstructor].filter(Boolean).length} filtro(s) activo(s)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Selector de Ficha */}
        <SearchableSelect
          options={fichaOptions}
          value={selectedFicha}
          onChange={setSelectedFicha}
          placeholder="Seleccionar ficha"
          label="Ficha"
          disabled={loading}
        />

        {/* Selector de Nivel */}
        <SearchableSelect
          options={nivelOptions}
          value={selectedNivel}
          onChange={setSelectedNivel}
          placeholder="Seleccionar nivel"
          label="Nivel"
          disabled={loading}
        />

        {/* Selector de Instructor */}
        <SearchableSelect
          options={instructorOptions}
          value={selectedInstructor}
          onChange={setSelectedInstructor}
          placeholder="Seleccionar instructor"
          label="Instructor"
          disabled={loading}
        />

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={handleSearch}
            disabled={!canSearch}
            className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              canSearch
                ? "bg-[#1f384c] text-white hover:bg-[#2a4a64] focus:outline-none focus:ring-2 focus:ring-[#1f384c] focus:ring-offset-2"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Buscando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Buscar
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            disabled={loading || !hasActiveFilters}
            className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
              hasActiveFilters && !loading
                ? "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                : "border border-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </button>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-200">
          <p className="text-sm text-blue-800 font-medium mb-2">Filtros activos:</p>
          <div className="flex flex-wrap gap-2">
            {selectedFicha && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Ficha: {fichaOptions.find((f) => f.value === selectedFicha)?.label}
              </span>
            )}
            {selectedNivel && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Nivel: {selectedNivel}
              </span>
            )}
            {selectedInstructor && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Instructor: {selectedInstructor}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default FeedbackFilters
