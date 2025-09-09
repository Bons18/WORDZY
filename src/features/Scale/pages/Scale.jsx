                         
"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Plus, Trash2, AlertTriangle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import GenericTable from "../../../shared/components/Table"
import { useAuth } from "../../auth/hooks/useAuth"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import { useGetScales } from "../hooks/useGetScales"
import { usePostScale } from "../hooks/usePostScale"
import { usePutScale } from "../hooks/usePutScale"
import { useDeleteScale } from "../hooks/useDeleteScale"
import LoadingSpinner from "../../../shared/components/LoadingSpinner"

// Columnas para la tabla - SIN métricas, solo datos principales
const columns = [
  {
    key: "fechaInicial",
    label: "Fecha Inicial",
    render: (item) => new Date(item.fechaInicial).toLocaleDateString(),
  },
  {
    key: "fechaFinal",
    label: "Fecha Final",
    render: (item) => new Date(item.fechaFinal).toLocaleDateString(),
  },
  {
    key: "apruebaPorcentaje",
    label: "% Aprobación",
    render: (item) => `${item.apruebaPorcentaje}%`,
  },
  {
    key: "estado",
    label: "Estado",
    render: (item) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.estado === "activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {item.estado}
      </span>
    ),
  },
]

const Scale = () => {
  const [selectedEscala, setSelectedEscala] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [showDateConflictModal, setShowDateConflictModal] = useState(false)
  const [conflictingScales, setConflictingScales] = useState([])

  const { data: scales, loading, error, refetch } = useGetScales()
  const { createNewScale, loading: creating } = usePostScale()
  const { updateExistingScale, loading: updating } = usePutScale()
  const { deleteExistingScale, loading: deleting } = useDeleteScale()
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Formulario para crear/editar - SIN rangoInicial y rangoFinal para la escala
  const [formData, setFormData] = useState({
    fechaInicial: "",
    fechaFinal: "",
    descripcion: "",
    metricas: [],
    apruebaPorcentaje: 70,
  })

  // Nueva métrica temporal - CON rangoInicial y rangoFinal
  const [newMetrica, setNewMetrica] = useState({
    rangoInicial: "",
    rangoFinal: "",
    concepto: "",
    descripcion: "",
  })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Función para encontrar escalas que se solapan con las fechas dadas
  const findConflictingScales = (fechaInicial, fechaFinal) => {
    if (!scales || !fechaInicial || !fechaFinal) return []

    const startDate = new Date(fechaInicial)
    const endDate = new Date(fechaFinal)

    return scales.filter((scale) => {
      if (scale.estado !== "activo") return false

      const scaleStart = new Date(scale.fechaInicial)
      const scaleEnd = new Date(scale.fechaFinal)

      // Verificar solapamiento
      return startDate <= scaleEnd && endDate >= scaleStart
    })
  }

  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleShowEscala = (escala) => {
    setSelectedEscala(escala)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
  }

  const handleAddScale = () => {
    setFormData({
      fechaInicial: "",
      fechaFinal: "",
      descripcion: "",
      metricas: [],
      apruebaPorcentaje: 70,
    })
    setNewMetrica({
      rangoInicial: "",
      rangoFinal: "",
      concepto: "",
      descripcion: "",
    })
    setValidationErrors([])
    setIsCreateModalOpen(true)
  }

  const handleEditScale = (scale) => {
    setSelectedEscala(scale)

    // Formatear fechas para el input date
    const fechaInicial = scale.fechaInicial ? new Date(scale.fechaInicial).toISOString().split("T")[0] : ""
    const fechaFinal = scale.fechaFinal ? new Date(scale.fechaFinal).toISOString().split("T")[0] : ""

    setFormData({
      fechaInicial,
      fechaFinal,
      descripcion: scale.descripcion || "",
      metricas: scale.metricas ? [...scale.metricas] : [],
      apruebaPorcentaje: scale.apruebaPorcentaje || 70,
    })
    setValidationErrors([])
    setIsEditModalOpen(true)
  }

  const handleDeleteScale = (id) => {
    setItemToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteScale = async () => {
    try {
      await deleteExistingScale(itemToDelete)
      setSuccessMessage("Escala eliminada exitosamente")
      setShowSuccessModal(true)
      refetch()
    } catch (error) {
      console.error("Error deleting scale:", error)
      setSuccessMessage("Error al eliminar la escala")
      setShowSuccessModal(true)
    } finally {
      setShowDeleteConfirm(false)
      setItemToDelete(null)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "apruebaPorcentaje" ? Number.parseInt(value) || "" : value,
    })

    // Verificar conflictos de fechas en tiempo real
    if (name === "fechaInicial" || name === "fechaFinal") {
      const newFormData = { ...formData, [name]: value }
      if (newFormData.fechaInicial && newFormData.fechaFinal) {
        const conflicts = findConflictingScales(newFormData.fechaInicial, newFormData.fechaFinal)
        if (conflicts.length > 0) {
          setConflictingScales(conflicts)
        } else {
          setConflictingScales([])
        }
      }
    }
  }

  const handleNewMetricaChange = (e) => {
    const { name, value } = e.target
    setNewMetrica((prev) => ({
      ...prev,
      [name]: name === "rangoInicial" || name === "rangoFinal" ? (value === "" ? "" : Number(value)) : value,
    }))
  }

  const handleAddMetrica = () => {
    // Validar que todos los campos estén completos
    if (!newMetrica.concepto || newMetrica.rangoInicial === "" || newMetrica.rangoFinal === "") {
      setSuccessMessage("Por favor complete todos los campos de la métrica")
      setShowSuccessModal(true)
      return
    }

    // Validar que el rango final sea mayor al inicial
    if (Number(newMetrica.rangoFinal) <= Number(newMetrica.rangoInicial)) {
      setSuccessMessage("El rango final debe ser mayor al rango inicial")
      setShowSuccessModal(true)
      return
    }

    // Validar solapamiento con métricas existentes
    const hasOverlap = formData.metricas.some((metrica) => {
      const newInicial = Number(newMetrica.rangoInicial)
      const newFinal = Number(newMetrica.rangoFinal)
      const existingInicial = Number(metrica.rangoInicial)
      const existingFinal = Number(metrica.rangoFinal)

      return newInicial < existingFinal && newFinal > existingInicial
    })

    if (hasOverlap) {
      setSuccessMessage("Los rangos de las métricas no pueden solaparse")
      setShowSuccessModal(true)
      return
    }

    const newMetricaWithId = {
      ...newMetrica,
      id: Date.now(), // ID temporal para el frontend
      rangoInicial: Number(newMetrica.rangoInicial),
      rangoFinal: Number(newMetrica.rangoFinal),
    }

    setFormData({
      ...formData,
      metricas: [...formData.metricas, newMetricaWithId],
    })

    // Resetear la nueva métrica
    setNewMetrica({
      rangoInicial: "",
      rangoFinal: "",
      concepto: "",
      descripcion: "",
    })
  }

  const handleDeleteMetrica = (id) => {
    const updatedMetricas = formData.metricas.filter((m) => m.id !== id)
    setFormData({
      ...formData,
      metricas: updatedMetricas,
    })
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    setValidationErrors([])

    try {
      // Validar fechas
      if (new Date(formData.fechaFinal) < new Date(formData.fechaInicial)) {
        setSuccessMessage("La fecha final debe ser posterior o igual a la fecha inicial")
        setShowSuccessModal(true)
        return
      }

      // Verificar conflictos de fechas antes de enviar
      const conflicts = findConflictingScales(formData.fechaInicial, formData.fechaFinal)
      if (conflicts.length > 0) {
        setConflictingScales(conflicts)
        setShowDateConflictModal(true)
        return
      }

      // Preparar datos para enviar - SIN rangoInicial y rangoFinal de la escala
      const cleanData = {
        fechaInicial: formData.fechaInicial,
        fechaFinal: formData.fechaFinal,
        descripcion: formData.descripcion,
        apruebaPorcentaje: Number(formData.apruebaPorcentaje),
        metricas: formData.metricas.map((metrica) => ({
          rangoInicial: Number(metrica.rangoInicial),
          rangoFinal: Number(metrica.rangoFinal),
          concepto: metrica.concepto,
          descripcion: metrica.descripcion || "",
        })),
      }

      console.log("📤 Enviando datos para crear escala:", cleanData)

      const result = await createNewScale(cleanData)

      if (result.success) {
        setIsCreateModalOpen(false)
        setSuccessMessage("Escala creada exitosamente")
        setShowSuccessModal(true)

        // Refrescar inmediatamente
        console.log("🔄 Refrescando escalas después de crear...")
        await refetch()

        // Refrescar nuevamente después de un pequeño delay para asegurar consistencia
        setTimeout(async () => {
          console.log("🔄 Segundo refetch para asegurar consistencia...")
          await refetch()
        }, 1000)
      } else {
        // Mostrar errores específicos
        if (result.errorType === "DATE_OVERLAP") {
          setConflictingScales(conflicts)
          setShowDateConflictModal(true)
        } else if (result.errors && result.errors.length > 0) {
          setValidationErrors(result.errors)
        } else {
          setSuccessMessage(result.message || "Error al crear la escala")
          setShowSuccessModal(true)
        }
      }
    } catch (error) {
      console.error("Error creating scale:", error)
      setSuccessMessage(error.message || "Error al crear la escala")
      setShowSuccessModal(true)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    setValidationErrors([])

    try {
      // Validar fechas
      if (new Date(formData.fechaFinal) < new Date(formData.fechaInicial)) {
        setSuccessMessage("La fecha final debe ser posterior o igual a la fecha inicial")
        setShowSuccessModal(true)
        return
      }

      // Preparar datos para enviar
      const cleanData = {
        fechaInicial: formData.fechaInicial,
        fechaFinal: formData.fechaFinal,
        descripcion: formData.descripcion,
        apruebaPorcentaje: Number(formData.apruebaPorcentaje),
        metricas: formData.metricas.map((metrica) => ({
          rangoInicial: Number(metrica.rangoInicial),
          rangoFinal: Number(metrica.rangoFinal),
          concepto: metrica.concepto,
          descripcion: metrica.descripcion || "",
        })),
      }

      const result = await updateExistingScale(selectedEscala._id, cleanData)

      if (result.success) {
        setIsEditModalOpen(false)
        setSuccessMessage("Escala actualizada exitosamente")
        setShowSuccessModal(true)

        // Refrescar inmediatamente
        console.log("🔄 Refrescando escalas después de editar...")
        await refetch()

        // Refrescar nuevamente después de un pequeño delay
        setTimeout(async () => {
          console.log("🔄 Segundo refetch para asegurar consistencia...")
          await refetch()
        }, 1000)
      } else {
        // Mostrar errores específicos
        if (result.errors && result.errors.length > 0) {
          setValidationErrors(result.errors)
        } else {
          setSuccessMessage(result.message || "Error al actualizar la escala")
          setShowSuccessModal(true)
        }
      }
    } catch (error) {
      console.error("Error updating scale:", error)
      setSuccessMessage(error.message || "Error al actualizar la escala")
      setShowSuccessModal(true)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  if (error) return <div className="text-red-500 text-center">Error: {error}</div>

  // Debug: mostrar información de las escalas
  console.log("🎯 Renderizando Scale component:")
  console.log("📊 Loading:", loading)
  console.log("❌ Error:", error)
  console.log("📋 Scales data:", scales)
  console.log("📈 Scales length:", scales?.length || 0)

  // Debug adicional: verificar el estado completo
  console.log("🔍 Estado completo del componente:")
  console.log("  - Loading:", loading)
  console.log("  - Error:", error)
  console.log("  - Scales raw:", scales)
  console.log("  - Scales type:", typeof scales)
  console.log("  - Scales isArray:", Array.isArray(scales))
  console.log("  - Scales stringified:", JSON.stringify(scales, null, 2))

  // Verificar si GenericTable recibe los datos
  console.log("📋 Datos que se pasan a GenericTable:")
  console.log("  - data:", scales || [])
  console.log("  - columns:", columns)

    console.log("🔎 Escalas desde useGetScales:", scales); // <-- Aquí

  return (
    <div className="min-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">ESCALA DE VALORACIÓN</h1>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2"
            >
              <div className="text-right">
                <div className="text-sm font-medium">{user?.nombre} {user?.apellido}</div>
                <div className="text-xs text-gray-600">{getRoleDisplayName(getUserRole(user))}</div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
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
      </header>

      <div className="container mx-auto px-6">
        {/* Prueba temporal - mostrar datos sin GenericTable */}
        {/* <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-bold mb-2">🧪 PRUEBA DE DATOS:</h3>
          <p>
            <strong>Loading:</strong> {loading ? "Sí" : "No"}
          </p>
          <p>
            <strong>Error:</strong> {error || "Ninguno"}
          </p>
          <p>
            <strong>Cantidad de escalas:</strong> {scales?.length || 0}
          </p>
          {scales && scales.length > 0 && (
            <div className="mt-2">
              <strong>Escalas encontradas:</strong>
              <ul className="list-disc ml-4">
                {scales.map((scale, index) => (
                  <li key={index}>
                    {new Date(scale.fechaInicial).toLocaleDateString()} -
                    {new Date(scale.fechaFinal).toLocaleDateString()}({scale.apruebaPorcentaje}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div> */}

        <GenericTable
          data={scales || []}
          columns={columns}
          onShow={handleShowEscala}
          onAdd={handleAddScale}
          onEdit={handleEditScale}
          onDelete={handleDeleteScale}
          showActions={{ show: true, edit: true, delete: true, add: true }}
          addButtonText="Añadir Escala"
        />

        {selectedEscala && (
          <ScaleDetailModal escala={selectedEscala} isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} />
        )}

        {/* Create Scale Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#1f384c] mb-6">CREAR ESCALA DE VALORACIÓN</h2>

                {/* Mostrar errores de validación */}
                {validationErrors.length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-red-800 font-medium mb-2">Errores de validación:</h3>
                    <ul className="list-disc list-inside text-red-700 text-sm">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mostrar advertencia de conflictos de fechas */}
                {conflictingScales.length > 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                      <h3 className="text-yellow-800 font-medium">Conflicto de fechas detectado</h3>
                    </div>
                    <p className="text-yellow-700 text-sm mb-2">
                      Las fechas seleccionadas se solapan con las siguientes escalas activas:
                    </p>
                    <ul className="list-disc list-inside text-yellow-700 text-sm">
                      {conflictingScales.map((scale, index) => (
                        <li key={index}>
                          {new Date(scale.fechaInicial).toLocaleDateString()} -{" "}
                          {new Date(scale.fechaFinal).toLocaleDateString()} ({scale.apruebaPorcentaje}% aprobación)
                        </li>
                      ))}
                    </ul>
                    <p className="text-yellow-700 text-sm mt-2">
                      Por favor, selecciona fechas diferentes o elimina/desactiva las escalas existentes.
                    </p>
                  </div>
                )}

                <form onSubmit={handleCreateSubmit}>
                  {/* Información básica de la escala */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicial*</label>
                      <input
                        type="date"
                        name="fechaInicial"
                        value={formData.fechaInicial}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          conflictingScales.length > 0 ? "border-yellow-300 bg-yellow-50" : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Final*</label>
                      <input
                        type="date"
                        name="fechaFinal"
                        value={formData.fechaFinal}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md text-sm ${
                          conflictingScales.length > 0 ? "border-yellow-300 bg-yellow-50" : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Porcentaje de Aprobación (%)*
                      </label>
                      <input
                        type="number"
                        name="apruebaPorcentaje"
                        value={formData.apruebaPorcentaje}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Porcentaje mínimo para aprobar</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Descripción de la escala de valoración..."
                    ></textarea>
                  </div>

                  {/* Sección para añadir métricas de valoración */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium mb-4 text-center">Métricas de Valoración</h3>
                    <p className="text-sm text-gray-600 mb-4 text-center">
                      Las métricas definen los rangos de calificación y sus conceptos asociados
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rango Inicial*</label>
                        <input
                          type="number"
                          name="rangoInicial"
                          value={newMetrica.rangoInicial}
                          onChange={handleNewMetricaChange}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rango Final*</label>
                        <input
                          type="number"
                          name="rangoFinal"
                          value={newMetrica.rangoFinal}
                          onChange={handleNewMetricaChange}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Concepto*</label>
                        <input
                          type="text"
                          name="concepto"
                          value={newMetrica.concepto}
                          onChange={handleNewMetricaChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          placeholder="Ej: Excelente"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handleAddMetrica}
                          className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5 mr-1" />
                          Agregar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la métrica</label>
                      <input
                        type="text"
                        name="descripcion"
                        value={newMetrica.descripcion}
                        onChange={handleNewMetricaChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Descripción opcional de la métrica"
                      />
                    </div>

                    {formData.metricas.length > 0 && (
                      <>
                        <div className="border-t border-dashed border-gray-300 my-4"></div>
                        <h4 className="text-md font-medium mb-2">Métricas Agregadas:</h4>
                        <div className="space-y-2">
                          {formData.metricas.map((metrica) => (
                            <div key={metrica.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">
                                <strong>
                                  {metrica.rangoInicial}% - {metrica.rangoFinal}%:
                                </strong>{" "}
                                {metrica.concepto}
                                {metrica.descripcion && <span className="text-gray-600"> - {metrica.descripcion}</span>}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteMetrica(metrica.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsCreateModalOpen(false)}
                      className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating || conflictingScales.length > 0}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      {creating ? "Creando..." : "Crear Escala"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de conflicto de fechas */}
        <ConfirmationModal
          isOpen={showDateConflictModal}
          onClose={() => setShowDateConflictModal(false)}
          title="Conflicto de Fechas"
          message={`Las fechas seleccionadas se solapan con ${conflictingScales.length} escala(s) activa(s). Por favor, selecciona fechas diferentes o elimina las escalas existentes.`}
          confirmText="Entendido"
          confirmColor="bg-yellow-500 hover:bg-yellow-600"
          showButtonCancel={false}
        />

        {/* Edit Scale Modal - Similar structure */}
        {isEditModalOpen && selectedEscala && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold text-[#1f384c] mb-6">EDITAR ESCALA DE VALORACIÓN</h2>

                {/* Mostrar errores de validación */}
                {validationErrors.length > 0 && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h3 className="text-red-800 font-medium mb-2">Errores de validación:</h3>
                    <ul className="list-disc list-inside text-red-700 text-sm">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <form onSubmit={handleEditSubmit}>
                  {/* Same form structure as create modal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicial*</label>
                      <input
                        type="date"
                        name="fechaInicial"
                        value={formData.fechaInicial}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Final*</label>
                      <input
                        type="date"
                        name="fechaFinal"
                        value={formData.fechaFinal}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Porcentaje de Aprobación (%)*
                      </label>
                      <input
                        type="number"
                        name="apruebaPorcentaje"
                        value={formData.apruebaPorcentaje}
                        onChange={handleInputChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      placeholder="Descripción de la escala de valoración..."
                    ></textarea>
                  </div>

                  {/* Métricas section - same as create */}
                  <div className="border border-gray-200 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-medium mb-4 text-center">Métricas de Valoración</h3>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rango Inicial*</label>
                        <input
                          type="number"
                          name="rangoInicial"
                          value={newMetrica.rangoInicial}
                          onChange={handleNewMetricaChange}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rango Final*</label>
                        <input
                          type="number"
                          name="rangoFinal"
                          value={newMetrica.rangoFinal}
                          onChange={handleNewMetricaChange}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Concepto*</label>
                        <input
                          type="text"
                          name="concepto"
                          value={newMetrica.concepto}
                          onChange={handleNewMetricaChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handleAddMetrica}
                          className="w-full bg-green-500 text-white p-2 rounded-md hover:bg-green-600 flex items-center justify-center"
                        >
                          <Plus className="w-5 h-5 mr-1" />
                          Agregar
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la métrica</label>
                      <input
                        type="text"
                        name="descripcion"
                        value={newMetrica.descripcion}
                        onChange={handleNewMetricaChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Descripción opcional de la métrica"
                      />
                    </div>

                    {formData.metricas.length > 0 && (
                      <>
                        <div className="border-t border-dashed border-gray-300 my-4"></div>
                        <h4 className="text-md font-medium mb-2">Métricas Agregadas:</h4>
                        <div className="space-y-2">
                          {formData.metricas.map((metrica) => (
                            <div key={metrica.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span className="text-sm">
                                <strong>
                                  {metrica.rangoInicial}% - {metrica.rangoFinal}%:
                                </strong>{" "}
                                {metrica.concepto}
                                {metrica.descripcion && <span className="text-gray-600"> - {metrica.descripcion}</span>}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteMetrica(metrica.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
                    >
                      {updating ? "Actualizando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modales de confirmación */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteScale}
          title="Eliminar Escala"
          message="¿Está seguro que desea eliminar esta escala de valoración? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          confirmColor="bg-[#f44144] hover:bg-red-600"
        />

        <ConfirmationModal
          isOpen={showSuccessModal}
          onConfirm={() => setShowSuccessModal(false)}
          title="Información"
          message={successMessage}
          confirmText="Aceptar"
          confirmColor="bg-green-500 hover:bg-green-600"
          showButtonCancel={false}
        />
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
    </div>
  )
}

// Componente para el modal de detalle de escala - AQUÍ SÍ SE MUESTRAN LAS MÉTRICAS
const ScaleDetailModal = ({ escala, isOpen, onClose }) => {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen || !escala) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-center text-[#1f384c] mb-6">DETALLE ESCALA DE VALORACIÓN</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex">
                <div className="w-1/2 font-medium text-base">Fecha Inicial:</div>
                <div className="w-1/2 text-base text-gray-500">
                  {new Date(escala.fechaInicial).toLocaleDateString()}
                </div>
              </div>

              <div className="flex">
                <div className="w-1/2 font-medium text-base">Fecha Final:</div>
                <div className="w-1/2 text-base text-gray-500">{new Date(escala.fechaFinal).toLocaleDateString()}</div>
              </div>

              <div className="flex">
                <div className="w-1/2 font-medium text-base">% Aprobación:</div>
                <div className="w-1/2 text-base text-gray-500">{escala.apruebaPorcentaje}%</div>
              </div>

              <div className="flex">
                <div className="w-1/2 font-medium text-base">Estado:</div>
                <div className="w-1/2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      escala.estado === "activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {escala.estado}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex">
                <div className="w-1/2 font-medium text-base">Total Métricas:</div>
                <div className="w-1/2 text-base text-gray-500">{escala.metricas?.length || 0}</div>
              </div>

              <div className="flex">
                <div className="w-1/2 font-medium text-base">Creada:</div>
                <div className="w-1/2 text-base text-gray-500">
                  {escala.createdAt ? new Date(escala.createdAt).toLocaleDateString() : "N/A"}
                </div>
              </div>

              <div className="flex">
                <div className="w-1/2 font-medium text-base">Actualizada:</div>
                <div className="w-1/2 text-base text-gray-500">
                  {escala.updatedAt ? new Date(escala.updatedAt).toLocaleDateString() : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {escala.descripcion && (
            <>
              <h3 className="text-lg font-medium mb-3">Descripción</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 text-sm">{escala.descripcion}</p>
              </div>
            </>
          )}

          <h3 className="text-lg font-medium mb-3">Métricas de Valoración</h3>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            {escala.metricas && escala.metricas.length > 0 ? (
              <div className="space-y-3">
                {escala.metricas
                  .sort((a, b) => a.rangoInicial - b.rangoInicial)
                  .map((metrica, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 bg-white p-3 rounded">
                      <div className="font-medium text-sm mb-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold mr-2">
                          {metrica.rangoInicial}% - {metrica.rangoFinal}%
                        </span>
                        {metrica.concepto}
                      </div>
                      {metrica.descripcion && <div className="text-xs text-gray-600 mt-1">{metrica.descripcion}</div>}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">No hay métricas definidas</p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-[#f44144] text-white py-2 px-6 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Scale
