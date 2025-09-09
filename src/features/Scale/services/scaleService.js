
import api from "../../../shared/services/api"

const BASE_URL = "/scales"

export const getScales = async (params = {}) => {
  try {
    console.log("🔄 scaleService.getScales - Iniciando petición con params:", params)

    // Construir query string si hay parámetros
    const queryParams = new URLSearchParams()

    if (params.page) queryParams.append("page", params.page)
    if (params.limit) queryParams.append("limit", params.limit)
    if (params.search) queryParams.append("search", params.search)
    if (params.estado) queryParams.append("estado", params.estado)

    const queryString = queryParams.toString()
    const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL

    console.log("📡 scaleService.getScales - URL relativa:", url)

    const response = await api.get(url)

    console.log("📥 scaleService.getScales - Respuesta completa:", response)
    console.log("📊 scaleService.getScales - Status:", response.status)
    console.log("📋 scaleService.getScales - Data:", response.data)

    // Verificar si la respuesta es exitosa
    if (response.status === 200 && response.data) {
      console.log("✅ scaleService.getScales - Respuesta exitosa")
      return response.data
    } else {
      console.error("❌ scaleService.getScales - Respuesta no válida:", response)
      throw new Error("Respuesta no válida del servidor")
    }
  } catch (error) {
    console.error("❌ scaleService.getScales - Error completo:", error)
    console.error("❌ scaleService.getScales - Error message:", error.message)
    console.error("❌ scaleService.getScales - Error response:", error.response)

    if (error.response) {
      console.error("❌ scaleService.getScales - Error status:", error.response.status)
      console.error("❌ scaleService.getScales - Error data:", error.response.data)
    }

    throw error
  }
}

export const createScale = async (scaleData) => {
  try {
    console.log("📤 scaleService.createScale - Enviando datos:", scaleData)

    const response = await api.post(BASE_URL, scaleData)

    console.log("📥 scaleService.createScale - Respuesta:", response.data)

    return response.data
  } catch (error) {
    console.error("❌ scaleService.createScale - Error:", error)

    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Error al crear la escala")
    }

    throw error
  }
}

export const updateScale = async (id, scaleData) => {
  try {
    console.log("🔧 ===== INICIO UPDATE SCALE =====")
    console.log("🆔 ID de la escala:", id)
    console.log("📋 Datos ORIGINALES recibidos:", JSON.stringify(scaleData, null, 2))

    // Limpiar datos específicamente para evitar problemas
    const cleanData = {
      fechaInicial: scaleData.fechaInicial,
      fechaFinal: scaleData.fechaFinal,
      descripcion: scaleData.descripcion || "",
      apruebaPorcentaje: Number(scaleData.apruebaPorcentaje) || 70,
    }

    // Solo agregar métricas si existen y son válidas
    if (scaleData.metricas && Array.isArray(scaleData.metricas) && scaleData.metricas.length > 0) {
      cleanData.metricas = scaleData.metricas
        .filter((metrica) => metrica.concepto && metrica.rangoInicial !== undefined && metrica.rangoFinal !== undefined)
        .map((metrica) => ({
          rangoInicial: Number(metrica.rangoInicial),
          rangoFinal: Number(metrica.rangoFinal),
          concepto: String(metrica.concepto).trim(),
          descripcion: String(metrica.descripcion || "").trim(),
        }))
    } else {
      cleanData.metricas = []
    }

    console.log("🧹 Datos LIMPIADOS para enviar:", JSON.stringify(cleanData, null, 2))

    const response = await api.put(`${BASE_URL}/${id}`, cleanData)

    console.log("📥 scaleService.updateScale - Respuesta:", response.data)
    console.log("🔧 ===== FIN UPDATE SCALE =====")

    return response.data
  } catch (error) {
    console.error("❌ scaleService.updateScale - Error completo:", error)
    console.error("❌ Error message:", error.message)

    if (error.response) {
      console.error("❌ Error response status:", error.response.status)
      console.error("❌ Error response data:", error.response.data)

      // Extraer mensaje de error más específico
      const errorData = error.response.data
      if (errorData && errorData.data && errorData.data.errors) {
        console.error("❌ Errores específicos:", errorData.data.errors)
        throw new Error(`Errores de validación: ${errorData.data.errors.join(", ")}`)
      } else if (errorData && errorData.message) {
        throw new Error(errorData.message)
      }
    }

    throw error
  }
}

export const deleteScale = async (id) => {
  try {
    console.log("🗑️ scaleService.deleteScale - ID:", id)

    const response = await api.delete(`${BASE_URL}/${id}`)

    console.log("📥 scaleService.deleteScale - Respuesta:", response.data)

    return response.data
  } catch (error) {
    console.error("❌ scaleService.deleteScale - Error:", error)

    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Error al eliminar la escala")
    }

    throw error
  }
}

export const getScaleById = async (id) => {
  try {
    console.log("🔍 scaleService.getScaleById - ID:", id)

    const response = await api.get(`${BASE_URL}/${id}`)

    console.log("📥 scaleService.getScaleById - Respuesta:", response.data)

    return response.data
  } catch (error) {
    console.error("❌ scaleService.getScaleById - Error:", error)

    if (error.response && error.response.data) {
      throw new Error(error.response.data.message || "Error al obtener la escala")
    }

    throw error
  }
}
