"use client"

import { CircleAlert, Trash, Check } from "lucide-react"
import Tooltip from "../../../../shared/components/Tooltip"
import CustomSelect from "./ui/custom-select"
import ActivitiesSection from "./activities-section"
import { useState } from "react"

export default function ThemesList({ level, levels, setLevels, activeTabs, setActiveTabs, createdTopics = [] }) {
  const [themeValidationErrors, setThemeValidationErrors] = useState({})

  // ✅ CORREGIDA: Función para obtener temas ya utilizados en TODA la programación
  const getUsedTopicIds = () => {
    const usedIds = new Set()

    levels.forEach((lvl) => {
      lvl.themes?.forEach((theme) => {
        if (theme.selectedTheme) {
          let topicId = null

          // Manejar diferentes formatos de selectedTheme
          if (typeof theme.selectedTheme === "string") {
            topicId = theme.selectedTheme
          } else if (typeof theme.selectedTheme === "object" && theme.selectedTheme !== null) {
            // ✅ IMPORTANTE: Manejar tanto .value como ._id
            topicId = theme.selectedTheme.value || theme.selectedTheme._id
          }

          if (topicId) {
            usedIds.add(topicId)
          }
        }
      })
    })

    console.log("🔍 Temas utilizados en toda la programación:", Array.from(usedIds))
    return usedIds
  }

  // ✅ CORREGIDA: Función para obtener opciones disponibles excluyendo temas ya utilizados
  const getAvailableThemeOptions = (currentThemeId) => {
    const usedIds = getUsedTopicIds()

    // Obtener el tema actual para permitir su propia selección
    const currentTheme = level.themes?.find((t) => t.id === currentThemeId)
    let currentSelection = null

    if (currentTheme?.selectedTheme) {
      if (typeof currentTheme.selectedTheme === "string") {
        currentSelection = currentTheme.selectedTheme
      } else if (typeof currentTheme.selectedTheme === "object" && currentTheme.selectedTheme !== null) {
        // ✅ IMPORTANTE: Manejar tanto .value como ._id
        currentSelection = currentTheme.selectedTheme.value || currentTheme.selectedTheme._id
      }
    }

    console.log(`🎯 Evaluando tema actual (${currentThemeId}):`, {
      currentSelection,
      currentTheme: currentTheme?.selectedTheme,
    })

    const availableOptions = createdTopics.filter((topic) => {
      const isCurrentSelection = currentSelection === topic.value
      const isAlreadyUsed = usedIds.has(topic.value)

      console.log(`Tema "${topic.label}" (${topic.value}):`, {
        isCurrentSelection,
        isAlreadyUsed,
        willShow: isCurrentSelection || !isAlreadyUsed,
      })

      // Permitir la selección actual o temas no utilizados
      return isCurrentSelection || !isAlreadyUsed
    })

    console.log(
      "✅ Opciones disponibles para el tema:",
      availableOptions.map((opt) => opt.label),
    )
    return availableOptions
  }

  // ✅ NUEVA: Función para validar si un tema ya está siendo utilizado
  const validateThemeSelection = (selectedOption, currentThemeId) => {
    if (!selectedOption || !selectedOption.value) return true

    const usedIds = getUsedTopicIds()
    const currentTheme = level.themes?.find((t) => t.id === currentThemeId)
    let currentSelection = null

    if (currentTheme?.selectedTheme) {
      if (typeof currentTheme.selectedTheme === "string") {
        currentSelection = currentTheme.selectedTheme
      } else if (typeof currentTheme.selectedTheme === "object" && currentTheme.selectedTheme.value) {
        currentSelection = currentTheme.selectedTheme.value
      }
    }

    // Si es la misma selección actual, permitir
    if (currentSelection === selectedOption.value) {
      return true
    }

    // Si ya está siendo utilizado en otro lugar, no permitir
    if (usedIds.has(selectedOption.value)) {
      return false
    }

    return true
  }

  const toggleThemeExpand = (levelId, themeId) => {
    setLevels(
      levels.map((level) => {
        if (level.id === levelId) {
          const updatedThemes = level.themes.map((theme) =>
            theme.id === themeId ? { ...theme, expanded: !theme.expanded } : theme,
          )
          return { ...level, themes: updatedThemes }
        }
        return level
      }),
    )
  }

  // ✅ MEJORADA: Función para actualizar tema con validación
  const updateTheme = (levelId, themeId, selectedOption) => {
    console.log("🔄 Actualizando tema:", { levelId, themeId, selectedOption })

    // Limpiar errores de validación previos
    const themeKey = `${levelId}-${themeId}`
    setThemeValidationErrors((prev) => ({
      ...prev,
      [themeKey]: "",
    }))

    // Validar que el tema no esté ya siendo utilizado en otro lugar
    if (selectedOption && selectedOption.value) {
      const usedIds = getUsedTopicIds()
      const currentTheme = level.themes?.find((t) => t.id === themeId)
      let currentSelection = null

      if (currentTheme?.selectedTheme) {
        if (typeof currentTheme.selectedTheme === "string") {
          currentSelection = currentTheme.selectedTheme
        } else if (typeof currentTheme.selectedTheme === "object" && currentTheme.selectedTheme !== null) {
          currentSelection = currentTheme.selectedTheme.value || currentTheme.selectedTheme._id
        }
      }

      // Si no es la misma selección actual y ya está siendo utilizado, mostrar error
      if (currentSelection !== selectedOption.value && usedIds.has(selectedOption.value)) {
        setThemeValidationErrors((prev) => ({
          ...prev,
          [themeKey]: "Este tema ya está siendo utilizado en otro nivel de la programación",
        }))
        return
      }
    }

    // Actualizar el tema
    setLevels(
      levels.map((level) => {
        if (level.id === levelId) {
          const updatedThemes = level.themes.map((theme) =>
            theme.id === themeId ? { ...theme, selectedTheme: selectedOption } : theme,
          )
          return { ...level, themes: updatedThemes }
        }
        return level
      }),
    )
  }

  const deleteTheme = (levelId, themeId) => {
    // Limpiar errores de validación al eliminar
    const themeKey = `${levelId}-${themeId}`
    setThemeValidationErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[themeKey]
      return newErrors
    })

    setLevels(
      levels.map((level) => {
        if (level.id === levelId) {
          const updatedThemes = level.themes.filter((theme) => theme.id !== themeId)
          return { ...level, themes: updatedThemes }
        }
        return level
      }),
    )
  }

  const toggleActivitiesSection = (levelId, themeId) => {
    setLevels(
      levels.map((level) => {
        if (level.id === levelId) {
          const updatedThemes = level.themes.map((theme) =>
            theme.id === themeId ? { ...theme, showActivities: !theme.showActivities } : theme,
          )
          return { ...level, themes: updatedThemes }
        }
        return level
      }),
    )
  }

  const getThemeDisplayName = (theme) => {
    if (theme.selectedTheme) {
      // Si selectedTheme es un objeto con label
      if (typeof theme.selectedTheme === "object" && theme.selectedTheme.label) {
        return theme.selectedTheme.label
      }
      // Si selectedTheme es un string (ID), buscar en createdTopics
      else if (typeof theme.selectedTheme === "string") {
        const foundTopic = createdTopics.find((topic) => topic.value === theme.selectedTheme)
        return foundTopic ? foundTopic.label : "Tema no encontrado"
      }
      // Si selectedTheme tiene value, buscar por value
      else if (theme.selectedTheme.value) {
        const foundTopic = createdTopics.find((topic) => topic.value === theme.selectedTheme.value)
        return foundTopic ? foundTopic.label : "Tema no encontrado"
      }
    }
    return "Seleccionar tema"
  }

  const getLocalActiveTab = (levelId, themeId) => {
    return activeTabs[`${levelId}-${themeId}`] || "Actividades"
  }

  const setLocalActiveTab = (levelId, themeId, tab) => {
    setActiveTabs((prev) => ({
      ...prev,
      [`${levelId}-${themeId}`]: tab,
    }))
  }

  const calculateTotalThemeValue = () => {
    return level.themes?.reduce((total, theme) => total + (theme.progress || 0), 0) || 0
  }

  const totalThemeValue = calculateTotalThemeValue()
  const isValueValid = totalThemeValue === 100

  return (
    <div className="space-y-3 p-3">
      {level.themes?.length > 0 && (
        <div className="flex justify-between items-center px-2 py-1 bg-gray-50 rounded-[10px]">
          <span className="text-sm font-medium">Valor total de temas:</span>
          <span className={`text-sm font-medium ${isValueValid ? "text-green-600" : "text-red-600"}`}>
            <span className="inline-flex items-center gap-1">
              {totalThemeValue}% {!isValueValid && <CircleAlert className="h-5 w-7" />}
              {isValueValid && <Check className="h-5 w-7" />}
            </span>
          </span>
        </div>
      )}

      {level.themes?.map((theme) => {
        const availableOptions = getAvailableThemeOptions(theme.id)
        const themeKey = `${level.id}-${theme.id}`
        const hasValidationError = themeValidationErrors[themeKey]

        return (
          <div key={theme.id} className="border rounded-md">
            <div
              className="flex items-center justify-between p-2 cursor-pointer rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              onClick={() => toggleThemeExpand(level.id, theme.id)}
            >
              <div className="flex items-center justify-between w-full">
                <h4 className="block text-sm font-medium text-gray-700">{getThemeDisplayName(theme)}</h4>
                {theme.progress > 0 && (
                  <span className="mr-1 block text-sm font-medium text-gray-700">{theme.progress}%</span>
                )}
              </div>
              <div className="flex items-center">
                <Tooltip text="Eliminar" position="top">
                  <button
                    className="p-1 hover:bg-gray-100 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteTheme(level.id, theme.id)
                    }}
                  >
                    <Trash className="h-4 w-6 text-red-500" />
                  </button>
                </Tooltip>
                {theme.expanded ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </div>
            </div>

            {theme.expanded && (
              <div className="p-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tema <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      placeholder="Seleccionar tema"
                      options={availableOptions}
                      value={theme.selectedTheme}
                      onChange={(option) => updateTheme(level.id, theme.id, option)}
                    />
                    {/* ✅ NUEVO: Mostrar mensaje de error si el tema ya está utilizado */}
                    {hasValidationError && <p className="text-xs text-red-600 mt-1">{hasValidationError}</p>}
                    {/* ✅ MEJORADO: Mensaje más específico cuando no hay opciones disponibles */}
                    {availableOptions.length === 0 && !hasValidationError && (
                      <p className="text-xs text-amber-600 mt-1">
                        ⚠️ Todos los temas disponibles ya han sido utilizados en esta programación
                      </p>
                    )}
                  </div>
                  <div className="flex">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor <span className="text-red-500">*</span>
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          className={`w-full rounded-l-md border px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                            themeValidationErrors[`${level.id}-${theme.id}-value`]
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          value={theme.progress || ""}
                          onChange={(e) => {
                            const value = Number.parseInt(e.target.value) || 0
                            const valueKey = `${level.id}-${theme.id}-value`

                            // Clear previous error
                            setThemeValidationErrors((prev) => ({
                              ...prev,
                              [valueKey]: "",
                            }))

                            // Validate value
                            if (value > 100) {
                              setThemeValidationErrors((prev) => ({
                                ...prev,
                                [valueKey]: "El valor no puede ser mayor a 100%",
                              }))
                            }

                            const updatedLevels = levels.map((l) => {
                              if (l.id === level.id) {
                                const updatedThemes = l.themes.map((t) =>
                                  t.id === theme.id ? { ...t, progress: value } : t,
                                )
                                return { ...l, themes: updatedThemes }
                              }
                              return l
                            })
                            setLevels(updatedLevels)
                          }}
                        />
                        <span className="bg-gray-100 border border-l-0 border-gray-300 px-2 py-1.5 rounded-r-md">
                          %
                        </span>
                      </div>
                      {themeValidationErrors[`${level.id}-${theme.id}-value`] && (
                        <p className="text-xs text-red-600 mt-1">
                          {themeValidationErrors[`${level.id}-${theme.id}-value`]}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-sm text-white rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={totalThemeValue > 100}
                  onClick={() => toggleActivitiesSection(level.id, theme.id)}
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir Evaluaciones y Material
                </button>

                {theme.showActivities && (
                  <ActivitiesSection
                    levelId={level.id}
                    themeId={theme.id}
                    localActiveTab={getLocalActiveTab(level.id, theme.id)}
                    setLocalActiveTab={(tab) => setLocalActiveTab(level.id, theme.id, tab)}
                    levels={levels}
                    setLevels={setLevels}
                  />
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
