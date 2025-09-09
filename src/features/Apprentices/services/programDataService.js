import api from "../../../shared/services/api"

const API_URL = import.meta.env.VITE_API_URL

// Fetches all courses (fichas)
export const getAllCourses = async () => {
  try {
    const response = await api.get(`${API_URL}/course`)
    return response.data
  } catch (error) {
    console.error("Error fetching courses:", error)
    throw error
  }
}

// Fetches all programs
export const getAllPrograms = async () => {
  try {
    const response = await api.get(`${API_URL}/program`)
    return response.data
  } catch (error) {
    console.error("Error fetching programs:", error)
    throw error
  }
}

// Fetches all course programmings
export const getAllCourseProgrammings = async () => {
  try {
    const response = await api.get(`${API_URL}/course-programming`)
    return response.data
  } catch (error) {
    console.error("Error fetching course programmings:", error)
    throw error
  }
}
