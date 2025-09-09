"use client"

import { useState, useEffect, useRef } from "react"
import GenericTable from "../../../shared/components/Table"
import TopicModal from "../components/TopicModal"
import EditTopicModal from "../components/EditTopicModal"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import { ChevronDown } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import { useGetTopics } from "../hooks/useGetTopics"
import { usePostTopic } from "../hooks/usePostTopic"
import { usePutTopic } from "../hooks/usePutTopic"
import { useDeleteTopic } from "../hooks/useDeleteTopic"
import { useCheckTopicUsage } from "../hooks/useCheckTopicUsage" // ✅ NUEVO IMPORT
import { useCheckTopicStatusChange } from "../hooks/useCheckTopicStatusChange"

const columns = [
  {
    key: "name",
    label: "Nombre",
    render: (item) => <div className="whitespace-normal break-words max-w-md">{item.name}</div>,
    width: "30%",
  },
  {
    key: "description",
    label: "Descripción",
    render: (item) => <span className="text-gray-600">{item.description || "Sin descripción"}</span>,
  },
  {
    key: "status",
    label: "Estado",
    render: (item) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          item.status === true ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {item.status ? "Activo" : "Inactivo"}
      </span>
    ),
  },
]

const TopicsPage = () => {
  // Cerrar sesión
  const dropdownRef = useRef(null)
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

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
  ////////////////////////////////

  //HOOKS
  const { topics, loading: fetchLoading, error: fetchError, refetch } = useGetTopics()
  const { postTopic, loading: createLoading, error: createError } = usePostTopic()
  const { putTopic, loading: updateLoading, error: updateError } = usePutTopic()
  const { deleteTopic, loading: deleteLoading, error: deleteError } = useDeleteTopic()
  const { checkTopicUsage, loading: checkLoading } = useCheckTopicUsage() // ✅ NUEVO HOOK
  const { checkStatusChange, loading: checkStatusLoading } = useCheckTopicStatusChange()

  // Estados
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentTopic, setCurrentTopic] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [pendingChanges, setPendingChanges] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // ✅ NUEVOS ESTADOS para validación de eliminación
  const [showUsageWarning, setShowUsageWarning] = useState(false)
  const [topicUsageInfo, setTopicUsageInfo] = useState(null)
  const [showStatusWarning, setShowStatusWarning] = useState(false)
  const [statusChangeInfo, setStatusChangeInfo] = useState(null)

  // Actualizar el estado de carga y error cuando cambien los hooks
  useEffect(() => {
    setIsLoading(fetchLoading || createLoading || updateLoading || deleteLoading || checkLoading || checkStatusLoading)
  }, [fetchLoading, createLoading, updateLoading, deleteLoading, checkLoading, checkStatusLoading])

  // Consolidar errores de los diferentes hooks
  useEffect(() => {
    const error = fetchError || createError || updateError || deleteError
    setErrorMessage(error ? `Error: ${error}` : "")
  }, [fetchError, createError, updateError, deleteError])

  // Maneja la apertura del modal para agregar un nuevo tema
  const handleAddTopic = () => {
    setIsModalOpen(true)
  }

  // Maneja el envío del nuevo tema
  const handleSubmitTopic = async (newTopic) => {
    try {
      setIsSaving(true)
      await postTopic(newTopic)
      setIsModalOpen(false)
      await refetch() // Refresca la lista de temas
      setSuccessMessage(`Tema "${newTopic.name}" creado exitosamente`)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error al crear el tema:", error)
      setSuccessMessage(error.message || "Ocurrió un error al crear el tema")
      setShowSuccessModal(true)
    } finally {
      setIsSaving(false)
    }
  }

  // Maneja la edición de un tema
  const handleEditTopic = (topic) => {
    setCurrentTopic(topic)
    setIsEditModalOpen(true)
  }

  // Maneja la actualización de un tema
  const handleUpdateTopic = async (updatedTopic) => {
    try {
      // Verificar si se está intentando cambiar el estado
      const isStatusChanging = currentTopic.status !== updatedTopic.status

      if (isStatusChanging) {
        const statusCheck = await checkStatusChange(currentTopic._id, updatedTopic.status)

        if (!statusCheck.canChange && statusCheck.reason === "in_use") {
          // Mostrar modal de advertencia para cambio de estado
          setStatusChangeInfo({
            topic: currentTopic,
            newStatus: updatedTopic.status,
            usageInfo: statusCheck.usageInfo,
          })
          setShowStatusWarning(true)
          return
        }
      }

      // Si no hay problemas con el estado, proceder normalmente
      setPendingChanges(updatedTopic)
      setShowSaveConfirm(true)
    } catch (error) {
      console.error("Error al verificar cambio de estado:", error)
      setSuccessMessage("Error al verificar si el tema puede cambiar de estado")
      setShowSuccessModal(true)
    }
  }

  const confirmSaveChanges = async () => {
    try {
      setIsSaving(true)
      if (!currentTopic || !pendingChanges) {
        throw new Error("No hay tema seleccionado para editar")
      }

      // Prepara los datos para la API
      const topicToUpdate = {
        name: pendingChanges.name,
        description: pendingChanges.description,
        status: pendingChanges.status, // Ya es boolean
      }

      // Llama a la API para actualizar
      await putTopic(currentTopic._id, topicToUpdate)

      // Refresca la lista
      await refetch()

      // Cierra modales
      setIsEditModalOpen(false)
      setShowSaveConfirm(false)
      setPendingChanges(null)
      setSuccessMessage("Tema actualizado exitosamente")
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error al actualizar el tema:", error)
      setSuccessMessage(error.message || "Ocurrió un error al actualizar el tema")
      setShowSuccessModal(true)
    } finally {
      setIsSaving(false)
    }
  }

  // ✅ MEJORADA: Maneja la eliminación de un tema con validación previa
  const handleDeleteTopic = async (id) => {
    try {
      // Verificar si el tema está en uso antes de mostrar el modal de confirmación
      const usageInfo = await checkTopicUsage(id)

      if (usageInfo.isInUse) {
        // Si está en uso, mostrar modal de advertencia
        setTopicUsageInfo(usageInfo)
        setShowUsageWarning(true)
      } else {
        // Si no está en uso, proceder con la confirmación normal
        setItemToDelete(id)
        setShowDeleteConfirm(true)
      }
    } catch (error) {
      console.error("Error al verificar el uso del tema:", error)
      setSuccessMessage("Error al verificar si el tema está en uso")
      setShowSuccessModal(true)
    }
  }

  const confirmDeleteTopic = async () => {
    try {
      setIsDeleting(true)
      await deleteTopic(itemToDelete)
      await refetch()
      setSuccessMessage("Tema eliminado exitosamente")
      setShowSuccessModal(true)
    } catch (error) {
      setSuccessMessage(error.message || "Error al eliminar el tema")
      setShowSuccessModal(true)
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
      setItemToDelete(null)
    }
  }

  return (
    <div className="max-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">Temas</h1>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 transition-colors duration-200 p-2 rounded-lg"
            >
              <div className="text-right">
                <div className="text-sm font-medium">{user?.name} {user?.lastName}</div>
                <div className="text-xs text-gray-500">{getRoleDisplayName(getUserRole(user))}</div>
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
        {/* Mostrar error si existe */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">{errorMessage}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
            <span className="ml-2">Cargando...</span>
          </div>
        ) : (
          <GenericTable
            data={topics}
            columns={columns}
            onAdd={handleAddTopic}
            onEdit={handleEditTopic}
            onDelete={handleDeleteTopic}
          />
        )}

        <TopicModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitTopic}
          topic={currentTopic}
          existingTopics={topics}
          loading={isLoading}
        />

        <EditTopicModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleUpdateTopic}
          topic={currentTopic}
          existingTopics={topics}
        />

        <ConfirmationModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Cerrar Sesión"
          message="¿Está seguro de que desea cerrar la sesión actual?"
          confirmText="Cerrar Sesión"
        />

        {/* ✅ NUEVO: Modal de advertencia cuando el tema está en uso */}
        <ConfirmationModal
          isOpen={showUsageWarning}
          onClose={() => {
            setShowUsageWarning(false)
            setTopicUsageInfo(null)
          }}
          onConfirm={() => {
            setShowUsageWarning(false)
            setTopicUsageInfo(null)
          }}
          title="Acción no permitida"
          message={
            <div className="space-y-3">
              <p>
                El tema <strong>"{topicUsageInfo?.topicName}"</strong> no puede ser eliminado porque está siendo
                utilizado en las siguientes programaciones de cursos:
              </p>
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <ul className="list-disc list-inside space-y-1">
                  {topicUsageInfo?.usedInPrograms?.map((programName, index) => (
                    <li key={index} className="text-sm text-red-800">
                      {programName}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                Para eliminar este tema, primero debe removerlo de todas las programaciones donde se encuentra.
              </p>
            </div>
          }
          confirmText="Cerrar"
          confirmColor="bg-red-500 hover:bg-red-600"
          showButtonCancel={false}
        />

        {/* Modal de confirmación para eliminar tema */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDeleteTopic}
          title="Eliminar Tema"
          message="¿Está seguro que desea eliminar este tema? Esta acción no se puede deshacer."
          confirmText={isDeleting ? "Eliminando..." : "Eliminar"}
          confirmColor="bg-[#f44144] hover:bg-red-600"
          isLoading={isDeleting}
        />

        <ConfirmationModal
          isOpen={showSaveConfirm}
          onClose={() => {
            setShowSaveConfirm(false)
            setIsEditModalOpen(false)
          }}
          onConfirm={confirmSaveChanges}
          title="Confirmar Cambios"
          message="¿Estás seguro que deseas guardar los cambios del tema?"
          confirmText={isSaving ? "Guardando..." : "Guardar"}
          confirmColor="bg-green-500 hover:bg-green-600"
          isLoading={isSaving}
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

        {/* Modal de advertencia para cambio de estado */}
        <ConfirmationModal
          isOpen={showStatusWarning}
          onClose={() => {
            setShowStatusWarning(false)
            setStatusChangeInfo(null)
          }}
          onConfirm={() => {
            setShowStatusWarning(false)
            setStatusChangeInfo(null)
          }}
          title="No se puede cambiar el estado del tema"
          message={
            <div className="space-y-3">
              <p>
                No se puede cambiar el estado del tema <strong>"{statusChangeInfo?.topic?.name}"</strong> a{" "}
                <strong>{statusChangeInfo?.newStatus ? "Activo" : "Inactivo"}</strong> porque está siendo utilizado en
                las siguientes programaciones de cursos:
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <ul className="list-disc list-inside space-y-1">
                  {statusChangeInfo?.usageInfo?.usedInPrograms?.map((programName, index) => (
                    <li key={index} className="text-sm text-yellow-800">
                      {programName}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                Para cambiar el estado de este tema, primero debe removerlo de todas las programaciones donde se
                encuentra.
              </p>
            </div>
          }
          confirmText="Entendido"
          confirmColor="bg-blue-500 hover:bg-blue-600"
          showButtonCancel={false}
        />
      </div>
    </div>
  )
}

export default TopicsPage
