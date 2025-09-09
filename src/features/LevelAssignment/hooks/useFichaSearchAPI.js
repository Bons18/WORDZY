"use client"

import { useState, useRef, useCallback } from "react"
import { fichaLevelAssignmentService } from "../services/fichaLevelAssignmentService"

export const useFichaSearchAPI = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const searchTimeoutRef = useRef(null)

  const executeSearch = useCallback(async (value) => {
    if (!value.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const results = await fichaLevelAssignmentService.searchFichas(value)
      setSearchResults(results || [])
      setShowSearchResults(true)
    } catch (error) {
      console.error("Error searching fichas:", error)
      setError(error.message)
      setSearchResults([])
      setShowSearchResults(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearchInputChange = useCallback(
    (value) => {
      setSearchTerm(value)

      // Limpiar timeout anterior
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      // Si está vacío, limpiar resultados inmediatamente
      if (!value.trim()) {
        setSearchResults([])
        setShowSearchResults(false)
        setIsLoading(false)
        setError(null)
        return
      }

      // Debounce de 300ms
      searchTimeoutRef.current = setTimeout(() => {
        executeSearch(value)
      }, 300)
    },
    [executeSearch],
  )

  const clearSearch = useCallback(() => {
    setSearchTerm("")
    setSearchResults([])
    setShowSearchResults(false)
    setIsLoading(false)
    setError(null)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }, [])

  return {
    searchTerm,
    searchResults,
    showSearchResults,
    isLoading,
    error,
    handleSearchInputChange,
    clearSearch,
    setShowSearchResults,
  }
}
