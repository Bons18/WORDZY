"use client"

import { useState, useEffect } from "react"
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  BookOpen, 
  Target, 
  Lightbulb,
  RefreshCw,
  Clock,
  Award,
  MessageSquare
} from "lucide-react"
import { generateStudentFeedback } from "../services/feedbackAIService"

const AIFeedbackPanel = ({ student, onClose }) => {
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("exams")

  useEffect(() => {
    if (student) {
      generateFeedback()
    }
  }, [student])

  const generateFeedback = async () => {
    if (!student) return

    setLoading(true)
    setError(null)
    
    try {
      console.log("🤖 Generando retroalimentación IA para:", student.nombre)
      const result = await generateStudentFeedback(student)
      setFeedback(result)
      console.log("✅ Retroalimentación generada:", result)
    } catch (err) {
      console.error("❌ Error generando retroalimentación:", err)
      setError("No se pudo generar la retroalimentación. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (level) => {
    switch (level) {
      case "Excelente": return "text-green-600 bg-green-50"
      case "Bueno": return "text-blue-600 bg-blue-50"
      case "Regular": return "text-yellow-600 bg-yellow-50"
      case "Bajo": return "text-red-600 bg-red-50"
      default: return "text-gray-600 bg-gray-50"
    }
  }

  const getScoreColor = (score) => {
    if (score >= 4.0) return "text-green-600"
    if (score >= 3.5) return "text-blue-600"
    if (score >= 3.0) return "text-yellow-600"
    return "text-red-600"
  }

  if (!student) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay estudiante seleccionado
            </h3>
            <p className="text-gray-600 mb-4">
              Selecciona un estudiante para generar retroalimentación con IA.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Retroalimentación IA</h2>
                <p className="text-blue-100">
                  {student.nombre} {student.apellido} - {student.programa}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-8 text-center flex-1 flex items-center justify-center">
            <div>
              <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Generando retroalimentación...
              </h3>
              <p className="text-gray-600">
                La IA está analizando el rendimiento del estudiante
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-8 text-center flex-1 flex items-center justify-center">
            <div>
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={generateFeedback}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {feedback && !loading && (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 flex-shrink-0">
              <nav className="flex space-x-8 px-6">
                {[
                  { id: "exams", label: "Exámenes", icon: BookOpen },
                  { id: "activities", label: "Actividades", icon: Award }
                ].map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content with Custom Scrollbar */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
              {activeTab === "exams" && (
                <ExamsTab feedback={feedback} getScoreColor={getScoreColor} />
              )}
              {activeTab === "activities" && (
                <ActivitiesTab feedback={feedback} getScoreColor={getScoreColor} />
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="w-4 h-4" />
                  <span>Generado el {new Date(feedback.generatedAt).toLocaleString()}</span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={generateFeedback}
                    className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    Regenerar
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// Componente para la pestaña de exámenes
const ExamsTab = ({ feedback, getScoreColor }) => (
  <div className="space-y-6 max-h-full">
    {feedback.examsFeedback.length > 0 ? (
      <div className="space-y-6">
        {feedback.examsFeedback.map((exam, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{exam.examName}</h3>
              <div className="flex items-center space-x-4">
                <span className={`text-2xl font-bold ${getScoreColor(exam.score)}`}>
                  {exam.score}/5.0
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(exam.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Failed Questions */}
            {exam.failedQuestions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-red-800 mb-3 flex items-center">
                  <XCircle className="w-4 h-4 mr-2" />
                  Preguntas Incorrectas ({exam.failedQuestions.length})
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-red-300 scrollbar-track-red-100">
                  {exam.failedQuestions.map((question, qIndex) => (
                    <div key={qIndex} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="font-medium text-gray-900 mb-2">{question.question}</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-red-700">Tu respuesta:</span>
                          <p className="text-red-600 mt-1">{question.studentAnswer}</p>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Respuesta correcta:</span>
                          <p className="text-green-600 mt-1">{question.correctAnswer}</p>
                        </div>
                      </div>
                      {question.explanation && (
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                          <span className="font-medium text-blue-700">Explicación:</span>
                          <p className="text-blue-600 mt-1">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Analysis */}
            {exam.aiAnalysis && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-md font-semibold text-purple-800 mb-3 flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  Análisis de IA
                </h4>
                {exam.aiAnalysis.analysis ? (
                  <p className="text-purple-700 text-sm">{exam.aiAnalysis.analysis}</p>
                ) : (
                  <div className="space-y-2 text-sm">
                    {exam.aiAnalysis.patterns && exam.aiAnalysis.patterns.length > 0 && (
                      <div>
                        <span className="font-medium text-purple-700">Patrones identificados:</span>
                        <ul className="list-disc list-inside text-purple-600 mt-1">
                          {exam.aiAnalysis.patterns.map((pattern, pIndex) => (
                            <li key={pIndex}>{pattern}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {exam.recommendations && exam.recommendations.length > 0 && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-blue-800 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Recomendaciones
                </h4>
                <ul className="space-y-1">
                  {exam.recommendations.map((rec, rIndex) => (
                    <li key={rIndex} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-blue-700 text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay exámenes disponibles</h3>
        <p className="text-gray-600">Este estudiante no tiene exámenes registrados para analizar.</p>
      </div>
    )}
  </div>
)

// Componente para la pestaña de actividades
const ActivitiesTab = ({ feedback, getScoreColor }) => (
  <div className="space-y-6 max-h-full">
    {feedback.activitiesFeedback.length > 0 ? (
      <div className="space-y-6">
        {feedback.activitiesFeedback.map((activity, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{activity.activityName}</h3>
              <div className="flex items-center space-x-4">
                <span className={`text-2xl font-bold ${getScoreColor(activity.score)}`}>
                  {activity.score}/5.0
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(activity.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Original Feedback */}
            {activity.existingFeedback && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-gray-800 mb-2 flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Retroalimentación Original
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  <p className="text-gray-700 text-sm">{activity.existingFeedback}</p>
                </div>
              </div>
            )}

            {/* AI Enhanced Feedback */}
            {activity.aiEnhancedFeedback && activity.aiEnhancedFeedback !== activity.existingFeedback && (
              <div className="mb-4">
                <h4 className="text-md font-semibold text-purple-800 mb-2 flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  Retroalimentación Mejorada por IA
                </h4>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-purple-100">
                  <p className="text-purple-700 text-sm">{activity.aiEnhancedFeedback}</p>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {activity.recommendations && activity.recommendations.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-blue-800 mb-2 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Recomendaciones
                </h4>
                <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
                  <ul className="space-y-1">
                    {activity.recommendations.map((rec, rIndex) => (
                      <li key={rIndex} className="flex items-start space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-blue-700 text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay actividades disponibles</h3>
        <p className="text-gray-600">Este estudiante no tiene actividades registradas para analizar.</p>
      </div>
    )}
  </div>
)

export default AIFeedbackPanel