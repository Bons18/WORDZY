"use client"

import { useState } from "react"
import { updateInstructor } from "../services/instructorApiService"

const usePutInstructor = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const updateInstructorWithRole = async (instructorId, instructorData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      console.log("=== HOOK: ACTUALIZANDO INSTRUCTOR ===")
      console.log("ID:", instructorId)
      console.log("Datos:", instructorData)

      const result = await updateInstructor(instructorId, instructorData)
      console.log("Instructor actualizado exitosamente:", result)
      setSuccess(true)
      return result
    } catch (err) {
      console.error("Error al actualizar instructor:", err)
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
    updateInstructor: updateInstructorWithRole,
    loading,
    error,
    success,
    resetState,
  }
}

export default usePutInstructor
