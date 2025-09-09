
"use client"
import SupportMaterialForm from "./SupportMaterialForm"

const CreateSupportMaterialModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  successMessage,
  setSuccessMessage,
  setShowSuccessModal,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header fijo */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#1f384c]">Añadir material de apoyo</h2>
        </div>

        <SupportMaterialForm
          mode="create"
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        //   topics={topics}
          successMessage={successMessage}
          setSuccessMessage={setSuccessMessage}
          setShowSuccessModal={setShowSuccessModal}
        />
      </div>
    </div>
  )
}

export default CreateSupportMaterialModal
