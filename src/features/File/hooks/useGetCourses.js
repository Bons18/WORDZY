
"use client"

import { useState, useEffect } from "react"
import { courseService } from "../services/courseService"

export const useGetCourses = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await courseService.getAll()
      setCourses(data)
    } catch (err) {
      console.error("❌ API Error:", err.response?.status, err.response?.data || err.message)
      console.error("Error fetching courses:", err)
      setError(err.response?.data?.message || err.message || "Error al cargar cursos")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return {
    courses,
    loading,
    error,
    refetch: fetchCourses,
  }
}

export default useGetCourses
