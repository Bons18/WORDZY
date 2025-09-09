const API_BASE_URL = 'http://localhost:3000/api'
const API_KEY = 'sara_d32775a2ea8a39a3.a14bb968e21a6be6821d19f2764945338ba182b972aff43732b0c7c8314d343a'

// Obtener perfil de usuario
export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      }
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    // El backend devuelve { success: true, data: userData }
    return data.data || data
  } catch (error) {
    console.error('Error fetching user profile:', error)
    throw error
  }
}

// Actualizar perfil de usuario
export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY
      },
      body: JSON.stringify(profileData)
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    // El backend devuelve { success: true, data: userData }
    return data.data || data
  } catch (error) {
    console.error('Error updating user profile:', error)
    throw error
  }
}