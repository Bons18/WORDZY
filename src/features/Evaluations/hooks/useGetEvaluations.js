"use client"

import { useState, useEffect, useCallback } from "react"

const useGetEvaluations = () => {
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvaluations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("http://localhost:3000/api/evaluation")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al obtener las evaluaciones")
      }

      const data = await response.json()
      setEvaluations(data)
    } catch (error) {
      setError(error.message)
      console.error("Error fetching evaluations:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar evaluaciones al montar el componente
  useEffect(() => {
    fetchEvaluations()
  }, [fetchEvaluations])

  return { evaluations, loading, error, refetch: fetchEvaluations }
}

export default useGetEvaluations
