import api from "../../../shared/services/api"

export const courseService = {
  // Obtener todos los cursos
  getAll: async () => {
    try {
      const response = await api.get("/course")
      return response.data
    } catch (error) {
      console.error("Error fetching courses:", error)
      throw error
    }
  },

  // Obtener curso por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/course/${id}`)
      return response.data
    } catch (error) {
      console.error("Error fetching course by ID:", error)
      throw error
    }
  },

  // Crear nuevo curso
  create: async (courseData) => {
    try {
      const response = await api.post("/course", courseData)
      return response.data
    } catch (error) {
      console.error("Error creating course:", error)
      throw error
    }
  },

  // Actualizar curso
  update: async (id, courseData) => {
    try {
      const response = await api.put(`/course/${id}`, courseData)
      return response.data
    } catch (error) {
      console.error("Error updating course:", error)
      throw error
    }
  },

  // Eliminar curso
  delete: async (id) => {
    try {
      const response = await api.delete(`/course/${id}`)
      return response.data
    } catch (error) {
      console.error("Error deleting course:", error)
      throw error
    }
  },

  // Obtener cursos desde API externa
  getExternal: async (page = 1, limit = 10) => {
    try {
      const response = await api.get("/course/external/courses", {
        params: { page, limit },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching external courses:", error)
      throw error
    }
  },

  // Sincronización masiva
  syncMassive: async () => {
    try {
      const response = await api.post("/course/sync")
      return response.data
    } catch (error) {
      console.error("Error in massive sync:", error)
      throw error
    }
  },

  // Verificar conectividad
  checkConnectivity: async () => {
    try {
      const response = await api.get("/course/connectivity/check")
      return response.data
    } catch (error) {
      console.error("Error checking connectivity:", error)
      throw error
    }
  },
}
