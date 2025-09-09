"use client"

import { useEffect, useRef } from "react"

const ProgressBar = ({ level, percentage }) => {
  const getProgressBarColor = (level) => {
    if (level === 1) return { bg: "#f44144", text: "text-white" } // Rojo
    if (level === 2) return { bg: "#FFD700", text: "text-black" } // Amarillo dorado
    if (level === 3) return { bg: "#35dc4e", text: "text-white" } // Verde
    return { bg: "#f44144", text: "text-white" } // Default rojo
  }

  const { bg, text } = getProgressBarColor(level)

  return (
    <div className="flex flex-col space-y-1 w-full">
      <div className="flex justify-between items-center px-1">
        <span className="font-semibold text-[14px] text-[#1f384c]">Nivel {level}</span>
        <span className="text-gray-600 font-medium text-[14px]">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`rounded-full h-3 transition-all duration-300 ${text}`}
          style={{
            width: `${percentage}%`,
            backgroundColor: bg,
            minWidth: "30px",
          }}
        />
      </div>
    </div>
  )
}

const ApprenticeProgressModal = ({ isOpen, onClose, progressData }) => {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
          <h2 className="text-[18px] font-bold text-center text-[#1f384c]">PROGRESO POR NIVELES</h2>
        </div>

        <div className="p-4 overflow-y-auto">
          <div className="space-y-4">
            {progressData.map((progress) => (
              <ProgressBar key={progress.nivel} level={progress.nivel} percentage={progress.porcentaje} />
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-center rounded-b-lg">
          <button
            onClick={onClose}
            className="bg-[#f44144] text-white py-2 px-8 rounded-lg text-[14px] font-medium 
                     hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApprenticeProgressModal
