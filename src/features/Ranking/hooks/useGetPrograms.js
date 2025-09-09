"use client"

import { useState, useEffect } from "react"
import { getPrograms } from "../services/rankingService"

export const useGetPrograms = (page = 1, limit = 100) => {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getPrograms(page, limit)

      if (response.success) {
        setPrograms(response.data || [])
        setPagination(response.pagination || null)
      } else {
        throw new Error(response.message || "Error al obtener programas")
      }
    } catch (err) {
      setError(err.message || "Error al cargar los programas")
      setPrograms([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrograms()
  }, [page, limit])

  return {
    programs,
    loading,
    error,
    pagination,
    refetch: fetchPrograms,
  }
}
