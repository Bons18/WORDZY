"use client"

import { useState, useEffect, useCallback } from "react"
import { fichaLevelAssignmentService } from "../services/fichaLevelAssignmentService"
import { DEFAULT_LEVELS } from "../utils/constants"

export const useLevelManagementAPI = (selectedFicha) => {
  const [currentLevelStates, setCurrentLevelStates] = useState(DEFAULT_LEVELS)
  const [tempLevelStates, setTempLevelStates] = useState(DEFAULT_LEVELS)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fichaInfo, setFichaInfo] = useState(null)
  const [hasProgramming, setHasProgramming] = useState(true)

  // ✅ FUNCIÓN PARA LIMPIAR TODOS LOS ESTADOS
  const clearAllStates = useCallback(() => {
    console.log("🧹 Limpiando todos los estados...")
    setCurrentLevelStates({})
    setTempLevelStates({})
    setHasChanges(false)
    setError(null)
    setFichaInfo(null)
    setHasProgramming(true)
  }, [])

  // Cargar niveles cuando cambia la ficha seleccionada
  useEffect(() => {
    if (selectedFicha?.id) {
      // ✅ LIMPIAR ESTADOS ANTES DE CARGAR NUEVA FICHA
      clearAllStates()
      loadFichaLevels(selectedFicha.id)
    } else {
      // ✅ LIMPIAR ESTADOS CUANDO NO HAY FICHA SELECCIONADA
      clearAllStates()
    }
  }, [selectedFicha, clearAllStates])

  // Verificar cambios
  useEffect(() => {
    const changes = JSON.stringify(currentLevelStates) !== JSON.stringify(tempLevelStates)
    setHasChanges(changes)
  }, [currentLevelStates, tempLevelStates])

  const loadFichaLevels = async (courseId) => {
    try {
      setIsLoading(true)
      setError(null)
      setHasProgramming(true)

      console.log("=== CARGANDO FICHA ===", courseId)

      const response = await fichaLevelAssignmentService.getFichaLevels(courseId)

      console.log("=== RESPUESTA DEL SERVIDOR ===")
      console.log("Response completa:", JSON.stringify(response, null, 2))

      // ✅ MANEJO MEJORADO: Si no hay programación, limpiar TODO y establecer estado específico
      if (response.hasNoProgramming) {
        console.log("❌ No hay programación - Limpiando estados y estableciendo error")

        setHasProgramming(false)
        setCurrentLevelStates({})
        setTempLevelStates({})
        setHasChanges(false)

        // ✅ INFORMACIÓN ESPECÍFICA PARA FICHAS SIN PROGRAMACIÓN
        setFichaInfo({
          courseInfo: response.courseInfo,
          programInfo: response.programInfo,
          programmingInfo: null,
          hasNoProgramming: true,
          isDefault: false,
          hasNoAssignment: false,
        })

        setError("No hay programación de inglés disponible para este programa")
        return
      }

      // ✅ RESTABLECER hasProgramming si llegamos aquí
      setHasProgramming(true)

      // Obtener los niveles - puede venir en response.levels o directamente en response
      let levels = {}

      // Si hay una asignación existente, usar sus niveles
      if (response.levels && typeof response.levels === "object") {
        levels = response.levels
        console.log("✅ Niveles encontrados en response.levels:", levels)
      } else if (response.hasNoAssignment && response.programmingInfo) {
        // Si no hay asignación previa, crear estructura vacía basada en programación
        response.programmingInfo.levels.forEach((level) => {
          levels[level.id] = false
        })
        console.log("✅ Niveles creados para nueva asignación:", levels)
      }

      console.log("Niveles finales a establecer:", levels)

      setCurrentLevelStates(levels)
      setTempLevelStates(levels)

      // ✅ INFORMACIÓN COMPLETA PARA FICHAS CON PROGRAMACIÓN
      setFichaInfo({
        courseInfo: response.courseInfo,
        programInfo: response.programInfo,
        programmingInfo: response.programmingInfo,
        isDefault: response.isDefault,
        hasNoAssignment: response.hasNoAssignment,
        hasNoProgramming: false, // ✅ Explícitamente false
      })

      console.log("✅ Estados establecidos correctamente:")
      console.log("currentLevelStates:", levels)
      console.log("tempLevelStates:", levels)
      console.log("hasProgramming:", true)
      console.log("fichaInfo:", {
        courseInfo: response.courseInfo?.code,
        programInfo: response.programInfo?.name,
        programmingInfo: response.programmingInfo ? "Presente" : "Ausente",
        hasNoProgramming: false,
      })
    } catch (error) {
      console.error("❌ Error loading ficha levels:", error)

      // ✅ LIMPIAR ESTADOS EN CASO DE ERROR
      setCurrentLevelStates({})
      setTempLevelStates({})
      setHasChanges(false)
      setFichaInfo(null)

      setError(error.message)

      // Si el error es por falta de programación, manejarlo específicamente
      if (error.message.includes("programación de inglés")) {
        console.log("❌ Error por falta de programación")
        setHasProgramming(false)
      } else {
        console.log("❌ Error general")
        setHasProgramming(true) // Mantener true para otros errores
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleLevelToggle = useCallback(
    (levelId) => {
      if (!hasProgramming) {
        console.log("⚠️ Intento de toggle sin programación - ignorado")
        return
      }

      console.log("🔄 Toggle level:", levelId, "hasProgramming:", hasProgramming)
      setTempLevelStates((prev) => ({
        ...prev,
        [levelId]: !prev[levelId],
      }))
    },
    [hasProgramming],
  )

  const handleQuickAction = useCallback(
    (action) => {
      if (!hasProgramming) {
        console.log("⚠️ Intento de quick action sin programación - ignorado")
        return
      }

      console.log("⚡ Quick action:", action, "hasProgramming:", hasProgramming)

      const newStates = { ...tempLevelStates }
      const programmingLevels = fichaInfo?.programmingInfo?.levels || []
      const isTenico = fichaInfo?.programInfo?.level === "TECNICO"
      const maxLevels = isTenico ? Math.min(programmingLevels.length, 3) : programmingLevels.length

      switch (action) {
        case "activar-todos":
          programmingLevels.slice(0, maxLevels).forEach((level) => {
            newStates[level.id] = true
          })
          break
        case "desactivar-todos":
          programmingLevels.forEach((level) => {
            newStates[level.id] = false
          })
          break
        default:
          // Manejar acciones "hasta-X"
          if (action.startsWith("hasta-")) {
            const targetLevelId = action.replace("hasta-", "")
            const targetIndex = programmingLevels.findIndex((level) => level.id === targetLevelId)

            if (targetIndex !== -1) {
              // Desactivar todos primero
              programmingLevels.forEach((level) => {
                newStates[level.id] = false
              })

              // Activar hasta el nivel objetivo
              for (let i = 0; i <= targetIndex && i < maxLevels; i++) {
                newStates[programmingLevels[i].id] = true
              }
            }
          }
          break
      }

      setTempLevelStates(newStates)
    },
    [tempLevelStates, fichaInfo, hasProgramming],
  )

  const saveLevels = useCallback(async () => {
    if (!selectedFicha || !hasProgramming) {
      console.log("❌ No se puede guardar:", {
        selectedFicha: !!selectedFicha,
        hasProgramming,
      })
      return {
        success: false,
        message: hasProgramming ? "No hay ficha seleccionada" : "No se puede guardar sin programación de inglés",
      }
    }

    try {
      setIsSaving(true)
      setError(null)

      const userId = localStorage.getItem("userId") || "admin"

      const data = {
        levels: tempLevelStates,
        userId: userId,
      }

      console.log("=== ENVIANDO AL SERVIDOR ===")
      console.log("Ficha ID:", selectedFicha.id)
      console.log("Datos a enviar:", JSON.stringify(data, null, 2))
      console.log("tempLevelStates:", tempLevelStates)

      const response = await fichaLevelAssignmentService.saveFichaLevels(selectedFicha.id, data)

      console.log("=== RESPUESTA DEL GUARDADO ===")
      console.log("Response:", JSON.stringify(response, null, 2))

      // Actualizar estado local con los niveles guardados
      setCurrentLevelStates(tempLevelStates)
      setHasChanges(false)

      return {
        success: true,
        message: response.message || `Niveles actualizados exitosamente para la ficha ${selectedFicha.codigo}`,
      }
    } catch (error) {
      console.error("Error saving levels:", error)
      setError(error.message)
      return {
        success: false,
        message: error.message || "Error al guardar los cambios. Inténtalo de nuevo.",
      }
    } finally {
      setIsSaving(false)
    }
  }, [selectedFicha, tempLevelStates, hasProgramming])

  const resetChanges = useCallback(() => {
    console.log("🔄 Reseteando cambios")
    setTempLevelStates(currentLevelStates)
    setHasChanges(false)
    setError(null)
  }, [currentLevelStates])

  // ✅ LOGGING PARA DEBUG
  useEffect(() => {
    console.log("📊 Estado actual del hook:", {
      selectedFicha: selectedFicha?.codigo || "ninguna",
      hasProgramming,
      hasLevels: Object.keys(currentLevelStates).length > 0,
      hasChanges,
      fichaInfo: fichaInfo
        ? {
            courseCode: fichaInfo.courseInfo?.code,
            programName: fichaInfo.programInfo?.name,
            hasNoProgramming: fichaInfo.hasNoProgramming,
            programmingPresent: !!fichaInfo.programmingInfo,
          }
        : "null",
    })
  }, [selectedFicha, hasProgramming, currentLevelStates, hasChanges, fichaInfo])

  return {
    currentLevelStates,
    tempLevelStates,
    hasChanges,
    isSaving,
    isLoading,
    error,
    fichaInfo,
    hasProgramming,
    handleLevelToggle,
    handleQuickAction,
    saveLevels,
    resetChanges,
    loadFichaLevels,
    clearAllStates, // ✅ Exportar para uso externo si es necesario
  }
}
