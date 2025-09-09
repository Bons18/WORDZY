import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Plus, Eye, Edit, Trash2, X } from "lucide-react"
import BadgeTable from "../components/BadgeTable"
import BadgeHeader from "../components/BadgeHeader"
import BadgeForm from "../components/BadgeForm"
import { useBadges } from "../hooks/useBadges"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"

const Badges = () => {
  const navigate = useNavigate()
  const [currentView, setCurrentView] = useState("list")
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [badgeToDelete, setBadgeToDelete] = useState(null)
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [showErrorAlert, setShowErrorAlert] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [editingBadge, setEditingBadge] = useState(null)
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false)
  const [badgeToEdit, setBadgeToEdit] = useState(null)
  
  const { badges, loading, createNewBadge, updateBadge, deleteBadge } = useBadges()

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 5000)
  }

  // Show error message
  const showError = (message) => {
    setErrorMessage(message)
    setShowErrorAlert(true)
    setTimeout(() => setShowErrorAlert(false), 5000)
  }

  // Las columnas ahora se manejan internamente en BadgeTable

  // Handle actions
  const handleShow = (badge) => {
    console.log("Ver insignia:", badge)
    // Implement view details logic
  }

  const handleEdit = (badge) => {
    console.log('🔍 EDIT BADGE - Badge completo:', badge)
    console.log('🔍 EDIT BADGE - Badge._id:', badge._id)
    console.log('🔍 EDIT BADGE - Badge.id:', badge.id)
    setBadgeToEdit(badge)
    setShowEditConfirmModal(true)
  }

  const confirmEdit = () => {
    console.log('🔍 EDIT BADGE - Confirmed edit for badge:', badgeToEdit)
    setEditingBadge(badgeToEdit)
    setCurrentView("form")
    setShowEditConfirmModal(false)
    setBadgeToEdit(null)
  }

  const cancelEdit = () => {
    setShowEditConfirmModal(false)
    setBadgeToEdit(null)
  }

  const handleDelete = (badgeId) => {
    const badge = badges.find(b => (b._id || b.id) === badgeId)
    if (badge) {
      setBadgeToDelete(badge)
      setShowConfirmModal(true)
    }
  }

  const confirmDelete = async () => {
    if (badgeToDelete) {
      try {
        const result = await deleteBadge(badgeToDelete._id || badgeToDelete.id)
        if (result.success) {
          showSuccess(`Insignia "${badgeToDelete.name || badgeToDelete.badgeName}" eliminada exitosamente`)
        } else {
          showError(result.error || "Error al eliminar la insignia")
        }
      } catch (error) {
        console.error("Error deleting badge:", error)
        showError("Error inesperado al eliminar la insignia")
      }
    }
    setShowConfirmModal(false)
    setBadgeToDelete(null)
  }

  const cancelDelete = () => {
    setShowConfirmModal(false)
    setBadgeToDelete(null)
  }

  const handleAddBadge = () => {
    setEditingBadge(null)
    setCurrentView("form")
  }



  // Handle form submission
  const handleFormSubmit = async (formData) => {
    try {
      if (editingBadge) {
        const badgeId = editingBadge._id || editingBadge.id
        console.log('🔍 FORM SUBMIT - editingBadge:', editingBadge)
        console.log('🔍 FORM SUBMIT - badgeId a enviar:', badgeId)
        // Agregar información de imagen existente para validación
        const formDataWithExisting = {
          ...formData,
          existingImage: editingBadge.image
        }
        const result = await updateBadge(badgeId, formDataWithExisting)
        if (result.success) {
          showSuccess("Insignia actualizada exitosamente")
          setEditingBadge(null)
          setCurrentView("list")
        } else {
          showError(result.error || "Error al actualizar la insignia")
        }
      } else {
        console.log('🔍 BADGES2 - handleFormSubmit CREATE - formData recibido:', formData)
        console.log('🔍 BADGES2 - handleFormSubmit CREATE - formData.file:', formData.file)
        console.log('🔍 BADGES2 - handleFormSubmit CREATE - formData.file instanceof File:', formData.file instanceof File)
        if (formData.file) {
          console.log('🔍 BADGES2 - handleFormSubmit CREATE - File details:', {
            name: formData.file.name,
            size: formData.file.size,
            type: formData.file.type,
            lastModified: formData.file.lastModified
          })
        }
        const result = await createNewBadge(formData)
        if (result.success) {
          showSuccess("Insignia creada exitosamente")
          setCurrentView("list")
        } else {
          showError(result.error || "Error al crear la insignia")
        }
      }
    } catch (error) {
      console.error("Error saving badge:", error)
      showError("Error inesperado al guardar la insignia")
    }
  }

  const handleFormCancel = () => {
    setCurrentView("list")
    setEditingBadge(null)
  }

  // Render badge form
  const renderBadgeForm = () => {
    return (
      <div className="min-h-screen bg-white">
        <BadgeHeader 
          title={editingBadge ? "Editar Insignia" : "Crear Insignia"}
        />
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
          <BadgeForm
            initialData={editingBadge}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    )
  }



  // Render current view
  if (currentView === "form") {
    return renderBadgeForm()
  }

  // Render badges list
  return (
    <div className="min-h-screen bg-white">
      <BadgeHeader title="Insignias" />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">


        <BadgeTable
          data={badges}
          onShow={handleShow}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAddBadge}
          defaultItemsPerPage={5}
          showActions={{ show: false, edit: true, delete: true, add: true }}
          tooltipText="Ver insignia"
          showSearch={true}
          showPagination={true}
          loading={loading}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all">
            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-[#1f384c]">Eliminar Insignia</h3>
                <p className="mt-2 text-[#627b87]">
                  ¿Está seguro de que desea eliminar la insignia "{badgeToDelete?.name || badgeToDelete?.badgeName}"?
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  className="px-6 py-2.5 border border-[#d9d9d9] rounded-lg text-[#627b87] hover:bg-gray-50 font-medium transition-colors"
                  onClick={cancelDelete}
                >
                  Cancelar
                </button>
                <button
                  className="px-6 py-2.5 bg-[#f44144] text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                  onClick={confirmDelete}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all z-50">
          <div className="p-4 flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-2 mr-3">
              <svg
                className="h-5 w-5 text-green-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{successMessage}</p>
            </div>
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {showErrorAlert && (
        <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all z-50">
          <div className="p-4 flex items-center">
            <div className="flex-shrink-0 bg-red-100 rounded-full p-2 mr-3">
              <svg
                className="h-5 w-5 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{errorMessage}</p>
            </div>
            <button
              onClick={() => setShowErrorAlert(false)}
              className="ml-4 text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      <ConfirmationModal
        isOpen={showEditConfirmModal}
        onClose={cancelEdit}
        onConfirm={confirmEdit}
        title="Editar Insignia"
        message={`¿Está seguro de que desea editar la insignia "${badgeToEdit?.name || badgeToEdit?.badgeName}"?`}
        confirmText="Editar"
        confirmColor="bg-green-500 hover:bg-green-600"
      />
    </div>
  )
}

export default Badges
