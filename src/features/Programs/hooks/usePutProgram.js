
"use client"

import { useState } from "react"
import { programService } from "../services/programService"

export const usePutProgram = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateProgram = async (id, programData) => {
    try {
      setLoading(true)
      setError(null)
      const result = await programService.update(id, programData)
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error al actualizar programa"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    updateProgram,
    loading,
    error,
  }
}
