"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown } from "lucide-react"
import { useNavigate } from "react-router-dom"
import GenericTable from "../../../shared/components/Table"
import InstructorDetailModal from "./InstructorDetailModal"
import { useAuth } from "../../auth/hooks/useAuth"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import useGetInstructors from "../hooks/useGetInstructors"
import useDeleteInstructor from "../hooks/useDeleteInstructor"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"

const columns = [
  { key: "nombre", label: "Nombre" },
  { key: "apellido", label: "Apellido" },
  { key: "tipoDocumento", label: "Tipo Documento" },
  { key: "documento", label: "Documento" },
  {
    key: "estado",
    label: "Estado",
    render: (item) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {item.estado}
      </span>
    ),
  },
]

const InstructorsPage = () => {
  const [selectedInstructor, setSelectedInstructor] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [instructorToDelete, setInstructorToDelete] = useState(null)

  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)

  // Hooks para API
  const { instructors, loading, error, refetch } = useGetInstructors()
  const { deleteInstructor, loading: deleting } = useDeleteInstructor()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleShowInstructor = (instructor) => {
    setSelectedInstructor(instructor)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
  }

  const handleCreateInstructor = () => {
    navigate("/formacion/instructores/crear")
  }

  const handleEditInstructor = (instructor) => {
    const instructorId = instructor._id || instructor.id
    navigate(`/formacion/instructores/editar/${instructorId}`)
  }

  const handleDeleteInstructor = (instructorData) => {
    console.log("Datos recibidos para eliminar:", instructorData)

    let instructorToDelete
    if (typeof instructorData === "string") {
      instructorToDelete = instructors.find((inst) => inst._id === instructorData || inst.id === instructorData)
      console.log("Instructor encontrado por ID:", instructorToDelete)
    } else {
      instructorToDelete = instructorData
    }

    if (!instructorToDelete) {
      console.error("No se pudo encontrar el instructor")
      return
    }

    setInstructorToDelete(instructorToDelete)
    setShowDeleteConfirm(true)
  }

  const handleConfirmDelete = async () => {
    if (instructorToDelete) {
      try {
        let instructorId
        if (typeof instructorToDelete === "object") {
          instructorId = instructorToDelete._id || instructorToDelete.id
        } else {
          instructorId = instructorToDelete
        }

        console.log("ID del instructor a eliminar:", instructorId)

        if (!instructorId) {
          console.error("No se encontró ID del instructor:", instructorToDelete)
          return
        }

        await deleteInstructor(instructorId)
        refetch()
        setShowDeleteConfirm(false)
        setInstructorToDelete(null)
      } catch (error) {
        console.error("Error al eliminar instructor:", error)
      }
    }
  }

  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f384c] mx-auto mb-4"></div>
          <p className="text-[#1f384c] font-medium">Cargando instructores...</p>
        </div>
      </div>
    )
  }

  const displayError = error && !instructors.length ? error : null

  return (
    <div className="min-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">Instructores</h1>
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
        {displayError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">Error: {displayError}</div>
        )}

        <GenericTable
          data={instructors}
          columns={columns}
          onAdd={handleCreateInstructor}
          onShow={handleShowInstructor}
          onEdit={handleEditInstructor}
          onDelete={handleDeleteInstructor}
          title="LISTA DE INSTRUCTORES"
          showActions={{ show: true, edit: true, delete: true, add: true }}
          tooltipText="Ver detalle del instructor"
        />

        {selectedInstructor && (
          <InstructorDetailModal
            instructor={selectedInstructor}
            isOpen={isDetailModalOpen}
            onClose={handleCloseDetailModal}
          />
        )}
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
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Instructor"
        message={`¿Está seguro de que desea eliminar al instructor ${instructorToDelete?.nombre} ${instructorToDelete?.apellido}?`}
        confirmText="Eliminar"
        confirmColor="bg-[#f44144] hover:bg-red-600"
        loading={deleting}
      />
    </div>
  )
}

export default InstructorsPage
