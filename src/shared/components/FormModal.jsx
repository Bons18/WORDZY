import React from 'react'
import { Modal } from './Modal'
import RoleForm from './RoleForm'
import { X } from 'lucide-react'
import { Button } from './Button'

const FormModal = ({
  isOpen,
  onClose,
  role = 'aprendiz',
  initialData = {},
  onSubmit,
  isEditing = false,
  isLoading = false,
  title,
  size = 'lg',
  showRoleSpecificFields = true
}) => {
  const defaultTitle = isEditing 
    ? `Editar ${role.charAt(0).toUpperCase() + role.slice(1)}`
    : `Registrar ${role.charAt(0).toUpperCase() + role.slice(1)}`

  const handleSubmit = async (formData) => {
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      // El error se maneja en RoleForm
      throw error
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="bg-white rounded-xl">
        {/* Header personalizado */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1f384c]">
            {title || defaultTitle}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            icon={<X className="w-4 h-4" />}
            className="text-gray-400 hover:text-gray-600"
          />
        </div>
        
        {/* Contenido del formulario */}
        <div className="p-0">
          <RoleForm
            role={role}
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isEditing={isEditing}
            isLoading={isLoading}
            showRoleSpecificFields={showRoleSpecificFields}
            className="border-0 shadow-none rounded-none"
          />
        </div>
      </div>
    </Modal>
  )
}

export default FormModal