"use client"

import { useState, useEffect } from "react"
import { useGetApprenticesByFicha } from "./use-get-apprentices-by-ficha"
import { useGetProgrammingByProgramName } from "./use-get-programming-by-program-name"

export function useApprenticesWithProgress(fichaNumber, fichaId) {
  const { apprentices, loading: apprenticesLoading, error: apprenticesError } = useGetApprenticesByFicha(fichaNumber)
  const [apprenticesWithProgress, setApprenticesWithProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fichaPrograma, setFichaPrograma] = useState("")

  // Obtener la programación del curso
  const {
    programming,
    loading: programmingLoading,
    error: programmingError,
  } = useGetProgrammingByProgramName(fichaPrograma)

  // Obtener el programa de la ficha desde sessionStorage
  useEffect(() => {
    const selectedFichaPrograma = sessionStorage.getItem("selectedFichaPrograma")
    if (selectedFichaPrograma) {
      setFichaPrograma(selectedFichaPrograma)
    }
  }, [])

  // Función para extraer todas las evaluaciones de un nivel
  const getEvaluationsFromLevel = (level) => {
    const evaluations = []

    if (level.topics && level.topics.length > 0) {
      level.topics.forEach((topic) => {
        // Agregar actividades
        if (topic.activities && topic.activities.length > 0) {
          topic.activities.forEach((activity) => {
            evaluations.push({
              evaluationId: activity.evaluationId,
              type: "activity",
              value: activity.value,
              topicId: topic.topicId,
            })
          })
        }

        // Agregar exámenes
        if (topic.exams && topic.exams.length > 0) {
          topic.exams.forEach((exam) => {
            evaluations.push({
              evaluationId: exam.evaluationId,
              type: "exam",
              value: exam.value,
              topicId: topic.topicId,
            })
          })
        }
      })
    }

    return evaluations
  }

  // Función para obtener progreso de un aprendiz específico
  const fetchApprenticeProgress = async (apprenticeId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/apprentice-progress?apprenticeId=${apprenticeId}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.data : []
    } catch (error) {
      console.error(`❌ Error obteniendo progreso para aprendiz ${apprenticeId}:`, error)
      return []
    }
  }

  useEffect(() => {
    const calculateProgressForApprentices = async () => {
      if (!apprenticesLoading && !programmingLoading && apprentices.length > 0 && programming) {
        try {
          const apprenticesWithCalculatedProgress = await Promise.all(
            apprentices.map(async (apprentice) => {
              const apprenticeId = apprentice._id || apprentice.id

              // Obtener todas las evaluaciones realizadas por el aprendiz
              const progressData = await fetchApprenticeProgress(apprenticeId)

              // Calcular progreso por nivel basado en la programación
              const progresoNiveles = []

              // Procesar cada nivel de la programación
              if (programming.levels && programming.levels.length > 0) {
                programming.levels.forEach((levelConfig, levelIndex) => {
                  const nivelNumero = levelIndex + 1

                  // Obtener todas las evaluaciones programadas para este nivel
                  const evaluacionesProgramadas = getEvaluationsFromLevel(levelConfig)

                  if (evaluacionesProgramadas.length > 0) {
                    // Obtener evaluaciones realizadas para este nivel
                    const evaluacionesRealizadas = progressData.filter((p) => p.level === nivelNumero)

                    // Para cada evaluación programada, verificar si fue APROBADA
                    let evaluacionesAprobadas = 0
                    let puntosObtenidos = 0

                    // Para cada evaluación programada, verificar si fue APROBADA
                    evaluacionesProgramadas.forEach((evalProgramada) => {
                      const evalId = evalProgramada.evaluationId

                      // Buscar si esta evaluación fue realizada Y APROBADA
                      const evalRealizada = evaluacionesRealizadas.find(
                        (er) =>
                          (er.evaluationId === evalId ||
                            er.evaluationId?._id === evalId ||
                            er.evaluationId?.toString() === evalId?.toString()) &&
                          er.passed === true, // SOLO CONTAR SI ESTÁ APROBADA
                      )

                      if (evalRealizada) {
                        evaluacionesAprobadas++ // Solo cuenta si está aprobada
                        puntosObtenidos += evalRealizada.score || 0 // Solo suma puntos de aprobadas
                        console.log(
                          `  ✅ Evaluación APROBADA: ${evalProgramada.type} (${evalId}) - ${evalRealizada.score} puntos`,
                        )
                      } else {
                        // Verificar si fue realizada pero no aprobada
                        const evalRealizadaNoAprobada = evaluacionesRealizadas.find(
                          (er) =>
                            (er.evaluationId === evalId ||
                              er.evaluationId?._id === evalId ||
                              er.evaluationId?.toString() === evalId?.toString()) &&
                            er.passed === false,
                        )
                      }
                    })

                    // PROGRESO = EVALUACIONES APROBADAS / EVALUACIONES PROGRAMADAS * 100
                    const porcentajeCompletitud = Math.round(
                      (evaluacionesAprobadas / evaluacionesProgramadas.length) * 100,
                    )

                    progresoNiveles.push({
                      nivel: nivelNumero,
                      porcentaje: porcentajeCompletitud, // Basado en evaluaciones aprobadas
                      puntosObtenidos,
                      puntosMaximosPosibles: evaluacionesProgramadas.length * 100, // Para referencia
                      evaluacionesProgramadas: evaluacionesProgramadas.length,
                      evaluacionesAprobadas, // CAMBIO: Guardar evaluaciones aprobadas
                      evaluacionesPendientes: evaluacionesProgramadas.length - evaluacionesAprobadas,
                    })

                  } else {
                    // Nivel sin evaluaciones programadas
                    progresoNiveles.push({
                      nivel: nivelNumero,
                      porcentaje: 0,
                      puntosObtenidos: 0,
                      puntosMaximosPosibles: 0,
                      evaluacionesProgramadas: 0,
                      evaluacionesAprobadas: 0,
                      evaluacionesPendientes: 0,
                    })
                  }
                })
              }

              // Calcular puntos totales del nivel actual
              const nivelActual = Number.parseInt(sessionStorage.getItem("selectedNivelNumber")) || 1
              const progresoNivelActual = progresoNiveles.find((p) => p.nivel === nivelActual)
              const puntosTotales = progresoNivelActual?.puntosObtenidos || 0

              return {
                ...apprentice,
                progresoNiveles,
                puntos: puntosTotales,
                // Progreso general basado en niveles con evaluaciones
                progresoActual:
                  progresoNiveles.length > 0
                    ? Math.round(
                        progresoNiveles
                          .filter((p) => p.evaluacionesProgramadas > 0)
                          .reduce((sum, p) => sum + p.porcentaje, 0) /
                          Math.max(1, progresoNiveles.filter((p) => p.evaluacionesProgramadas > 0).length),
                      )
                    : 0,
              }
            }),
          )

          setApprenticesWithProgress(apprenticesWithCalculatedProgress)
          setError(null)
        } catch (err) {
          console.error("❌ Error calculando progreso:", err)
          setError("Error al calcular el progreso de los aprendices")
          setApprenticesWithProgress(apprentices) // Fallback a datos originales
        }
      } else if (apprenticesError || programmingError) {
        setError(apprenticesError || programmingError)
      }

      setLoading(apprenticesLoading || programmingLoading)
    }

    calculateProgressForApprentices()
  }, [apprentices, apprenticesLoading, programming, programmingLoading, apprenticesError, programmingError])

  return {
    apprentices: apprenticesWithProgress,
    loading,
    error,
  }
}
