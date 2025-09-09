"use client"

import { useState } from "react"

// ✅ NUEVO HOOK: Para verificar si un tema puede cambiar de estado
export function useCheckTopicStatusChange() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const checkStatusChange = async (topicId, newStatus) => {
    setLoading(true)
    setError(null)

    try {
      // Si se está activando el tema, no hay restricciones
      if (newStatus === true) {
        return { canChange: true, reason: null }
      }

      // Si se está desactivando, verificar si está en uso
      const response = await fetch(`http://localhost:3000/api/topic/${topicId}/usage`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Error al verificar el uso del tema")
      }

      // Si está en uso y se intenta desactivar, no permitir
      if (data.isInUse && newStatus === false) {
        return {
          canChange: false,
          reason: "in_use",
          usageInfo: data,
        }
      }

      return { canChange: true, reason: null }
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { checkStatusChange, loading, error }
}
