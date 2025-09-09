
"use client"

import { useState, useEffect } from "react"
import { programService } from "../services/programService"

export const useGetPrograms = () => {
  const [programs, setPrograms] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPrograms = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await programService.getAll()
      setPrograms(data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Error al cargar programas")
      console.error("Error fetching programs:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrograms()
  }, [])

  return {
    programs,
    loading,
    error,
    refetch: fetchPrograms,
  }
}
