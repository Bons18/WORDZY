"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import EvaluationForm from "../components/EvaluationForm"
import useGetEvaluations from "../hooks/useGetEvaluations"
import usePutEvaluation from "../hooks/usePutEvaluation"
import { normalizeEvaluation } from "../services/evaluationService"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import CustomAlert from "../components/CustomAlert"

const EditEvaluationPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { id } = useParams()
  const { evaluations, loading: fetchLoading, error: fetchError } = useGetEvaluations()
  const { updateEvaluation, loading: updateLoading, error: updateError } = usePutEvaluation()

  const [evaluation, setEvaluation] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showErrorAlert, setShowErrorAlert] = useState(false) // Declared setShowErrorAlert
  const dropdownRef = useRef(null)

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  // Buscar la evaluación por ID
  useEffect(() => {
    if (evaluations && id) {
      const foundEvaluation = evaluations.find(
        (evaluationItem) => evaluationItem._id === id || evaluationItem.id === id,
      )
      if (foundEvaluation) {
        setEvaluation(normalizeEvaluation(foundEvaluation))
      }
    }
  }, [evaluations, id])

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true)
      await updateEvaluation(id, formData)

      // Mostrar modal de éxito
      setIsSuccessModalOpen(true)
    } catch (error) {
      console.error("Error al actualizar evaluación:", error)
      setAlertMessage(`Error al actualizar evaluación: ${error.message}`)
      setShowErrorAlert(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/programacion/evaluaciones")
  }

  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false)
    navigate("/programacion/evaluaciones")
  }

  // Loading state
  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span>Cargando evaluación...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (fetchError) {
    return (
      <div className="min-h-screen">
        <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#1f384c]">Evaluaciones</h1>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="text-right">
                  <div className="text-sm font-medium">{user?.name} {user?.lastName}</div>
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-300 text-red-700 rounded-md p-4">
              Error al cargar la evaluación: {fetchError}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Not found state
  if (!evaluation && !fetchLoading) {
    return (
      <div className="min-h-screen">
        <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[#1f384c]">Evaluaciones</h1>
            </div>

            {/* User Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="text-right">
                  <div className="text-sm font-medium">Administrador</div>
                  <div className="text-xs text-gray-600">Admin</div>
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-md p-4">
              No se encontró la evaluación con ID: {id}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-[#1f384c]">Evaluaciones</h1>
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="text-right">
                <div className="text-sm font-medium">Administrador</div>
                <div className="text-xs text-gray-600">Admin</div>
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

      {/* Content */}
      <div className="container mx-auto px-6">
        <div className="max-w-full mx-auto">
          {/* Error Message */}
          {updateError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
              Error: {updateError}
            </div>
          )}

          {/* Loading Overlay */}
          {(updateLoading || isSubmitting) && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-300 text-blue-700 rounded-md flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              {isSubmitting ? "Actualizando evaluación..." : "Cargando..."}
            </div>
          )}

          {/* Form */}
          {evaluation && (
            <div className="bg-white rounded-lg shadow-sm">
              <EvaluationForm
                evaluation={evaluation}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isCreating={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación para cerrar sesión */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Cerrar Sesión"
        message="¿Está seguro de que desea cerrar la sesión actual?"
        confirmText="Cerrar Sesión"
        confirmColor="bg-[#f44144] hover:bg-red-600"
      />

      {/* Modal de éxito */}
      <ConfirmationModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        onConfirm={handleCloseSuccessModal}
        title="Operación Exitosa"
        message="Evaluación actualizada exitosamente."
        confirmText="Aceptar"
        confirmColor="bg-green-500 hover:bg-green-600"
        showButtonCancel={false}
      />

      {/* Custom Alert for Error */}
      {showErrorAlert && <CustomAlert message={alertMessage} onClose={() => setShowErrorAlert(false)} />}
    </div>
  )
}

export default EditEvaluationPage
