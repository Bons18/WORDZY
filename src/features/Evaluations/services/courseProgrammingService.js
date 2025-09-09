const API_URL = "http://localhost:3000/api"

export const isEvaluationInUse = async (evaluationId) => {
  try {
    const response = await fetch(`${API_URL}/course-programming`)
    if (!response.ok) {
      throw new Error("Error al obtener las programaciones de los cursos")
    }
    const courseProgrammings = await response.json()

    for (const programming of courseProgrammings) {
      for (const level of programming.levels) {
        for (const topic of level.topics) {
          // Verificar en actividades
          if (topic.activities && topic.activities.some((activity) => activity.evaluationId === evaluationId)) {
            return true
          }
          // Verificar en exámenes
          if (topic.exams && topic.exams.some((exam) => exam.evaluationId === evaluationId)) {
            return true
          }
        }
      }
    }

    return false
  } catch (error) {
    console.error("Error al verificar si la evaluación está en uso:", error)
    // En caso de error en la API, asumimos que no está en uso para no bloquear la acción.
    // Se podría manejar de forma más estricta si se prefiere.
    return false
  }
}
