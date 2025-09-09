"use client"

import { useState, useEffect, useCallback } from "react"
import { useGetCourseProgrammings } from "../../CourseProgramming/hooks/useGetCoursePrograming"
import useGetCourses from "../../File/hooks/useGetCourses"
import useGetApprentices from "../../Apprentices/hooks/useGetApprentices"
import dashboardService from "../../../services/dashboardService"

export function useDashboardData(filters = {}) {
  const { courses, loading: coursesLoading } = useGetCourses()
  const { programmings, loading: programmingsLoading } = useGetCourseProgrammings()
  const { apprentices, loading: apprenticesLoading } = useGetApprentices()

  const [dashboardData, setDashboardData] = useState({
    levelProgress: [],
    totalStats: {
      totalFichas: 0,
      totalApprentices: 0,
      totalLevels: 0,
    },
  })
  const [rankingData, setRankingData] = useState(null)
  const [competenciesData, setCompetenciesData] = useState(null)
  const [lessonStats, setLessonStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastFetch, setLastFetch] = useState(null)

  // Función para obtener datos del dashboard desde la API
  const fetchDashboardData = useCallback(async (currentFilters = {}) => {
    try {
      setLoading(true)
      setError(null)
      
      // Crear clave de cache basada en filtros
      const cacheKey = `dashboard_${JSON.stringify(currentFilters)}`
      
      // Intentar obtener datos del cache primero
      const cachedData = dashboardService.constructor.getCachedData(cacheKey)
      if (cachedData && Date.now() - (lastFetch || 0) < 30000) { // 30 segundos
        setDashboardData(cachedData.dashboard)
        setRankingData(cachedData.ranking)
        setCompetenciesData(cachedData.competencies)
        setLessonStats(cachedData.lessons)
        setLoading(false)
        return
      }
      
      // Realizar peticiones en paralelo para mejor rendimiento
      const [dashboardStats, ranking, competencies, lessons] = await Promise.all([
        dashboardService.getLevelProgressData(currentFilters),
        dashboardService.getDashboardRanking({ ...currentFilters, limit: 10 }),
        dashboardService.getLanguageCompetencies({ ...currentFilters, level: 1 }),
        dashboardService.getLessonStats({ ...currentFilters, level: 1 })
      ])
      
      // Procesar y establecer datos
      const processedData = {
        dashboard: dashboardStats.data,
        ranking: ranking.data,
        competencies: competencies.data,
        lessons: lessons.data
      }
      
      // Guardar en cache
      dashboardService.constructor.setCachedData(cacheKey, processedData)
      
      setDashboardData(processedData.dashboard)
      setRankingData(processedData.ranking)
      setCompetenciesData(processedData.competencies)
      setLessonStats(processedData.lessons)
      setLastFetch(Date.now())
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err.message || 'Error al cargar datos del dashboard')
    } finally {
      setLoading(false)
    }
  }, [lastFetch])

  // Función para extraer evaluaciones de un nivel
  const getEvaluationsFromLevel = (level) => {
    const evaluations = []
    if (level.topics && level.topics.length > 0) {
      level.topics.forEach((topic) => {
        if (topic.activities && topic.activities.length > 0) {
          topic.activities.forEach((activity) => {
            evaluations.push({
              evaluationId: activity.evaluationId,
              type: "activity",
              value: activity.value,
            })
          })
        }
        if (topic.exams && topic.exams.length > 0) {
          topic.exams.forEach((exam) => {
            evaluations.push({
              evaluationId: exam.evaluationId,
              type: "exam",
              value: exam.value,
            })
          })
        }
      })
    }
    return evaluations
  }

  // Función para refrescar datos específicos
  const refreshRanking = useCallback(async (rankingFilters = {}) => {
    try {
      const ranking = await dashboardService.getDashboardRanking({ ...filters, ...rankingFilters, limit: 10 })
      setRankingData(ranking.data)
    } catch (err) {
      console.error('Error refreshing ranking:', err)
    }
  }, [filters])
  
  const refreshCompetencies = useCallback(async (level = 1) => {
    try {
      const competencies = await dashboardService.getLanguageCompetencies({ ...filters, level })
      setCompetenciesData(competencies.data)
    } catch (err) {
      console.error('Error refreshing competencies:', err)
    }
  }, [filters])
  
  const refreshLessonStats = useCallback(async (level = 1) => {
    try {
      const lessons = await dashboardService.getLessonStats({ ...filters, level })
      setLessonStats(lessons.data)
    } catch (err) {
      console.error('Error refreshing lesson stats:', err)
    }
  }, [filters])

  // Función para obtener progreso de un aprendiz
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

  // Función para limpiar cache cuando sea necesario
  const clearCache = useCallback(() => {
    dashboardService.constructor.clearCache()
  }, [])

  // Función mejorada para encontrar programación por ficha
  const findProgrammingForCourse = (course, programmings) => {
    const courseProgramName = course.fk_programs?.toUpperCase().trim()

    return programmings.find((prog) => {
      const progName = prog.programId?.name?.toUpperCase().trim()
      const progAbbr = prog.programId?.abbreviation?.toUpperCase().trim()

      // Buscar coincidencias exactas
      return progName === courseProgramName || progAbbr === courseProgramName
    })
  }

  // Función principal para calcular datos del dashboard
  const calculateDashboardData = async () => {
    if (coursesLoading || programmingsLoading || apprenticesLoading) {
      return
    }

    try {
      setLoading(true)

      console.log("🚀 Iniciando cálculo del dashboard...")
      console.log("📊 Datos disponibles:", {
        courses: courses.length,
        programmings: programmings.length,
        apprentices: apprentices.length,
      })

      // Usar TODAS las fichas sin filtrar por año
      const validCourses = courses
      console.log(`📅 Procesando TODAS las fichas disponibles:`, validCourses.length)

      // Encontrar fichas que tienen programación de inglés
      const coursesWithProgramming = []
      const coursesWithoutProgramming = []

      validCourses.forEach((course) => {
        const programming = findProgrammingForCourse(course, programmings)
        if (programming && programming.levels && programming.levels.length > 0) {
          coursesWithProgramming.push(course)
          console.log(`✅ Ficha ${course.code} (${course.fk_programs}) TIENE programación`)
        } else {
          coursesWithoutProgramming.push(course)
          console.log(`❌ Ficha ${course.code} (${course.fk_programs}) SIN programación`)
        }
      })

      console.log("📚 Fichas con programación de inglés:", coursesWithProgramming.length)
      console.log("🚫 Fichas sin programación de inglés:", coursesWithoutProgramming.length)

      if (coursesWithProgramming.length === 0) {
        console.log("⚠️ No hay fichas con programación de inglés")
        setDashboardData({
          levelProgress: [],
          totalStats: {
            totalFichas: 0,
            totalApprentices: 0,
            totalLevels: 0,
          },
        })
        return
      }

      // Crear un mapa de niveles únicos
      const allLevelsMap = new Map()

      // PASO 1: Identificar todos los niveles únicos disponibles en todas las programaciones
      programmings.forEach((programming) => {
        if (programming.levels && programming.levels.length > 0) {
          programming.levels.forEach((level, levelIndex) => {
            const levelNumber = levelIndex + 1
            const levelName = level.name || `Nivel ${levelNumber}`

            // Obtener evaluaciones programadas para este nivel
            const evaluacionesProgramadas = getEvaluationsFromLevel(level)

            if (evaluacionesProgramadas.length > 0) {
              if (!allLevelsMap.has(levelNumber)) {
                allLevelsMap.set(levelNumber, {
                  nivel: levelName,
                  cantidadFichas: 0,
                  cantidadAprendices: 0,
                  totalCompletitud: 0,
                  aprendicesConProgreso: 0, // Solo los que tienen progreso
                  fichasWithThisLevel: new Set(),
                  aprendicesUnicos: new Set(), // Para evitar duplicados
                  evaluacionesProgramadas: evaluacionesProgramadas,
                })
                console.log(`🆕 Nivel global creado: ${levelName} con ${evaluacionesProgramadas.length} evaluaciones`)
              }
            }
          })
        }
      })

      console.log(`🎯 Niveles globales identificados: ${allLevelsMap.size}`)

      // PASO 2: Procesar cada ficha con programación
      for (const course of coursesWithProgramming) {
        console.log(`\n🔄 Procesando ficha: ${course.code} - ${course.fk_programs}`)

        const programming = findProgrammingForCourse(course, programmings)

        if (!programming) {
          console.log(`❌ No se encontró programación para: ${course.fk_programs}`)
          continue
        }

        // Obtener aprendices de esta ficha
        const fichaApprentices = apprentices.filter((apprentice) => {
          const hasThisFicha = apprentice.ficha && apprentice.ficha.includes(Number.parseInt(course.code))
          return hasThisFicha
        })

        console.log(`👥 Aprendices en ficha ${course.code}:`, fichaApprentices.length)

        // PASO 3: Para cada nivel que existe en esta programación
        for (let levelIndex = 0; levelIndex < programming.levels.length; levelIndex++) {
          const level = programming.levels[levelIndex]
          const levelNumber = levelIndex + 1

          // Verificar si este nivel existe en el mapa global
          if (!allLevelsMap.has(levelNumber)) {
            console.log(`⚠️ Nivel ${levelNumber} no existe en mapa global - saltando`)
            continue
          }

          const levelData = allLevelsMap.get(levelNumber)
          const evaluacionesProgramadas = levelData.evaluacionesProgramadas

          console.log(`\n📖 Procesando nivel ${levelNumber} para ficha ${course.code}`)

          // SIEMPRE agregar esta ficha al nivel (aunque no tenga aprendices)
          if (!levelData.fichasWithThisLevel.has(course.code)) {
            levelData.fichasWithThisLevel.add(course.code)
            levelData.cantidadFichas++
            console.log(
              `✅ Ficha ${course.code} agregada al nivel ${levelNumber} (total fichas: ${levelData.cantidadFichas})`,
            )
          }

          // PASO 4: Procesar TODOS los aprendices de esta ficha para este nivel
          for (const apprentice of fichaApprentices) {
            const apprenticeId = apprentice._id || apprentice.id
            const apprenticeName = apprentice.nombre || apprentice.name || apprenticeId

            // SIEMPRE contar el aprendiz (aunque no tenga progreso)
            if (!levelData.aprendicesUnicos.has(apprenticeId)) {
              levelData.aprendicesUnicos.add(apprenticeId)
              levelData.cantidadAprendices++
              console.log(
                `👤 Aprendiz ${apprenticeName} agregado al nivel ${levelNumber} (total: ${levelData.cantidadAprendices})`,
              )
            }

            // Obtener progreso del aprendiz
            const progressData = await fetchApprenticeProgress(apprenticeId)

            // Filtrar evaluaciones de este nivel específico
            const evaluacionesRealizadas = progressData.filter((p) => p.level === levelNumber)

            if (evaluacionesRealizadas.length > 0) {
              console.log(
                `📊 Aprendiz ${apprenticeName} tiene ${evaluacionesRealizadas.length} evaluaciones realizadas`,
              )

              // Contar evaluaciones aprobadas
              let evaluacionesAprobadas = 0
              evaluacionesProgramadas.forEach((evalProgramada) => {
                const evalId = evalProgramada.evaluationId
                const evalRealizada = evaluacionesRealizadas.find(
                  (er) =>
                    (er.evaluationId === evalId ||
                      er.evaluationId?._id === evalId ||
                      er.evaluationId?.toString() === evalId?.toString()) &&
                    er.passed === true,
                )

                if (evalRealizada) {
                  evaluacionesAprobadas++
                }
              })

              // Calcular porcentaje de completitud para este aprendiz
              const completitudAprendiz = (evaluacionesAprobadas / evaluacionesProgramadas.length) * 100

              // SOLO sumar al promedio si tiene progreso
              levelData.totalCompletitud += completitudAprendiz
              levelData.aprendicesConProgreso++

              console.log(
                `📊 ${apprenticeName} en nivel ${levelNumber}: ${evaluacionesAprobadas}/${evaluacionesProgramadas.length} (${Math.round(completitudAprendiz)}%) - Aprendices con progreso: ${levelData.aprendicesConProgreso}`,
              )
            } else {
              console.log(`⚪ Aprendiz ${apprenticeName} sin progreso en nivel ${levelNumber}`)
            }
          }
        }
      }

      console.log("\n🗺️ Mapa de niveles final:")
      allLevelsMap.forEach((data, levelNumber) => {
        console.log(`Nivel ${levelNumber}:`, {
          nombre: data.nivel,
          fichas: data.cantidadFichas,
          aprendicesTotal: data.cantidadAprendices,
          aprendicesConProgreso: data.aprendicesConProgreso,
          completitudTotal: data.totalCompletitud,
        })
      })

      // Convertir Map a array y calcular promedios finales
      const levelProgressArray = Array.from(allLevelsMap.entries())
        .map(([levelNumber, data]) => {
          // Calcular progreso considerando TODOS los aprendices (con y sin progreso)
          // Los que no tienen progreso cuentan como 0%
          const progresoPromedio =
            data.cantidadAprendices > 0 ? Math.round(data.totalCompletitud / data.cantidadAprendices) : 0

          console.log(
            `📊 Cálculo de progreso para Nivel ${levelNumber}:
  - Total aprendices: ${data.cantidadAprendices}
  - Con progreso: ${data.aprendicesConProgreso} 
  - Sin progreso: ${data.cantidadAprendices - data.aprendicesConProgreso} (cuentan como 0%)
  - Suma total completitud: ${data.totalCompletitud}
  - Progreso promedio: ${progresoPromedio}% (${data.totalCompletitud} ÷ ${data.cantidadAprendices})`,
          )

          console.log(
            `📈 RESULTADO Nivel ${levelNumber} - Fichas: ${data.cantidadFichas}, Aprendices Total: ${data.cantidadAprendices}, Con Progreso: ${data.aprendicesConProgreso}, Sin Progreso: ${data.cantidadAprendices - data.aprendicesConProgreso}, Progreso Promedio: ${progresoPromedio}%`,
          )

          return {
            id: levelNumber,
            nivel: data.nivel,
            cantidadFichas: data.cantidadFichas,
            cantidadAprendices: data.cantidadAprendices, // Total de aprendices
            progreso: `${progresoPromedio}%`, // Promedio de TODOS (incluyendo 0% para los sin progreso)
          }
        })
        .filter((level) => level.cantidadFichas > 0) // Solo mostrar niveles con fichas
        .sort((a, b) => a.id - b.id)

      console.log("\n📊 Array final de niveles:", levelProgressArray)

      // Calcular estadísticas totales
      const totalStats = {
        totalFichas: coursesWithProgramming.length,
        totalApprentices: apprentices.filter((apprentice) =>
          coursesWithProgramming.some(
            (course) => apprentice.ficha && apprentice.ficha.includes(Number.parseInt(course.code)),
          ),
        ).length,
        totalLevels: levelProgressArray.length,
      }

      console.log("\n📈 Estadísticas totales:", totalStats)

      setDashboardData({
        levelProgress: levelProgressArray,
        totalStats,
      })

      console.log("✅ RESUMEN FINAL:", {
        fichasConProgramacion: totalStats.totalFichas,
        apprenticesTotal: totalStats.totalApprentices,
        nivelesConDatos: totalStats.totalLevels,
        levelDetails: levelProgressArray,
      })
    } catch (err) {
      console.error("❌ Error calculando datos del dashboard:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!coursesLoading && !programmingsLoading && !apprenticesLoading) {
      calculateDashboardData()
    }
  }, [courses, programmings, apprentices, coursesLoading, programmingsLoading, apprenticesLoading])

  return {
    dashboardData,
    rankingData,
    competenciesData,
    lessonStats,
    loading: loading || coursesLoading || programmingsLoading || apprenticesLoading,
    error,
    refetch: calculateDashboardData,
    fetchDashboardData,
    refreshRanking,
    refreshCompetencies,
    refreshLessonStats,
    clearCache,
    // Agregar estos datos para el componente de debug
    programmings,
    courses,
    apprentices,
  }
}
