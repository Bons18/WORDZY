"use client"

import { useState, useEffect, useCallback, useMemo } from "react"

const useGetApprentices = () => {
  const [apprentices, setApprentices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Datos de ejemplo como fallback - usar useMemo para evitar recreación
  const fallbackData = useMemo(
    () => [
      {
        id: 1,
        tipoUsuario: "aprendiz",
        nombre: "Carlita",
        apellido: "Pérez",
        documento: "1023456789",
        tipoDocumento: "CC",
        ficha: [2889927],
        estado: "En formación",
        telefono: "3102568799",
        programa: "ADSO",
        correo: "carlos.perez@example.com",
        progresoActual: 15,
        // CAMBIO: El progreso detallado ya no viene en la lista general
      },
      {
        id: 2,
        tipoUsuario: "aprendiz",
        nombre: "Ana",
        apellido: "Gómez",
        documento: "1029876543",
        tipoDocumento: "PPT",
        ficha: [2996778],
        estado: "Condicionado",
        telefono: "3156789012",
        programa: "Contabilidad",
        correo: "ana.gomez@example.com",
        progresoActual: 45,
      },
    ],
    [],
  )

  const fetchApprentices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Obteniendo aprendices desde API...")

      const response = await fetch(`${import.meta.env.VITE_LOCAL_DB_URL}/apprentice`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Datos de aprendices recibidos:", data)

      // Normalizar datos
      const normalizedData = data.map((apprentice) => ({
        ...apprentice,
        id: apprentice._id || apprentice.id,
        ficha: Array.isArray(apprentice.ficha) ? apprentice.ficha : [apprentice.ficha],
        // CAMBIO: Ya no se normaliza `progresoNiveles` aquí
      }))

      const apprenticesEnFormacion = normalizedData.filter((apprentice) => apprentice.estado === "En formación")

      setApprentices(apprenticesEnFormacion)
      console.log(`✅ ${apprenticesEnFormacion.length} aprendices "En formación" cargados exitosamente`)
    } catch (err) {
      console.error("❌ Error al obtener aprendices:", err)
      setError(err.message)
      const fallbackEnFormacion = fallbackData.filter((apprentice) => apprentice.estado === "En formación")
      setApprentices(fallbackEnFormacion)
    } finally {
      setLoading(false)
    }
  }, [fallbackData])

  useEffect(() => {
    fetchApprentices()
  }, [fetchApprentices])

  const refetch = useCallback(() => {
    console.log("🔄 Refrescando datos de aprendices...")
    return fetchApprentices()
  }, [fetchApprentices])

  return {
    apprentices,
    loading,
    error,
    refetch,
  }
}

export default useGetApprentices
