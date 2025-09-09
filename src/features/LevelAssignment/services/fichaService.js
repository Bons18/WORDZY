const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

class FichaService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/fichas` // Ajusta según tu endpoint
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

  // Obtener todas las fichas
  async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString()
      const url = queryParams ? `${this.baseURL}?${queryParams}` : this.baseURL

      const response = await fetch(url, {
        method: "GET",
        headers: await this.getHeaders(),
      })
      return await this.handleResponse(response)
    } catch (error) {
      console.error("Error getting fichas:", error)
      throw error
    }
  }

  // Buscar fichas
  async search(searchTerm) {
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

  // Obtener ficha por ID
  async getById(id) {
    try {
      const response = await fetch(`${this.baseURL}/${id}`, {
        method: "GET",
        headers: await this.getHeaders(),
      })
      return await this.handleResponse(response)
    } catch (error) {
      console.error("Error getting ficha by id:", error)
      throw error
    }
  }
}

export const fichaService = new FichaService()
