"use client"

import { useState } from "react"

const useDeleteEvaluation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const deleteEvaluation = async (id) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:3000/api/evaluation/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al eliminar la evaluación")
      }

      return await response.json()
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { deleteEvaluation, loading, error }
}

export default useDeleteEvaluation
