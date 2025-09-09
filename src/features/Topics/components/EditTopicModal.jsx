"use client"

import { useState, useEffect } from "react"
import Modal from "../../../shared/components/Modal"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import { normalizeText } from "../../../shared/utils/normalizeText"
import { useCheckTopicStatusChange } from "../hooks/useCheckTopicStatusChange"

const EditTopicModal = ({ isOpen, onClose, onSubmit, topic, existingTopics }) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState("")
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)

  // ✅ NUEVOS ESTADOS para el modal de alerta
  const [showStatusAlert, setShowStatusAlert] = useState(false)
  const [statusAlertInfo, setStatusAlertInfo] = useState(null)

  // ✅ Hook para verificar cambios de estado
  const { checkStatusChange } = useCheckTopicStatusChange()

  useEffect(() => {
    if (topic) {
      setName(topic.name)
      setDescription(topic.description || "")
      setStatus(topic.status) // Asegúrate que topic.status es boolean
      setHasChanges(false)
      setError("")
    }
  }, [topic, isOpen])

  // Validar en tiempo real si el nombre ya existe
  useEffect(() => {
    const trimmed = name.trim()
    const normalized = normalizeText(trimmed)

    const exists = existingTopics.some((t) => normalizeText(t.name) === normalized && t._id !== topic._id)

    if (exists) {
      setError("El tema ya existe")
    } else {
      setError("") // Limpia el error si ya no hay duplicado
    }
  }, [name, existingTopics])

  // ✅ MODIFICADA: Función para manejar cambio de estado con modal de alerta
  const toggleStatus = async () => {
    const newStatus = !status

    // Si se está activando el tema, no hay restricciones
    if (newStatus === true) {
      setStatus(newStatus)
      setHasChanges(true)
      return
    }

    // Si se está desactivando, verificar si está en uso
    if (newStatus === false && topic) {
      setIsCheckingStatus(true)
      try {
        const statusCheck = await checkStatusChange(topic._id, newStatus)

        if (!statusCheck.canChange && statusCheck.reason === "in_use") {
          // Mostrar modal de alerta en lugar de warning inline
          setStatusAlertInfo(statusCheck.usageInfo)
          setShowStatusAlert(true)
          return // No cambiar el estado, mantener como activo
        } else {
          // Permitir el cambio
          setStatus(newStatus)
          setHasChanges(true)
        }
      } catch (error) {
        console.error("Error al verificar cambio de estado:", error)
        // Mostrar error en modal de alerta
        setStatusAlertInfo({
          topicName: topic.name,
          error: "Error al verificar si el tema puede ser desactivado. Intente nuevamente.",
        })
        setShowStatusAlert(true)
        return
      } finally {
        setIsCheckingStatus(false)
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "name") {
      setName(value)
      setError("")
    }
    if (name === "description") setDescription(value)
    setHasChanges(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (error) return

    const trimmedName = name.trim()
    const trimmedDescription = description.trim()

    if (!trimmedName) return

    const exists = existingTopics.some(
      (t) => normalizeText(t.name) === normalizeText(trimmedName) && t._id !== topic._id,
    )

    if (exists) {
      setError("El tema ya existe")
      return
    }

    onSubmit({
      name: trimmedName,
      description: trimmedDescription,
      status,
    })
  }

  // ✅ NUEVA: Función para cerrar el modal de alerta y regresar al de edición
  const handleCloseStatusAlert = () => {
    setShowStatusAlert(false)
    setStatusAlertInfo(null)
    // El modal de edición permanece abierto y el estado se mantiene como activo
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <h1 className="text-xl font-bold text-[#1f384c]">EDITAR TEMA</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mt-4">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                error ? "border-red-500" : "border-gray-300"
              }`}
              required
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="description"
              value={description}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={status}
                  onChange={toggleStatus}
                  disabled={isCheckingStatus}
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A34A] ${
                    isCheckingStatus ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                ></div>
                <span className="ml-2 text-sm font-medium text-gray-700">
                  {isCheckingStatus ? "Verificando..." : status ? "Activo" : "Inactivo"}
                </span>
              </label>
            </div>

            {/* ✅ Información sobre temas inactivos (solo cuando está inactivo y no hay restricciones) */}
            {status === false && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800">
                      <strong>Información:</strong> Los temas inactivos no aparecen disponibles para seleccionar en
                      nuevas programaciones de cursos.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between space-x-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm text-white rounded-[10px] focus:outline-none focus:ring-1 bg-red-500 hover:bg-red-600 focus:ring-red-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!hasChanges || !!error || isCheckingStatus}
              className={`px-3 py-2 text-sm text-white rounded-[10px] focus:outline-none focus:ring-1 transition-colors ${
                hasChanges && !error && !isCheckingStatus
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isCheckingStatus ? "Verificando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </Modal>
      <ConfirmationModal
        isOpen={showStatusAlert}
        onClose={handleCloseStatusAlert}
        onConfirm={handleCloseStatusAlert}
        title="Acción no permitida"
        message="No se puede desactivar el estado del tema ya que se encuentra asociada a una programación activa."
        confirmText="Cerrar"
        confirmColor="bg-[#f44144] hover:bg-red-600"
        showButtonCancel={false}
      />

      
    </>
  )
}

export default EditTopicModal
