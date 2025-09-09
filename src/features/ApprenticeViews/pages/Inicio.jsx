"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, BookOpen, CheckCircle, Circle, Lock, FileText, X } from "lucide-react"
import ExamModal from "../components/ExamModal"
import ExamIntroModal from "../components/ExamIntroModal"
import { useExams } from "../hooks/useExams"

const Home = () => {
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
    <div className="flex flex-col items-center justify-center bg-gray-100 min-h-screen w-full p-5">
      <div className="w-full max-w-6xl bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b">
          <h1 className="text-xl font-bold text-center text-[#1f384c]">WELCOME BACK, DANIEL!</h1>
        </div>

        {/* Info Cards */}
        <div className="p-4 space-y-3">
          <div className="border rounded-md p-3 flex items-center">
            <BookOpen className="mr-3 text-[#1f384c]" size={25} />
            <div>
              <p className="font-semibold">Nivel actual</p>
              <p className="text-sm font-medium">Nivel 1</p>
            </div>
          </div>

          <div className="border rounded-md p-3 flex items-center">
            <CheckCircle className="mr-3 text-[#1f384c]" size={25} />
            <div>
              <p className="font-semibold">Evaluaciones completadas</p>
              <p className="text-sm font-medium">8 / 10</p>
            </div>
          </div>
        </div>

        {/* Learning Path */}
        <div className="p-4">
          <h2 className="text-lg font-bold text-[#1f384c] mb-3">Tu camino de aprendizaje</h2>

          {/* Level 1 */}
          <div className="border rounded-md mb-4 overflow-hidden">
            <div
              className="flex justify-between items-center p-3 bg-white cursor-pointer"
              onClick={() => toggleSection("nivel1")}
            >
              <h3 className="font-semibold">Nivel 1: Principiante</h3>
              {expandedSections.nivel1 ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>

            {expandedSections.nivel1 && (
              <div className="p-3 border-t">
                <p className="text-sm font-medium mb-1">Progreso nivel</p>
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                    <div className="bg-[#1f384c] h-2.5 rounded-full" style={{ width: "65%" }}></div>
                  </div>
                  <p className="text-sm whitespace-nowrap">65%</p>
                </div>

                <p className="font-semibold mt-4 mb-2">Temas</p>

                {/* Greeting & Introductions */}
                <div className="border rounded-md mb-3">
                  <div
                    className="flex justify-between items-center p-3 cursor-pointer"
                    onClick={() => toggleSection("greeting")}
                  >
                    <p className="font-medium">Greeting & Introductions</p>
                    {expandedSections.greeting ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {expandedSections.greeting && (
                    <div className="p-3 border-t">
                      <p className="text-sm font-medium mb-1">Progreso</p>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-[#1f384c] h-2.5 rounded-full" style={{ width: "100%" }}></div>
                        </div>
                        <p className="text-sm whitespace-nowrap">100%</p>
                      </div>

                      <div className="flex justify-between items-center mt-4 mb-4 border-b pb-2">
                        <div className="flex items-center">
                          <FileText size={16} className="mr-2" />
                          <p className="text-sm">Material de apoyo: Beginners guide to english pronunciation</p>
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
                          className="bg-white border border-[#1f384c] rounded-md px-3 py-1 text-xs hover:bg-[#1f384c] hover:text-white transition-colors duration-300"
                        >
                          Ver material
                        </button>
                      </div>

                      <p className="font-medium mt-3 mb-2">Actividades</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {getScoreIcon(85)}
                            <p className="text-sm">Canon Listening</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(85)}`}>85/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Canon Listening")}
                            className={`${getButtonColor(85)} rounded-md px-3 py-1 text-xs transition-colors duration-300`}
                          >
                            Repetir
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {getScoreIcon(92)}
                            <p className="text-sm">Introducing yourself</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(92)}`}>92/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Introducing yourself")}
                            className={`${getButtonColor(92)} rounded-md px-3 py-1 text-xs transition-colors duration-300`}
                          >
                            Repetir
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {getScoreIcon(65)}
                            <p className="text-sm">Support phrases</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(65)}`}>65/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Support phrases")}
                            className={`${getButtonColor(65)} rounded-md px-3 py-1 text-xs transition-colors duration-300`}
                          >
                            Repetir
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {getScoreIcon(78)}
                            <p className="text-sm">Exam Greeting & Introductions</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(78)}`}>78/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Greeting & Introductions")}
                            className={`${getButtonColor(78)} rounded-md px-3 py-1 text-xs transition-colors duration-300`}
                          >
                            Repetir
                          </button>
                        </div>
                      </div>

                      <p className="font-medium mt-3 mb-2">Examen</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {getScoreIcon(88)}
                          <p className="text-sm">Greeting</p>
                          <span className={`ml-2 text-xs font-medium ${getScoreColor(88)}`}>88/100</span>
                        </div>
                        <button
                          onClick={() => handleStartExam("Greeting & Introductions")}
                          className={`${getButtonColor(88)} rounded-md px-3 py-1 text-xs transition-colors duration-300`}
                        >
                          Repetir
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Simple Present */}
                <div className="border rounded-md mb-3">
                  <div
                    className="flex justify-between items-center p-3 cursor-pointer"
                    onClick={() => toggleSection("simplePresent")}
                  >
                    <p className="font-medium">Simple Present</p>
                    {expandedSections.simplePresent ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  {expandedSections.simplePresent && (
                    <div className="p-3 border-t">
                      <p className="text-sm mb-1">Progreso</p>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div className="bg-[#1f384c] h-2.5 rounded-full" style={{ width: "75%" }}></div>
                        </div>
                        <p className="text-sm whitespace-nowrap">75%</p>
                      </div>

                      <div className="flex justify-between items-center mt-4 mb-4 border-b pb-2">
                        <div className="flex items-center">
                          <FileText size={16} className="mr-2" />
                          <p className="text-sm">Material de apoyo: Simple Present</p>
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
                          className="bg-white border border-[#1f384c] rounded-md px-3 py-1 text-xs hover:bg-[#1f384c] hover:text-white transition-colors duration-300"
                        >
                          Ver material
                        </button>
                      </div>

                      <p className="font-medium mt-3 mb-2">Actividades</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {getScoreIcon(75)}
                            <p className="text-sm">Canon Listening</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(75)}`}>75/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Canon Listening")}
                            className={`${getButtonColor(75)} rounded-md px-3 py-1 text-xs transition-colors duration-300`}
                          >
                            Repetir
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {getScoreIcon(82)}
                            <p className="text-sm">Introducing yourself</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(82)}`}>82/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Introducing yourself")}
                            className={`${getButtonColor(82)} rounded-md px-3 py-1 text-xs transition-colors duration-300`}
                          >
                            Repetir
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <Circle size={16} className="mr-2" />
                            <p className="text-sm">Support phrases</p>
                            <span className="ml-2 text-xs font-medium text-gray-500">Pendiente</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Support phrases")}
                            className="bg-white border border-[#1f384c] rounded-md px-3 py-1 text-xs hover:bg-[#1f384c] hover:text-white transition-colors duration-300"
                          >
                            Comenzar
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            {getScoreIcon(60)}
                            <p className="text-sm">Exam Greeting & Introductions</p>
                            <span className={`ml-2 text-xs font-medium ${getScoreColor(60)}`}>60/100</span>
                          </div>
                          <button
                            onClick={() => handleStartExam("Greeting & Introductions")}
                            className={`${getButtonColor(60)} rounded-md px-3 py-1 text-xs transition-colors duration-300`}
                          >
                            Repetir
                          </button>
                        </div>
                      </div>

                      <p className="font-medium mt-3 mb-2">Examen</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Circle size={16} className="mr-2" />
                          <p className="text-sm">Simple Present</p>
                          <span className="ml-2 text-xs font-medium text-gray-500">Pendiente</span>
                        </div>
                        <button
                          onClick={() => handleStartExam("Simple Present")}
                          className="bg-white border border-[#1f384c] rounded-md px-3 py-1 text-xs hover:bg-[#1f384c] hover:text-white transition-colors duration-300"
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
          <div className="space-y-3">
            {/* Level 2 */}
            <div className="border rounded-md p-3 flex items-center">
              <Lock className="mr-3 text-gray-500" size={20} />
              <div>
                <p className="font-bold">Nivel 2: Conjugations</p>
                <p className="text-sm text-gray-500">El nivel se habilitará en el trimestre correspondiente</p>
              </div>
            </div>

            {/* Level 3 */}
            <div className="border rounded-md p-3 flex items-center">
              <Lock className="mr-3 text-gray-500" size={20} />
              <div>
                <p className="font-bold">Nivel 3: Writing</p>
                <p className="text-sm text-gray-500">El nivel se habilitará en el trimestre correspondiente</p>
              </div>
            </div>

            {/* Level 4 */}
            <div className="border rounded-md p-3 flex items-center">
              <Lock className="mr-3 text-gray-500" size={20} />
              <div>
                <p className="font-bold">Nivel 4: Listening</p>
                <p className="text-sm text-gray-500">El nivel se habilitará en el trimestre correspondiente</p>
              </div>
            </div>

            {/* Level 5 */}
            <div className="border rounded-md p-3 flex items-center">
              <Lock className="mr-3 text-gray-500" size={20} />
              <div>
                <p className="font-bold">Nivel 5: Speaking</p>
                <p className="text-sm text-gray-500">El nivel se habilitará en el trimestre correspondiente</p>
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

export default Home