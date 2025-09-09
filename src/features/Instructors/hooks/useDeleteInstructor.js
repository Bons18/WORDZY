"use client"

import { useState } from "react"

const useDeleteInstructor = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const deleteInstructor = async (id) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      console.log("ID recibido para eliminar:", id)

      if (!id) {
        throw new Error("ID de instructor requerido")
      }

      // Validar que el ID sea una cadena válida
      if (typeof id !== "string" || id.trim() === "") {
        throw new Error("ID de instructor inválido")
      }

      console.log("Eliminando instructor con ID:", id)

      const response = await fetch(`http://localhost:3000/api/instructor/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log("Respuesta del servidor:", response.status, response.statusText)

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { message: `Error ${response.status}: ${response.statusText}` }
        }
        console.error("Error del servidor:", errorData)
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log("Instructor eliminado exitosamente:", result)
      setSuccess(true)
      return true
    } catch (err) {
      console.error("Error al eliminar instructor:", err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const resetState = () => {
    setError(null)
    setSuccess(false)
    setLoading(false)
  }

  return {
    deleteInstructor,
    loading,
    error,
    success,
    resetState,
  }
}

export default useDeleteInstructor
