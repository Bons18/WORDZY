
"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, RefreshCw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import GenericTable from "../../../shared/components/Table"
import { useAuth } from "../../auth/hooks/useAuth"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import CourseDetailModal from "./CourseDetailModal"
import MassiveUpdateModal from "../componentes/MassiveUpdateModal"
// Importar las funciones de utilidad para mostrar el rol del usuario
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"

import { useGetCourses } from "../hooks/useGetCourses"

const columns = [
  { key: "code", label: "Código" },
  {
  key: "fk_programs",
  label: "Programa",
  render: (item) => (
    <div className="whitespace-normal break-words max-w-md">{item.fk_programs}</div>
  ),
},
{
  key: "area",
  label: "Área",
  render: (item) => (
    <div className="whitespace-normal break-words max-w-md">{item.area}</div>
  ),
},

  {
    key: "offer_type",
    label: "Tipo de Oferta",
    render: (item) => {
      const typeMap = {
        ABIERTA: "Abierta",
        CERRADA: "Cerrada",
        ESPECIAL: "Especial",
      }
      return typeMap[item.offer_type] || item.offer_type
    },
  },
  {
    key: "start_date",
    label: "Fecha Inicio",
    render: (item) => new Date(item.start_date).toLocaleDateString("es-ES"),
  },
  {
    key: "end_date",
    label: "Fecha Fin",
    render: (item) => new Date(item.end_date).toLocaleDateString("es-ES"),
  },
  {
    key: "course_status",
    label: "Estado",
    render: (item) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.course_status === "EN EJECUCION"
            ? "bg-green-100 text-green-800"
            : item.course_status === "TERMINADO"
              ? "bg-blue-100 text-blue-800"
              : item.course_status === "SUSPENDIDO"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
        }`}
      >
        {item.course_status}
      </span>
    ),
  },
]

export default function Courses() {
  // Estados principales
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [showMassiveUpdateModal, setShowMassiveUpdateModal] = useState(false)

  // Hooks
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Hooks de datos
  const { courses, loading, error, refetch } = useGetCourses()

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
  const handleShowCourse = (course) => {
    setSelectedCourse(course)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedCourse(null)
  }

  const handleMassiveUpdate = () => {
    setShowMassiveUpdateModal(true)
  }

  const handleMassiveUpdateComplete = (results) => {
    console.log("Actualización masiva completada:", results)
    // Refrescar la lista de cursos
    refetch()
  }

  // Renderizado condicional para estados de carga y error
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f384c] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando cursos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">Fichas</h1>
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
        <div className="mb-6 flex justify-end">
          <button
            onClick={handleMassiveUpdate}
            className="flex items-center gap-2 bg-[#1f384c] text-white px-4 py-2 rounded-lg hover:bg-[#2a4a5e] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Actualización Masiva
          </button>
        </div>

        <GenericTable
          data={courses}
          columns={columns}
          onShow={handleShowCourse}
          title="LISTA DE FICHAS"
          showActions={{ show: true, edit: false, delete: false, add: false }}
          tooltipText="Ver detalle de la ficha"
        />

        {/* Modal de detalle del curso */}
        {selectedCourse && (
          <CourseDetailModal course={selectedCourse} isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} />
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
