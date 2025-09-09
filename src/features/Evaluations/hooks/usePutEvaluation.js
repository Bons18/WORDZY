"use client"

import { useState } from "react"

const usePutEvaluation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateEvaluation = async (id, formData) => {
    try {
      setLoading(true)
      setError(null)

      // Verificar si estamos usando FormData o un objeto regular
      const isFormData = formData instanceof FormData

      // Si es FormData y no tiene el ID, añadirlo
      if (isFormData && !formData.has("id")) {
        formData.append("id", id)
      }

      // Configurar la petición
      const options = {
        method: "PUT",
        // No establecer Content-Type si es FormData, el navegador lo hará automáticamente
        headers: isFormData
          ? undefined
          : {
              "Content-Type": "application/json",
            },
        body: isFormData ? formData : JSON.stringify(formData),
      }

      // Realizar la petición a la API
      const response = await fetch(`http://localhost:3000/api/evaluation/${id}`, options)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al actualizar la evaluación")
      }

      const data = await response.json()
      return data
    } catch (error) {
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return { updateEvaluation, loading, error }
}

export default usePutEvaluation
