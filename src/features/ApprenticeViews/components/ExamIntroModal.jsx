"use client"

import { ArrowLeft, FileText, Download } from "lucide-react"

const ExamIntroModal = ({ isOpen, onClose, exam, onStart }) => {
  if (!isOpen || !exam) return null

  const handleDownload = () => {
    // Crear un enlace para descargar el archivo
    const link = document.createElement("a")
    link.href = "/src/shared/prueba.docx"
    link.download = "Material.docx"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="p-6 flex flex-col">
          {/* Botón de abandonar */}
          <button
            onClick={onClose}
            className="flex items-center text-[#1f384c] font-medium mb-8 hover:text-gray-700 transition-colors w-fit"
          >
            <ArrowLeft className="mr-2" size={20} />
            Abandonar
          </button>

          {/* Título */}
          <h1 className="text-4xl font-bold text-center text-[#1f384c] mb-8">{exam.title}</h1>

          {/* Descripción */}
          <p className="text-xl text-center text-gray-600 mb-12">
            Basic activity based on your personal presentation, I this is for any avereg student of english and doet
            require to much
          </p>

          {/* Material */}
          <h2 className="text-3xl font-bold text-center text-[#1f384c] mb-6">Material:</h2>

          {/* Botón de descarga */}
          <div
            className="border-2 border-gray-300 rounded-xl p-4 flex justify-between items-center mb-12 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={handleDownload}
          >
            <div className="flex items-center">
              <FileText size={24} className="mr-4 text-[#1f384c]" />
              <span className="text-xl font-medium">Material.docx</span>
            </div>
            <Download size={24} className="text-[#1f384c]" />
          </div>

          {/* Botón de empezar */}
          <div className="flex justify-center">
            <button
              onClick={onStart}
              className="bg-[#1f384c] text-white py-4 px-12 rounded-xl text-xl font-medium hover:bg-[#162a3a] transition-colors"
            >
              Empezar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamIntroModal