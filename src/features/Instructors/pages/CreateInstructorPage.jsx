"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, Loader2 } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import usePostInstructor from "../hooks/usePostInstructor"
import useGetCourses from "../hooks/useGetCourses"
import {
  validateInstructorData,
  processServerError,
  validateDocumento,
  validateTelefono,
  validateCorreo,
  validateNombre,
  validateApellido,
  checkDocumentUniqueness,
  checkEmailUniqueness,
} from "../services/instructorValidationService"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"

// Hook de debounce estable que no causa re-renders
const useDebouncedCallback = (callback, delay) => {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    (...args) => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay],
  )
}

const CreateInstructorPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { createInstructor, loading: creating } = usePostInstructor()
  const { courses, loading: coursesLoading, error: coursesError, hasLoaded, loadCoursesOnDemand } = useGetCourses()

  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    tipoDocumento: "CC",
    telefono: "",
    correo: "",
    fichas: [],
  })

  const [errors, setErrors] = useState({})
  const [asyncValidation, setAsyncValidation] = useState({
    documento: { status: "idle", message: "" },
    correo: { status: "idle", message: "" },
  })

  const [searchTerm, setSearchTerm] = useState("")
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const dropdownRef = useRef(null)

  // --- Lógica de Validación ---

  // Validaciones síncronas que se ejecutan con cada cambio en el formulario
  useEffect(() => {
    const { nombre, apellido, documento, tipoDocumento, telefono, correo } = formData
    setErrors({
      nombre: validateNombre(nombre),
      apellido: validateApellido(apellido),
      documento: validateDocumento(documento, tipoDocumento),
      telefono: validateTelefono(telefono),
      correo: validateCorreo(correo),
    })
  }, [formData])

  // Callback para la validación de documento
  const checkDocumentCallback = useCallback(async (doc, docType) => {
    if (validateDocumento(doc, docType)) {
      setAsyncValidation((prev) => ({ ...prev, documento: { status: "idle", message: "" } }))
      return
    }
    setAsyncValidation((prev) => ({ ...prev, documento: { status: "checking", message: "" } }))
    const result = await checkDocumentUniqueness(doc)
    setAsyncValidation((prev) => ({
      ...prev,
      documento: { status: result.unique ? "idle" : "error", message: result.message || "" },
    }))
  }, [])

  // Callback para la validación de correo
  const checkEmailCallback = useCallback(async (email) => {
    if (validateCorreo(email)) {
      setAsyncValidation((prev) => ({ ...prev, correo: { status: "idle", message: "" } }))
      return
    }
    setAsyncValidation((prev) => ({ ...prev, correo: { status: "checking", message: "" } }))
    const result = await checkEmailUniqueness(email)
    setAsyncValidation((prev) => ({
      ...prev,
      correo: { status: result.unique ? "idle" : "error", message: result.message || "" },
    }))
  }, [])

  // Usar el hook de debounce con los callbacks estables
  const debouncedCheckDocument = useDebouncedCallback(checkDocumentCallback, 500)
  const debouncedCheckEmail = useDebouncedCallback(checkEmailCallback, 500)

  // useEffects para disparar las validaciones asíncronas con debounce
  useEffect(() => {
    if (formData.documento) {
      debouncedCheckDocument(formData.documento, formData.tipoDocumento)
    }
  }, [formData.documento, formData.tipoDocumento, debouncedCheckDocument])

  useEffect(() => {
    if (formData.correo) {
      debouncedCheckEmail(formData.correo)
    }
  }, [formData.correo, debouncedCheckEmail])

  // --- Fin de la Lógica de Validación ---

  const isFormValid = useCallback(() => {
    const requiredFields = ["nombre", "apellido", "documento", "telefono", "correo"]
    if (requiredFields.some((field) => !formData[field]?.trim())) return false
    if (Object.values(errors).some((error) => error !== null)) return false
    if (Object.values(asyncValidation).some((v) => v.status === "checking" || v.status === "error")) return false
    return true
  }, [formData, errors, asyncValidation])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsDropdownOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFichaToggle = (fichaId) => {
    setFormData((prev) => {
      const newFichas = prev.fichas.includes(fichaId)
        ? prev.fichas.filter((id) => id !== fichaId)
        : [...prev.fichas, fichaId]
      return { ...prev, fichas: newFichas }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Forzar una última validación completa antes de enviar
    const finalValidationErrors = await validateInstructorData(formData, false)
    if (Object.keys(finalValidationErrors).length > 0) {
      setErrors(finalValidationErrors)
      return
    }
    if (!isFormValid()) return

    try {
      const instructorData = {
        ...formData,
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        documento: formData.documento.trim(),
        telefono: formData.telefono.trim(),
        correo: formData.correo.toLowerCase().trim(),
        estado: "Activo",
        tipoUsuario: "instructor",
      }
      await createInstructor(instructorData)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error al crear instructor:", error)
      setErrors(processServerError(error))
    }
  }

  const handleCancel = () => navigate("/formacion/instructores")
  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }
  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleSearchChange = async (e) => {
    const value = e.target.value
    setSearchTerm(value)
    if (value.trim() && !hasLoaded && !coursesLoading) {
      await loadCoursesOnDemand().catch((err) => console.error("Error al cargar cursos por búsqueda:", err))
    }
  }

  const getDisplayedCourses = () => {
    if (!hasLoaded) return []
    if (!searchTerm.trim()) return courses.filter((c) => formData.fichas.includes(c.id))
    const searchLower = searchTerm.toLowerCase()
    return courses.filter(
      (c) =>
        c.code?.toLowerCase().includes(searchLower) ||
        c.fk_programs?.toLowerCase().includes(searchLower) ||
        c.area?.toLowerCase().includes(searchLower) ||
        c.course_status?.toLowerCase().includes(searchLower),
    )
  }

  const displayedCourses = getDisplayedCourses()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-[#1f384c]">Crear Nuevo Instructor</h1>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex flex-col items-end gap-0 text-[#1f384c] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">{user?.name}</div>
                    <div className="text-xs text-gray-500">{getRoleDisplayName(getUserRole(user))}</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </div>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-2 text-[#f44144] hover:bg-gray-50 rounded-lg"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Información del Instructor</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            {errors.general && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">{errors.general}</div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documento <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                      errors.documento || asyncValidation.documento.status === "error"
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {asyncValidation.documento.status === "checking" && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                  )}
                </div>
                {errors.documento && <p className="text-red-500 text-sm mt-1">{errors.documento}</p>}
                {asyncValidation.documento.status === "error" && (
                  <p className="text-red-500 text-sm mt-1">{asyncValidation.documento.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="correo"
                    value={formData.correo}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                      errors.correo || asyncValidation.correo.status === "error" ? "border-red-500" : "border-gray-300"
                    }`}
                    required
                  />
                  {asyncValidation.correo.status === "checking" && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 animate-spin" />
                  )}
                </div>
                {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
                {asyncValidation.correo.status === "error" && (
                  <p className="text-red-500 text-sm mt-1">{asyncValidation.correo.message}</p>
                )}
              </div>
            </div>
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#1f384c] mb-4">
                Fichas Asignadas
                {formData.fichas.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({formData.fichas.length} seleccionada{formData.fichas.length !== 1 ? "s" : ""})
                  </span>
                )}
              </h3>
              <div className="border border-gray-200 rounded-md">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Buscar fichas..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
                    />
                    {/* Search Icon can be added here */}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto p-4">
                  {displayedCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {displayedCourses.map((course) => (
                        <div
                          key={course.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                            formData.fichas.includes(course.id)
                              ? "border-[#1f384c] bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => handleFichaToggle(course.id)}
                        >
                          <input
                            type="checkbox"
                            checked={formData.fichas.includes(course.id)}
                            readOnly
                            className="h-4 w-4 text-[#1f384c] focus:ring-[#1f384c] border-gray-300 rounded mr-2"
                          />
                          <span>
                            {course.code} - {course.fk_programs}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">
                      {hasLoaded ? "No se encontraron fichas." : "Escriba para buscar y cargar fichas."}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={creating}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-6 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                  !isFormValid() || creating || coursesLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={!isFormValid() || creating || coursesLoading}
              >
                {creating ? (
                  <div className="flex items-center">
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Creando...
                  </div>
                ) : (
                  "Crear Instructor"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Cerrar Sesión"
        message="¿Está seguro de que desea cerrar la sesión actual?"
        confirmText="Cerrar Sesión"
        confirmColor="bg-[#f44144] hover:bg-red-600"
      />
      <ConfirmationModal
        isOpen={showSuccessModal}
        onClose={() => navigate("/formacion/instructores")}
        onConfirm={() => navigate("/formacion/instructores")}
        title="Operación Exitosa"
        message="Instructor creado exitosamente."
        confirmText="Aceptar"
        confirmColor="bg-green-500 hover:bg-green-600"
        showButtonCancel={false}
      />
    </div>
  )
}

export default CreateInstructorPage
