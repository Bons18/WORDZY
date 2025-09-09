import React from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  confirmColor = "bg-[#f44144] hover:bg-red-600",
  showButtonCancel = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-[#1f384c]">{title}</h3>
            <div className="mt-2 text-[#627b87]">{message}</div>
          </div>

          <div className="flex justify-center gap-6">
            {showButtonCancel && (
            <button
              className="px-4 py-2 border border-[#d9d9d9] rounded-[10px] text-[#627b87] hover:bg-gray-50 focus:outline-none text-sm transition-colors"
              onClick={onClose}
            >
              Cancelar
            </button>
            )}
            <button
              className={`px-4 py-2 ${confirmColor} text-white rounded-[10px] text-sm focus:outline-none transition-colors`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;