"use client"

import { useState, useEffect } from "react"
import { getRankingMetrics, getFichasByPrograma, getProgramasByFicha } from "../services/rankingService"

export const useGetRankingMetrics = (year = null, month = null) => {
  const [metrics, setMetrics] = useState({ aprendices: 0, fichas: 0, programas: 0 })
  const [courses, setCourses] = useState([])
  const [students, setStudents] = useState([])
  const [programs, setPrograms] = useState([])
  const [fichas, setFichas] = useState([])
  const [programas, setProgramas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [allStudents, setAllStudents] = useState([]) // Guardar todos los estudiantes para filtros

  const fetchRankingMetrics = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🚀 useGetRankingMetrics: Starting fetch...")

      const response = await getRankingMetrics(year, month)

      if (response.success) {
        console.log("✅ useGetRankingMetrics: Data received successfully")
        console.log("📊 Metrics:", response.data)
        console.log("👥 Students received:", response.students?.length || 0)
        console.log("🏫 Fichas received:", response.fichas?.length || 0)
        console.log("📚 Programas received:", response.programas?.length || 0)
        console.log("📋 Fichas data:", response.fichas?.length || 0, "fichas")
        console.log("🎓 Programas data:", response.programas?.length || 0, "programas")

        setMetrics(response.data)
        setCourses(response.fichas || []) // Para compatibilidad
        setStudents(response.students || [])
        setPrograms(response.programas || []) // Para compatibilidad
        setFichas(response.fichas || [])
        setProgramas(response.programas || [])
        setAllStudents(response.students || []) // Guardar todos los estudiantes
        
        console.log("🎯 State updated - Students:", response.students?.length || 0)
        console.log("🎯 State updated - Fichas:", response.fichas?.length || 0)
        console.log("🎯 State updated - Programas:", response.programas?.length || 0)
      } else {
        console.warn("⚠️ No success response from getRankingMetrics")
        throw new Error(response.message || "Error al obtener métricas del ranking")
      }
    } catch (err) {
      console.error("❌ useGetRankingMetrics error:", err)
      setError(err.message || "Error al cargar las métricas del ranking")

      // Establecer datos de prueba si hay error
      console.log("🔧 Setting test data due to API error...")
      // Usar los datos de prueba del servicio
      const { getStudentPoints } = await import('../services/rankingService')
      const testResponse = await getStudentPoints()
      const testStudents = testResponse.data || []

      // Generar fichas y programas únicos desde los datos de prueba
      const uniqueFichas = getUniqueFichas(testStudents)
      const uniqueProgramas = getUniqueProgramas(testStudents)
      
      setMetrics({ aprendices: testStudents.length, fichas: uniqueFichas.length, programas: uniqueProgramas.length })
      setFichas(uniqueFichas)
      setProgramas(uniqueProgramas)
      setStudents(testStudents)
      setAllStudents(testStudents)
      setCourses(uniqueFichas) // Para compatibilidad
      setPrograms(uniqueProgramas) // Para compatibilidad
    } finally {
      setLoading(false)
    }
  }

  // Función para actualizar fichas basado en programa seleccionado
  const updateFichasByPrograma = (programa) => {
    if (!programa) {
      setFichas(getUniqueFichas(allStudents))
      setCourses(getUniqueFichas(allStudents))
    } else {
      const fichasRelacionadas = getFichasByPrograma(allStudents, programa)
      setFichas(fichasRelacionadas)
      setCourses(fichasRelacionadas)
    }
  }

  // Función para actualizar programas basado en ficha seleccionada
  const updateProgramasByFicha = (ficha) => {
    if (!ficha) {
      setProgramas(getUniqueProgramas(allStudents))
      setPrograms(getUniqueProgramas(allStudents))
    } else {
      const programasRelacionados = getProgramasByFicha(allStudents, ficha)
      setProgramas(programasRelacionados)
      setPrograms(programasRelacionados)
    }
  }

  // Función helper para obtener fichas únicas
  const getUniqueFichas = (students) => {
    const uniqueFichas = new Set()
    students.forEach((student) => {
      if (student.ficha && Array.isArray(student.ficha)) {
        student.ficha.forEach((f) => uniqueFichas.add(f))
      }
    })
    return Array.from(uniqueFichas)
      .sort()
      .map((ficha) => ({
        id: ficha,
        name: `Ficha ${ficha}`,
        code: ficha,
      }))
  }

  // Función helper para obtener programas únicos
  const getUniqueProgramas = (students) => {
    const uniqueProgramas = new Set()
    students.forEach((student) => {
      if (student.programa) {
        uniqueProgramas.add(student.programa)
      }
    })
    return Array.from(uniqueProgramas)
      .sort()
      .map((programa) => ({
        id: programa,
        name: programa,
        code: programa.replace(/\s+/g, "_").toUpperCase(),
      }))
  }

  useEffect(() => {
    fetchRankingMetrics()
  }, [year, month])

  return {
    metrics,
    courses,
    students,
    programs,
    fichas,
    programas,
    allStudents,
    loading,
    error,
    refetch: fetchRankingMetrics,
    updateFichasByPrograma,
    updateProgramasByFicha,
  }
}
