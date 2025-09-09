"use client"

import { useState, useEffect } from "react"
import { getStudents } from "../services/rankingService"

export const useGetStudents = (page = 1, limit = 100) => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getStudents(page, limit)

      if (response.success) {
        setStudents(response.data || [])
        setPagination(response.pagination || null)
      } else {
        throw new Error(response.message || "Error al obtener estudiantes")
      }
    } catch (err) {
      setError(err.message || "Error al cargar los estudiantes")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [page, limit])

  return {
    students,
    loading,
    error,
    pagination,
    refetch: fetchStudents,
  }
}
