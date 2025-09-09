"use client"

import { useState } from "react"
import { getStudentDetails, getStudentFailedQuestions } from "../services/feedbackService"

export const useStudentDetails = () => {
  const [studentData, setStudentData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadStudentData = async (feedbackId) => {
    try {
      setLoading(true)
      setError(null)

      console.log("Cargando datos de estudiantes para feedback ID:", feedbackId)

      const students = await getStudentDetails(feedbackId)

      console.log("Estudiantes cargados:", students.length)
      setStudentData(students)
    } catch (err) {
      console.error("Error al cargar estudiantes:", err)
      setError(err.message || "Error al cargar los datos de estudiantes")
      setStudentData([])
    } finally {
      setLoading(false)
    }
  }

  const loadFailedQuestions = async (studentId, feedbackId) => {
    try {
      console.log("Cargando preguntas falladas para estudiante:", studentId)

      const questions = await getStudentFailedQuestions(studentId, feedbackId)

      console.log("Preguntas falladas cargadas:", questions.length)
      return questions
    } catch (err) {
      console.error("Error al cargar preguntas falladas:", err)
      throw new Error(err.message || "Error al cargar las preguntas falladas")
    }
  }

  return {
    studentData,
    loading,
    error,
    loadStudentData,
    loadFailedQuestions,
  }
}
