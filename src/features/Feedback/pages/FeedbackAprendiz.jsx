"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Lock } from "lucide-react"
import { useLocation } from "react-router-dom"

export default function ApprenticeFeedbackView() {
  const [expandedLevels, setExpandedLevels] = useState({ 1: true })
  const [expandedTopics, setExpandedTopics] = useState({ temas: true, greetings: true, "simple-present": true })
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const location = useLocation()

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
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 max-w-5xl">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Page Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-[#1f384c]">Mi Retroalimentación</h2>
            <p className="text-gray-600 mt-1">Revisa tu progreso en las actividades y evaluaciones</p>
          </div>

          {/* Levels */}
          <div className="p-6">
            {/* Level 1 - Expanded */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                onClick={() => toggleLevel(1)}
              >
                <h3 className="font-medium text-lg">Nivel 1</h3>
                <div className="flex items-center">
                  <div className="mr-3 font-medium">95%</div>
                  {expandedLevels[1] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {expandedLevels[1] && (
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex justify-between mb-2">
                      <span>Progreso nivel</span>
                      <span>95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>

                  {/* Temas section */}
                  <div>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <div
                        className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
                        onClick={() => toggleTopic("temas")}
                      >
                        <h4 className="font-medium text-lg">Temas</h4>
                        <div>{expandedTopics["temas"] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
                      </div>

                      {expandedTopics["temas"] && (
                        <div className="p-4">
                          {/* Topic 1 - Greetings */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                            <div
                              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                              onClick={() => toggleTopic("greetings")}
                            >
                              <h4 className="font-medium">Greetings & Introductions</h4>
                              <div className="flex items-center">
                                <div className="mr-3 font-medium">100%</div>
                                {expandedTopics["greetings"] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </div>
                            </div>

                            {expandedTopics["greetings"] && (
                              <div className="p-4 border-t border-gray-200">
                                <div className="mb-4">
                                  <div className="flex justify-between mb-2">
                                    <span>Progreso</span>
                                    <span>100%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "100%" }}></div>
                                  </div>
                                </div>

                                {/* Activities */}
                                <div className="mt-6">
                                  <div className="font-medium mb-3">Actividades:</div>

                                  <div className="space-y-3">
                                    {greetingsActivities.map((activity) => (
                                      <div key={activity.id} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-start">
                                          <input
                                            type="checkbox"
                                            checked={activity.completed}
                                            readOnly
                                            className="mt-1 mr-3"
                                          />
                                          <div className="flex-1">
                                            <div className="font-medium">{activity.name}</div>
                                            {activity.description && (
                                              <div className="text-sm text-gray-500 mt-1">{activity.description}</div>
                                            )}
                                          </div>
                                          <button
                                            className="ml-2 px-3 py-1 bg-[#1f384c] text-white text-sm rounded hover:bg-opacity-90"
                                            onClick={() => handleViewDetail(activity)}
                                          >
                                            Ver Detalle
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Exams */}
                                <div className="mt-6">
                                  <div className="font-medium mb-3">Examen:</div>

                                  <div className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-start">
                                      <input type="checkbox" checked={true} readOnly className="mt-1 mr-3" />
                                      <div className="flex-1">
                                        <div className="font-medium">Greeting</div>
                                      </div>
                                      <button
                                        className="ml-2 px-3 py-1 bg-[#1f384c] text-white text-sm rounded hover:bg-opacity-90"
                                        onClick={() =>
                                          handleViewDetail({
                                            id: "exam-1",
                                            name: "Greeting",
                                            type: "Examen",
                                            score: 95,
                                            feedback: "Excelente dominio de los saludos y presentaciones.",
                                          })
                                        }
                                      >
                                        Ver Detalle
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Topic 2 - Simple Present */}
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <div
                              className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50"
                              onClick={() => toggleTopic("simple-present")}
                            >
                              <h4 className="font-medium">Simple Present</h4>
                              <div className="flex items-center">
                                <div className="mr-3 font-medium">60%</div>
                                {expandedTopics["simple-present"] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                              </div>
                            </div>

                            {expandedTopics["simple-present"] && (
                              <div className="p-4 border-t border-gray-200">
                                <div className="mb-4">
                                  <div className="flex justify-between mb-2">
                                    <span>Progreso</span>
                                    <span>60%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "60%" }}></div>
                                  </div>
                                </div>

                                {/* Activities */}
                                <div className="mt-6">
                                  <div className="font-medium mb-3">Actividades:</div>

                                  <div className="space-y-3">
                                    {simplePresentActivities.map((activity) => (
                                      <div key={activity.id} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex items-start">
                                          <input
                                            type="checkbox"
                                            checked={activity.completed}
                                            readOnly
                                            className="mt-1 mr-3"
                                          />
                                          <div className="flex-1">
                                            <div className="font-medium">{activity.name}</div>
                                            {activity.description && (
                                              <div className="text-sm text-gray-500 mt-1">{activity.description}</div>
                                            )}
                                          </div>
                                          <button
                                            className="ml-2 px-3 py-1 bg-[#1f384c] text-white text-sm rounded hover:bg-opacity-90"
                                            onClick={() => handleViewDetail(activity)}
                                          >
                                            Ver Detalle
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Exams */}
                                <div className="mt-6">
                                  <div className="font-medium mb-3">Examen:</div>

                                  <div className="border border-gray-200 rounded-lg p-3">
                                    <div className="flex items-start">
                                      <input type="checkbox" checked={false} readOnly className="mt-1 mr-3" />
                                      <div className="flex-1">
                                        <div className="font-medium">Simple Present</div>
                                      </div>
                                      <button
                                        className="ml-2 px-3 py-1 bg-[#1f384c] text-white text-sm rounded hover:bg-opacity-90"
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
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Level 2 - Locked */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <div className="flex items-center">
                  <Lock size={18} className="mr-2" />
                  <h3 className="font-medium text-lg">Nivel 2: Conjugations</h3>
                </div>
                <div>El nivel se habilitará al terminar el correspondiente</div>
              </div>
            </div>

            {/* Level 3 - Locked */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <div className="flex items-center">
                  <Lock size={18} className="mr-2" />
                  <h3 className="font-medium text-lg">Nivel 3: Writing</h3>
                </div>
                <div>El nivel se habilitará al terminar el correspondiente</div>
              </div>
            </div>

            {/* Level 4 - Locked */}
            <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-4 bg-gray-50">
                <div className="flex items-center">
                  <Lock size={18} className="mr-2" />
                  <h3 className="font-medium text-lg">Nivel 4: Listening</h3>
                </div>
                <div>El nivel se habilitará al terminar el correspondiente</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-[#1f384c]">Detalle de Retroalimentación</h3>
            </div>

            <div className="p-6 overflow-y-auto flex-grow">
              {/* Información del nivel y tema */}
              <div className="mb-4">
                <p className="font-medium">Nivel {selectedActivity.level}</p>
                <p className="text-gray-600">Tema: {selectedActivity.topic}</p>
              </div>

              {/* Barra de progreso */}
              <div className="mb-6">
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
              <div className="mb-6">
                <div className="text-sm font-medium mb-1">Nombre de la Actividad</div>
                <div className="p-3 border border-gray-200 rounded bg-gray-50">{selectedActivity.name}</div>
              </div>

              {/* Preguntas y respuestas */}
              {selectedActivity.questions &&
                selectedActivity.questions.map((question, index) => (
                  <div key={question.id} className="mb-8 border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="mb-4">
                      <div className="text-base font-medium mb-3">{question.text}</div>
                      <div className="space-y-3">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <input
                                type="radio"
                                checked={optIndex === question.userAnswer}
                                readOnly
                                className="h-4 w-4"
                              />
                              <div className="border border-gray-200 rounded p-3 flex-1 bg-white">{option}</div>
                            </div>
                            <div className="ml-3">
                              {optIndex === question.correctAnswer ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-800 rounded-md">
                                  ✓
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 bg-red-100 text-red-800 rounded-md">
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
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded text-sm">{question.feedback}</div>
                    </div>

                    {/* Puntaje */}
                    <div className="flex justify-end mt-3">
                      <span className="text-sm font-medium">Puntos: {question.score}</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                className="px-6 py-2 bg-[#1f384c] text-white rounded hover:bg-opacity-90 transition-colors"
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
