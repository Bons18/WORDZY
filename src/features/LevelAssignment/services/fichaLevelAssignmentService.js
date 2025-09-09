class FichaLevelAssignmentService {
  constructor() {
    this.baseURL = "http://localhost:3000/api/level-assignment"
  }

  async getHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error desconocido" }))
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  }

  // Obtener asignación de niveles por ficha
  async getFichaLevels(courseId) {
    try {
      const response = await fetch(`${this.baseURL}/${courseId}`, {
        method: "GET",
        headers: await this.getHeaders(),
      })
      return await this.handleResponse(response)
    } catch (error) {
      console.error("Error getting ficha levels:", error)
      throw error
    }
  }

  // Guardar asignación de niveles
  async saveFichaLevels(courseId, data) {
    try {
      const response = await fetch(`${this.baseURL}/${courseId}`, {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify(data),
      })
      return await this.handleResponse(response)
    } catch (error) {
      console.error("Error saving ficha levels:", error)
      throw error
    }
  }

  // Buscar fichas
  async searchFichas(searchTerm) {
    try {
      const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(searchTerm)}`, {
        method: "GET",
        headers: await this.getHeaders(),
      })
      return await this.handleResponse(response)
    } catch (error) {
      console.error("Error searching fichas:", error)
      throw error
    }
  }

  // Obtener todas las asignaciones
  async getAllAssignments(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const url = queryParams ? `${this.baseURL}?${queryParams}` : this.baseURL

      const response = await fetch(url, {
        method: "GET",
        headers: await this.getHeaders(),
      })
      return await this.handleResponse(response)
    } catch (error) {
      console.error("Error getting all assignments:", error)
      throw error
    }
  }

  // Obtener estadísticas
  async getStats() {
    try {
      const response = await fetch(`${this.baseURL}/stats`, {
        method: "GET",
        headers: await this.getHeaders(),
      })
      return await this.handleResponse(response)
    } catch (error) {
      console.error("Error getting stats:", error)
      throw error
    }
  }

  // Eliminar asignación
  async deleteAssignment(courseId) {
    try {
      const response = await fetch(`${this.baseURL}/${courseId}`, {
        method: "DELETE",
        headers: await this.getHeaders(),
      })
      return await this.handleResponse(response)
    } catch (error) {
      console.error("Error deleting assignment:", error)
      throw error
    }
  }
}

export const fichaLevelAssignmentService = new FichaLevelAssignmentService()
