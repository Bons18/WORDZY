"use client"

// Crear el hook usePostEvaluation para manejar correctamente FormData
// Este es un nuevo archivo

import { useState } from "react"

const usePostEvaluation = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createEvaluation = async (formData) => {
    try {
      setLoading(true)
      setError(null)

      // Verificar si estamos usando FormData o un objeto regular
      const isFormData = formData instanceof FormData

      // Configurar la petición
      const options = {
        method: "POST",
        // No establecer Content-Type si es FormData, el navegador lo hará automáticamente
        headers: isFormData
          ? undefined
          : {
              "Content-Type": "application/json",
            },
        body: isFormData ? formData : JSON.stringify(formData),
      }

      // Realizar la petición a la API
      const response = await fetch("http://localhost:3000/api/evaluation", options)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Error al crear la evaluación")
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

  return { createEvaluation, loading, error }
}

export default usePostEvaluation
