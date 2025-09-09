"use client"

import { useState, useEffect } from "react"
import { getCourses } from "../services/rankingService"

export const useGetCourses = (page = 1, limit = 100) => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getCourses(page, limit)

      if (response.success) {
        setCourses(response.data || [])
        setPagination(response.pagination || null)
      } else {
        throw new Error(response.message || "Error al obtener cursos")
      }
    } catch (err) {
      setError(err.message || "Error al cargar los cursos")
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [page, limit])

  return {
    courses,
    loading,
    error,
    pagination,
    refetch: fetchCourses,
  }
}
