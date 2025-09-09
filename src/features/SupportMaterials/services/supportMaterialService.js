
const API_BASE_URL = "http://localhost:3000/api"

// Obtener todos los materiales
export const getAllMaterials = async () => {
  try {
    console.log("🚀 supportMaterialService.getAllMaterials - INICIO")

    const response = await fetch(`${API_BASE_URL}/support-materials`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("📥 Datos recibidos:", data)

    // Manejar diferentes formatos de respuesta
    if (data.success && data.data) {
      return data.data
    } else if (Array.isArray(data)) {
      return data
    } else if (data.materials) {
      return data.materials
    } else {
      console.warn("⚠️ Formato de respuesta inesperado:", data)
      return []
    }
  } catch (error) {
    console.error("❌ Error en getAllMaterials:", error)
    throw error
  }
}

// Crear un nuevo material
export const createMaterial = async (materialData) => {
  try {
    console.log("🚀 supportMaterialService.createMaterial - INICIO")
    console.log("📤 Datos a enviar:", materialData)

    const response = await fetch(`${API_BASE_URL}/support-materials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(materialData),
    })

    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("📥 Material creado:", data)

    return data.data || data
  } catch (error) {
    console.error("❌ Error en createMaterial:", error)
    throw error
  }
}

// Actualizar un material existente
export const updateMaterial = async (id, materialData) => {
  try {
    console.log("🚀 supportMaterialService.updateMaterial - INICIO")
    console.log("📤 ID:", id, "Datos:", materialData)

    const response = await fetch(`${API_BASE_URL}/support-materials/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(materialData),
    })

    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("📥 Material actualizado:", data)

    return data.data || data
  } catch (error) {
    console.error("❌ Error en updateMaterial:", error)
    throw error
  }
}

// Eliminar un material
export const deleteMaterial = async (id) => {
  try {
    console.log("🚀 supportMaterialService.deleteMaterial - INICIO")
    console.log("📤 ID a eliminar:", id)

    const response = await fetch(`${API_BASE_URL}/support-materials/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    console.log("📡 Response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log("📥 Material eliminado:", data)

    return data
  } catch (error) {
    console.error("❌ Error en deleteMaterial:", error)
    throw error
  }
}

export default {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
}
