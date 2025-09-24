"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Lock, ArrowLeft, Unlock } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

export default function ApprenticeFeedbackView() {
  const [expandedLevels, setExpandedLevels] = useState({ 1: true })
  const [expandedTopics, setExpandedTopics] = useState({ temas: true, greetings: true, "simple-present": true })
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  // Check if we should open a specific activity detail on load
  useEffect(() => {
    if (location.state && location.state.openActivity) {
      const activity = location.state.openActivity
      console.log("Received activity data:", activity) // Para depuración

      // Asegurarse de que el objeto activity tiene la estructura esperada
      if (activity && activity.name) {
        handleViewDetail(activity)
      }
    }
  }, [location.state])

  const greetingsActivities = [
    {
      id: "greeting-1",
      name: "Saludar a un compañero",
      description: "Practica cómo saludar a un compañero en diferentes momentos del día.",
      completed: true,
    },
    {
      id: "greeting-2",
      name: "Presentarte formalmente",
      description: "Aprende a presentarte en un contexto formal.",
      completed: true,
    },
  ]

  const simplePresentActivities = [
    {
      id: "simple-present-1",
      name: "Describir tu rutina diaria",
      description: "Describe las actividades que realizas en un día típico.",
      completed: true,
    },
    {
      id: "simple-present-2",
      name: "Hablar de tus hobbies",
      description: "Comparte información sobre tus pasatiempos e intereses.",
      completed: false,
    },
  ]

  // Modificar la función handleViewDetail para incluir datos de ejemplo de preguntas
  const handleViewDetail = (activity) => {
    // Si la actividad ya tiene preguntas, usarlas directamente
    if (activity.questions) {
      setSelectedActivity({
        ...activity,
        level: activity.level || "1",
        topic: activity.topic || (activity.name?.includes("Simple Present") ? "simple present" : "greetings"),
      })
      setShowDetailModal(true)
      return
    }

    // Si no tiene preguntas, crear datos de ejemplo (código existente)
    const activityWithQuestions = {
      ...activity,
      level: "1",
      topic: activity.id?.includes("simple-present") ? "simple present" : "greetings",
      questions: [
        {
          id: "q1",
          text: "What is your name?",
          options: ["I'm Jennifer is Ibraham", "My name is Jennifer", "Me llamo Jennifer", "I am Jennifer"],
          correctAnswer: 1,
          userAnswer: 0,
          score: 20,
          maxScore: 20,
          feedback:
            "Error: La respuesta correcta es 'My name is Jennifer'. La estructura 'I'm Jennifer is Ibraham' mezcla dos formas de presentación y contiene un error gramatical. Recuerda que 'I'm' ya es una contracción de 'I am'.",
        },
        {
          id: "q2",
          text: "What is your address?",
          options: [
            "I'm address is street 2",
            "My address is 123 Main Street",
            "I live on 123 Main Street",
            "I live at 123 Main Street",
          ],
          correctAnswer: 3,
          userAnswer: 0,
          score: 0,
          maxScore: 20,
          feedback:
            "Error: La respuesta correcta es 'I live at 123 Main Street'. La estructura 'I'm address is street 2' contiene varios errores: 'I'm' es incorrecto (debería ser 'My'), y la dirección es demasiado vaga. En inglés, usamos 'at' para indicar una dirección específica.",
        },
        {
          id: "q3",
          text: "Where are you from?",
          options: ["I'm from Colombia", "I am Colombia", "I from Colombia", "My country is Colombia"],
          correctAnswer: 0,
          userAnswer: 2,
          score: 0,
          maxScore: 20,
          feedback:
            "Error: La respuesta correcta es 'I'm from Colombia'. La estructura 'I from Colombia' omite el verbo auxiliar 'am'. Recuerda que siempre necesitas un verbo en la oración en inglés.",
        },
        {
          id: "q4",
          text: "How old are you?",
          options: ["I have 25 years old", "I am 25 years", "I am 25 years old", "My age is 25 years"],
          correctAnswer: 2,
          userAnswer: 0,
          score: 0,
          maxScore: 20,
          feedback:
            "Error: La respuesta correcta es 'I am 25 years old'. La estructura 'I have 25 years old' es una traducción literal del español. En inglés, usamos el verbo 'to be' (am/is/are) para expresar la edad, no el verbo 'to have'.",
        },
      ],
      score: activity.id?.includes("exam-1") ? 95 : activity.id?.includes("exam-2") ? 0 : 85,
    }

    setSelectedActivity(activityWithQuestions)
    setShowDetailModal(true)
  }

  const toggleLevel = (levelId) => {
    setExpandedLevels((prev) => ({
      ...prev,
      [levelId]: !prev[levelId],
    }))
  }

  const toggleTopic = (topicId) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId],
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-3 sm:mr-4 p-1 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#1f384c]">
                  Retroalimentación del Aprendiz
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Revisa tu progreso y retroalimentación detallada
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Level 1 - Unlocked */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div 
              className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpandedLevels(prev => ({ ...prev, 1: !prev[1] }))}
            >
              <div className="flex items-center mb-2 sm:mb-0">
                <Unlock size={18} className="mr-2 sm:mr-3 text-green-600 flex-shrink-0" />
                <h3 className="font-medium text-lg sm:text-xl">Nivel 1: Vocabulary</h3>
              </div>
              <div className="flex items-center justify-between sm:justify-end">
                <span className="text-sm sm:text-base text-gray-600 mr-2 sm:mr-4">
                  Progreso: 75%
                </span>
                {expandedLevels[1] ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </div>
            </div>

            {expandedLevels[1] && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Activities Section */}
                    <div>
                      <h4 className="font-medium text-base sm:text-lg mb-3 sm:mb-4 text-[#1f384c]">
                        Actividades
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        {/* Activity 1 */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div className="flex-1 mb-2 sm:mb-0">
                              <div className="font-medium text-sm sm:text-base">Colors and Numbers</div>
                              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                Calificación: 85%
                              </div>
                            </div>
                            <button
                              className="w-full sm:w-auto px-3 py-2 bg-[#1f384c] text-white text-xs sm:text-sm rounded hover:bg-opacity-90 transition-colors"
                              onClick={() =>
                                handleViewDetail({
                                  id: "activity-1",
                                  name: "Colors and Numbers",
                                  type: "Actividad",
                                  level: 1,
                                  topic: "Vocabulary",
                                  score: 85,
                                  feedback: "Excelente trabajo en vocabulario básico",
                                  questions: [
                                    {
                                      id: 1,
                                      text: "What color is the sky?",
                                      options: ["Blue", "Red", "Green", "Yellow"],
                                      correctAnswer: 0,
                                      userAnswer: 0,
                                      feedback: "Correcto! El cielo es azul.",
                                      score: 10,
                                    },
                                    {
                                      id: 2,
                                      text: "How many fingers do you have?",
                                      options: ["Eight", "Nine", "Ten", "Eleven"],
                                      correctAnswer: 2,
                                      userAnswer: 1,
                                      feedback: "Incorrecto. Los humanos tienen diez dedos.",
                                      score: 0,
                                    },
                                  ],
                                })
                              }
                            >
                              Ver Detalle
                            </button>
                          </div>
                        </div>

                        {/* Activity 2 */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div className="flex-1 mb-2 sm:mb-0">
                              <div className="font-medium text-sm sm:text-base">Family Members</div>
                              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                Calificación: 92%
                              </div>
                            </div>
                            <button
                              className="w-full sm:w-auto px-3 py-2 bg-[#1f384c] text-white text-xs sm:text-sm rounded hover:bg-opacity-90 transition-colors"
                              onClick={() =>
                                handleViewDetail({
                                  id: "activity-2",
                                  name: "Family Members",
                                  type: "Actividad",
                                  level: 1,
                                  topic: "Vocabulary",
                                  score: 92,
                                  feedback: "Muy buen dominio del vocabulario familiar",
                                  questions: [
                                    {
                                      id: 1,
                                      text: "What do you call your father's brother?",
                                      options: ["Cousin", "Uncle", "Nephew", "Grandfather"],
                                      correctAnswer: 1,
                                      userAnswer: 1,
                                      feedback: "Correcto! Uncle es el hermano del padre.",
                                      score: 10,
                                    },
                                  ],
                                })
                              }
                            >
                              Ver Detalle
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Exams Section */}
                    <div>
                      <h4 className="font-medium text-base sm:text-lg mb-3 sm:mb-4 text-[#1f384c]">
                        Exámenes
                      </h4>
                      <div className="space-y-3 sm:space-y-4">
                        {/* Exam 1 */}
                        <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div className="flex-1 mb-2 sm:mb-0">
                              <div className="font-medium text-sm sm:text-base">Vocabulary Test</div>
                              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                Calificación: 78%
                              </div>
                            </div>
                            <button
                              className="w-full sm:w-auto px-3 py-2 bg-[#1f384c] text-white text-xs sm:text-sm rounded hover:bg-opacity-90 transition-colors"
                              onClick={() =>
                                handleViewDetail({
                                  id: "exam-1",
                                  name: "Vocabulary Test",
                                  type: "Examen",
                                  level: 1,
                                  topic: "Vocabulary",
                                  score: 78,
                                  feedback: "Buen desempeño general, revisar algunos conceptos",
                                })
                              }
                            >
                              Ver Detalle
                            </button>
                          </div>
                        </div>

                        {/* Exam 2 - Pending */}
                        <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <div className="flex-1 mb-2 sm:mb-0">
                              <div className="font-medium text-sm sm:text-base">Simple Present</div>
                              <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                Pendiente de realizar
                              </div>
                            </div>
                            <button
                              className="w-full sm:w-auto px-3 py-2 bg-[#1f384c] text-white text-xs sm:text-sm rounded hover:bg-opacity-90 transition-colors"
                              onClick={() =>
                                handleViewDetail({
                                  id: "exam-2",
                                  name: "Simple Present",
                                  type: "Examen",
                                  score: 0,
                                  feedback: "Pendiente de realizar",
                                })
                              }
                            >
                              Ver Detalle
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Level 2 - Locked */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 bg-gray-50">
              <div className="flex items-center mb-2 sm:mb-0">
                <Lock size={18} className="mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <h3 className="font-medium text-lg sm:text-xl text-gray-600">Nivel 2: Conjugations</h3>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                El nivel se habilitará al terminar el correspondiente
              </div>
            </div>
          </div>

          {/* Level 3 - Locked */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 bg-gray-50">
              <div className="flex items-center mb-2 sm:mb-0">
                <Lock size={18} className="mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <h3 className="font-medium text-lg sm:text-xl text-gray-600">Nivel 3: Writing</h3>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                El nivel se habilitará al terminar el correspondiente
              </div>
            </div>
          </div>

          {/* Level 4 - Locked */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 sm:p-6 bg-gray-50">
              <div className="flex items-center mb-2 sm:mb-0">
                <Lock size={18} className="mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <h3 className="font-medium text-lg sm:text-xl text-gray-600">Nivel 4: Listening</h3>
              </div>
              <div className="text-xs sm:text-sm text-gray-500">
                El nivel se habilitará al terminar el correspondiente
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-[#1f384c]">
                Detalle de Retroalimentación
              </h3>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
              {/* Información del nivel y tema */}
              <div className="mb-4 sm:mb-6">
                <p className="font-medium text-sm sm:text-base">Nivel {selectedActivity.level}</p>
                <p className="text-gray-600 text-sm sm:text-base">Tema: {selectedActivity.topic}</p>
              </div>

              {/* Barra de progreso */}
              <div className="mb-4 sm:mb-6">
                <div className="text-sm font-medium mb-1">Calificación</div>
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div></div>
                    <div className="text-right">
                      <span className="text-sm font-semibold inline-block text-gray-800">
                        {selectedActivity.score}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${selectedActivity.score}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                    ></div>
                  </div>
                </div>
              </div>

              {/* Nombre de la actividad */}
              <div className="mb-4 sm:mb-6">
                <div className="text-sm font-medium mb-1">Nombre de la Actividad</div>
                <div className="p-3 border border-gray-200 rounded bg-gray-50 text-sm sm:text-base">
                  {selectedActivity.name}
                </div>
              </div>

              {/* Preguntas y respuestas */}
              {selectedActivity.questions &&
                selectedActivity.questions.map((question, index) => (
                  <div key={question.id} className="mb-6 sm:mb-8 border-b border-gray-200 pb-4 sm:pb-6 last:border-b-0">
                    <div className="mb-4">
                      <div className="text-sm sm:text-base font-medium mb-3">{question.text}</div>
                      <div className="space-y-2 sm:space-y-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center justify-between gap-2 sm:gap-3">
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <input
                                type="radio"
                                checked={optIndex === question.userAnswer}
                                readOnly
                                className="h-4 w-4 flex-shrink-0"
                              />
                              <div className="border border-gray-200 rounded p-2 sm:p-3 flex-1 bg-white text-sm sm:text-base break-words">
                                {option}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {optIndex === question.correctAnswer ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-md text-sm">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-800 rounded-md text-sm">
                                  ✗
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Retroalimentación */}
                    <div className="mt-4">
                      <div className="text-sm font-medium mb-2">Retroalimentación</div>
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded text-xs sm:text-sm">
                        {question.feedback}
                      </div>
                    </div>

                    {/* Puntaje */}
                    <div className="flex justify-end mt-3">
                      <span className="text-xs sm:text-sm font-medium">Puntos: {question.score}</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end">
              <button
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#1f384c] text-white rounded hover:bg-opacity-90 transition-colors text-sm sm:text-base"
                onClick={() => setShowDetailModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
