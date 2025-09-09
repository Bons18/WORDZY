"use client"

import { useState, useEffect } from "react"
import useGetCourses from "../hooks/useGetCourses"

const InstructorForm = ({ isOpen, onClose, onSubmit, instructor, isEditMode, loading }) => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    tipoDocumento: "CC",
    estado: "Activo",
    telefono: "",
    correo: "",
    fichas: [], // Array de IDs de fichas
  })

  const [errors, setErrors] = useState({})
  const [searchTerm, setSearchTerm] = useState("")
  const { courses, loading: coursesLoading, error: coursesError } = useGetCourses()

  // Resetear formulario cuando se abre/cierra o cambia el instructor
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && instructor) {
        console.log("Cargando datos del instructor para edición:", instructor)

        // Extraer IDs de fichas si vienen como objetos poblados
        let fichasIds = []
        if (instructor.fichas && Array.isArray(instructor.fichas)) {
          fichasIds = instructor.fichas.map((ficha) => {
            // Si la ficha es un objeto, extraer el ID
            if (typeof ficha === "object" && ficha !== null) {
              return ficha._id || ficha.id
            }
            // Si ya es un string (ID), usarlo directamente
            return ficha
          })
        }

        setFormData({
          nombre: instructor.nombre || "",
          apellido: instructor.apellido || "",
          documento: instructor.documento || "",
          tipoDocumento: instructor.tipoDocumento || "CC",
          estado: instructor.estado || "Activo",
          telefono: instructor.telefono || "",
          correo: instructor.correo || "",
          fichas: fichasIds,
        })
        console.log("Fichas cargadas para edición:", fichasIds)
      } else {
        // Resetear para nuevo instructor
        setFormData({
          nombre: "",
          apellido: "",
          documento: "",
          tipoDocumento: "CC",
          estado: "Activo",
          telefono: "",
          correo: "",
          fichas: [],
        })
      }
      setErrors({})
      setSearchTerm("") // Limpiar búsqueda
    }
  }, [isOpen, isEditMode, instructor])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const toggleEstado = () => {
    setFormData((prev) => ({
      ...prev,
      estado: prev.estado === "Activo" ? "Inactivo" : "Activo",
    }))
  }

  const handleFichaToggle = (fichaId) => {
    console.log("Toggling ficha:", fichaId)
    setFormData((prev) => {
      const currentFichas = prev.fichas || []
      const isSelected = currentFichas.includes(fichaId)

      let newFichas
      if (isSelected) {
        newFichas = currentFichas.filter((id) => id !== fichaId)
      } else {
        newFichas = [...currentFichas, fichaId]
      }

      console.log("Fichas actualizadas:", newFichas)
      return {
        ...prev,
        fichas: newFichas,
      }
    })
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "El nombre es obligatorio"
    }

    if (!formData.apellido?.trim()) {
      newErrors.apellido = "El apellido es obligatorio"
    }

    if (!formData.documento?.trim()) {
      newErrors.documento = "El documento es obligatorio"
    }

    if (!formData.correo?.trim()) {
      newErrors.correo = "El correo es obligatorio"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.correo)) {
        newErrors.correo = "El formato del correo no es válido"
      }
    }

    if (!formData.telefono?.trim()) {
      newErrors.telefono = "El teléfono es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Preparar datos directamente aquí para evitar problemas con servicios externos
      const instructorData = {
        tipoUsuario: "instructor",
        nombre: formData.nombre?.trim(),
        apellido: formData.apellido?.trim(),
        documento: formData.documento?.trim(),
        tipoDocumento: formData.tipoDocumento,
        estado: formData.estado,
        telefono: formData.telefono?.trim(),
        correo: formData.correo?.toLowerCase().trim(),
        fichas: formData.fichas || [], // Asegurar que fichas siempre sea un array
      }

      console.log("=== DATOS A ENVIAR AL SERVIDOR ===")
      console.log("Instructor data:", instructorData)
      console.log("Fichas seleccionadas:", instructorData.fichas)
      console.log("Cantidad de fichas:", instructorData.fichas.length)

      await onSubmit(instructorData)
    } catch (error) {
      console.error("Error en el formulario:", error)
    }
  }

  // Filtrar fichas basado en el término de búsqueda
  const filteredCourses = courses.filter((course) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      course.code?.toLowerCase().includes(searchLower) ||
      course.fk_programs?.toLowerCase().includes(searchLower) ||
      course.area?.toLowerCase().includes(searchLower) ||
      course.course_status?.toLowerCase().includes(searchLower)
    )
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#1f384c]">
              {isEditMode ? "EDITAR INSTRUCTOR" : "CREAR INSTRUCTOR"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{errors.general}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Información Personal */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#1f384c] mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                      errors.nombre ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={formData.apellido}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                      errors.apellido ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.apellido && <p className="text-red-500 text-sm mt-1">{errors.apellido}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Documento <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f384c]"
                    required
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PPT">Permiso por Protección Temporal</option>
                    <option value="PEP">Permiso Especial de Permanencia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Documento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                      errors.documento ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.documento && <p className="text-red-500 text-sm mt-1">{errors.documento}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                      errors.telefono ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center mt-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.estado === "Activo"}
                        onChange={toggleEstado}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A34A]"></div>
                    </label>
                    <span className="ml-3 text-sm text-gray-700">
                      {formData.estado === "Activo" ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                  {errors.estado && <p className="text-red-500 text-sm mt-1">{errors.estado}</p>}
                </div>
              </div>

              <div className="mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                      errors.correo ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
                </div>
              </div>
            </div>

            {/* Sección de Fichas */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#1f384c] mb-4">
                Fichas Asignadas
                {formData.fichas.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({formData.fichas.length} seleccionada{formData.fichas.length !== 1 ? "s" : ""})
                  </span>
                )}
              </h3>

              {coursesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f384c] mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Cargando fichas...</p>
                </div>
              ) : coursesError ? (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">
                  Error al cargar fichas: {coursesError}
                </div>
              ) : courses.length > 0 ? (
                <div className="border border-gray-200 rounded-md">
                  {/* Buscador de fichas */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                      </div>
                      <input
                        type="text"
                        placeholder="Buscar fichas por código, programa, área o estado..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#1f384c] focus:border-[#1f384c]"
                      />
                    </div>
                    {searchTerm && (
                      <p className="text-sm text-gray-600 mt-2">
                        Mostrando {filteredCourses.length} de {courses.length} fichas
                      </p>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {filteredCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
                        {filteredCourses.map((course) => (
                          <div
                            key={course.id}
                            className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                              formData.fichas.includes(course.id)
                                ? "border-[#1f384c] bg-blue-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                            onClick={() => handleFichaToggle(course.id)}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.fichas.includes(course.id)}
                                  onChange={() => handleFichaToggle(course.id)}
                                  className="h-4 w-4 text-[#1f384c] focus:ring-[#1f384c] border-gray-300 rounded mr-2"
                                />
                                <div className="font-semibold text-sm text-[#1f384c]">{course.code}</div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  course.course_status === "EN EJECUCION"
                                    ? "bg-green-100 text-green-800"
                                    : course.course_status === "TERMINADO"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {course.course_status}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600 space-y-1">
                              <div>
                                <strong>Programa:</strong> {course.fk_programs}
                              </div>
                              <div>
                                <strong>Área:</strong> {course.area}
                              </div>
                              <div>
                                <strong>Tipo:</strong> {course.offer_type}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <svg
                          className="w-12 h-12 mx-auto mb-2 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                          />
                        </svg>
                        <p>No se encontraron fichas que coincidan con "{searchTerm}"</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm text-center py-8 bg-gray-50 rounded-md">
                  No hay fichas disponibles
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f384c]"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-[#1f384c] border border-transparent rounded-md hover:bg-[#2d4a5c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1f384c] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || coursesLoading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  `${isEditMode ? "Actualizar" : "Crear"} Instructor`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default InstructorForm
