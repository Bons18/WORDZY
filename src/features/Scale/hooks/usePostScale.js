
"use client"

import { useState } from "react"
import { createScale } from "../services/scaleService"

export const usePostScale = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const createNewScale = async (scaleData) => {
    try {
      console.log("🚀 usePostScale.createNewScale - INICIANDO")
      setLoading(true)
      setError(null)

      console.log("📤 usePostScale - Datos a enviar:", scaleData)

      const response = await createScale(scaleData)
      console.log("📥 usePostScale - Respuesta:", response)

      setLoading(false)

      // Verificar si la respuesta indica éxito
      if (response && response.success !== false) {
        console.log("✅ usePostScale - Escala creada exitosamente")
        return { success: true, data: response }
      } else {
        console.error("❌ usePostScale - Error en respuesta:", response)
        return {
          success: false,
          message: response?.message || "Error al crear la escala",
          errors: response?.errors || [],
        }
      }
    } catch (err) {
      console.error("❌ usePostScale - ERROR:", err)
      setLoading(false)
      setError(err.message)

      return {
        success: false,
        message: err.message || "Error al crear la escala",
        errors: [],
      }
    }
  }

  return {
    createNewScale,
    loading,
    error,
  }
}

export default usePostScale
