"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, BookOpen, CheckCircle, Circle, Lock, FileText, X } from "lucide-react"
import ExamModal from "../components/ExamModal"
import ExamIntroModal from "../components/ExamIntroModal"
import ApprenticeHeader from "../components/ApprenticeHeader"
import { useExams } from "../hooks/useExams"

const ApprenticeHomeNew = () => {
  const [expandedSections, setExpandedSections] = useState({
    nivel1: true,
    greeting: false,
    simplePresent: false,
  })
  const [currentExam, setCurrentExam] = useState(null)
  const [showExamModal, setShowExamModal] = useState(false)
  const [showIntroModal, setShowIntroModal] = useState(false)

  const { exams, getExamByTitle } = useExams()

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  // Modificar la función getScoreColor para que también devuelva el color del botón
  const getScoreColor = (score) => {
    if (score >= 70) {
      return "text-green-600"
    } else {
      return "text-red-600"
    }
  }

  // Añadir una nueva función para determinar el color del botón basado en el puntaje
  const getButtonColor = (score) => {
    if (score === undefined) return "bg-white hover:bg-gray-200 border"
    if (score >= 70) {
      return "bg-white hover:bg-green-200 border border-green-600 text-green-600"
    } else {
      return "bg-white hover:bg-red-200 border border-red-600 text-red-600"
    }
  }

  // Función para determinar el icono basado en el puntaje
  const getScoreIcon = (score) => {
    if (score >= 70) {
      return <CheckCircle size={16} className="text-green-600 mr-2" />
    } else {
      return <X size={16} className="text-red-600 mr-2" />
    }
  }

  // Función para abrir el modal de introducción del examen
  const handleStartExam = (examTitle) => {
    const exam = getExamByTitle(examTitle)
    if (exam) {
      setCurrentExam(exam)
      setShowIntroModal(true)
    }
  }

  // Función para iniciar el examen después de la introducción
  const handleStartExamAfterIntro = () => {
    setShowIntroModal(false)
    setShowExamModal(true)
  }

  // Función para cerrar el modal de examen
  const handleCloseExam = () => {
    setShowExamModal(false)
    setShowIntroModal(false)
    setCurrentExam(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <ApprenticeHeader title="¡Bienvenido de vuelta!" subtitle="Continúa tu camino de aprendizaje" />
      
      <div className="flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 lg:p-8">
        <div className="w-full max-w-6xl bg-white rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl overflow-hidden border border-gray-100">

        {/* Info Cards */}
        <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 via-indigo-25 to-purple-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="group bg-white border border-blue-100 rounded-lg sm:rounded-xl p-4 sm:p-6 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300 mr-3 sm:mr-4">
                <BookOpen className="text-[#1f384c]" size={28} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg">Nivel actual</p>
                <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#1f384c] to-blue-600 bg-clip-text text-transparent">Nivel 1</p>
              </div>
            </div>

            <div className="group bg-white border border-green-100 rounded-lg sm:rounded-xl p-4 sm:p-6 flex items-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300 mr-3 sm:mr-4">
                <CheckCircle className="text-green-600" size={28} />
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm sm:text-base lg:text-lg">Evaluaciones completadas</p>
                <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">8 / 10</p>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Path */}
        <div className="p-3 sm:p-4 md:p-6 bg-white">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#1f384c] to-[#2a4a64] bg-clip-text text-transparent mb-2 sm:mb-3 px-2">Tu camino de aprendizaje</h2>
            <p className="text-gray-600 text-base sm:text-lg px-4">Explora tus niveles y continúa mejorando</p>
          </div>

          {/* Level 1 */}
          <div className="bg-gradient-to-r from-white to-blue-50 border border-blue-200 rounded-lg sm:rounded-xl mb-4 sm:mb-6 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
            <div
              className="flex justify-between items-center p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 cursor-pointer hover:from-blue-100 hover:to-indigo-100 transition-all duration-300"
              onClick={() => toggleSection("nivel1")}
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg mr-2 sm:mr-3 group-hover:bg-blue-200 transition-colors">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-[#1f384c]" />
                </div>
                <h3 className="font-bold text-lg sm:text-xl text-gray-800">Nivel 1: Principiante</h3>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-semibold">
                  65% Completado
                </span>
                {expandedSections.nivel1 ? <ChevronUp size={20} className="text-gray-600 sm:hidden" /> : <ChevronDown size={20} className="text-gray-600 sm:hidden" />}
                {expandedSections.nivel1 ? <ChevronUp size={24} className="text-gray-600 hidden sm:block" /> : <ChevronDown size={24} className="text-gray-600 hidden sm:block" />}
              </div>
            </div>

            {expandedSections.nivel1 && (
              <div className="p-4 sm:p-6 bg-gradient-to-br from-white to-gray-50">
                <div className="mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm font-bold mb-2 text-gray-700">Progreso nivel</p>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-[#1f384c] to-blue-600 h-2 sm:h-3 rounded-full transition-all duration-500" style={{ width: "65%" }}></div>
                    </div>
                    <p className="text-xs sm:text-sm font-bold whitespace-nowrap text-[#1f384c]">65%</p>
                  </div>
                </div>

                <p className="font-bold mt-4 sm:mt-6 mb-3 sm:mb-4 text-lg sm:text-xl text-gray-800">Temas</p>

                {/* Greeting & Introductions */}
                <div className="bg-white border border-gray-200 rounded-lg mb-3 sm:mb-4 shadow-sm">
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200 border-b border-gray-100"
                    onClick={() => toggleSection("greeting")}
                  >
                    <p className="font-medium text-gray-800">Greeting & Introductions</p>
                    {expandedSections.greeting ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                  </div>

                  {expandedSections.greeting && (
                    <div className="p-4 bg-white">
                      <p className="text-sm font-medium mb-1">Progreso</p>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-[#1f384c] h-2.5 rounded-full" style={{ width: "100%" }}></div>
                        </div>
                        <p className="text-sm whitespace-nowrap">100%</p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 mb-4 border-b border-gray-200 pb-3 gap-2">
                        <div className="flex items-center">
                          <FileText size={16} className="mr-2 text-[#1f384c]" />
                          <p className="text-sm text-gray-700">Material de apoyo: Beginners guide to english pronunciation</p>
                        </div>
                        <button
                          onClick={() => {
                            const link = document.createElement("a")
                            link.href = "/src/shared/prueba.docx"
                            link.download = "prueba.docx"
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          className="bg-white border border-[#1f384c] rounded-lg px-4 py-2 text-sm font-medium text-[#1f384c] hover:bg-[#162a3a] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0"
                        >
                          Ver material
                        </button>
                      </div>

                      <p className="font-medium mt-4 mb-3 text-gray-800">Actividades</p>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-lg border border-gray-200 gap-2">
                          <div className="flex items-center">
                            {getScoreIcon(85)}
                            <p className="text-sm font-medium text-gray-700">Canon Listening</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(85)}`}>85/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Canon Listening")}
                            className={`${getButtonColor(85)} rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0`}
                          >
                            Repetir
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-lg border border-gray-200 gap-2">
                          <div className="flex items-center">
                            {getScoreIcon(92)}
                            <p className="text-sm font-medium text-gray-700">Introducing yourself</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(92)}`}>92/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Introducing yourself")}
                            className={`${getButtonColor(92)} rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0`}
                          >
                            Repetir
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-lg border border-gray-200 gap-2">
                          <div className="flex items-center">
                            {getScoreIcon(65)}
                            <p className="text-sm font-medium text-gray-700">Support phrases</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(65)}`}>65/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Support phrases")}
                            className={`${getButtonColor(65)} rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0`}
                          >
                            Repetir
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-lg border border-gray-200 gap-2">
                          <div className="flex items-center">
                            {getScoreIcon(78)}
                            <p className="text-sm font-medium text-gray-700">Exam Greeting & Introductions</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(78)}`}>78/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Greeting & Introductions")}
                            className={`${getButtonColor(78)} rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0`}
                          >
                            Repetir
                          </button>
                        </div>
                      </div>

                      <p className="font-medium mt-4 mb-3 text-gray-800">Examen</p>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-lg border border-gray-200 gap-2">
                        <div className="flex items-center">
                          {getScoreIcon(88)}
                          <p className="text-sm font-medium text-gray-700">Greeting</p>
                          <span className={`ml-2 text-xs font-medium ${getScoreColor(88)}`}>88/100</span>
                        </div>
                        <button
                          onClick={() => handleStartExam("Greeting & Introductions")}
                          className={`${getButtonColor(88)} rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0`}
                        >
                          Repetir
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simple Present */}
                <div className="bg-white border border-gray-200 rounded-lg mb-3 sm:mb-4 shadow-sm">
                  <div
                    className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-200 border-b border-gray-100"
                    onClick={() => toggleSection("simplePresent")}
                  >
                    <p className="font-medium text-gray-800">Simple Present</p>
                    {expandedSections.simplePresent ? <ChevronUp size={20} className="text-gray-600" /> : <ChevronDown size={20} className="text-gray-600" />}
                  </div>

                  {expandedSections.simplePresent && (
                    <div className="p-4 bg-white">
                      <p className="text-sm mb-1">Progreso</p>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-[#1f384c] h-2.5 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                        <p className="text-sm whitespace-nowrap">75%</p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 mb-4 border-b border-gray-200 pb-3 gap-2">
                        <div className="flex items-center">
                          <FileText size={16} className="mr-2 text-[#1f384c]" />
                          <p className="text-sm text-gray-700">Material de apoyo: Simple Present</p>
                        </div>
                        <button
                          onClick={() => {
                            const link = document.createElement("a")
                            link.href = "/src/shared/prueba.docx"
                            link.download = "prueba.docx"
                            document.body.appendChild(link)
                            link.click()
                            document.body.removeChild(link)
                          }}
                          className="bg-white border border-[#1f384c] rounded-lg px-4 py-2 text-sm font-medium text-[#1f384c] hover:bg-[#162a3a] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0"
                        >
                          Ver material
                        </button>
                      </div>

                      <p className="font-medium mt-4 mb-3 text-gray-800">Actividades</p>
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-lg border border-gray-200 gap-2">
                          <div className="flex items-center">
                            {getScoreIcon(75)}
                            <p className="text-sm font-medium text-gray-700">Canon Listening</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(75)}`}>75/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Canon Listening")}
                            className={`${getButtonColor(75)} rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0`}
                          >
                            Repetir
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-lg border border-gray-200 gap-2">
                          <div className="flex items-center">
                            {getScoreIcon(82)}
                            <p className="text-sm font-medium text-gray-700">Introducing yourself</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(82)}`}>82/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Introducing yourself")}
                            className={`${getButtonColor(82)} rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0`}
                          >
                            Repetir
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-lg border border-gray-200 gap-2">
                          <div className="flex items-center">
                            <Circle size={16} className="mr-2 text-gray-400" />
                            <p className="text-sm font-medium text-gray-700">Support phrases</p>
                            <span className="ml-2 text-xs font-medium text-gray-500">Pendiente</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Support phrases")}
                            className="bg-white border border-[#1f384c] rounded-lg px-4 py-2 text-sm font-medium text-[#1f384c] hover:bg-[#162a3a] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0"
                          >
                            Comenzar
                          </button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-lg border border-gray-200 gap-2">
                          <div className="flex items-center">
                            {getScoreIcon(60)}
                            <p className="text-sm font-medium text-gray-700">Exam Greeting & Introductions</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(60)}`}>60/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Greeting & Introductions")}
                            className={`${getButtonColor(60)} rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0`}
                          >
                            Repetir
                          </button>
                        </div>
                      </div>

                      <p className="font-medium mt-4 mb-3 text-gray-800">Examen</p>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-3 rounded-lg border border-gray-200 gap-2">
                        <div className="flex items-center">
                          <Circle size={16} className="mr-2 text-gray-400" />
                          <p className="text-sm font-medium text-gray-700">Simple Present</p>
                          <span className="ml-2 text-xs font-medium text-gray-500">Pendiente</span>
                        </div>
                        <button
                          onClick={() => handleStartExam("Simple Present")}
                          className="bg-white border border-[#1f384c] rounded-lg px-4 py-2 text-sm font-medium text-[#1f384c] hover:bg-[#162a3a] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md flex-shrink-0"
                        >
                          Comenzar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Locked Levels */}
          <div className="space-y-3 sm:space-y-4">
            {/* Level 2 */}
            <div className="bg-gradient-to-r from-gray-50 to-purple-50 border border-purple-200 rounded-lg sm:rounded-xl p-4 sm:p-6 flex items-center opacity-80 hover:opacity-90 transition-all duration-300 shadow-md">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-lg mr-3 sm:mr-4">
                <Lock className="text-purple-400" size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-700 text-base sm:text-lg">Nivel 2: Conjugations</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">El nivel se habilitará en el trimestre correspondiente</p>
              </div>
            </div>

            {/* Level 3 */}
            <div className="bg-gradient-to-r from-gray-50 to-orange-50 border border-orange-200 rounded-lg sm:rounded-xl p-4 sm:p-6 flex items-center opacity-80 hover:opacity-90 transition-all duration-300 shadow-md">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-lg mr-3 sm:mr-4">
                <Lock className="text-orange-400" size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-700 text-base sm:text-lg">Nivel 3: Writing</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">El nivel se habilitará en el trimestre correspondiente</p>
              </div>
            </div>

            {/* Level 4 */}
            <div className="bg-gradient-to-r from-gray-50 to-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6 flex items-center opacity-80 hover:opacity-90 transition-all duration-300 shadow-md">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg mr-3 sm:mr-4">
                <Lock className="text-red-400" size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-700 text-base sm:text-lg">Nivel 4: Listening</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">El nivel se habilitará en el trimestre correspondiente</p>
              </div>
            </div>

            {/* Level 5 */}
            <div className="bg-gradient-to-r from-gray-50 to-green-50 border border-green-200 rounded-lg sm:rounded-xl p-4 sm:p-6 flex items-center opacity-80 hover:opacity-90 transition-all duration-300 shadow-md">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg mr-3 sm:mr-4">
                <Lock className="text-green-400" size={20} />
              </div>
              <div>
                <p className="font-bold text-gray-700 text-base sm:text-lg">Nivel 5: Speaking</p>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">El nivel se habilitará en el trimestre correspondiente</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Intro Modal */}
      <ExamIntroModal
        isOpen={showIntroModal}
        onClose={handleCloseExam}
        exam={currentExam}
        onStart={handleStartExamAfterIntro}
      />

      {/* Exam Modal */}
      <ExamModal isOpen={showExamModal} onClose={handleCloseExam} exam={currentExam} />
    </div>
  )
}

export default ApprenticeHomeNew