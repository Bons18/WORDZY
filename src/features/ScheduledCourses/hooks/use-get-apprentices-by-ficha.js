"use client"

import { useState, useEffect } from "react"
import useGetApprentices from "../../Apprentices/hooks/useGetApprentices"


export function useGetApprenticesByFicha(fichaNumber) {
  const { apprentices, loading: apprenticesLoading, error: apprenticesError } = useGetApprentices()
  const [apprenticesByFicha, setApprenticesByFicha] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!apprenticesLoading && apprentices.length > 0 && fichaNumber) {
      try {
        // Filtrar aprendices por ficha
        const filteredApprentices = apprentices.filter(
          (apprentice) => apprentice.ficha && apprentice.ficha.includes(Number.parseInt(fichaNumber)),
        )

        setApprenticesByFicha(filteredApprentices)
        setError(null)
      } catch (err) {
        setError("Error al filtrar aprendices por ficha")
        console.error("Error al filtrar aprendices:", err)
      }
    }

    setLoading(apprenticesLoading)
  }, [apprentices, apprenticesLoading, fichaNumber])

  useEffect(() => {
    if (apprenticesError) {
      setError(apprenticesError)
    }
  }, [apprenticesError])

  return {
    apprentices: apprenticesByFicha,
    loading,
    error,
  }
}
