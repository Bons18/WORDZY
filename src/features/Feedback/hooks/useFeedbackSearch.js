"use client"

import { useState } from "react"
import { searchFeedbackData } from "../services/feedbackService"

export const useFeedbackSearch = () => {
  const [feedbackData, setFeedbackData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)

  const searchFeedback = async (filters) => {
    try {
      setLoading(true)
      setError(null)

      console.log("Iniciando búsqueda con filtros:", filters)

      const results = await searchFeedbackData(filters)

      console.log("Resultados encontrados:", results.length)
      setFeedbackData(results)
      setHasSearched(true)
    } catch (err) {
      console.error("Error en la búsqueda:", err)
      setError(err.message || "Error al realizar la búsqueda")
      setFeedbackData([])
    } finally {
      setLoading(false)
    }
  }

  const resetSearch = () => {
    setFeedbackData([])
    setHasSearched(false)
    setError(null)
    setLoading(false)
  }

  return {
    feedbackData,
    loading,
    error,
    hasSearched,
    searchFeedback,
    resetSearch,
  }
}
