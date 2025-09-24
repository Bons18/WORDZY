"use client"

import { useState } from "react"
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  BookOpen, 
  Target,
  Eye,
  EyeOff
} from "lucide-react"

const EnhancedQuestionCard = ({ question, index, showAIFeedback }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)

  const getQuestionTypeColor = (type) => {
    const colors = {
      Grammar: "bg-blue-100 text-blue-800 border-blue-200",
      Vocabulary: "bg-green-100 text-green-800 border-green-200",
      "Reading Comprehension": "bg-purple-100 text-purple-800 border-purple-200",
      Listening: "bg-orange-100 text-orange-800 border-orange-200",
      Speaking: "bg-pink-100 text-pink-800 border-pink-200",
      default: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colors[type] || colors.default
  }

  const getQuestionTypeIcon = (type) => {
    const icons = {
      Grammar: BookOpen,
      Vocabulary: Target,
      "Reading Comprehension": Eye,
      Listening: AlertCircle,
      Speaking: Lightbulb
    }
    const IconComponent = icons[type] || BookOpen
    return <IconComponent className="w-4 h-4" />
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header de la pregunta */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full">
              <span className="text-red-600 font-semibold text-sm">{index + 1}</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getQuestionTypeColor(question.tipo)}`}>
                  {getQuestionTypeIcon(question.tipo)}
                  {question.tipo}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pregunta {question.numero}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-red-100 px-3 py-1 rounded-full">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-700 font-medium text-sm">-{question.puntos} pts</span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              aria-label={isExpanded ? "Contraer" : "Expandir"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido de la pregunta */}
      <div className="p-4">
        {/* Pregunta */}
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">Pregunta:</h4>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-gray-300">
                {question.pregunta}
              </p>
            </div>
          </div>
        </div>

        {/* Respuestas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Respuesta del estudiante */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h5 className="font-medium text-red-800 mb-2">Tu respuesta:</h5>
                <p className="text-red-700 bg-white p-3 rounded border border-red-200">
                  {question.respuestaEstudiante}
                </p>
              </div>
            </div>
          </div>

          {/* Respuesta correcta */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-green-800">Respuesta correcta:</h5>
                  <button
                    onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-800 transition-colors"
                  >
                    {showCorrectAnswer ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Mostrar
                      </>
                    )}
                  </button>
                </div>
                {showCorrectAnswer ? (
                  <p className="text-green-700 bg-white p-3 rounded border border-green-200">
                    {question.respuestaCorrecta}
                  </p>
                ) : (
                  <p className="text-green-600 italic text-sm">
                    Haz clic en "Mostrar" para ver la respuesta correcta
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Observación */}
        {question.observacion && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h5 className="font-medium text-yellow-800 mb-1">Observación:</h5>
                <p className="text-yellow-700">{question.observacion}</p>
              </div>
            </div>
          </div>
        )}

        {/* Contenido expandible */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Retroalimentación de IA */}
            {showAIFeedback && question.feedback && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                      <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">IA</span>
                      Retroalimentación Personalizada
                    </h5>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-blue-800 leading-relaxed">{question.feedback}</p>
                      </div>
                      
                      {question.explanation && (
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <h6 className="font-medium text-blue-900 mb-2 flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            Explicación detallada:
                          </h6>
                          <p className="text-blue-800 leading-relaxed">{question.explanation}</p>
                        </div>
                      )}
                      
                      {question.suggestions && question.suggestions.length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <h6 className="font-medium text-blue-900 mb-2 flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            Sugerencias para mejorar:
                          </h6>
                          <ul className="space-y-2">
                            {question.suggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2 text-blue-800">
                                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span className="leading-relaxed">{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Dificultad:</span>
            <div className="flex gap-1">
              {[...Array(question.puntos)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-red-400 rounded-full"></div>
              ))}
              {[...Array(3 - question.puntos)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-300 rounded-full"></div>
              ))}
            </div>
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            {isExpanded ? "Ver menos" : "Ver más detalles"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EnhancedQuestionCard