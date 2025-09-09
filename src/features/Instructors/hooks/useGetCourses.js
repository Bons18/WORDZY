"use client"

import { useState } from "react"
import { getCourses } from "../services/courseService"

const useGetCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  const loadCoursesOnDemand = async () => {
    if (hasLoaded || loading) return // Evitar cargas duplicadas

    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Iniciando carga de cursos...")
      const data = await getCourses()
      console.log("✅ Cursos cargados en hook:", data)

      setCourses(data)
      setHasLoaded(true)
    } catch (err) {
      console.error("❌ Error al cargar cursos en hook:", err)
      setError(err.message || "Error al cargar los cursos")
    } finally {
      setLoading(false)
    }
  }

  return {
    courses,
    loading,
    error,
    hasLoaded,
    loadCoursesOnDemand,
  }
}

export default useGetCourses
