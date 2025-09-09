"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, RefreshCw } from "lucide-react"
import { useNavigate } from "react-router-dom"
import GenericTable from "../../../shared/components/Table"
import ApprenticeDetailModal from "./ApprenticeDetailModal"
import ApprenticeProgressModal from "./ApprenticeProgressModal"
import { useAuth } from "../../auth/hooks/useAuth"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import useGetApprentices from "../hooks/useGetApprentices"
import MassiveUpdateModal from "../components/MassiveUpdateModal"

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "apellido", label: "Apellido" },
  { key: "tipoDocumento", label: "Tipo Documento" },
  { key: "documento", label: "Documento" },
  { key: "ficha", label: "Ficha", render: (item) => (Array.isArray(item.ficha) ? item.ficha.join(", ") : item.ficha) },
  {
    key: "estado",
    label: "Estado",
    render: (item) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.estado === "En formación"
            ? "bg-green-100 text-green-800"
            : item.estado === "Condicionado"
              ? "bg-yellow-100 text-yellow-800"
              : item.estado === "Graduado"
                ? "bg-blue-100 text-blue-800"
                : "bg-red-100 text-red-800"
        }`}
      >
        {item.estado}
      </span>
    ),
  },
]

const Apprentices = () => {
  const [selectedApprentice, setSelectedApprentice] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showMassiveUpdateModal, setShowMassiveUpdateModal] = useState(false) // Inicializado explícitamente en false
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Solo hook para obtener datos
  const { apprentices, loading, error, refetch } = useGetApprentices()

  // Debug: Log del estado del modal
  useEffect(() => {
    console.log("🔍 Estado showMassiveUpdateModal:", showMassiveUpdateModal)
  }, [showMassiveUpdateModal])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleShowApprentice = (apprentice) => {
    setSelectedApprentice(apprentice)
    setIsDetailModalOpen(true)
    setIsProgressModalOpen(false)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setSelectedApprentice(null)
  }

  const handleShowProgress = () => {
    setIsDetailModalOpen(false)
    setIsProgressModalOpen(true)
  }

  const handleCloseProgressModal = () => {
    setIsProgressModalOpen(false)
    setIsDetailModalOpen(true)
  }

  const handleMassiveUpdate = () => {
    console.log("🚀 Abriendo modal de actualización masiva")
    setShowMassiveUpdateModal(true)
  }

  const handleMassiveUpdateComplete = async (results) => {
    console.log("📊 Actualización masiva completada:", results)

    try {
      setIsRefreshing(true)
      console.log("🔄 Refrescando lista de aprendices...")

      // Delay para asegurar que los datos se hayan guardado
      await new Promise((resolve) => setTimeout(resolve, 1000))

      await refetch()
      console.log("✅ Lista refrescada exitosamente")

      // Delay adicional para mostrar el loading
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("❌ Error al refrescar lista:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleMassiveUpdateModalClose = () => {
    console.log("🔒 Cerrando modal de actualización masiva desde componente padre")
    setShowMassiveUpdateModal(false)
  }

  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  // Mostrar loading
  if (loading || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f384c] mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {isRefreshing ? "Actualizando lista de aprendices..." : "Cargando aprendices..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">Aprendices</h1>
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
            disabled={isRefreshing || showMassiveUpdateModal}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isRefreshing || showMassiveUpdateModal
                ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                : "bg-[#1f384c] text-white hover:bg-[#2a4a5e]"
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Actualizando..." : "Actualización Masiva"}
          </button>
        </div>

        <GenericTable
          data={apprentices}
          columns={columns}
          onShow={handleShowApprentice}
          title="LISTA DE APRENDICES"
          showActions={{ show: true, edit: false, delete: false, add: false }}
          tooltipText="Ver detalle del aprendiz"
        />

        {/* Modal de detalle del aprendiz */}
        {selectedApprentice && (
          <>
            <ApprenticeDetailModal
              apprentice={selectedApprentice}
              isOpen={isDetailModalOpen}
              onClose={handleCloseDetailModal}
              onShowProgress={handleShowProgress}
            />

            <ApprenticeProgressModal
              isOpen={isProgressModalOpen}
              onClose={handleCloseProgressModal}
              progressData={selectedApprentice.progresoNiveles}
            />
          </>
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
          onClose={handleMassiveUpdateModalClose}
          onComplete={handleMassiveUpdateComplete}
        />
      </div>
    </div>
  )
}

export default Apprentices
