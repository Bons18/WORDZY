"use client"

import { useState, useEffect, useCallback } from "react"

export function useApprenticeProgress(apprenticeId, level) {
  const [progress, setProgress] = useState([])
  const [apprenticeInfo, setApprenticeInfo] = useState(null)
  const [statistics, setStatistics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProgress = useCallback(async () => {
    if (!apprenticeId || !level) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `http://localhost:3000/api/apprentice-progress/apprentice/${apprenticeId}/level/${level}`,
        {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        // Usar la nueva estructura de datos
        setApprenticeInfo(data.data.apprentice)
        setProgress(data.data.evaluations || [])
        setStatistics(data.data.statistics || null)

        console.log("✅ Datos estructurados recibidos:", {
          apprentice: data.data.apprentice?.nombre,
          evaluations: data.data.evaluations?.length || 0,
          statistics: data.data.statistics,
        })
      } else {
        throw new Error(data.message || "Error al obtener el progreso")
      }
    } catch (err) {
      console.error("❌ Error al obtener progreso del aprendiz:", err)
      setError(err.message)
      setProgress([])
      setApprenticeInfo(null)
      setStatistics(null)
    } finally {
      setLoading(false)
    }
  }, [apprenticeId, level])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const refetch = useCallback(() => {
    return fetchProgress()
  }, [fetchProgress])

  return {
    progress,
    apprenticeInfo, // Nueva propiedad
    statistics,
    loading,
    error,
    refetch,
  }
}

// Hook para crear nuevo progreso
export function useCreateProgress() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createProgress = useCallback(async (progressData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:3000/api/apprentice-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(progressData),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.success) {
        return data.data
      } else {
        throw new Error(data.message || "Error al crear el progreso")
      }
    } catch (err) {
      console.error("❌ Error al crear progreso:", err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    createProgress,
    loading,
    error,
  }
}

// Hook para obtener progreso por ficha - ACTUALIZADO
export function useFichaProgress(courseId) {
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProgress = useCallback(async () => {
    if (!courseId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3000/api/apprentice-progress/course/${courseId}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      if (data.success) {
        const transformedProgress = data.data.map((item) => ({
          apprenticeId: item.apprenticeId,
          level: item.level,
          totalScore: item.totalScore || 0,
          totalMaxScore: item.totalMaxScore || 0,
          progressPercentage: item.progressPercentage || 0,
          totalAttempts: item.totalAttempts || 0,
          passedAttempts: item.passedAttempts || 0,
          apprentice: item.apprentice,
        }))

        setProgress(transformedProgress)
      } else {
        throw new Error(data.message || "Error al obtener el progreso de la ficha")
      }
    } catch (err) {
      console.error("❌ Error al obtener progreso de la ficha:", err)
      setError(err.message)
      setProgress([])
    } finally {
      setLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  const refetch = useCallback(() => {
    return fetchProgress()
  }, [fetchProgress])

  return {
    progress,
    loading,
    error,
    refetch,
  }
}
