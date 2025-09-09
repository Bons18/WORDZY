"use client"

import { useState, useCallback, useRef } from "react"
import { getFeedbackResults } from "../services/feedbackService"

export const useFeedbackResults = () => {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const abortControllerRef = useRef(null)

  const searchFeedbackResults = useCallback(async (filters, loadMore = false) => {
    try {
      // Cancelar petición anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      
      // Crear nuevo AbortController
      abortControllerRef.current = new AbortController()
      
      setLoading(true)
      setError(null)
      
      const currentPage = loadMore ? page + 1 : 1
      const filtersWithPagination = {
        ...filters,
        page: currentPage,
        limit: 50 // Reducir límite para mejorar rendimiento
      }
      
      console.log('🔍 Buscando resultados con filtros:', filtersWithPagination)
      
      const response = await getFeedbackResults(filtersWithPagination, {
        signal: abortControllerRef.current.signal
      })
      
      console.log('📊 Resultados obtenidos:', response)
      
      if (loadMore) {
        // Agregar resultados a los existentes
        setResults(prev => [...prev, ...(response.results || [])])
        setPage(currentPage)
      } else {
        // Reemplazar resultados
        setResults(response.results || [])
        setPage(1)
      }
      
      setTotal(response.total || 0)
      setHasMore(response.hasMore || false)
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🚫 Petición cancelada')
        return
      }
      
      console.error('❌ Error al buscar resultados:', error)
      setError('Error al obtener los resultados de retroalimentación')
      
      if (!loadMore) {
        setResults([])
        setTotal(0)
        setPage(1)
      }
    } finally {
      setLoading(false)
    }
  }, [page])

  const loadMoreResults = useCallback((filters) => {
    if (!loading && hasMore) {
      searchFeedbackResults(filters, true)
    }
  }, [searchFeedbackResults, loading, hasMore])

  const resetResults = useCallback(() => {
    setResults([])
    setTotal(0)
    setPage(1)
    setHasMore(false)
    setError(null)
    
    // Cancelar petición en curso
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  return {
    results,
    loading,
    error,
    total,
    hasMore,
    page,
    searchFeedbackResults,
    loadMoreResults,
    resetResults
  }
};