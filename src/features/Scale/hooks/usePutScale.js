
"use client"

import { useState } from "react"
import { updateScale } from "../services/scaleService"

export const usePutScale = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const updateExistingScale = async (id, scaleData) => {
    try {
      setLoading(true)
      setError(null)

      console.log("📤 usePutScale - Actualizando escala:", id)
      console.log("📋 Datos recibidos en hook:", JSON.stringify(scaleData, null, 2))

      const response = await updateScale(id, scaleData)

      console.log("📥 usePutScale - Respuesta del servicio:", response)

      if (response && response.success !== false) {
        console.log("✅ usePutScale - Escala actualizada exitosamente")
        return { success: true, data: response.data || response }
      } else {
        console.error("❌ usePutScale - Error en respuesta:", response)
        const errorMessage = response.message || "Error al actualizar la escala"
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage,
          errors: response.errors || [],
        }
      }
    } catch (err) {
      console.error("❌ usePutScale - Error capturado:", err)
      console.error("❌ usePutScale - Error message:", err.message)

      const errorMessage = err.message || "Error al actualizar la escala"
      setError(errorMessage)

      return {
        success: false,
        message: errorMessage,
        errors: [],
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    updateExistingScale,
    loading,
    error,
  }
}

export default usePutScale
