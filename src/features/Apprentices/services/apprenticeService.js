import { API_URL } from "../../../shared/config/api"

// Obtener todos los aprendices
export const getApprentices = async () => {
  try {
    console.log("🔍 Obteniendo lista de aprendices...")

    const response = await fetch(`${API_URL}/apprentice`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Aprendices obtenidos:", data.length)

    return data
  } catch (error) {
    console.error("❌ Error obteniendo aprendices:", error)
    throw error
  }
}

// Obtener un aprendiz por ID con progreso calculado dinámicamente
export const getApprenticeById = async (id) => {
  try {
    console.log("🔍 Obteniendo detalles del aprendiz:", id)

    const response = await fetch(`${API_URL}/user/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Detalles del aprendiz obtenidos:", data)

    return data
  } catch (error) {
    console.error("❌ Error obteniendo detalles del aprendiz:", error)
    throw error
  }
}

// Crear un nuevo aprendiz
export const createApprentice = async (apprenticeData) => {
  try {
    console.log("🔍 Creando nuevo aprendiz:", apprenticeData)

    const response = await fetch(`${API_URL}/apprentice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apprenticeData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Aprendiz creado exitosamente:", data)

    return data
  } catch (error) {
    console.error("❌ Error creando aprendiz:", error)
    throw error
  }
}

// Actualizar un aprendiz
export const updateApprentice = async (id, apprenticeData) => {
  try {
    console.log("🔍 Actualizando aprendiz:", id, apprenticeData)

    const response = await fetch(`${API_URL}/user/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apprenticeData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Aprendiz actualizado exitosamente:", data)

    return data
  } catch (error) {
    console.error("❌ Error actualizando aprendiz:", error)
    throw error
  }
}

// Eliminar un aprendiz
export const deleteApprentice = async (id) => {
  try {
    console.log("🔍 Eliminando aprendiz:", id)

    const response = await fetch(`${API_URL}/user/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Aprendiz eliminado exitosamente")

    return data
  } catch (error) {
    console.error("❌ Error eliminando aprendiz:", error)
    throw error
  }
}

// Obtener progreso de un aprendiz por nivel
export const getApprenticeProgressByLevel = async (apprenticeId, level) => {
  try {
    console.log("🔍 Obteniendo progreso del aprendiz:", apprenticeId, "nivel:", level)

    const response = await fetch(`${API_URL}/apprentice-progress/apprentice/${apprenticeId}/level/${level}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Progreso obtenido:", data)

    return data
  } catch (error) {
    console.error("❌ Error obteniendo progreso:", error)
    throw error
  }
}

// Obtener estadísticas de progreso
export const getProgressStatistics = async (apprenticeId, level) => {
  try {
    console.log("🔍 Obteniendo estadísticas de progreso:", apprenticeId, level)

    const params = new URLSearchParams()
    if (apprenticeId) params.append("apprenticeId", apprenticeId)
    if (level) params.append("level", level)

    const response = await fetch(`${API_URL}/apprentice-progress/statistics?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Estadísticas obtenidas:", data)

    return data
  } catch (error) {
    console.error("❌ Error obteniendo estadísticas:", error)
    throw error
  }
}

// Actualización masiva de aprendices
export const massUpdateApprentices = async (userIds, updateData) => {
  try {
    console.log("🔍 Actualizando aprendices masivamente:", userIds, updateData)

    const response = await fetch(`${API_URL}/user/mass-update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userIds, updateData }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Actualización masiva completada:", data)

    return data
  } catch (error) {
    console.error("❌ Error en actualización masiva:", error)
    throw error
  }
}

// Nueva función para obtener estadísticas de progreso por nivel
export const getApprenticeStatsByLevel = async (apprenticeId, level) => {
  try {
    const response = await fetch(`${API_URL}/apprentice-progress/apprentice/${apprenticeId}/level/${level}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })

    if (!response.ok) {
      console.error(`Error fetching stats for level ${level}: ${response.status}`)
      return null
    }

    const data = await response.json()

    if (data.success && data.data.statistics) {
      return {
        puntos: data.data.statistics.puntosAprobadas || 0,
        evaluacionesAprobadas: data.data.statistics.evaluacionesAprobadas || 0,
        evaluacionesProgramadas: data.data.statistics.evaluacionesProgramadas || 0,
      }
    }

    return null
  } catch (error) {
    console.error(`❌ Error obteniendo estadísticas para el nivel ${level}:`, error)
    return null
  }
}
