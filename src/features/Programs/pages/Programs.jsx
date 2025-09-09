"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, RefreshCw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import GenericTable from "../../../shared/components/Table"
import { useAuth } from "../../auth/hooks/useAuth"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import ProgramDetailModal from "./ProgramDetailModal"
import MassiveUpdateModal from "../componentes/MassiveUpdateModal"
// Importar las funciones de utilidad para mostrar el rol del usuario
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import { usePermissionGuard } from "../../../shared/components/PermissionGuard"

// Hooks
import { useGetPrograms } from "../hooks/useGetPrograms"

const columns = [
  {
  key: "name",
  label: "Nombre",
  render: (item) => (
    <div className="whitespace-normal break-words max-w-xs">{item.name}</div>
  ),
},

  { key: "code", label: "Código" },
  {
    key: "fk_level",
    label: "Nivel",
    render: (item) => {
      const levelMap = {
        TECNICO: "Técnico",
        TECNÓLOGO: "Tecnólogo",
        ESPECIALIZACION: "Especialización",
        AUXILIAR: "Auxiliar",
        OPERARIO: "Operario",
      }
      return levelMap[item.fk_level] || item.fk_level
    },
  },
  {
    key: "fk_modality",
    label: "Modalidad",
    render: (item) => {
      const modalityMap = {
        PRESENCIAL: "Presencial",
        "A DISTANCIA": "A Distancia",
        VIRTUAL: "Virtual",
        COMBINADO: "Combinado",
      }
      return modalityMap[item.fk_modality] || item.fk_modality
    },
  },
  {
    key: "status",
    label: "Estado",
    render: (item) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {item.status ? "Activo" : "Inactivo"}
      </span>
    ),
  },
]

export default function Programs() {
  // Estados principales
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [showMassiveUpdateModal, setShowMassiveUpdateModal] = useState(false)

  // Hooks
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Hooks de datos
  const { programs, loading, error, refetch } = useGetPrograms()

  // Permisos
  const canViewPrograms = usePermissionGuard('Programas', 'view')
  const canCreatePrograms = usePermissionGuard('Programas', 'create')
  const canEditPrograms = usePermissionGuard('Programas', 'edit')
  const canDeletePrograms = usePermissionGuard('Programas', 'delete')

  // Efectos
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handlers de autenticación
  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Handlers de modales
  const handleShowProgram = (program) => {
    setSelectedProgram(program)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedProgram(null)
  }

  const handleMassiveUpdate = () => {
    setShowMassiveUpdateModal(true)
  }

  const handleMassiveUpdateComplete = (results) => {
    console.log("Actualización masiva completada:", results)
    // Refrescar la lista de programas
    refetch()
  }

  // Renderizado condicional para estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f384c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando programas...</p>
        </div>
      </div>
    )
  }

  // Si no tiene permisos para ver programas, mostrar mensaje
  if (!canViewPrograms) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta sección.</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="bg-[#1f384c] text-white px-4 py-2 rounded-lg hover:bg-[#2d4a5c]"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">Programas</h1>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 text-[#1f384c] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-end text-right">
                <span className="text-sm font-medium">{user?.name} {user?.lastName}</span>
                <span className="text-xs text-gray-500">{getRoleDisplayName(getUserRole(user))}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform text-gray-400 ${isDropdownOpen ? "rotate-180" : ""}`} />
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
        {/* Mostrar errores si los hay */}
        {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

        {/* Botón de Actualización Masiva */}
        {canEditPrograms && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={handleMassiveUpdate}
              className="flex items-center gap-2 bg-[#1f384c] text-white px-4 py-2 rounded-lg hover:bg-[#2a4a5e] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Actualización Masiva
            </button>
          </div>
        )}

        <GenericTable
          data={programs}
          columns={columns}
          onShow={handleShowProgram}
          title="LISTA DE PROGRAMAS"
          showActions={{ show: true, edit: false, delete: false, add: false }}
          tooltipText="Ver detalle del programa"
        />

        {/* Modal de detalle del programa */}
        {selectedProgram && (
          <ProgramDetailModal program={selectedProgram} isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} />
        )}

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

        {/* Modal de actualización masiva */}
        <MassiveUpdateModal
          isOpen={showMassiveUpdateModal}
          onClose={() => setShowMassiveUpdateModal(false)}
          onComplete={handleMassiveUpdateComplete}
        />
      </div>
    </div>
  )
}
