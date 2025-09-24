"use client"

import { useState, useEffect } from "react"
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Target, 
  Award, 
  AlertTriangle,
  RefreshCw,
  X,
  Download,
  Filter,
  Eye,
  Brain,
  Clock,
  Users,
  BookOpen,
  CheckCircle
} from "lucide-react"
import enhancedAiService from "../services/enhancedAiService"

const PerformanceAnalysisPanel = ({ student, isOpen, onClose, timeframe = "month" }) => {
  const [analysisData, setAnalysisData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)
  const [selectedMetrics, setSelectedMetrics] = useState("all")

  useEffect(() => {
    if (isOpen && student) {
      performAnalysis()
    }
  }, [isOpen, student, selectedTimeframe])

  const performAnalysis = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Preparar datos para análisis
      const performanceData = {
        studentId: student._id,
        data: prepareStudentData(student),
        timeframe: selectedTimeframe,
        metrics: selectedMetrics === "all" ? ["scores", "progress", "engagement", "strengths", "weaknesses"] : [selectedMetrics]
      }

      console.log("📊 Analizando rendimiento para:", student.nombre, performanceData)
      
      const result = await enhancedAiService.analyzeStudentPerformance(performanceData)
      setAnalysisData(result)
      
    } catch (error) {
      console.error("❌ Error analizando rendimiento:", error)
      setError("No se pudo completar el análisis de rendimiento. Intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const prepareStudentData = (student) => {
    const activities = student.actividades || []
    const exams = student.examenes || []
    
    // Combinar todas las actividades y exámenes con fechas
    const allItems = [
      ...activities.map(a => ({
        type: 'activity',
        name: a.nombre,
        score: a.calificacion || 0,
        date: new Date(a.fecha || Date.now()),
        status: a.estado || 'completado',
        feedback: a.retroalimentacion || ''
      })),
      ...exams.map(e => ({
        type: 'exam',
        name: e.nombre,
        score: e.calificacion || 0,
        date: new Date(e.fecha || Date.now()),
        status: e.estado || 'completado',
        questions: e.preguntas || []
      }))
    ]

    // Ordenar por fecha
    allItems.sort((a, b) => a.date - b.date)

    // Calcular métricas
    const scores = allItems.map(item => item.score).filter(score => score > 0)
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
    const passedItems = scores.filter(score => score >= 3.0).length
    const passRate = scores.length > 0 ? (passedItems / scores.length) * 100 : 0

    // Análisis de tendencias (últimos 30 días)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentItems = allItems.filter(item => item.date >= thirtyDaysAgo)
    const recentScores = recentItems.map(item => item.score).filter(score => score > 0)
    const recentAverage = recentScores.length > 0 ? recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length : 0

    return {
      totalActivities: allItems.length,
      averageScore: averageScore,
      passRate: passRate,
      recentAverage: recentAverage,
      trend: recentAverage > averageScore ? 'improving' : recentAverage < averageScore ? 'declining' : 'stable',
      activities: allItems,
      timeRange: {
        start: allItems.length > 0 ? allItems[0].date : new Date(),
        end: allItems.length > 0 ? allItems[allItems.length - 1].date : new Date()
      },
      engagement: calculateEngagement(allItems),
      strengths: identifyStrengths(allItems),
      weaknesses: identifyWeaknesses(allItems)
    }
  }

  const calculateEngagement = (items) => {
    const totalDays = 30 // Últimos 30 días
    const activeDays = new Set()
    
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - totalDays)
    
    items.forEach(item => {
      if (item.date >= thirtyDaysAgo) {
        activeDays.add(item.date.toDateString())
      }
    })
    
    return {
      activeDays: activeDays.size,
      totalDays: totalDays,
      engagementRate: (activeDays.size / totalDays) * 100
    }
  }

  const identifyStrengths = (items) => {
    const strengths = []
    const highScoreItems = items.filter(item => item.score >= 4.0)
    
    if (highScoreItems.length > 0) {
      const topics = {}
      highScoreItems.forEach(item => {
        const topic = extractTopic(item.name)
        topics[topic] = (topics[topic] || 0) + 1
      })
      
      Object.entries(topics)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .forEach(([topic, count]) => {
          strengths.push(`${topic} (${count} actividades exitosas)`)
        })
    }
    
    return strengths
  }

  const identifyWeaknesses = (items) => {
    const weaknesses = []
    const lowScoreItems = items.filter(item => item.score < 3.0 && item.score > 0)
    
    if (lowScoreItems.length > 0) {
      const topics = {}
      lowScoreItems.forEach(item => {
        const topic = extractTopic(item.name)
        topics[topic] = (topics[topic] || 0) + 1
      })
      
      Object.entries(topics)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .forEach(([topic, count]) => {
          weaknesses.push(`${topic} (${count} actividades con dificultades)`)
        })
    }
    
    return weaknesses
  }

  const extractTopic = (name) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes('grammar')) return 'Gramática'
    if (lowerName.includes('vocabulary')) return 'Vocabulario'
    if (lowerName.includes('reading')) return 'Comprensión de lectura'
    if (lowerName.includes('writing')) return 'Escritura'
    if (lowerName.includes('speaking')) return 'Expresión oral'
    if (lowerName.includes('listening')) return 'Comprensión auditiva'
    return 'Conceptos generales'
  }

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-green-600'
    if (score >= 4.0) return 'text-blue-600'
    if (score >= 3.5) return 'text-yellow-600'
    if (score >= 3.0) return 'text-orange-600'
    return 'text-red-600'
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'declining': return <TrendingDown className="w-5 h-5 text-red-600" />
      default: return <BarChart3 className="w-5 h-5 text-gray-600" />
    }
  }

  const exportAnalysis = () => {
    if (!analysisData) return
    
    const exportData = {
      student: `${student.nombre} ${student.apellido}`,
      program: student.programa,
      analysisDate: new Date().toISOString(),
      timeframe: selectedTimeframe,
      ...analysisData
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analisis-rendimiento-${student.nombre}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Análisis de Rendimiento con IA
              </h2>
              <p className="text-sm text-gray-600">
                {student?.nombre} {student?.apellido} - {student?.programa}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportAnalysis}
              disabled={!analysisData}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              title="Exportar análisis"
            >
              <Download className="w-5 h-5 text-gray-500" />
            </button>
            <button
              onClick={performAnalysis}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Actualizar análisis"
            >
              <RefreshCw className={`w-5 h-5 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="quarter">Último trimestre</option>
                <option value="all">Todo el tiempo</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <select
                value={selectedMetrics}
                onChange={(e) => setSelectedMetrics(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">Todas las métricas</option>
                <option value="scores">Solo calificaciones</option>
                <option value="progress">Solo progreso</option>
                <option value="engagement">Solo participación</option>
              </select>
            </div>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            Última actualización: {new Date().toLocaleString()}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Analizando Rendimiento con IA
                </h3>
                <p className="text-gray-600">
                  La IA está procesando los datos de rendimiento para generar insights personalizados...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error en el Análisis</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={performAnalysis}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Reintentar Análisis
              </button>
            </div>
          ) : analysisData ? (
            <div className="space-y-6">
              {/* Resumen Ejecutivo */}
              {analysisData.summary && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Brain className="w-6 h-6 text-purple-600 mr-2" />
                    <h3 className="text-lg font-semibold text-purple-800">Resumen Ejecutivo IA</h3>
                  </div>
                  <p className="text-purple-700 leading-relaxed">{analysisData.summary}</p>
                </div>
              )}

              {/* Métricas Clave */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600">Promedio General</p>
                  <p className={`text-2xl font-bold ${getScoreColor(prepareStudentData(student).averageScore)}`}>
                    {prepareStudentData(student).averageScore.toFixed(1)}
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-600">Tasa de Aprobación</p>
                  <p className="text-2xl font-bold text-green-600">
                    {prepareStudentData(student).passRate.toFixed(0)}%
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    {getTrendIcon(prepareStudentData(student).trend)}
                  </div>
                  <p className="text-sm text-gray-600">Tendencia</p>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {prepareStudentData(student).trend === 'improving' ? 'Mejorando' : 
                     prepareStudentData(student).trend === 'declining' ? 'Declinando' : 'Estable'}
                  </p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-sm text-gray-600">Participación</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {prepareStudentData(student).engagement.engagementRate.toFixed(0)}%
                  </p>
                </div>
              </div>

              {/* Insights de IA */}
              {analysisData.insights && analysisData.insights.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Eye className="w-6 h-6 text-blue-600 mr-2" />
                    <h3 className="text-lg font-semibold text-blue-800">Insights de IA</h3>
                  </div>
                  <div className="space-y-3">
                    {analysisData.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-blue-700 text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tendencias */}
              {analysisData.trends && analysisData.trends.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <TrendingUp className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-semibold text-green-800">Análisis de Tendencias</h3>
                  </div>
                  <div className="space-y-3">
                    {analysisData.trends.map((trend, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-green-700 text-sm">{trend}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendaciones */}
              {analysisData.recommendations && analysisData.recommendations.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <Award className="w-6 h-6 text-yellow-600 mr-2" />
                    <h3 className="text-lg font-semibold text-yellow-800">Recomendaciones de Mejora</h3>
                  </div>
                  <div className="space-y-3">
                    {analysisData.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-yellow-700 text-sm">{recommendation}</p>
                      </div>
                    ))}
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
                    {prepareStudentData(student).strengths.map((strength, index) => (
                      <li key={index} className="text-green-700 text-sm flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        {strength}
                      </li>
                    ))}
                    {prepareStudentData(student).strengths.length === 0 && (
                      <li className="text-green-600 text-sm italic">
                        Continúa trabajando para identificar fortalezas específicas
                      </li>
                    )}
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-orange-800">Áreas de Oportunidad</h4>
                  </div>
                  <ul className="space-y-2">
                    {prepareStudentData(student).weaknesses.map((weakness, index) => (
                      <li key={index} className="text-orange-700 text-sm flex items-center">
                        <div className="w-2 h-2 bg-orange-600 rounded-full mr-2"></div>
                        {weakness}
                      </li>
                    ))}
                    {prepareStudentData(student).weaknesses.length === 0 && (
                      <li className="text-orange-600 text-sm italic">
                        ¡Excelente! No se identificaron áreas críticas de mejora
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Análisis de Rendimiento
              </h3>
              <p className="text-gray-600 mb-4">
                Haz clic en "Actualizar análisis" para generar un reporte detallado del rendimiento del estudiante.
              </p>
              <button
                onClick={performAnalysis}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                Generar Análisis
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PerformanceAnalysisPanel