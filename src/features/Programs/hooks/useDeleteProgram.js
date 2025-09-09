
"use client"

import { useState } from "react"
import { programService } from "../services/programService"

export const useDeleteProgram = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteProgram = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const result = await programService.delete(id)
      return result
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error al eliminar programa"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    deleteProgram,
    loading,
    error,
  }
}
