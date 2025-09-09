"use client"

import { useState } from "react"
import { createInstructor } from "../services/instructorApiService"

const usePostInstructor = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const createInstructorWithRole = async (instructorData) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      console.log("=== HOOK: CREANDO INSTRUCTOR CON ROL ===")
      console.log("Datos recibidos:", instructorData)

      const result = await createInstructor(instructorData)
      console.log("Instructor creado exitosamente:", result)
      setSuccess(true)
      return result
    } catch (err) {
      console.error("Error al crear instructor:", err)
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
    createInstructor: createInstructorWithRole,
    loading,
    error,
    success,
    resetState,
  }
}

export default usePostInstructor
