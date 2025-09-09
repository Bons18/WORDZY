"use client"

import { useState, useEffect, useMemo } from "react"
import useGetCourses from "../hooks/useGetCourses"

const CourseSelector = ({ selectedCourses = [], onCoursesChange, errors = {} }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { courses, loading, error, hasLoaded, loadCoursesOnDemand } = useGetCourses()

  // Filtrar cursos basado en el término de búsqueda
  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim() || !hasLoaded) return []

    const term = searchTerm.toLowerCase().trim()
    return courses.filter(
      (course) =>
        course.code?.toLowerCase().includes(term) ||
        course.fk_programs?.toLowerCase().includes(term) ||
        course.area?.toLowerCase().includes(term),
    )
  }, [courses, searchTerm, hasLoaded])

  // Manejar cambio en el campo de búsqueda
  const handleSearchChange = async (e) => {
    const value = e.target.value
    setSearchTerm(value)

    // Si el usuario empieza a escribir y no hemos cargado los cursos, cargarlos
    if (value.trim() && !hasLoaded && !loading) {
      await loadCoursesOnDemand()
    }

    // Mostrar dropdown si hay texto
    setIsDropdownOpen(value.trim().length > 0)
  }

  // Manejar selección de curso
  const handleCourseSelect = (course) => {
    // Verificar si el curso ya está seleccionado
    const isAlreadySelected = selectedCourses.some((selected) => selected.id === course.id)

    if (!isAlreadySelected) {
      const updatedCourses = [...selectedCourses, course]
      onCoursesChange(updatedCourses)
    }

    // Limpiar búsqueda y cerrar dropdown
    setSearchTerm("")
    setIsDropdownOpen(false)
  }

  // Manejar eliminación de curso seleccionado
  const handleRemoveCourse = (courseId) => {
    const updatedCourses = selectedCourses.filter((course) => course.id !== courseId)
    onCoursesChange(updatedCourses)
  }

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".course-selector-container")) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="course-selector-container">
      <label className="block text-sm font-medium text-gray-700 mb-2">Fichas Asignadas</label>

      {/* Campo de búsqueda */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Buscar por código, programa o área..."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1f384c] focus:border-transparent ${
            errors.fichas ? "border-red-500" : "border-gray-300"
          }`}
        />

        {/* Indicador de carga */}
        {loading && (
          <div className="absolute right-3 top-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#1f384c]"></div>
          </div>
        )}

        {/* Dropdown de resultados */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-2 text-gray-500 text-center">Cargando fichas...</div>
            ) : error ? (
              <div className="px-3 py-2 text-red-500 text-center">Error al cargar fichas: {error}</div>
            ) : filteredCourses.length === 0 ? (
              <div className="px-3 py-2 text-gray-500 text-center">
                {searchTerm.trim() ? "No se encontraron fichas" : "Escribe para buscar fichas"}
              </div>
            ) : (
              filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleCourseSelect(course)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{course.code}</div>
                  <div className="text-sm text-gray-600">
                    {course.fk_programs} - {course.area}
                  </div>
                  <div className="text-xs text-gray-500">Estado: {course.course_status}</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Cursos seleccionados */}
      {selectedCourses.length > 0 && (
        <div className="mt-3">
          <div className="text-sm font-medium text-gray-700 mb-2">Fichas seleccionadas ({selectedCourses.length}):</div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedCourses.map((course) => (
              <div key={course.id} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{course.code}</div>
                  <div className="text-sm text-gray-600">
                    {course.fk_programs} - {course.area}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCourse(course.id)}
                  className="ml-2 text-red-600 hover:text-red-800 focus:outline-none"
                  title="Eliminar ficha"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {errors.fichas && <p className="mt-1 text-sm text-red-600">{errors.fichas}</p>}

      {/* Información adicional */}
      <div className="mt-2 text-xs text-gray-500">
        💡 Escribe en el campo de búsqueda para encontrar fichas por código, programa o área
      </div>
    </div>
  )
}

export default CourseSelector
