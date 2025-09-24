"use client"

import { useState, useMemo } from "react"
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Eye, 
  EyeOff,
  RotateCcw,
  BookOpen,
  Target,
  Zap,
  Trophy,
  Star
} from "lucide-react"

const InteractiveFeedbackPanel = ({ 
  failedQuestions, 
  onQuestionSelect, 
  showAIFeedback, 
  onToggleAIFeedback 
}) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [sortBy, setSortBy] = useState("number") // number, points, type
  const [sortOrder, setSortOrder] = useState("asc")
  const [showFilters, setShowFilters] = useState(false)

  // Obtener tipos únicos de preguntas
  const questionTypes = useMemo(() => {
    const types = [...new Set(failedQuestions.map(q => q.tipo))]
    return types.sort()
  }, [failedQuestions])

  // Filtrar y ordenar preguntas
  const filteredAndSortedQuestions = useMemo(() => {
    let filtered = failedQuestions.filter(question => {
      const matchesSearch = question.pregunta.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           question.tipo.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = selectedType === "all" || question.tipo === selectedType
      return matchesSearch && matchesType
    })

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case "number":
          comparison = a.numero - b.numero
          break
        case "points":
          comparison = b.puntos - a.puntos // Mayor puntos primero por defecto
          break
        case "type":
          comparison = a.tipo.localeCompare(b.tipo)
          break
        default:
          comparison = 0
      }
      
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [failedQuestions, searchTerm, selectedType, sortBy, sortOrder])

  const resetFilters = () => {
    setSearchTerm("")
    setSelectedType("all")
    setSortBy("number")
    setSortOrder("asc")
  }

  const getTypeColor = (type) => {
    const colors = {
      Grammar: "bg-blue-100 text-blue-800",
      Vocabulary: "bg-green-100 text-green-800",
      "Reading Comprehension": "bg-purple-100 text-purple-800",
      Listening: "bg-orange-100 text-orange-800",
      Speaking: "bg-pink-100 text-pink-800"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const getTypeIcon = (type) => {
    const icons = {
      Grammar: BookOpen,
      Vocabulary: Target,
      "Reading Comprehension": Eye,
      Listening: Zap,
      Speaking: Star
    }
    const IconComponent = icons[type] || BookOpen
    return <IconComponent className="w-4 h-4" />
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header con controles */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar preguntas por contenido o tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-2">
            {/* Toggle filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showFilters 
                  ? "bg-blue-100 border-blue-300 text-blue-700" 
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>

            {/* Toggle IA */}
            <button
              onClick={onToggleAIFeedback}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                showAIFeedback 
                  ? "bg-purple-100 border-purple-300 text-purple-700" 
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {showAIFeedback ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              IA
            </button>

            {/* Reset */}
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtro por tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de pregunta
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Todos los tipos</option>
                  {questionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Ordenar por */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordenar por
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="number">Número de pregunta</option>
                  <option value="points">Puntos perdidos</option>
                  <option value="type">Tipo de pregunta</option>
                </select>
              </div>

              {/* Orden */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Orden
                </label>
                <button
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {sortOrder === "asc" ? (
                    <>
                      <SortAsc className="w-4 h-4" />
                      Ascendente
                    </>
                  ) : (
                    <>
                      <SortDesc className="w-4 h-4" />
                      Descendente
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-sm text-gray-600">
                {filteredAndSortedQuestions.length} de {failedQuestions.length} preguntas
              </span>
            </div>
            
            {searchTerm && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Search className="w-4 h-4" />
                Buscando: "{searchTerm}"
              </div>
            )}
          </div>

          {/* Indicador de progreso */}
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">
              {Math.round(((failedQuestions.length - filteredAndSortedQuestions.length) / failedQuestions.length) * 100) || 0}% filtrado
            </span>
          </div>
        </div>
      </div>

      {/* Lista de preguntas */}
      <div className="max-h-96 overflow-y-auto">
        {filteredAndSortedQuestions.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredAndSortedQuestions.map((question, index) => (
              <div
                key={question.id}
                onClick={() => onQuestionSelect(question)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-full flex-shrink-0">
                      <span className="text-red-600 font-semibold text-sm">{question.numero}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(question.tipo)}`}>
                          {getTypeIcon(question.tipo)}
                          {question.tipo}
                        </span>
                      </div>
                      <p className="text-sm text-gray-900 truncate">
                        {question.pregunta}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      {[...Array(question.puntos)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-red-400 rounded-full"></div>
                      ))}
                    </div>
                    <span className="text-sm text-red-600 font-medium">-{question.puntos}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron preguntas</h3>
            <p className="text-gray-500">
              {searchTerm || selectedType !== "all" 
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay preguntas incorrectas para mostrar"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InteractiveFeedbackPanel