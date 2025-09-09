"use client"

import { useContext, useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import RoleForm from "../components/RoleForm"
import { RoleContext } from "../../../shared/contexts/RoleContext/RoleContext"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"

const RegistrarRolPage = () => {
  const navigate = useNavigate()
  const { addRole } = useContext(RoleContext)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Nuevo estado
  const { logout, user } = useAuth()
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleFormSubmit = async (nuevoRol) => {
    // Prevenir doble submit
    if (isSubmitting) return

    setIsSubmitting(true)

    try {
      await addRole(nuevoRol)
      setSuccessMessage("Rol creado exitosamente")
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error al crear el rol:", error)
      setSuccessMessage("Error al crear el rol: " + error.message)
      setShowSuccessModal(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/configuracion/roles")
  }

  const handleSuccessModalConfirm = () => {
    setShowSuccessModal(false)
    if (successMessage.includes("exitosamente")) {
      navigate("/configuracion/roles")
    }
  }

  return (
    <div className="max-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-1">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">Roles</h1>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2"
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
        <div className="min-h-screen">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-10xl mx-auto">
            <RoleForm onSubmit={handleFormSubmit} onCancel={handleCancel} />
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

      {/* Modal de éxito/error al crear rol */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onConfirm={handleSuccessModalConfirm}
        title={successMessage.includes("exitosamente") ? "Operación Exitosa" : "Error"}
        message={successMessage}
        confirmText="Aceptar"
        confirmColor={
          successMessage.includes("exitosamente") ? "bg-green-500 hover:bg-green-600" : "bg-[#f44144] hover:bg-red-600"
        }
        showButtonCancel={false}
      />
    </div>
  )
}

export default RegistrarRolPage
