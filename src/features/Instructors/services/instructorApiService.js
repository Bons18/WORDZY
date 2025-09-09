import { API_ENDPOINTS } from "../../../shared/config/api"

/**
 * Servicio para manejar operaciones de instructores
 */

/**
 * Obtiene todos los instructores
 */
export const fetchInstructors = async () => {
  try {
    const response = await fetch(API_ENDPOINTS.INSTRUCTORS)

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al obtener instructores:", error)
    throw error
  }
}

/**
 * Obtiene un instructor por ID
 */
export const fetchInstructorById = async (id) => {
  try {
    const response = await fetch(API_ENDPOINTS.INSTRUCTOR_BY_ID(id))

    if (!response.ok) {
      throw new Error(`Error HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error al obtener instructor ${id}:`, error)
    throw error
  }
}

/**
 * Crea un nuevo instructor
 */
export const createInstructor = async (instructorData) => {
  try {
    const response = await fetch(API_ENDPOINTS.INSTRUCTORS, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(instructorData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error al crear instructor:", error)
    throw error
  }
}

/**
 * Actualiza un instructor existente
 */
export const updateInstructor = async (id, instructorData) => {
  try {
    const response = await fetch(API_ENDPOINTS.INSTRUCTOR_BY_ID(id), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(instructorData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error al actualizar instructor ${id}:`, error)
    throw error
  }
}

/**
 * Elimina un instructor
 */
export const deleteInstructor = async (id) => {
  try {
    const response = await fetch(API_ENDPOINTS.INSTRUCTOR_BY_ID(id), {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error HTTP ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error al eliminar instructor ${id}:`, error)
    throw error
  }
}

/**
 * Verifica si un documento ya existe en el sistema
 */
export const checkDocumentExists = async (documento, excludeId = null) => {
  try {
    const instructors = await fetchInstructors()

    const exists = instructors.some(
      (instructor) => instructor.documento === documento.trim() && (excludeId ? instructor._id !== excludeId : true),
    )

    return exists
  } catch (error) {
    console.error("Error verificando documento:", error)
    return false // En caso de error, permitir continuar
  }
}

/**
 * Verifica si un correo ya existe en el sistema
 */
export const checkEmailExists = async (correo, excludeId = null) => {
  try {
    const instructors = await fetchInstructors()

    const exists = instructors.some(
      (instructor) =>
        instructor.correo.toLowerCase() === correo.toLowerCase().trim() &&
        (excludeId ? instructor._id !== excludeId : true),
    )

    return exists
  } catch (error) {
    console.error("Error verificando correo:", error)
    return false // En caso de error, permitir continuar
  }
}

/**
 * Normaliza un instructor para asegurar que tenga un campo 'id'
 */
export const normalizeInstructor = (instructor) => {
  if (!instructor) return null

  return {
    ...instructor,
    id: instructor.id || instructor._id,
  }
}

/**
 * Normaliza un array de instructores
 */
export const normalizeInstructors = (instructors) => {
  if (!Array.isArray(instructors)) return []

  return instructors.map(normalizeInstructor)
}
