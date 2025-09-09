"use client"

import { useState, useEffect } from "react"
import { getStudentsByPrograma } from "../services/rankingService"

export const useGetStudentsByProgram = (programCode) => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStudentsByProgram = async () => {
    if (!programCode) {
      setStudents([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Fetching students by program:", programCode)

      const response = await getStudentsByPrograma(programCode)

      if (response.success) {
        console.log("✅ Students by program fetched successfully:", response.data.length)
        setStudents(response.data)
      } else {
        throw new Error(response.message || "Error al obtener estudiantes por programa")
      }
    } catch (err) {
      console.error("❌ Error fetching students by program:", err)
      setError(err.message || "Error al cargar estudiantes por programa")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentsByProgram()
  }, [programCode])

  return {
    students,
    loading,
    error,
    refetch: fetchStudentsByProgram,
  }
}
