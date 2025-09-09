
"use client"

import { useState } from "react"
import { programService } from "../services/programService"

export const usePostProgram = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createProgram = async (programData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await programService.create(programData)
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error al crear programa"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    createProgram,
    loading,
    error,
  }
}
