"use client"

import { useEffect } from "react"

const CustomAlert = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "success", // "success", "confirm", "error"
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  showCancel = false,
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      document.body.style.overflow = "hidden"
    }

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6 text-center">
        {/* Icono */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-[#ffc72d] rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">i</span>
          </div>
        </div>

        {/* Título */}
        {title && <h2 className="text-xl font-bold text-[#202224] mb-2">{title}</h2>}

        {/* Mensaje */}
        {message && <p className="text-[#202224] mb-6 text-lg">{message}</p>}

        {/* Botones */}
        <div className="flex justify-center gap-4">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#f44144] text-white rounded-md hover:bg-red-600 transition-colors font-medium min-w-[120px]"
            >
              {cancelText}
            </button>
          )}

          <button
            onClick={handleConfirm}
            className={`px-6 py-2 text-white rounded-md transition-colors font-medium min-w-[120px] ${
              type === "confirm" && showCancel ? "bg-[#46ae69] hover:bg-green-600" : "bg-[#f44144] hover:bg-red-600"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CustomAlert
