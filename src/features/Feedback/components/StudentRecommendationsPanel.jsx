"use client"

import { useState, useEffect } from "react"
import { 
  User, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  BookOpen, 
  Award, 
  RefreshCw,
  X,
  CheckCircle,
  AlertTriangle,
  Brain,
  Clock
} from "lucide-react"
import enhancedAiService from "../services/enhancedAiService"

const StudentRecommendationsPanel = ({ student, isOpen, onClose }) => {
  const [recommendations, setRecommendations] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null)

  useEffect(() => {
    if (isOpen && student) {
      generateRecommendations()
      analyzePerformance()
    }
  }, [isOpen, student])

  const generateRecommendations = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Preparar datos del estudiante para recomendaciones
      const studentData = {
        studentId: student._id,
        level: calculateStudentLevel(student),
        strengths: identifyStrengths(student),
        weaknesses: identifyWeaknesses(student),
        performance: calculatePerformanceMetrics(student),
        learningPreferences: inferLearningPreferences(student)
      }

      console.log("🤖 Generando recomendaciones para:", student.nombre, studentData)
      
      const result = await enhancedAiService.generateStudentRecommendations(studentData)
      setRecommendations(result)
      
    } catch (error) {
      console.error("❌ Error generando recomendaciones:", error)
      setError("No se pudieron generar las recomendaciones. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const analyzePerformance = async () => {
    try {
      const performanceData = {
        studentId: student._id,
        data: preparePerformanceData(student),
        timeframe: 'month'
      }

      const analysis = await enhancedAiService.analyzeStudentPerformance(performanceData)
      setPerformanceAnalysis(analysis)
      
    } catch (error) {
      console.error("❌ Error analizando rendimiento:", error)
    }
  }

  // Funciones auxiliares para análisis del estudiante
  const calculateStudentLevel = (student) => {
    const activities = student.actividades || []
    const exams = student.examenes || []
    
    const allScores = [
      ...activities.map(a => a.calificacion || 0),
      ...exams.map(e => e.calificacion || 0)
    ]
    
    if (allScores.length === 0) return 1
    
    const average = allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    
    if (average >= 4.5) return 6
    if (average >= 4.0) return 5
    if (average >= 3.5) return 4
    if (average >= 3.0) return 3
    if (average >= 2.5) return 2
    return 1
  }

  const identifyStrengths = (student) => {
    const activities = student.actividades || []
    const exams = student.examenes || []
    
    const strongAreas = []
    
    // Analizar actividades con buenas calificaciones
    activities.forEach(activity => {
      if (activity.calificacion >= 4.0) {
        if (activity.nombre.toLowerCase().includes('grammar')) strongAreas.push('Gramática')
        if (activity.nombre.toLowerCase().includes('vocabulary')) strongAreas.push('Vocabulario')
        if (activity.nombre.toLowerCase().includes('reading')) strongAreas.push('Comprensión de lectura')
        if (activity.nombre.toLowerCase().includes('writing')) strongAreas.push('Escritura')
        if (activity.nombre.toLowerCase().includes('speaking')) strongAreas.push('Expresión oral')
        if (activity.nombre.toLowerCase().includes('listening')) strongAreas.push('Comprensión auditiva')
      }
    })
    
    return [...new Set(strongAreas)]
  }

  const identifyWeaknesses = (student) => {
    const activities = student.actividades || []
    const exams = student.examenes || []
    
    const weakAreas = []
    
    // Analizar actividades con bajas calificaciones
    activities.forEach(activity => {
      if (activity.calificacion < 3.0) {
        if (activity.nombre.toLowerCase().includes('grammar')) weakAreas.push('Gramática')
        if (activity.nombre.toLowerCase().includes('vocabulary')) weakAreas.push('Vocabulario')
        if (activity.nombre.toLowerCase().includes('reading')) weakAreas.push('Comprensión de lectura')
        if (activity.nombre.toLowerCase().includes('writing')) weakAreas.push('Escritura')
        if (activity.nombre.toLowerCase().includes('speaking')) weakAreas.push('Expresión oral')
        if (activity.nombre.toLowerCase().includes('listening')) weakAreas.push('Comprensión auditiva')
      }
    })
    
    // Analizar preguntas incorrectas en exámenes
    exams.forEach(exam => {
      if (exam.preguntas) {
        exam.preguntas.forEach(pregunta => {
          if (!pregunta.esCorrecta) {
            weakAreas.push('Conceptos específicos')
          }
        })
      }
    })
    
    return [...new Set(weakAreas)]
  }

  const calculatePerformanceMetrics = (student) => {
    const activities = student.actividades || []
    const exams = student.examenes || []
    
    const allScores = [
      ...activities.map(a => a.calificacion || 0),
      ...exams.map(e => e.calificacion || 0)
    ]
    
    if (allScores.length === 0) {
      return { score: 0, accuracy: 0, totalActivities: 0 }
    }
    
    const averageScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length
    const passedActivities = allScores.filter(score => score >= 3.0).length
    const accuracy = (passedActivities / allScores.length) * 100
    
    return {
      score: averageScore,
      accuracy: accuracy,
      totalActivities: allScores.length,
      passedActivities: passedActivities
    }
  }

  const inferLearningPreferences = (student) => {
    const activities = student.actividades || []
    const preferences = []
    
    // Inferir preferencias basadas en el rendimiento en diferentes tipos de actividades
    const readingActivities = activities.filter(a => a.nombre.toLowerCase().includes('reading'))
    const listeningActivities = activities.filter(a => a.nombre.toLowerCase().includes('listening'))
    const writingActivities = activities.filter(a => a.nombre.toLowerCase().includes('writing'))
    const speakingActivities = activities.filter(a => a.nombre.toLowerCase().includes('speaking'))
    
    if (readingActivities.length > 0) {
      const avgReading = readingActivities.reduce((sum, a) => sum + (a.calificacion || 0), 0) / readingActivities.length
      if (avgReading >= 4.0) preferences.push('Visual/Lectura')
    }
    
    if (listeningActivities.length > 0) {
      const avgListening = listeningActivities.reduce((sum, a) => sum + (a.calificacion || 0), 0) / listeningActivities.length
      if (avgListening >= 4.0) preferences.push('Auditivo')
    }
    
    if (writingActivities.length > 0) {
      const avgWriting = writingActivities.reduce((sum, a) => sum + (a.calificacion || 0), 0) / writingActivities.length
      if (avgWriting >= 4.0) preferences.push('Kinestésico/Escritura')
    }
    
    return preferences.length > 0 ? preferences : ['Multimodal']
  }

  const preparePerformanceData = (student) => {
    const activities = student.actividades || []
    const exams = student.examenes || []
    
    return {
      activities: activities.map(a => ({
        name: a.nombre,
        score: a.calificacion,
        date: a.fecha,
        type: 'activity'
      })),
      exams: exams.map(e => ({
        name: e.nombre,
        score: e.calificacion,
        date: e.fecha,
        type: 'exam'
      })),
      totalActivities: activities.length + exams.length,
      averageScore: calculatePerformanceMetrics(student).score
    }
  }

  const getPerformanceColor = (score) => {
    if (score >= 4.5) return 'text-green-600'
    if (score >= 4.0) return 'text-blue-600'
    if (score >= 3.5) return 'text-yellow-600'
    if (score >= 3.0) return 'text-orange-600'
    return 'text-red-600'
  }

  const getPerformanceIcon = (score) => {
    if (score >= 4.0) return <Award className="w-5 h-5 text-green-600" />
    if (score >= 3.0) return <CheckCircle className="w-5 h-5 text-yellow-600" />
    return <AlertTriangle className="w-5 h-5 text-red-600" />
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Recomendaciones Personalizadas con IA
              </h2>
              <p className="text-sm text-gray-600">
                {student?.nombre} {student?.apellido} - {student?.programa}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Generando Recomendaciones Personalizadas
                </h3>
                <p className="text-gray-600">
                  La IA está analizando el rendimiento del estudiante para crear recomendaciones específicas...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={generateRecommendations}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Resumen del Estudiante */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <User className="w-6 h-6 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Perfil del Estudiante</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getPerformanceIcon(calculatePerformanceMetrics(student).score)}
                    </div>
                    <p className="text-sm text-gray-600">Rendimiento Promedio</p>
                    <p className={`text-lg font-bold ${getPerformanceColor(calculatePerformanceMetrics(student).score)}`}>
                      {calculatePerformanceMetrics(student).score.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Nivel Estimado</p>
                    <p className="text-lg font-bold text-blue-600">
                      Nivel {calculateStudentLevel(student)}
                    </p>
                  </div>
                  <div className="text-center">
                    <Target className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Actividades Completadas</p>
                    <p className="text-lg font-bold text-green-600">
                      {calculatePerformanceMetrics(student).totalActivities}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recomendaciones de IA */}
              {recommendations && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Lightbulb className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-800">Recomendaciones Personalizadas</h3>
                  </div>
                  
                  {recommendations.recommendations && recommendations.recommendations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-blue-800 mb-2">Sugerencias Principales:</h4>
                      <ul className="space-y-2">
                        {recommendations.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-blue-700 text-sm">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recommendations.nextSteps && recommendations.nextSteps.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-blue-800 mb-2">Próximos Pasos:</h4>
                      <ul className="space-y-2">
                        {recommendations.nextSteps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-700 text-sm">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {recommendations.resources && recommendations.resources.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Recursos Recomendados:</h4>
                      <ul className="space-y-2">
                        {recommendations.resources.map((resource, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <BookOpen className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                            <span className="text-blue-700 text-sm">{resource}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Análisis de Rendimiento */}
              {performanceAnalysis && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-green-800">Análisis de Rendimiento</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {performanceAnalysis.summary && (
                      <div>
                        <h4 className="font-medium text-green-800 mb-2">Resumen:</h4>
                        <p className="text-green-700 text-sm">{performanceAnalysis.summary}</p>
                      </div>
                    )}

                    {performanceAnalysis.trends && performanceAnalysis.trends.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-800 mb-2">Tendencias:</h4>
                        <ul className="space-y-1">
                          {performanceAnalysis.trends.map((trend, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-green-700 text-sm">{trend}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {performanceAnalysis.insights && performanceAnalysis.insights.length > 0 && (
                      <div>
                        <h4 className="font-medium text-green-800 mb-2">Insights:</h4>
                        <ul className="space-y-1">
                          {performanceAnalysis.insights.map((insight, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <Brain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                              <span className="text-green-700 text-sm">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Fortalezas y Debilidades */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-green-800">Fortalezas Identificadas</h4>
                  </div>
                  <ul className="space-y-2">
                    {identifyStrengths(student).map((strength, index) => (
                      <li key={index} className="text-green-700 text-sm flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        {strength}
                      </li>
                    ))}
                    {identifyStrengths(student).length === 0 && (
                      <li className="text-green-600 text-sm italic">
                        Continúa trabajando para identificar tus fortalezas
                      </li>
                    )}
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-orange-800">Áreas de Mejora</h4>
                  </div>
                  <ul className="space-y-2">
                    {identifyWeaknesses(student).map((weakness, index) => (
                      <li key={index} className="text-orange-700 text-sm flex items-center">
                        <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                        {weakness}
                      </li>
                    ))}
                    {identifyWeaknesses(student).length === 0 && (
                      <li className="text-orange-600 text-sm italic">
                        ¡Excelente! No se identificaron áreas críticas de mejora
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            Última actualización: {new Date().toLocaleString()}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={generateRecommendations}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentRecommendationsPanel