"use client"

import { useState, useEffect } from "react"
import { getFichasWithLevels, getInstructorsWithFichas, getNiveles } from "../services/feedbackService"

export const useFeedbackData = () => {
  const [fichas, setFichas] = useState([])
  const [instructors, setInstructors] = useState([])
  const [niveles, setNiveles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadInitialData = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Cargando datos iniciales...')
      
      // Cargar fichas, instructores y niveles en paralelo
      const [fichasData, instructorsData, nivelesData] = await Promise.all([
        getFichasWithLevels().catch(err => {
          console.error('Error cargando fichas:', err)
          return []
        }),
        getInstructorsWithFichas().catch(err => {
          console.error('Error cargando instructores:', err)
          return []
        }),
        getNiveles().catch(err => {
          console.error('Error cargando niveles:', err)
          return []
        })
      ])
      
      console.log('📊 Datos cargados:')
      console.log('- Fichas:', fichasData.length)
      console.log('- Instructores:', instructorsData.length)
      console.log('- Niveles:', nivelesData.length)
      
      setFichas(fichasData)
      setInstructors(instructorsData)
      setNiveles(nivelesData)
      
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error)
      setError('Error al cargar los datos iniciales. Usando datos por defecto.')
      // Datos por defecto en caso de error
      setFichas([
        { value: 'FICHA001', label: 'FICHA001' },
        { value: 'FICHA002', label: 'FICHA002' }
      ])
      setInstructors([
        { value: '1', label: 'Instructor Demo' }
      ])
      setNiveles([
        { value: '1', label: 'Nivel 1' },
        { value: '2', label: 'Nivel 2' },
        { value: '3', label: 'Nivel 3' }
      ])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInitialData()
  }, [])

  return {
    fichas,
    instructors,
    niveles,
    loading,
    error,
    refetch: loadInitialData,
  }
}
