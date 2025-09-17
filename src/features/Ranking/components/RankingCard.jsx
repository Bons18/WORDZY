"use client"

import { Trophy, Medal, Award, ChevronDown, ChevronUp, BarChart3 } from "lucide-react"
import { useState, useEffect } from "react"

const RankingCard = ({ title, icon, color, data, loading, error, filterComponent }) => {
  const [showAll, setShowAll] = useState(false)
  const [itemsToShow, setItemsToShow] = useState(5)
  // Mantener una referencia estable del estado de expansión
  const [isExpanded, setIsExpanded] = useState(false)

  // Actualizar itemsToShow cuando cambia showAll, pero mantener el estado de expansión
  useEffect(() => {
    if (showAll || isExpanded) {
      setItemsToShow(data?.length || 5)
    } else {
      setItemsToShow(5)
    }
  }, [showAll, isExpanded, data?.length])

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        border: "border-blue-500",
        bg: "bg-blue-50",
        text: "text-blue-500",
        header: "text-blue-600",
      },
      purple: {
        border: "border-purple-500",
        bg: "bg-purple-50",
        text: "text-purple-500",
        header: "text-purple-600",
      },
      green: {
        border: "border-green-500",
        bg: "bg-green-50",
        text: "text-green-500",
        header: "text-green-600",
      },
    }
    return colors[color] || colors.blue
  }

  const colorClasses = getColorClasses(color)

  const getRankIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="w-4 h-4 text-yellow-500" />
      case 2:
        return <Medal className="w-4 h-4 text-gray-400" />
      case 3:
        return <Award className="w-4 h-4 text-amber-600" />
      default:
        return (
          <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-500">{position}</span>
        )
    }
  }

  // Debug logs
  console.log(`🎯 RankingCard "${title}" - Loading: ${loading}, Data length: ${data?.length || 0}, Error: ${error || 'none'}`)
  
  if (loading) {
    return (
      <div className={`bg-white rounded-lg border-l-4 ${colorClasses.border} p-4 h-[400px]`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${colorClasses.bg}`}>{icon}</div>
            <h3 className={`font-semibold ${colorClasses.header} text-sm`}>{title}</h3>
          </div>
        </div>
        {filterComponent && <div className="mb-4">{filterComponent}</div>}
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="w-12 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border-l-4 ${colorClasses.border} p-3 h-[400px] flex flex-col shadow-sm relative`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-2 rounded-full ${colorClasses.bg} flex-shrink-0`}>{icon}</div>
          <h3 className={`font-semibold ${colorClasses.header} text-sm truncate`} title={title}>{title}</h3>
        </div>
      </div>

      {/* Filter Component */}
      {filterComponent && <div className="mb-3 flex-shrink-0">{filterComponent}</div>}

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-1 pb-2 border-b border-gray-200 text-xs font-medium text-gray-600 flex-shrink-0">
        <div className="col-span-2 text-center">Top</div>
        <div className="col-span-7 truncate">Nombre</div>
        <div className="col-span-3 text-center">Puntos</div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden mt-2 min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {data && data.length > 0 ? (
          <div className="space-y-1">
            {data.slice(0, showAll ? data.length : itemsToShow).map((student, index) => (
              <div
                key={student.documento || index}
                className="grid grid-cols-12 gap-1 py-2 px-1 hover:bg-gray-50 rounded text-xs items-center min-h-[32px]"
              >
                <div className="col-span-2 flex justify-center flex-shrink-0">{getRankIcon(student.posicion || index + 1)}</div>
                <div className="col-span-7 font-medium text-gray-800 truncate min-w-0" title={student.nombre}>
                  {student.nombre}
                </div>
                <div className={`col-span-3 text-center font-bold ${colorClasses.text} flex-shrink-0`}>{student.puntos}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="text-center text-gray-500 p-4">
              {error ? (
                <>
                  <div className="text-2xl mb-2">⚠️</div>
                  <p className="text-sm font-medium text-red-600">Error al cargar datos</p>
                  <p className="text-xs mt-1">{error}</p>
                </>
              ) : (
                <>
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm font-medium">No hay datos disponibles</p>
                  <p className="text-xs mt-1">Verifica que haya estudiantes con puntos registrados</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer con botón Ver más */}
      {data && data.length > 5 && (
        <div className="mt-4 pt-4 px-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-gray-600 font-medium">
              Mostrando {Math.min(itemsToShow, data.length)} de {data.length}
            </div>
            <button
              onClick={() => {
              const newShowAll = !showAll
              const newIsExpanded = !isExpanded
              setShowAll(newShowAll)
              setIsExpanded(newIsExpanded)
              // El useEffect se encargará de actualizar itemsToShow
            }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${colorClasses.text} hover:${colorClasses.bg} border border-current hover:shadow-sm flex-shrink-0`}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Más
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RankingCard
