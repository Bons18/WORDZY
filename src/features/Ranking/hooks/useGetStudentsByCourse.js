"use client"

import { useState, useEffect } from "react"
import { getStudentsByFicha } from "../services/rankingService"

export const useGetStudentsByCourse = (courseCode) => {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStudentsByCourse = async () => {
    if (!courseCode) {
      setStudents([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Fetching students by course:", courseCode)

      const response = await getStudentsByFicha(courseCode)

      if (response.success) {
        console.log("✅ Students by course fetched successfully:", response.data.length)
        setStudents(response.data)
      } else {
        throw new Error(response.message || "Error al obtener estudiantes por ficha")
      }
    } catch (err) {
      console.error("❌ Error fetching students by course:", err)
      setError(err.message || "Error al cargar estudiantes por ficha")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudentsByCourse()
  }, [courseCode])

  return {
    students,
    loading,
    error,
    refetch: fetchStudentsByCourse,
  }
}
