
"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import GenericTable from "../../../shared/components/Table"
import { useAuth } from "../../auth/hooks/useAuth"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import LoadingSpinner from "../../../shared/components/LoadingSpinner"
import ErrorMessage from "../../../shared/components/ErrorMessage"
import useSupportMaterials from "../hooks/useSupportMaterials"
import { useGetTopics } from "../../Topics/hooks/useGetTopics"
import CreateSupportMaterialModal from "../componentes/CreateSupportMaterialModal"
import EditSupportMaterialModal from "../componentes/EditSupportMaterialModal"
import SupportMaterialDetailModal from "../componentes/SupportMaterialDetailModal"

const columns = [
  { key: "nombre", label: "Nombre" },
  {
    key: "estado",
    label: "Estado",
    render: (item) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.estado === "Activo" || item.estado === "activo"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {item.estado.charAt(0).toUpperCase() + item.estado.slice(1).toLowerCase()}
      </span>
    ),
  },
]

// Datos de prueba temporales para cuando no hay conexión
const testMaterials = []

export default function SupportMaterials() {
  // Hook personalizado para manejar materiales
  const { materials, loading, error, createMaterial, updateMaterial, deleteMaterial, setMaterials, setError } =
    useSupportMaterials()

  // Debug: verificar qué datos estamos recibiendo
  console.log("SupportMaterials - materials:", materials, "loading:", loading, "error:", error)
  console.log("SupportMaterials - materials es array?", Array.isArray(materials))

  const { topics } = useGetTopics()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const { logout, user } = useAuth()
  const navigate = useNavigate()
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

  const handleAdd = () => {
    setShowAddModal(true)
  }

  const handleEdit = (material) => {
    setSelectedMaterial(material)
    setShowEditModal(true)
  }

  const handleView = (material) => {
    setSelectedMaterial(material)
    setShowDetailModal(true)
  }

  const handleDelete = (id) => {
    setItemToDelete(id)
    setSelectedMaterial(id)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteMaterial = async () => {
    try {
      console.log(`Eliminando material con ID: ${itemToDelete}`)

      await deleteMaterial(itemToDelete)

      setSuccessMessage("Material eliminado exitosamente de la base de datos")
      setShowSuccessModal(true)

      console.log("Material eliminado exitosamente")
    } catch (error) {
      console.error("Error al eliminar el material:", error)
      setSuccessMessage(`Error al eliminar el material: ${error.message}`)
      setShowSuccessModal(true)
    } finally {
      setShowDeleteConfirm(false)
      setItemToDelete(null)
    }
  }

  // Guardar un nuevo material
  const handleSaveNewMaterial = async (materialData) => {
    try {
      await createMaterial(materialData)
      setSuccessMessage("Material añadido exitosamente")
      setShowSuccessModal(true)
      setShowAddModal(false)
    } catch (error) {
      console.error("Error al añadir el material:", error)
      setSuccessMessage(`Error al añadir el material: ${error.message}`)
      setShowSuccessModal(true)
    }
  }

  // Actualizar un material existente
  const handleUpdateMaterial = async (id, materialData) => {
    try {
      await updateMaterial(id, materialData)
      setSuccessMessage("Material actualizado exitosamente")
      setShowSuccessModal(true)
      setShowEditModal(false)
    } catch (error) {
      console.error("Error al actualizar el material:", error)
      setSuccessMessage(`Error al actualizar el material: ${error.message}`)
      setShowSuccessModal(true)
    }
  }

  // Mostrar loading si está cargando
  if (loading && materials.length === 0) {
    return (
      <div className="min-h-screen">
        <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#1f384c]">MATERIAL DE APOYO</h1>
          </div>
        </header>
        <div className="container mx-auto px-6">
          <LoadingSpinner size="large" message="Cargando materiales de apoyo..." />
        </div>
      </div>
    )
  }

  // Mostrar error si hay error
  if (error && materials.length === 0) {
    return (
      <div className="min-h-screen">
        <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#1f384c]">MATERIAL DE APOYO</h1>
          </div>
        </header>
        <div className="container mx-auto px-6">
          <ErrorMessage
            message={error}
            onRetry={() => {
              if (setError) setError(null)
              window.location.reload()
            }}
          />
        </div>
      </div>
    )
  }

  // Asegurar que materials sea un array antes de pasarlo a GenericTable
  // Si no hay materiales del backend, usar datos de prueba temporales
  const materialsArray = Array.isArray(materials) && materials.length > 0 ? materials : testMaterials

  // Mapear los datos para asegurar que tengan la estructura correcta
  const mappedMaterials = materialsArray.map((material) => ({
    ...material,
    nombre: material.titulo || material.nombre, // Para mostrar en la tabla
    _id: material._id || material.id,
  }))

  console.log("SupportMaterials - materialsArray final:", mappedMaterials)

  return (
    <div className="min-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">MATERIAL DE APOYO</h1>
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
        <GenericTable
          data={mappedMaterials}
          columns={columns}
          onShow={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
          title=""
          showActions={{ show: true, edit: true, delete: true, add: true }}
        />
      </div>

      {/* Modales */}
      <CreateSupportMaterialModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSaveNewMaterial}
        topics={topics}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        setShowSuccessModal={setShowSuccessModal}
      />

      <EditSupportMaterialModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateMaterial}
        material={selectedMaterial}
        topics={topics}
        successMessage={successMessage}
        setSuccessMessage={setSuccessMessage}
        setShowSuccessModal={setShowSuccessModal}
      />

      <SupportMaterialDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        material={selectedMaterial}
      />

      {/* Modal de confirmación para eliminar material */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteMaterial}
        title="Eliminar Material"
        message="¿Está seguro que desea eliminar este material de apoyo? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        confirmColor="bg-[#f44144] hover:bg-red-600"
      />

      {/* Modal de éxito */}
      <ConfirmationModal
        isOpen={showSuccessModal}
        onConfirm={() => setShowSuccessModal(false)}
        title="Operación Exitosa"
        message={successMessage}
        confirmText="Aceptar"
        confirmColor="bg-green-500 hover:bg-green-600"
        showButtonCancel={false}
      />

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
    </div>
  )
}
