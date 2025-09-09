"use client"
import { Search, BookOpen, Users, Target, UserCheck } from "lucide-react"

const SearchResults = ({ results, searchTerm, onSelectFicha, isVisible, isLoading }) => {
  if (!isVisible) return null

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
          <p className="text-blue-600 font-medium text-sm">Buscando fichas...</p>
          <p className="text-gray-500 text-xs mt-1">Incluyendo búsqueda por instructor...</p>
        </div>
      </div>
    )
  }

  if (results.length === 0 && searchTerm.trim()) {
    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
        <div className="p-4 text-center">
          <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-sm mb-1">No se encontraron fichas</p>
          <p className="text-gray-500 text-xs mb-2">
            No hay resultados para "<span className="font-medium text-gray-700">{searchTerm}</span>"
          </p>
          <p className="text-gray-400 text-xs">Intenta buscar por código de ficha, programa o nombre del instructor</p>
        </div>
      </div>
    )
  }

  if (results.length > 0) {
    // Separar resultados encontrados por instructor vs otros criterios
    const foundByInstructor = results.filter((ficha) => ficha.foundByInstructor)
    const foundByOther = results.filter((ficha) => !ficha.foundByInstructor)

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
        {/* Header sutil */}
        <div className="p-3 border-b border-gray-100 bg-blue-50">
          <p className="text-blue-800 font-medium text-sm flex items-center">
            <Target className="w-4 h-4 mr-2" />
            {results.length} resultado{results.length !== 1 ? "s" : ""} encontrado
            {results.length !== 1 ? "s" : ""}
            {foundByInstructor.length > 0 && (
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                {foundByInstructor.length} por instructor
              </span>
            )}
          </p>
        </div>

        <div className="py-2">
          {/* Mostrar primero los resultados encontrados por instructor */}
          {foundByInstructor.map((ficha) => (
            <div
              key={`instructor-${ficha.id}`}
              onClick={() => onSelectFicha(ficha)}
              className="px-4 py-3 hover:bg-green-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 border-l-4 border-l-green-400"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{ficha.codigo}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Por instructor
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        ficha.hasProgramming ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ficha.statusMessage}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">{ficha.programa}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-green-600" />
                      <span className="font-medium text-green-700">Instructor: {ficha.instructor}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>{ficha.aprendices} aprendices</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {ficha.nivelesActivos || 0}/{ficha.totalNiveles || 6}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Mostrar otros resultados */}
          {foundByOther.map((ficha) => (
            <div
              key={`other-${ficha.id}`}
              onClick={() => onSelectFicha(ficha)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-semibold text-gray-900">{ficha.codigo}</span>
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">#{ficha.numero}</span>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        ficha.hasProgramming ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ficha.statusMessage}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2 text-sm">{ficha.programa}</h3>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Instructor: {ficha.instructor}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      <span>{ficha.aprendices} aprendices</span>
                    </div>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {ficha.nivelesActivos || 0}/{ficha.totalNiveles || 6}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default SearchResults
