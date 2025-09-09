import { apiRequest, API_ENDPOINTS } from "../../../shared/config/api"

export const getCourses = async () => {
  try {
    console.log("🔄 Obteniendo cursos desde API...")

    // apiRequest ya maneja la respuesta y devuelve los datos directamente
    const data = await apiRequest(API_ENDPOINTS.COURSES, {
      method: "GET",
    })

    console.log("✅ Cursos obtenidos exitosamente:", data)

    // Normalizar datos para el frontend
    const normalizedCourses = Array.isArray(data)
      ? data.map((course) => ({
          id: course._id || course.id,
          code: course.code,
          area: course.area,
          fk_programs: course.fk_programs,
          course_status: course.course_status,
          offer_type: course.offer_type,
          start_date: course.start_date,
          end_date: course.end_date,
          status: course.status,
          // Campos adicionales que pueden ser útiles
          quarter: course.quarter,
          fk_coordination: course.fk_coordination,
          fk_itinerary: course.fk_itinerary,
        }))
      : []

    console.log(`✅ ${normalizedCourses.length} fichas/cursos normalizados exitosamente`)
    return normalizedCourses
  } catch (error) {
    console.error("❌ Error al obtener cursos:", error)
    throw new Error(`Error al cargar cursos: ${error.message}`)
  }
}

export const getCourseById = async (id) => {
  try {
    console.log(`🔄 Obteniendo curso con ID: ${id}`)

    const data = await apiRequest(`${API_ENDPOINTS.COURSES}/${id}`, {
      method: "GET",
    })

    console.log("✅ Curso obtenido exitosamente:", data)
    return data
  } catch (error) {
    console.error("❌ Error al obtener curso:", error)
    throw new Error(`Error al cargar curso: ${error.message}`)
  }
}
