"use client"
import { Clock, BookOpen, Users, Target } from "lucide-react"
import { FiTrash } from "react-icons/fi"

const RecentFichas = ({ fichas, onSelectFicha, onClearHistory }) => {
  return (
    <div>
      {/* Header sutil */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-purple-50 p-2 rounded-lg mr-3 border border-purple-200">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Fichas Recientes</h2>
            <p className="text-gray-600 text-sm">Acceso rápido a tus consultas anteriores</p>
          </div>
        </div>
        {fichas.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
          >
            <FiTrash className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {fichas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fichas.map((ficha, index) => {
            // Colores sutiles alternados
            const cardStyles = [
              "border-blue-200 bg-blue-50 hover:bg-blue-100",
              "border-emerald-200 bg-emerald-50 hover:bg-emerald-100",
              "border-purple-200 bg-purple-50 hover:bg-purple-100",
              "border-orange-200 bg-orange-50 hover:bg-orange-100",
              "border-cyan-200 bg-cyan-50 hover:bg-cyan-100",
            ]
            const cardStyle = cardStyles[index % cardStyles.length]

            return (
              <div
                key={ficha.id}
                onClick={() => onSelectFicha(ficha)}
                className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-sm ${cardStyle}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/60 p-2 rounded-lg border border-white/80">
                      <BookOpen className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{ficha.codigo}</h3>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      ficha.hasProgramming ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {ficha.statusMessage}
                  </span>
                </div>

                <p className="text-sm font-medium text-gray-800 mb-3 line-clamp-2">{ficha.programa}</p>

                <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
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
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <div className="bg-gray-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
            <Clock className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-gray-600 font-medium text-sm mb-1">No hay fichas recientes</p>
          <p className="text-gray-500 text-xs">Las fichas que consultes aparecerán aquí para acceso rápido</p>
        </div>
      )}
    </div>
  )
}

export default RecentFichas
