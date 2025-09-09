"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Lock, BookOpen, Hand, FileText, Target, ClipboardList, X, Check, BarChart3, HelpCircle, Lightbulb } from "lucide-react"
import { useLocation } from "react-router-dom"
import ApprenticeHeader from "../components/ApprenticeHeader"

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <ApprenticeHeader title="Mi Retroalimentación" subtitle="Revisa tu progreso en las actividades y evaluaciones" />
        
        {/* Main Content */}
        <main className="container mx-auto py-6 sm:py-8 lg:py-12 px-4 sm:px-6 max-w-7xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl overflow-hidden border border-gray-200/50">

          {/* Levels */}
          <div className="p-4 sm:p-6 lg:p-10">
            {/* Level 1 - Expanded */}
            <div className="mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
              <div
                className="flex justify-between items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 cursor-pointer hover:from-blue-200/80 hover:to-indigo-200/80 transition-all duration-300 backdrop-blur-sm"
                onClick={() => toggleLevel(1)}
              >
                <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm sm:text-base lg:text-lg">1</span>
                  </div>
                  <h3 className="font-bold text-lg sm:text-xl lg:text-2xl bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">Nivel 1</h3>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
                  <div className="text-right">
                    <div className="font-bold text-lg sm:text-xl lg:text-2xl text-blue-600">95%</div>
                    <div className="text-xs sm:text-sm text-blue-500 font-medium">Completado</div>
                  </div>
                  {expandedLevels[1] ? <ChevronUp size={20} className="text-blue-600 hover:text-blue-700 transition-colors sm:hidden" /> : <ChevronDown size={20} className="text-blue-600 hover:text-blue-700 transition-colors sm:hidden" />}
                  {expandedLevels[1] ? <ChevronUp size={28} className="text-blue-600 hover:text-blue-700 transition-colors hidden sm:block" /> : <ChevronDown size={28} className="text-blue-600 hover:text-blue-700 transition-colors hidden sm:block" />}
                </div>
              </div>

              {expandedLevels[1] && (
                <div className="p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-white to-blue-50/20">
                  <div className="mb-6 sm:mb-8 lg:mb-10">
                    <div className="flex justify-between mb-3 sm:mb-4">
                      <span className="font-bold text-sm sm:text-base lg:text-lg text-gray-700">Progreso del Nivel</span>
                      <span className="font-bold text-lg sm:text-xl text-green-600">95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                      <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-4 rounded-full shadow-lg transform transition-all duration-500 hover:scale-105" style={{ width: "95%" }}></div>
                    </div>
                  </div>

                  {/* Temas section */}
                  <div>
                    <div className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-300/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                      <div
                        className="flex justify-between items-center p-4 sm:p-5 lg:p-6 bg-gradient-to-r from-gray-100/80 to-gray-200/80 cursor-pointer hover:from-gray-200/80 hover:to-gray-300/80 transition-all duration-300 backdrop-blur-sm"
                        onClick={() => toggleTopic("temas")}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-lg flex items-center justify-center shadow-md">
                            <BookOpen className="w-4 h-4 text-white" />
                          </div>
                          <h4 className="font-bold text-base sm:text-lg lg:text-xl bg-gradient-to-r from-gray-700 to-gray-800 bg-clip-text text-transparent">Temas</h4>
                        </div>
                        <div>{expandedTopics["temas"] ? <ChevronUp size={20} className="text-gray-600 hover:text-gray-700 transition-colors sm:hidden" /> : <ChevronDown size={20} className="text-gray-600 hover:text-gray-700 transition-colors sm:hidden" />}</div>
                        <div className="hidden sm:block">{expandedTopics["temas"] ? <ChevronUp size={26} className="text-gray-600 hover:text-gray-700 transition-colors" /> : <ChevronDown size={26} className="text-gray-600 hover:text-gray-700 transition-colors" />}</div>
                      </div>

                      {expandedTopics["temas"] && (
                        <div className="p-4 sm:p-6 lg:p-8">
                          {/* Topic 1 - Greetings */}
                          <div className="bg-gradient-to-br from-white to-green-50/30 border border-green-200/50 rounded-xl sm:rounded-2xl overflow-hidden mb-6 sm:mb-8 shadow-lg hover:shadow-xl transition-all duration-300">
                            <div
                              className="flex justify-between items-center p-4 sm:p-5 lg:p-6 cursor-pointer bg-gradient-to-r from-green-100/80 to-emerald-100/80 hover:from-green-200/80 hover:to-emerald-200/80 transition-all duration-300 backdrop-blur-sm"
                              onClick={() => toggleTopic("greetings")}
                            >
                              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                                  <Hand className="w-4 h-4 text-white" />
                                </div>
                                <h4 className="font-bold text-base sm:text-lg lg:text-xl bg-gradient-to-r from-green-700 to-emerald-700 bg-clip-text text-transparent">Greetings & Introductions</h4>
                              </div>
                              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                                <div className="text-right">
                                  <div className="font-bold text-lg sm:text-xl text-green-600">100%</div>
                                  <div className="text-xs sm:text-sm text-green-500 font-medium">Completado</div>
                                </div>
                                {expandedTopics["greetings"] ? <ChevronUp size={20} className="text-green-600 hover:text-green-700 transition-colors sm:hidden" /> : <ChevronDown size={20} className="text-green-600 hover:text-green-700 transition-colors sm:hidden" />}
                                {expandedTopics["greetings"] ? <ChevronUp size={24} className="text-green-600 hover:text-green-700 transition-colors hidden sm:block" /> : <ChevronDown size={24} className="text-green-600 hover:text-green-700 transition-colors hidden sm:block" />}
                              </div>
                            </div>

                            {expandedTopics["greetings"] && (
                              <div className="p-8 border-t border-green-200/50 bg-gradient-to-br from-white to-green-50/20">
                                <div className="mb-8">
                                  <div className="flex justify-between mb-4">
                                    <span className="font-bold text-lg text-gray-700">Progreso del Tema</span>
                                    <span className="font-bold text-xl text-green-600">100%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                                    <div className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-4 rounded-full shadow-lg transform transition-all duration-500 hover:scale-105" style={{ width: "100%" }}></div>
                                  </div>
                                </div>

                                {/* Activities */}
                                <div className="mt-10">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                      <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="font-bold text-xl text-gray-800">Actividades</div>
                                  </div>

                                  <div className="space-y-6">
                                    {greetingsActivities.map((activity) => (
                                      <div key={activity.id} className="bg-gradient-to-br from-white to-blue-50/30 border border-blue-200/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="flex items-start gap-6">
                                          <div className="flex items-center justify-center w-6 h-6 mt-1">
                                            <input
                                              type="checkbox"
                                              checked={activity.completed}
                                              readOnly
                                              className="h-5 w-5 text-green-600 rounded-md border-2 border-green-300 focus:ring-green-500"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <div className="font-bold text-lg text-gray-800 mb-2">{activity.name}</div>
                                            {activity.description && (
                                              <div className="text-sm text-gray-600 leading-relaxed">{activity.description}</div>
                                            )}
                                          </div>
                                          <button
                                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
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
                                <div className="mt-10">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                                      <Target className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="font-bold text-xl text-gray-800">Examen</div>
                                  </div>

                                  <div className="bg-gradient-to-br from-white to-purple-50/30 border border-purple-200/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-start gap-6">
                                      <div className="flex items-center justify-center w-6 h-6 mt-1">
                                        <input type="checkbox" checked={true} readOnly className="h-5 w-5 text-green-600 rounded-md border-2 border-green-300 focus:ring-green-500" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-bold text-lg text-gray-800 mb-2">Greeting</div>
                                        <div className="flex items-center gap-2">
                                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Completado</span>
                                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">95% - Excelente</span>
                                        </div>
                                      </div>
                                      <button
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
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
                          <div className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                            <div
                              className="flex justify-between items-center p-6 cursor-pointer bg-gradient-to-r from-orange-100/80 to-amber-100/80 hover:from-orange-200/80 hover:to-amber-200/80 transition-all duration-300 backdrop-blur-sm"
                              onClick={() => toggleTopic("simple-present")}
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                                  <span className="text-white font-bold text-sm">⏰</span>
                                </div>
                                <h4 className="font-bold text-lg bg-gradient-to-r from-orange-700 to-amber-700 bg-clip-text text-transparent">Simple Present</h4>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="font-bold text-lg text-orange-600">60%</div>
                                  <div className="text-xs text-orange-500 font-medium">En progreso</div>
                                </div>
                                {expandedTopics["simple-present"] ? <ChevronUp size={24} className="text-orange-600 hover:text-orange-700 transition-colors" /> : <ChevronDown size={24} className="text-orange-600 hover:text-orange-700 transition-colors" />}
                              </div>
                            </div>

                            {expandedTopics["simple-present"] && (
                              <div className="p-8 border-t border-orange-200/50 bg-gradient-to-br from-white to-orange-50/20">
                                <div className="mb-8">
                                  <div className="flex justify-between mb-4">
                                    <span className="font-bold text-lg text-gray-700">Progreso del Tema</span>
                                    <span className="font-bold text-xl text-orange-600">60%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                                    <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 h-4 rounded-full shadow-lg transform transition-all duration-500 hover:scale-105" style={{ width: "60%" }}></div>
                                  </div>
                                </div>

                                {/* Activities */}
                                <div className="mt-10">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                                      <FileText className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="font-bold text-xl text-gray-800">Actividades</div>
                                  </div>

                                  <div className="space-y-6">
                                    {simplePresentActivities.map((activity) => (
                                      <div key={activity.id} className="bg-gradient-to-br from-white to-orange-50/30 border border-orange-200/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="flex items-start gap-6">
                                          <div className="flex items-center justify-center w-6 h-6 mt-1">
                                            <input
                                              type="checkbox"
                                              checked={activity.completed}
                                              readOnly
                                              className="h-5 w-5 text-green-600 rounded-md border-2 border-green-300 focus:ring-green-500"
                                            />
                                          </div>
                                          <div className="flex-1">
                                            <div className="font-bold text-lg text-gray-800 mb-2">{activity.name}</div>
                                            {activity.description && (
                                              <div className="text-sm text-gray-600 leading-relaxed">{activity.description}</div>
                                            )}
                                          </div>
                                          <button
                                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
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
                                <div className="mt-10">
                                  <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                                      <Target className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="font-bold text-xl text-gray-800">Examen</div>
                                  </div>

                                  <div className="bg-gradient-to-br from-white to-purple-50/30 border border-purple-200/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                    <div className="flex items-start gap-6">
                                      <div className="flex items-center justify-center w-6 h-6 mt-1">
                                        <input type="checkbox" checked={false} readOnly className="h-5 w-5 text-green-600 rounded-md border-2 border-green-300 focus:ring-green-500" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="font-bold text-lg text-gray-800 mb-2">Simple Present</div>
                                        <div className="flex items-center gap-2">
                                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Pendiente</span>
                                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">No realizado</span>
                                        </div>
                                      </div>
                                      <button
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
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
            <div className="mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm opacity-60">
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-100 to-gray-200">
                <div className="flex items-center">
                  <Lock size={24} className="mr-4 text-gray-500" />
                  <h3 className="font-semibold text-xl text-gray-700">Nivel 2: Conjugations</h3>
                </div>
                <div className="font-semibold text-lg text-gray-600">0%</div>
              </div>
            </div>

            {/* Level 3 - Locked */}
            <div className="mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm opacity-60">
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-100 to-gray-200">
                <div className="flex items-center">
                  <Lock size={24} className="mr-4 text-gray-500" />
                  <h3 className="font-semibold text-xl text-gray-700">Nivel 3: Writing</h3>
                </div>
                <div className="font-semibold text-lg text-gray-600">0%</div>
              </div>
            </div>

            {/* Level 4 - Locked */}
            <div className="mb-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm opacity-60">
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-100 to-gray-200">
                <div className="flex items-center">
                  <Lock size={24} className="mr-4 text-gray-500" />
                  <h3 className="font-semibold text-xl text-gray-700">Nivel 4: Listening</h3>
                </div>
                <div className="font-semibold text-lg text-gray-600">0%</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Activity Detail Modal */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-gradient-to-br from-white to-blue-50/30 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col border border-blue-200/50">
            <div className="p-4 sm:p-6 lg:p-8 border-b border-blue-200/50 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm">
              <div className="flex justify-between items-start sm:items-center">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent leading-tight">Detalle de Retroalimentación</h3>
                    <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-100 px-2 sm:px-3 py-1 rounded-full inline-block truncate max-w-full">{selectedActivity.name}</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-all duration-300 p-1 sm:p-2 hover:bg-white/50 rounded-lg sm:rounded-xl ml-2 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 overflow-y-auto flex-grow">
              {/* Información del nivel y tema */}
              <div className="mb-6 sm:mb-8 lg:mb-10">
                <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-blue-200/50 shadow-lg">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                      <span className="text-white font-bold text-xs sm:text-sm">ℹ️</span>
                    </div>
                    <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Información de la Actividad</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    <div className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                      <span className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wide">Nivel:</span>
                      <div className="text-gray-800 font-bold text-sm sm:text-base lg:text-lg mt-1">{selectedActivity.level}</div>
                    </div>
                    <div className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                      <span className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wide">Tema:</span>
                      <div className="text-gray-800 font-bold text-sm sm:text-base lg:text-lg mt-1">{selectedActivity.topic}</div>
                    </div>
                    <div className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                      <span className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wide">Nombre:</span>
                      <div className="text-gray-800 font-bold text-sm sm:text-base lg:text-lg mt-1">{selectedActivity.name}</div>
                    </div>
                    <div className="bg-white/60 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-blue-100">
                      <span className="text-xs sm:text-sm font-bold text-blue-600 uppercase tracking-wide">Estado:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1"><Check className="w-3 h-3" /> Completado</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-br from-white to-green-50/30 border border-green-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Calificación</div>
                </div>
                <div className="relative">
                  <div className="flex mb-3 sm:mb-4 items-center justify-between">
                    <span className="font-bold text-sm sm:text-base lg:text-lg text-gray-700">Puntuación obtenida</span>
                    <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
                      {selectedActivity.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 shadow-inner">
                    <div
                      style={{ width: `${selectedActivity.score}%` }}
                      className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 h-3 sm:h-4 rounded-full shadow-lg transform transition-all duration-500 hover:scale-105"
                    ></div>
                  </div>
                </div>
              </div>

              {/* Preguntas y respuestas */}
              {selectedActivity.questions && (
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 lg:mb-8">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                      <HelpCircle className="w-4 h-4 text-white" />
                    </div>
                    <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">Preguntas y Retroalimentación</h4>
                  </div>
                  {selectedActivity.questions.map((question, index) => (
                    <div key={question.id} className="mb-6 sm:mb-8 lg:mb-10 bg-gradient-to-br from-white to-purple-50/30 border border-purple-200/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg hover:shadow-xl transition-all duration-300">
                      <div className="mb-4 sm:mb-6 lg:mb-8">
                        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                            <span className="text-white font-bold text-xs sm:text-sm">{index + 1}</span>
                          </div>
                          <div className="text-base sm:text-lg lg:text-xl font-bold text-gray-800">Pregunta {index + 1}: {question.text}</div>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center justify-between gap-2 sm:gap-4">
                              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
                                <input
                                  type="radio"
                                  checked={optIndex === question.userAnswer}
                                  readOnly
                                  className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600 flex-shrink-0"
                                />
                                <div className={`border-2 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-5 flex-1 font-bold text-sm sm:text-base lg:text-lg transition-all duration-300 shadow-sm min-w-0 ${
                                  optIndex === question.correctAnswer
                                    ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-green-200'
                                    : optIndex === question.userAnswer
                                    ? 'border-red-400 bg-gradient-to-r from-red-50 to-pink-50 text-red-800 shadow-red-200'
                                    : 'border-gray-300 bg-gradient-to-r from-white to-gray-50 text-gray-700 hover:border-gray-400'
                                }`}>{option}</div>
                              </div>
                              <div className="flex-shrink-0">
                                {optIndex === question.correctAnswer ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-green-400 to-emerald-500 text-white rounded-full font-bold text-base sm:text-lg lg:text-xl shadow-lg">
                                    <Check className="w-4 h-4 text-green-600" />
                                  </span>
                                ) : optIndex === question.userAnswer ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-full font-bold text-base sm:text-lg lg:text-xl shadow-lg">
                                    <X className="w-4 h-4 text-red-600" />
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Retroalimentación */}
                      <div className="mt-4 sm:mt-6 lg:mt-8 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border border-blue-300/50 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 shadow-lg">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                            <Lightbulb className="w-3 h-3 text-white" />
                          </div>
                          <div className="text-sm sm:text-base lg:text-lg font-bold text-blue-700">Retroalimentación</div>
                        </div>
                        <div className="text-blue-700 leading-relaxed font-medium text-sm sm:text-base">{question.feedback}</div>
                      </div>

                      {/* Puntaje */}
                      <div className="flex justify-end mt-4 sm:mt-6">
                        <span className="bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base lg:text-lg border border-yellow-300 shadow-lg">
                          Puntos: {question.score}/{question.maxScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 lg:p-8 border-t border-blue-200/50 bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              <div className="text-xs sm:text-sm text-blue-600 font-medium text-center sm:text-left">
                Actividad completada • Retroalimentación generada
              </div>
              <button
                 className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm sm:text-base lg:text-lg rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
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