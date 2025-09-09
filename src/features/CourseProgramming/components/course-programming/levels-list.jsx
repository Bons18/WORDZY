"use client"

import { Trash } from "lucide-react"
import Tooltip from "../../../../shared/components/Tooltip"
import ThemesList from "./themes-list"
import TopicModal from "../../../Topics/components/TopicModal"
import ConfirmationModal from "../../../../shared/components/ConfirmationModal"
import { useState, useEffect } from "react"
import { useGetTopics } from "../../../Topics/hooks/useGetTopics"
import { usePostTopic } from "../../../Topics/hooks/usePostTopic"

export default function LevelsList({ levels, setLevels, activeTabs, setActiveTabs }) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedLevelId, setSelectedLevelId] = useState(null)
  const { topics, refetch } = useGetTopics()
  const { postTopic } = usePostTopic()

  // ✅ Función actualizada para calcular el estado de completado incluyendo suma de temas
  const calculateLevelCompletion = (level) => {
    // Verificar que el nivel tenga nombre
    if (!level.name || level.name.trim() === "") {
      return false
    }

    // Verificar que tenga al menos un tema
    if (!level.themes || level.themes.length === 0) {
      return false
    }

    // ✅ Verificar que los temas sumen 100%
    const themesSum = level.themes.reduce((sum, theme) => sum + (theme.progress || 0), 0)
    if (themesSum !== 100) {
      return false
    }

    // Verificar cada tema
    for (const theme of level.themes) {
      // Verificar que el tema tenga un tema seleccionado
      if (!theme.selectedTheme) {
        return false
      }

      // Verificar que tenga actividades
      const activities = (theme.activities || []).filter((a) => a.type === "Actividades")
      if (activities.length === 0) {
        return false
      }

      // Verificar que las actividades sumen 100%
      const actSum = activities.reduce((sum, a) => {
        const value = Number.parseInt(a.value?.replace("%", "") || 0)
        return sum + value
      }, 0)
      if (actSum !== 100) {
        return false
      }

      // Verificar que tenga exámenes
      const exams = (theme.activities || []).filter((a) => a.type === "Exámenes")
      if (exams.length === 0) {
        return false
      }

      // Verificar que los exámenes sumen 100%
      const examSum = exams.reduce((sum, e) => {
        const value = Number.parseInt(e.value?.replace("%", "") || 0)
        return sum + value
      }, 0)
      if (examSum !== 100) {
        return false
      }

      // Verificar que tenga materiales de apoyo
      const materials = (theme.activities || []).filter((a) => a.type === "Material")
      if (materials.length === 0) {
        return false
      }
    }

    return true
  }

  // ✅ Función para obtener detalles de validación del nivel
  const getLevelValidationDetails = (level) => {
    const details = {
      hasName: !!(level.name && level.name.trim() !== ""),
      hasThemes: !!(level.themes && level.themes.length > 0),
      themesSum100: false,
      themesValid: false,
      activitiesValid: false,
      examsValid: false,
      materialsValid: false,
    }

    if (!details.hasName || !details.hasThemes) {
      return details
    }

    // Verificar suma de temas
    const themesSum = level.themes.reduce((sum, theme) => sum + (theme.progress || 0), 0)
    details.themesSum100 = themesSum === 100

    if (!details.themesSum100) {
      return details
    }

    // Verificar validaciones de cada tema
    let allThemesValid = true
    let allActivitiesValid = true
    let allExamsValid = true
    let allMaterialsValid = true

    for (const theme of level.themes) {
      if (!theme.selectedTheme) {
        allThemesValid = false
        break
      }

      const activities = (theme.activities || []).filter((a) => a.type === "Actividades")
      if (activities.length === 0) {
        allActivitiesValid = false
        break
      }

      const actSum = activities.reduce((sum, a) => {
        const value = Number.parseInt(a.value?.replace("%", "") || 0)
        return sum + value
      }, 0)
      if (actSum !== 100) {
        allActivitiesValid = false
        break
      }

      const exams = (theme.activities || []).filter((a) => a.type === "Exámenes")
      if (exams.length === 0) {
        allExamsValid = false
        break
      }

      const examSum = exams.reduce((sum, e) => {
        const value = Number.parseInt(e.value?.replace("%", "") || 0)
        return sum + value
      }, 0)
      if (examSum !== 100) {
        allExamsValid = false
        break
      }

      const materials = (theme.activities || []).filter((a) => a.type === "Material")
      if (materials.length === 0) {
        allMaterialsValid = false
        break
      }
    }

    details.themesValid = allThemesValid
    details.activitiesValid = allActivitiesValid
    details.examsValid = allExamsValid
    details.materialsValid = allMaterialsValid

    return details
  }

  // ✅ Efecto para actualizar el estado de completado cuando cambien los datos
  useEffect(() => {
    const updatedLevels = levels.map((level) => {
      const newCompletedStatus = calculateLevelCompletion(level)
      const validationDetails = getLevelValidationDetails(level)

      // Solo actualizar si el estado cambió
      if (level.completed !== newCompletedStatus) {
        return {
          ...level,
          completed: newCompletedStatus,
          completionDetails: validationDetails,
        }
      }
      return level
    })

    // Solo actualizar si hay cambios
    const hasChanges = updatedLevels.some((level, index) => level.completed !== levels[index].completed)

    if (hasChanges) {
      setLevels(updatedLevels)
    }
  }, [levels, setLevels])

  const handleAddTopic = (levelId) => {
    setSelectedLevelId(levelId)
    setIsModalOpen(true)
  }

  const handleSubmitTopic = async (topicData) => {
    try {
      await postTopic(topicData)
      await refetch()
      setIsModalOpen(false)
      setSuccessMessage(`Tema "${topicData.name}" creado exitosamente`)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error al agregar el tema:", error)
      setSuccessMessage(error.message || "Ocurrió un error al agregar el tema")
      setShowSuccessModal(true)
    }
  }

  const toggleLevelExpand = (levelId) => {
    setLevels(levels.map((level) => (level.id === levelId ? { ...level, expanded: !level.expanded } : level)))
  }

  const updateLevelName = (levelId, name) => {
    setLevels(levels.map((level) => (level.id === levelId ? { ...level, name } : level)))
  }

  const addTheme = (levelId) => {
    setLevels(
      levels.map((level) => {
        if (level.id === levelId) {
          const newTheme = {
            id: `theme-${Date.now()}`,
            name: "",
            selectedTheme: null,
            expanded: true,
            progress: 0,
            activities: [],
            showActivities: false,
          }
          return { ...level, themes: [...level.themes, newTheme] }
        }
        return level
      }),
    )
  }

  const addThemeWithTopic = (levelId, topicOption) => {
    setLevels(
      levels.map((level) => {
        if (level.id === levelId) {
          const newTheme = {
            id: `theme-${Date.now()}`,
            name: "",
            selectedTheme: topicOption,
            expanded: true,
            progress: 0,
            activities: [],
            showActivities: false,
          }
          return { ...level, themes: [...level.themes, newTheme] }
        }
        return level
      }),
    )
  }

  const deleteLevel = (levelId) => {
    setLevels(levels.filter((level) => level.id !== levelId))
  }

  const getLevelDisplayName = (level) => {
    const levelIndex = levels.findIndex((l) => l.id === level.id) + 1
    return level.name && level.name.trim() !== "" ? level.name : `Nivel ${levelIndex}`
  }

  const getExistingTopics = () => {
    return (
      topics?.map((topic) => ({
        nombre: topic.name,
      })) || []
    )
  }

  const getUsedTopicIds = () => {
    const usedIds = new Set()

    levels.forEach((level) => {
      level.themes?.forEach((theme) => {
        if (theme.selectedTheme) {
          if (typeof theme.selectedTheme === "string") {
            usedIds.add(theme.selectedTheme)
          } else if (theme.selectedTheme.value) {
            usedIds.add(theme.selectedTheme.value)
          }
        }
      })
    })

    return usedIds
  }

  const getAllTopicsForDisplay = () => {
    return (
      topics
        ?.filter((topic) => topic.status === true)
        .map((topic) => ({
          value: topic._id,
          label: topic.name,
        })) || []
    )
  }

  const getAvailableTopics = () => {
    const usedIds = getUsedTopicIds()

    return (
      topics
        ?.filter((topic) => topic.status === true && !usedIds.has(topic._id))
        .map((topic) => ({
          value: topic._id,
          label: topic.name,
        })) || []
    )
  }

  return (
    <div className="space-y-3">
      {levels.map((level) => (
        <div key={level.id} className="border rounded-md">
          <div
            className="flex items-center justify-between p-2 cursor-pointer rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            onClick={() => toggleLevelExpand(level.id)}
          >
            <h3 className="block text-sm font-medium text-gray-700">{getLevelDisplayName(level)}</h3>
            <div className="flex items-center gap-2">
              {/* ✅ Usar el estado de la base de datos o calcular en tiempo real */}
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
              <Tooltip text="Eliminar" position="top">
                <button
                  className="p-1 hover:bg-gray-100 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteLevel(level.id)
                  }}
                >
                  <Trash className="h-4 w-6 text-red-500" />
                </button>
              </Tooltip>
              {level.expanded ? (
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

          {level.expanded && (
            <div className="p-4 border-t">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Nivel <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nombre del nivel"
                  className="w-full text-sm rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={level.name}
                  onChange={(e) => updateLevelName(level.id, e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex space-x-2">
                  <button
                    className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-sm text-white rounded-md"
                    onClick={() => handleAddTopic(level.id)}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Crear Tema
                  </button>
                  <button
                    className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-sm text-white rounded-md"
                    onClick={() => addTheme(level.id)}
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Añadir Tema
                  </button>
                </div>
              </div>

              {level.themes?.length > 0 && (
                <ThemesList
                  level={level}
                  levels={levels}
                  setLevels={setLevels}
                  activeTabs={activeTabs}
                  setActiveTabs={setActiveTabs}
                  createdTopics={getAllTopicsForDisplay()}
                />
              )}
            </div>
          )}
        </div>
      ))}

      {isModalOpen && (
        <TopicModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitTopic}
          existingTopics={getExistingTopics()}
        />
      )}

      <ConfirmationModal
        isOpen={showSuccessModal}
        onConfirm={() => setShowSuccessModal(false)}
        title="Operación Exitosa"
        message={successMessage}
        confirmText="Aceptar"
        confirmColor="bg-green-500 hover:bg-green-600"
        showButtonCancel={false}
      />
    </div>
  )
}
