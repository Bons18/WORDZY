"use client"

import { useState } from "react"
import { Eye } from "lucide-react"
import { FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import Tooltip from "../../../../shared/components/Tooltip"
import { useNavigate } from "react-router-dom"

export default function ProgrammingDetails({ programming }) {
  const navigate = useNavigate()
  const [expandedLevels, setExpandedLevels] = useState({})
  const [expandedThemes, setExpandedThemes] = useState({})
  const [activeTabsByTheme, setActiveTabsByTheme] = useState({})
  const [currentPageByTheme, setCurrentPageByTheme] = useState({})
  const [itemsPerPage] = useState(5)

  const toggleLevelExpand = (levelId) => {
    setExpandedLevels((prev) => ({ ...prev, [levelId]: !prev[levelId] }))
  }

  const toggleThemeExpand = (levelId, themeId) => {
    const key = `${levelId}-${themeId}`
    setExpandedThemes((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const setActiveTab = (levelId, themeId, tab) => {
    const key = `${levelId}-${themeId}`
    setActiveTabsByTheme((prev) => ({ ...prev, [key]: tab }))
    setCurrentPageByTheme((prev) => ({ ...prev, [key]: 1 }))
  }

  const getActiveTab = (levelId, themeId) => {
    const key = `${levelId}-${themeId}`
    return activeTabsByTheme[key] || "Actividades"
  }

  const getCurrentPage = (levelId, themeId) => {
    const key = `${levelId}-${themeId}`
    return currentPageByTheme[key] || 1
  }

  const setCurrentPage = (levelId, themeId, page) => {
    const key = `${levelId}-${themeId}`
    setCurrentPageByTheme((prev) => ({ ...prev, [key]: page }))
  }

  const getThemeName = (theme) => {
    if (theme.selectedTheme && typeof theme.selectedTheme === "object") {
      return theme.selectedTheme.name
    }
    return `Tema ${theme.id}`
  }

  const getFilteredActivities = (activities, type) => {
    if (!activities) return []
    return activities.filter((activity) => activity.type === type)
  }

  const handleBackClick = () => {
    navigate("/programacion/programacionCursos")
  }

  const handlePageChange = (levelId, themeId, pageNumber) => {
    setCurrentPage(levelId, themeId, pageNumber)
  }

  // ✅ Función actualizada para calcular completado incluyendo suma de temas
  const calculateLevelCompletion = (level) => {
    if (!level.name || level.name.trim() === "") return false
    if (!level.themes || level.themes.length === 0) return false

    // ✅ Verificar que los temas sumen 100%
    const themesSum = level.themes.reduce((sum, theme) => sum + (theme.progress || 0), 0)
    if (themesSum !== 100) return false

    for (const theme of level.themes) {
      if (!theme.selectedTheme) return false

      const activities = (theme.activities || []).filter((a) => a.type === "Actividades")
      if (activities.length === 0) return false

      const actSum = activities.reduce((sum, a) => {
        const value = Number.parseInt(a.value?.toString().replace("%", "") || 0)
        return sum + value
      }, 0)
      if (actSum !== 100) return false

      const exams = (theme.activities || []).filter((a) => a.type === "Exámenes")
      if (exams.length === 0) return false

      const examSum = exams.reduce((sum, e) => {
        const value = Number.parseInt(e.value?.toString().replace("%", "") || 0)
        return sum + value
      }, 0)
      if (examSum !== 100) return false

      const materials = (theme.activities || []).filter((a) => a.type === "Material")
      if (materials.length === 0) return false
    }

    return true
  }

  // ✅ Función para obtener el tooltip con detalles de validación
  const getValidationTooltip = (level) => {
    const themesSum = level.themes?.reduce((sum, theme) => sum + (theme.progress || 0), 0) || 0

    if (level.completionDetails) {
      return `Validaciones detalladas:
• Nombre: ${level.completionDetails.hasName ? "✓" : "✗"}
• Temas: ${level.completionDetails.hasThemes ? "✓" : "✗"}
• Suma temas 100%: ${level.completionDetails.themesSum100 ? "✓" : "✗"} (actual: ${themesSum}%)
• Temas válidos: ${level.completionDetails.themesValid ? "✓" : "✗"}
• Actividades 100%: ${level.completionDetails.activitiesValid ? "✓" : "✗"}
• Exámenes 100%: ${level.completionDetails.examsValid ? "✓" : "✗"}
• Materiales: ${level.completionDetails.materialsValid ? "✓" : "✗"}`
    }

    return `Suma de temas: ${themesSum}% (debe ser 100%)`
  }

  return (
    <div className="max-w-10xl mx-auto p-6 bg-white rounded-lg shadow">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-[#1f384c] mb-4">Información Básica</h1>
      </header>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Programa</label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-700 text-sm">{programming.nombre}</div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Estado</label>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                programming.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {programming.estado}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Fecha de Inicio</label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-700 text-sm">{programming.fechaInicio}</div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">Fecha de Fin</label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-gray-700 text-sm">
              {programming.fechaFin || "No definida"}
            </div>
          </div>
        </div>

        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-bold text-[#1f384c] mb-4">Niveles y Temas</h2>

          {programming.levels?.length > 0 ? (
            <div className="space-y-4">
              {programming.levels.map((level) => (
                <div key={level.id} className="border rounded-md">
                  <div
                    className="flex items-center justify-between p-2 cursor-pointer"
                    onClick={() => toggleLevelExpand(level.id)}
                  >
                    <h3 className="text-sm font-bold text-gray-700">{level.name}</h3>
                    <div className="flex items-center gap-2">
                      {/* ✅ Usar el estado de la base de datos o calcular como respaldo */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          level.completed !== undefined
                            ? level.completed
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                            : calculateLevelCompletion(level)
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {level.completed !== undefined
                          ? level.completed
                            ? "Completado"
                            : "Sin completar"
                          : calculateLevelCompletion(level)
                            ? "Completado"
                            : "Sin completar"}
                      </span>
                      {expandedLevels[level.id] ? <FiChevronUp /> : <FiChevronDown />}
                    </div>
                  </div>

                  {expandedLevels[level.id] && (
                    <div className="p-4 border-t">
                      {level.themes?.length > 0 ? (
                        <div className="space-y-3">
                          {level.themes.map((theme) => (
                            <div key={theme.id} className="border rounded-md">
                              <div
                                className="flex items-center justify-between p-2 cursor-pointer"
                                onClick={() => toggleThemeExpand(level.id, theme.id)}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <h4 className="text-sm font-medium text-gray-700">{getThemeName(theme)}</h4>
                                  {theme.progress > 0 && (
                                    <span className="text-sm font-medium text-gray-700">{theme.progress}%</span>
                                  )}
                                </div>
                                {expandedThemes[`${level.id}-${theme.id}`] ? <FiChevronUp /> : <FiChevronDown />}
                              </div>

                              {expandedThemes[`${level.id}-${theme.id}`] && (
                                <div className="p-4 border-t">
                                  {theme.activities?.length > 0 && (
                                    <div className="mt-4 border rounded-md">
                                      <div className="flex border-b">
                                        {["Actividades", "Exámenes", "Material"].map((tab) => (
                                          <button
                                            key={tab}
                                            className={`px-6 py-2 block text-sm font-medium text-gray-700 ${
                                              getActiveTab(level.id, theme.id) === tab
                                                ? "bg-blue-50 border-b-2 border-blue-500"
                                                : ""
                                            }`}
                                            onClick={() => setActiveTab(level.id, theme.id, tab)}
                                          >
                                            {tab}
                                          </button>
                                        ))}
                                      </div>
                                      <div className="p-6">
                                        {(() => {
                                          const filteredActivities = getFilteredActivities(
                                            theme.activities,
                                            getActiveTab(level.id, theme.id),
                                          )
                                          const currentPage = getCurrentPage(level.id, theme.id)
                                          const currentData = filteredActivities.slice(
                                            (currentPage - 1) * itemsPerPage,
                                            currentPage * itemsPerPage,
                                          )
                                          const totalPages = Math.ceil(filteredActivities.length / itemsPerPage)

                                          return (
                                            <div className="border rounded-md">
                                              <table className="w-full table-fixed">
                                                <thead>
                                                  <tr className="border-b border-gray-200">
                                                    <th className="bg-gray-100 px-2 py-2 text-left text-sm font-medium text-gray-600 truncate">
                                                      Nombre
                                                    </th>
                                                    <th className="bg-gray-100 px-2 py-2 text-left text-sm font-medium text-gray-600 truncate">
                                                      Valor
                                                    </th>
                                                    <th className="bg-gray-100 px-2 py-2 text-left text-sm font-medium text-gray-600 w-28">
                                                      Acciones
                                                    </th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {currentData.map((activity) => (
                                                    <tr key={activity.id} className="hover:bg-gray-50">
                                                      <td className="px-2 py-2 text-sm text-left border-b border-gray-200 text-gray-700 truncate">
                                                        {activity.type === "Material"
                                                          ? activity.materialId?.titulo
                                                          : activity.evaluationId?.nombre || "Sin nombre"}
                                                      </td>
                                                      <td className="px-2 py-2 text-sm text-left border-b border-gray-200 text-gray-700 truncate">
                                                        {activity.value}
                                                      </td>
                                                      <td className="px-2 py-2 border-b border-gray-200">
                                                        <div className="flex justify-center mr-8">
                                                          <Tooltip text="Detalle" position="top">
                                                            <button
                                                              className="p-1 hover:bg-gray-100 rounded-full"
                                                              onClick={() => activity.onDetail?.()}
                                                            >
                                                              <Eye className="h-5 w-6 text-blue-500" />
                                                            </button>
                                                          </Tooltip>
                                                        </div>
                                                      </td>
                                                    </tr>
                                                  ))}
                                                  {currentData.length === 0 && (
                                                    <tr>
                                                      <td
                                                        colSpan={3}
                                                        className="px-2 py-4 text-sm text-center text-gray-500"
                                                      >
                                                        No hay{" "}
                                                        {getActiveTab(level.id, theme.id) === "Material"
                                                          ? "materiales"
                                                          : getActiveTab(level.id, theme.id) === "Exámenes"
                                                            ? "exámenes"
                                                            : "actividades"}{" "}
                                                        agregados
                                                      </td>
                                                    </tr>
                                                  )}
                                                </tbody>
                                              </table>
                                              <div className="flex justify-between items-center text-xs font-medium text-gray-600 ml-2 p-1">
                                                <div>{filteredActivities.length} elementos</div>

                                                {filteredActivities.length > 0 && (
                                                  <div className="flex items-center gap-2">
                                                    <span>
                                                      Página {currentPage} de {totalPages > 0 ? totalPages : 1}
                                                    </span>

                                                    <div className="flex gap-1">
                                                      <button
                                                        onClick={() =>
                                                          handlePageChange(
                                                            level.id,
                                                            theme.id,
                                                            Math.max(1, currentPage - 1),
                                                          )
                                                        }
                                                        disabled={currentPage === 1}
                                                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                                                        aria-label="Página anterior"
                                                      >
                                                        <FiChevronLeft size={14} />
                                                      </button>
                                                      <button
                                                        onClick={() =>
                                                          handlePageChange(
                                                            level.id,
                                                            theme.id,
                                                            Math.min(totalPages, currentPage + 1),
                                                          )
                                                        }
                                                        disabled={currentPage === totalPages || totalPages === 0}
                                                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                                                        aria-label="Página siguiente"
                                                      >
                                                        <FiChevronRight size={14} />
                                                      </button>
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          )
                                        })()}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No hay temas configurados</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No hay niveles configurados para esta programación</div>
          )}
        </div>
      </div>
      <div className="max-w-3xl mx-auto mt-6 flex justify-center">
        <button
          onClick={handleBackClick}
          className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
