
"use client"

import { useState, useEffect } from "react"
import { getScales } from "../services/scaleService"

export const useGetScales = (params = {}) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  const fetchScales = async (fetchParams = {}) => {
    try {
      console.log("🚀 useGetScales.fetchScales - INICIANDO")
      setLoading(true)
      setError(null)

      const mergedParams = { ...params, ...fetchParams }
      console.log("📋 useGetScales - Parámetros finales:", mergedParams)

      const response = await getScales(mergedParams)
      console.log("📥 useGetScales - Respuesta del servicio:", response)
      console.log("📊 useGetScales - Tipo de respuesta:", typeof response)
      console.log("📋 useGetScales - Es array?:", Array.isArray(response))

      // Procesar respuesta
      let scales = []
      let paginationData = {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      }

      if (response) {
        console.log("🔍 useGetScales - Analizando estructura de respuesta...")

        // Caso 1: { success: true, data: { scales: [...], pagination: {...} } }
        if (response.success && response.data && response.data.scales) {
          console.log("✅ Formato 1: success + data.scales")
          scales = response.data.scales
          paginationData = response.data.pagination || paginationData
        }
        // Caso 2: { scales: [...], pagination: {...} }
        else if (response.scales) {
          console.log("✅ Formato 2: scales directas")
          scales = response.scales
          paginationData = response.pagination || paginationData
        }
        // Caso 3: [escala1, escala2, ...]
        else if (Array.isArray(response)) {
          console.log("✅ Formato 3: array directo")
          scales = response
        }
        // Caso 4: { success: true, data: [...] }
        else if (response.success && Array.isArray(response.data)) {
          console.log("✅ Formato 4: success + data array")
          scales = response.data
        } else {
          console.warn("⚠️ Formato de respuesta no reconocido")
          console.log("📄 Respuesta completa:", JSON.stringify(response, null, 2))
        }
      }

      console.log("✅ useGetScales - Escalas procesadas:", scales.length)
      console.log("📋 useGetScales - Escalas:", scales)
      console.log("📊 useGetScales - Paginación:", paginationData)

      setData(scales)
      setPagination(paginationData)
    } catch (err) {
      console.error("❌ useGetScales - ERROR:", err)
      console.error("❌ Error message:", err.message)
      console.error("❌ Error stack:", err.stack)

      setError(err.message || "Error al cargar las escalas de valoración")
      setData([])
      setPagination({
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })
    } finally {
      setLoading(false)
      console.log("🏁 useGetScales.fetchScales - FINALIZADO")
    }
  }

  const refetch = (newParams = {}) => {
    console.log("🔄 useGetScales.refetch - Parámetros:", newParams)
    return fetchScales(newParams)
  }

  useEffect(() => {
    console.log("🚀 useGetScales - Hook inicializando...")
    fetchScales()
  }, [])

  return {
    data,
    loading,
    error,
    pagination,
    refetch,
    fetchScales,
  }
}

export default useGetScales
