// Configuración centralizada de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// Validar que la variable de entorno esté configurada
if (!API_BASE_URL) {
  throw new Error("VITE_API_URL no está configurada en el archivo .env")
}

// Exportar API_URL para compatibilidad
export const API_URL = API_BASE_URL

// Endpoints de la API con URLs completas
export const API_ENDPOINTS = {
  // Usuarios
  USERS: `${API_BASE_URL}/user`,
  USER_BY_ID: (id) => `${API_BASE_URL}/user/${id}`,

  // Aprendices
  APPRENTICES: `${API_BASE_URL}/apprentice`,
  APPRENTICE_BY_ID: (id) => `${API_BASE_URL}/apprentice/${id}`,
  APPRENTICE_STATS: `${API_BASE_URL}/apprentice/stats`,

  // Instructores
  INSTRUCTORS: `${API_BASE_URL}/instructor`,
  INSTRUCTOR_BY_ID: (id) => `${API_BASE_URL}/instructor/${id}`,
  INSTRUCTOR_FICHAS: (id) => `${API_BASE_URL}/instructor/${id}/fichas`,

  // Evaluaciones
  EVALUATIONS: `${API_BASE_URL}/evaluation`,
  EVALUATION_BY_ID: (id) => `${API_BASE_URL}/evaluation/${id}`,

  // Roles
  ROLES: `${API_BASE_URL}/role`,
  ROLE_BY_ID: (id) => `${API_BASE_URL}/role/${id}`,

  // Temas
  TOPICS: `${API_BASE_URL}/topic`,
  TOPIC_BY_ID: (id) => `${API_BASE_URL}/topic/${id}`,

  // Programas
  PROGRAMS: `${API_BASE_URL}/program`,
  PROGRAM_BY_ID: (id) => `${API_BASE_URL}/program/${id}`,

  // Cursos/Fichas
  COURSES: `${API_BASE_URL}/course`,
  COURSE_BY_ID: (id) => `${API_BASE_URL}/course/${id}`,

  // Programación de cursos
  COURSE_PROGRAMMING: `${API_BASE_URL}/course-programming`,
  COURSE_PROGRAMMING_BY_ID: (id) => `${API_BASE_URL}/course-programming/${id}`,

  // Material de apoyo
  SUPPORT_MATERIALS: `${API_BASE_URL}/support-materials`,
  SUPPORT_MATERIAL_BY_ID: (id) => `${API_BASE_URL}/support-materials/${id}`,

  // Uploads
  UPLOAD: `${API_BASE_URL}/upload`,

  // Escalas
  SCALES: `${API_BASE_URL}/scales`,
  SCALE_BY_ID: (id) => `${API_BASE_URL}/scales/${id}`,
}

// Configuración de headers por defecto
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
}

// Función helper para hacer requests (opcional, pero bueno mantenerla por si se usa en algún lado)
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: { ...DEFAULT_HEADERS, ...options.headers },
      ...options,
    })

    const responseText = await response.text() // Get response as text first
    if (!response.ok) {
      try {
        // Intenta parsear como JSON
        const errorData = JSON.parse(responseText)
        throw new Error(errorData.message || `Error HTTP ${response.status}`)
      } catch (e) {
        // Si falla el parseo JSON, es probable que sea HTML u otro texto
        console.error("Respuesta no JSON del servidor:", responseText)
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}. La respuesta no es un JSON válido.`)
      }
    }

    // Si la respuesta es OK, se asume que es JSON
    return JSON.parse(responseText)
  } catch (error) {
    console.error(`Error en request a ${url}:`, error)
    throw error
  }
}
