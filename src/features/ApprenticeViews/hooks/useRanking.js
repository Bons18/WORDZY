import { useState, useEffect, useCallback } from 'react'
import {
  getStudentPoints,
  getUniqueFichas,
  getUniqueProgramas,
  getStudentsByFicha,
  getStudentsByPrograma,
  generateRealRanking
} from '../../Ranking/services/rankingService'

export const useRanking = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [allStudents, setAllStudents] = useState([])
  const [fichas, setFichas] = useState([])
  const [programas, setProgramas] = useState([])
  const [rankings, setRankings] = useState({
    aprendices: [],
    ficha: [],
    programa: []
  })
  const [metrics, setMetrics] = useState({
    totalAprendices: 0,
    totalFichas: 0,
    totalProgramas: 0
  })

  // Función para cargar todos los datos iniciales
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔄 Cargando datos del ranking...')
      
      // Obtener todos los estudiantes
      const studentsResponse = await getStudentPoints()
      
      if (!studentsResponse.success) {
        throw new Error('No se pudieron cargar los datos de estudiantes')
      }

      const students = studentsResponse.data || []
      setAllStudents(students)

      // Extraer fichas y programas únicos
      const uniqueFichas = getUniqueFichas(students)
      const uniqueProgramas = getUniqueProgramas(students)
      
      setFichas(uniqueFichas)
      setProgramas(uniqueProgramas)

      // Generar rankings iniciales
      const aprendicesRanking = generateRealRanking(students, 'general')
      
      setRankings({
        aprendices: aprendicesRanking,
        ficha: aprendicesRanking, // Por defecto mostrar el general
        programa: aprendicesRanking // Por defecto mostrar el general
      })

      // Calcular métricas
      setMetrics({
        totalAprendices: students.length,
        totalFichas: uniqueFichas.length,
        totalProgramas: uniqueProgramas.length
      })

      console.log('✅ Datos del ranking cargados exitosamente')
      
    } catch (err) {
      console.error('❌ Error cargando datos del ranking:', err)
      setError(err.message || 'Error al cargar los datos del ranking')
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para obtener ranking por ficha específica
  const getRankingByFicha = useCallback(async (fichaCode) => {
    try {
      setLoading(true)
      console.log(`🔄 Obteniendo ranking para ficha: ${fichaCode}`)
      
      const response = await getStudentsByFicha(fichaCode)
      
      if (response.success) {
        const fichaRanking = generateRealRanking(response.data, 'ficha', fichaCode)
        setRankings(prev => ({
          ...prev,
          ficha: fichaRanking
        }))
        return fichaRanking
      }
      
      throw new Error('No se pudo obtener el ranking por ficha')
    } catch (err) {
      console.error('❌ Error obteniendo ranking por ficha:', err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para obtener ranking por programa específico
  const getRankingByPrograma = useCallback(async (programa) => {
    try {
      setLoading(true)
      console.log(`🔄 Obteniendo ranking para programa: ${programa}`)
      
      const response = await getStudentsByPrograma(programa)
      
      if (response.success) {
        const programaRanking = generateRealRanking(response.data, 'programa', programa)
        setRankings(prev => ({
          ...prev,
          programa: programaRanking
        }))
        return programaRanking
      }
      
      throw new Error('No se pudo obtener el ranking por programa')
    } catch (err) {
      console.error('❌ Error obteniendo ranking por programa:', err)
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para refrescar todos los datos
  const refreshData = useCallback(() => {
    loadInitialData()
  }, [loadInitialData])

  // Función para obtener el podio de una categoría específica
  const getPodium = useCallback((category) => {
    const ranking = rankings[category] || []
    return ranking.slice(0, 3).map((student, index) => ({
      position: index + 1,
      name: student.nombre || 'N/A',
      points: student.puntos || 0,
      ficha: student.ficha || 'N/A',
      programa: student.programa || 'N/A'
    }))
  }, [rankings])

  // Función para obtener la posición del usuario actual (simulada)
  const getCurrentUserPosition = useCallback((category) => {
    // Por ahora retornamos una posición simulada
    // En el futuro se puede integrar con el contexto de autenticación
    const ranking = rankings[category] || []
    return {
      position: Math.min(8, ranking.length),
      name: 'Usuario Actual',
      points: ranking[7]?.puntos || 0,
      ficha: ranking[7]?.ficha || 'N/A',
      programa: ranking[7]?.programa || 'N/A'
    }
  }, [rankings])

  // Cargar datos iniciales al montar el componente
  useEffect(() => {
    loadInitialData()
  }, [])

  return {
    // Estados
    loading,
    error,
    allStudents,
    fichas,
    programas,
    rankings,
    metrics,
    
    // Funciones
    getRankingByFicha,
    getRankingByPrograma,
    refreshData,
    getPodium,
    getCurrentUserPosition
  }
}

export default useRanking