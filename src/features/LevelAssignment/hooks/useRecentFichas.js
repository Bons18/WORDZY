"use client"

import { useState, useEffect } from "react"

const STORAGE_KEY = "recentFichas"
const MAX_RECENT = 6

export const useRecentFichas = () => {
  const [recentFichas, setRecentFichas] = useState([])

  // Cargar fichas recientes del localStorage al inicializar
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setRecentFichas(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error("Error loading recent fichas:", error)
      setRecentFichas([])
    }
  }, [])

  // Agregar ficha a recientes
  const addRecentFicha = (ficha) => {
    try {
      // Asegurar que la ficha tenga todas las propiedades necesarias
      const fichaCompleta = {
        id: ficha.id,
        codigo: ficha.codigo || ficha.numero,
        numero: ficha.numero || ficha.codigo,
        programa: ficha.programa,
        programId: ficha.programId,
        programLevel: ficha.programLevel,
        instructor: ficha.instructor,
        aprendices: ficha.aprendices, // Asegurar que siempre tenga un valor
        nivelesActivos: ficha.nivelesActivos || 0,
        totalNiveles: ficha.totalNiveles || 0,
        startDate: ficha.startDate,
        endDate: ficha.endDate,
        status: ficha.status,
        hasProgramming: ficha.hasProgramming,
        hasLevels: ficha.hasLevels,
        programmingLevels: ficha.programmingLevels || [],
        statusMessage: ficha.statusMessage,
        // Agregar timestamp para ordenar
        lastAccessed: new Date().toISOString(),
      }

      setRecentFichas((prev) => {
        // Filtrar la ficha si ya existe
        const filtered = prev.filter((f) => f.id !== fichaCompleta.id)

        // Agregar al inicio y limitar a MAX_RECENT
        const updated = [fichaCompleta, ...filtered].slice(0, MAX_RECENT)

        // Guardar en localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))

        return updated
      })
    } catch (error) {
      console.error("Error adding recent ficha:", error)
    }
  }

  // Limpiar fichas recientes
  const clearRecentFichas = () => {
    try {
      setRecentFichas([])
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error("Error clearing recent fichas:", error)
    }
  }

  // Remover una ficha específica
  const removeRecentFicha = (fichaId) => {
    try {
      setRecentFichas((prev) => {
        const updated = prev.filter((f) => f.id !== fichaId)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    } catch (error) {
      console.error("Error removing recent ficha:", error)
    }
  }

  return {
    recentFichas,
    addRecentFicha,
    clearRecentFichas,
    removeRecentFicha,
  }
}
