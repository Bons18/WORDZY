import api from "../../../shared/services/api"

// Servicio para manejar programas
export const programService = {
  // Obtener todos los programas
  getAll: async () => {
    try {
      const response = await api.get("/program")
      return response.data
    } catch (error) {
      console.error("Error fetching programs:", error)
      throw error
    }
  },

  // Obtener programa por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/program/${id}`)
      return response.data
    } catch (error) {
      console.error("Error fetching program by ID:", error)
      throw error
    }
  },

  // Crear nuevo programa
  create: async (programData) => {
    try {
      const response = await api.post("/program", programData)
      return response.data
    } catch (error) {
      console.error("Error creating program:", error)
      throw error
    }
  },

  // Actualizar programa
  update: async (id, programData) => {
    try {
      const response = await api.put(`/program/${id}`, programData)
      return response.data
    } catch (error) {
      console.error("Error updating program:", error)
      throw error
    }
  },

  // Eliminar programa
  delete: async (id) => {
    try {
      const response = await api.delete(`/program/${id}`)
      return response.data
    } catch (error) {
      console.error("Error deleting program:", error)
      throw error
    }
  },

  // Obtener programas de API externa con paginación
  getExternal: async (page = 1, limit = 10) => {
    try {
      const response = await api.get("/program/external/programs", {
        params: { page, limit },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching external programs:", error)
      throw error
    }
  },

  // Obtener todos los programas externos (todas las páginas)
  getAllExternal: async () => {
    try {
      let allPrograms = []
      let currentPage = 1
      let totalPages = 1

      do {
        const response = await api.get("/program/external/programs", {
          params: { page: currentPage, limit: 50 },
        })

        if (response.data.success) {
          allPrograms = allPrograms.concat(response.data.data)
          totalPages = response.data.pagination.totalPages
          currentPage++
        } else {
          break
        }
      } while (currentPage <= totalPages)

      return {
        success: true,
        data: allPrograms,
        total: allPrograms.length,
      }
    } catch (error) {
      console.error("Error fetching all external programs:", error)
      throw error
    }
  },

  // Sincronización masiva
  syncMassive: async () => {
    try {
      const response = await api.post("/program/sync/massive")
      return response.data
    } catch (error) {
      console.error("Error in massive sync:", error)
      throw error
    }
  },

  // Verificar conectividad
  checkConnectivity: async () => {
    try {
      const response = await api.get("/program/connectivity/check")
      return response.data
    } catch (error) {
      console.error("Error checking connectivity:", error)
      throw error
    }
  },
}
