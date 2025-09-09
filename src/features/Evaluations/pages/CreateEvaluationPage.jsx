"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import EvaluationForm from "../components/EvaluationForm"
import usePostEvaluation from "../hooks/usePostEvaluation"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"

const CreateEvaluationPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const { createEvaluation, loading, error } = usePostEvaluation()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const dropdownRef = useRef(null)

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  const handleSubmit = async (formData) => {
    try {
      setIsSubmitting(true)
      await createEvaluation(formData)
      setIsSuccessModalOpen(true)
    } catch (err) {
      console.error("Error al crear la evaluación:", err)
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

      {/* Content */}
      <div className="container mx-auto px-6">
        <div className="max-w-full mx-auto">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-md">Error: {error}</div>
          )}

          {/* Loading Overlay */}
          {(loading || isSubmitting) && (
            <div className="mb-6 p-4 bg-blue-100 border border-blue-300 text-blue-700 rounded-md flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700 mr-2"></div>
              {isSubmitting ? "Creando evaluación..." : "Cargando..."}
            </div>
          )}

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm">
            <EvaluationForm evaluation={null} onSubmit={handleSubmit} onCancel={handleCancel} isCreating={true} />
          </div>
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
        message="Evaluación creada con éxito."
        confirmText="Aceptar"
        confirmColor="bg-[#46ae69] hover:bg-green-600"
        showButtonCancel={false}
      />
    </div>
  )
}

export default CreateEvaluationPage
