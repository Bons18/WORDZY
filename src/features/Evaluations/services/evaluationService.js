import { API_ENDPOINTS } from "../../../shared/config/api"

/**
 * Servicio para manejar operaciones de evaluaciones
 */

/**
 * Obtiene todas las evaluaciones
 */
export const fetchEvaluations = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.EVALUATIONS)

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al obtener evaluaciones:", error)
    throw error
  }
}

/**
 * Obtiene una evaluación por ID
 */
export const fetchEvaluationById = async (id) => {
  try {
    const response = await fetch(API_ENDPOINTS.EVALUATION_BY_ID(id))

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error al obtener evaluación ${id}:`, error)
    throw error
  }
}

/**
 * Crea una nueva evaluación
 */
export const createEvaluation = async (evaluationData) => {
  try {
    const response = await fetch(API_ENDPOINTS.EVALUATIONS, {
      method: "POST",
      body: evaluationData, // FormData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al crear evaluación:", error)
    throw error
  }
}

/**
 * Actualiza una evaluación existente
 */
export const updateEvaluation = async (id, evaluationData) => {
  try {
    const response = await fetch(API_ENDPOINTS.EVALUATION_BY_ID(id), {
      method: "PUT",
      body: evaluationData, // FormData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error al actualizar evaluación ${id}:`, error)
    throw error
  }
}

/**
 * Elimina una evaluación
 */
export const deleteEvaluation = async (id) => {
  try {
    const response = await fetch(API_ENDPOINTS.EVALUATION_BY_ID(id), {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error al eliminar evaluación ${id}:`, error)
    throw error
  }
}

/**
 * Normaliza una evaluación para asegurar que tenga un campo 'id'
 */
export const normalizeEvaluation = (evaluation) => {
  if (!evaluation) return null

  return {
    ...evaluation,
    id: evaluation.id || evaluation._id,
  }
}

/**
 * Normaliza un array de evaluaciones
 */
export const normalizeEvaluations = (evaluations) => {
  if (!Array.isArray(evaluations)) return []

  return evaluations.map(normalizeEvaluation)
}
