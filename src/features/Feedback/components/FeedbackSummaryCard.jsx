"use client"

import { 
  TrendingDown, 
  Target, 
  BookOpen, 
  Award, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Brain
} from "lucide-react"

const FeedbackSummaryCard = ({ student, failedQuestions, totalQuestions }) => {
  const correctQuestions = totalQuestions - failedQuestions.length
  const successRate = totalQuestions > 0 ? Math.round((correctQuestions / totalQuestions) * 100) : 0
  
  // Análisis por tipo de pregunta
  const questionTypeAnalysis = failedQuestions.reduce((acc, question) => {
    acc[question.tipo] = (acc[question.tipo] || 0) + 1
    return acc
  }, {})

  const mostFailedType = Object.entries(questionTypeAnalysis)
    .sort(([,a], [,b]) => b - a)[0]

  const getPerformanceColor = (rate) => {
    if (rate >= 80) return "text-green-600 bg-green-50 border-green-200"
    if (rate >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200"
    return "text-red-600 bg-red-50 border-red-200"
  }

  const getPerformanceIcon = (rate) => {
    if (rate >= 80) return <CheckCircle className="w-6 h-6 text-green-500" />
    if (rate >= 60) return <AlertTriangle className="w-6 h-6 text-yellow-500" />
    return <XCircle className="w-6 h-6 text-red-500" />
  }

  const getPerformanceMessage = (rate) => {
    if (rate >= 80) return "¡Excelente desempeño!"
    if (rate >= 60) return "Buen trabajo, pero hay espacio para mejorar"
    return "Necesita refuerzo en varios temas"
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header con información del estudiante */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Brain className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{student?.nombre || "Estudiante"}</h2>
            <p className="text-blue-100">Resumen de Retroalimentación</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{successRate}%</div>
            <div className="text-sm text-blue-100">Aciertos</div>
          </div>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Preguntas correctas */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">{correctQuestions}</div>
                <div className="text-sm text-green-600">Correctas</div>
              </div>
            </div>
          </div>

          {/* Preguntas incorrectas */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-700">{failedQuestions.length}</div>
                <div className="text-sm text-red-600">Incorrectas</div>
              </div>
            </div>
          </div>

          {/* Total de preguntas */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700">{totalQuestions}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicador de rendimiento */}
        <div className={`rounded-lg border p-4 mb-6 ${getPerformanceColor(successRate)}`}>
          <div className="flex items-center gap-3">
            {getPerformanceIcon(successRate)}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{getPerformanceMessage(successRate)}</h3>
              <p className="text-sm opacity-80">
                {successRate >= 80 
                  ? "Continúa con este excelente trabajo y sigue practicando."
                  : successRate >= 60
                  ? "Revisa las áreas de mejora identificadas para alcanzar un mejor rendimiento."
                  : "Es importante dedicar más tiempo al estudio y práctica de los temas evaluados."
                }
              </p>
            </div>
          </div>
        </div>

        {/* Análisis por tipo de pregunta */}
        {Object.keys(questionTypeAnalysis).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Áreas que necesitan atención
            </h3>
            
            <div className="space-y-3">
              {Object.entries(questionTypeAnalysis)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="font-medium text-gray-900">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 font-semibold">{count}</span>
                      <span className="text-sm text-gray-500">
                        error{count > 1 ? 'es' : ''}
                      </span>
                    </div>
                  </div>
                ))}
            </div>

            {mostFailedType && (
              <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <TrendingDown className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      Área prioritaria: <span className="font-bold">{mostFailedType[0]}</span>
                    </p>
                    <p className="text-xs text-orange-700 mt-1">
                      Se recomienda dedicar tiempo extra a practicar este tipo de ejercicios.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mensaje motivacional */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-purple-900 mb-1">¡Sigue adelante!</h4>
              <p className="text-sm text-purple-800 leading-relaxed">
                Cada error es una oportunidad de aprendizaje. Revisa la retroalimentación detallada 
                de cada pregunta para mejorar tu comprensión y rendimiento futuro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeedbackSummaryCard