const API_BASE_URL = "http://localhost:3000/api/badges"

// Función para obtener un token válido automáticamente del backend
const getValidTokenFromBackend = async () => {
  try {
    console.log('🔄 Obteniendo token válido del backend...')
    const response = await fetch('http://localhost:3000/api/auth/get-valid-token')
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.token) {
        // Guardar el nuevo token y datos del usuario
        localStorage.setItem('wordzy_token', data.token)
        localStorage.setItem('wordzy_user', JSON.stringify(data.user))
        if (data.sessionId) {
          localStorage.setItem('wordzy_session_id', data.sessionId)
        }
        console.log('✅ Token renovado automáticamente')
        return data.token
      }
    }
    console.log('❌ No se pudo obtener token del backend')
    return null
  } catch (error) {
    console.error('❌ Error obteniendo token automático:', error)
    return null
  }
}

// Función para realizar peticiones con recuperación automática de token
const fetchWithAutoTokenRecovery = async (url, options = {}) => {
  // Primer intento con el token actual
  let response = await fetch(url, options)
  
  // Si obtenemos 401, intentar recuperar el token automáticamente
  if (response.status === 401) {
    console.log('🔄 Error 401 detectado, intentando recuperar token automáticamente...')
    
    const newToken = await getValidTokenFromBackend()
    if (newToken) {
      // Actualizar headers con el nuevo token
      const updatedHeaders = {
        ...options.headers,
        'Authorization': `Bearer ${newToken}`
      }
      
      // Reintentar la petición con el nuevo token
      response = await fetch(url, {
        ...options,
        headers: updatedHeaders
      })
      
      if (response.ok) {
        console.log('✅ Petición exitosa después de renovar token')
      }
    }
  }
  
  return response
}

const getApiHeaders = () => {
  const token = localStorage.getItem("wordzy_token")
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": "sara_d32775a2ea8a39a3.a14bb968e21a6be6821d19f2764945338ba182b972aff43732b0c7c8314d343a",
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  
  return headers
}

// Obtener todas las insignias
export const getBadges = async () => {
  try {
    const response = await fetchWithAutoTokenRecovery(API_BASE_URL, {
      method: "GET",
      headers: getApiHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || result,
    }
  } catch (error) {
    console.error("❌ Error fetching badges:", error)
    return {
      success: false,
      error: error.message,
      data: [],
    }
  }
}

// Crear una nueva insignia
export const createBadge = async (badgeData) => {
  try {
    console.log('🔍 CREATE BADGE - badgeData recibido:', badgeData)
    console.log('🔍 CREATE BADGE - badgeData.file:', badgeData.file)
    console.log('🔍 CREATE BADGE - typeof badgeData.file:', typeof badgeData.file)
    console.log('🔍 CREATE BADGE - badgeData.file instanceof File:', badgeData.file instanceof File)
    
    let body
    let headers

    // Si hay un archivo, usar FormData
    if (badgeData.file && badgeData.file instanceof File) {
      console.log('🔍 CREATE BADGE - Usando FormData (con archivo)')
       console.log('🔍 CREATE BADGE - Archivo details:', {
         name: badgeData.file.name,
         size: badgeData.file.size,
         type: badgeData.file.type,
         lastModified: badgeData.file.lastModified
       })
      
      const formData = new FormData()
      
      // Agregar campos de texto
      formData.append('name', badgeData.name?.trim() || '')
      formData.append('points', badgeData.points || '')
      formData.append('description', badgeData.description?.trim() || '')
      formData.append('startDate', badgeData.startDate || '')
      formData.append('endDate', badgeData.endDate || '')
      
      formData.append('image', badgeData.file)
      
      console.log('🔍 CREATE BADGE - FormData entries:')
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value)
      }
      
      body = formData
      headers = {
        "x-api-key": "sara_d32775a2ea8a39a3.a14bb968e21a6be6821d19f2764945338ba182b972aff43732b0c7c8314d343a",
      }
    } else {
      console.log('🔍 CREATE BADGE - Usando JSON (sin archivo)')
      console.log('🔍 CREATE BADGE - Razón: badgeData.file =', badgeData.file, 'instanceof File =', badgeData.file instanceof File)
      // Si no hay archivo, usar JSON
      body = JSON.stringify({
        name: badgeData.name?.trim(),
        points: parseInt(badgeData.points),
        description: badgeData.description?.trim(),
        startDate: badgeData.startDate,
        endDate: badgeData.endDate,
      })
      headers = getApiHeaders()
    }

    const response = await fetchWithAutoTokenRecovery(API_BASE_URL, {
      method: "POST",
      headers: headers,
      body: body,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log('🔍 CREATE BADGE - Response from backend:', data)
    console.log('🔍 CREATE BADGE - Badge image URL:', data.badge?.image)
    return {
      success: true,
      data: data.badge, // Extraer solo los datos de la insignia de la respuesta del backend
      message: data.message || "Insignia creada exitosamente",
    }
  } catch (error) {
    console.error("❌ Error creating badge:", error)
    return {
      success: false,
      error: error.message,
      message: "Error al crear la insignia",
    }
  }
}

// Actualizar una insignia existente
export const updateBadge = async (badgeId, badgeData) => {
  try {
    let body
    let headers

    // Formatear fechas correctamente para evitar problemas de zona horaria
    const formatDateForBackend = (dateString) => {
      if (!dateString) return null
      
      // Si ya está en formato YYYY-MM-DD, devolverlo tal como está
      if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString
      }
      
      // Si es una fecha ISO string, extraer solo la parte de la fecha
      if (typeof dateString === 'string' && dateString.includes('T')) {
        return dateString.split('T')[0]
      }
      
      // Para fechas en formato dd/mm/yyyy o similar, parsear manualmente
      if (typeof dateString === 'string' && dateString.includes('/')) {
        const parts = dateString.split('/')
        if (parts.length === 3) {
          // Asumir formato dd/mm/yyyy
          const day = parts[0].padStart(2, '0')
          const month = parts[1].padStart(2, '0')
          const year = parts[2]
          return `${year}-${month}-${day}`
        }
      }
      
      // Para otros casos, usar Date pero ajustar por zona horaria local
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return null
      
      // Usar getFullYear, getMonth, getDate para evitar problemas de zona horaria
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // Si hay un archivo nuevo, usar FormData
    if (badgeData.file) {
      const formData = new FormData()
      
      // Agregar campos de texto
      formData.append('name', badgeData.name || badgeData.badgeName?.trim() || '')
      formData.append('points', badgeData.points || '')
      formData.append('description', badgeData.description?.trim() || '')
      formData.append('startDate', formatDateForBackend(badgeData.startDate) || '')
      formData.append('endDate', formatDateForBackend(badgeData.endDate) || '')
      formData.append('image', badgeData.file)
      
      body = formData
      headers = {
        "x-api-key": "sara_d32775a2ea8a39a3.a14bb968e21a6be6821d19f2764945338ba182b972aff43732b0c7c8314d343a",
      }
    } else {
      // Si no hay archivo nuevo, usar JSON
      body = JSON.stringify({
        name: badgeData.name || badgeData.badgeName?.trim(),
        points: parseInt(badgeData.points),
        description: badgeData.description?.trim(),
        startDate: formatDateForBackend(badgeData.startDate),
        endDate: formatDateForBackend(badgeData.endDate),
      })
      headers = getApiHeaders()
    }
    
    const response = await fetchWithAutoTokenRecovery(`${API_BASE_URL}/${badgeId}`, {
      method: "PUT",
      headers: headers,
      body: body,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      success: true,
      data: data.data, // Extraer solo los datos de la insignia de la respuesta del backend
      message: data.message || "Insignia actualizada exitosamente",
    }
  } catch (error) {
    console.error("❌ Error updating badge:", error)
    return {
      success: false,
      error: error.message,
      message: "Error al actualizar la insignia",
    }
  }
}

// Eliminar una insignia
export const deleteBadge = async (badgeId) => {
  try {
    const response = await fetchWithAutoTokenRecovery(`${API_BASE_URL}/${badgeId}`, {
      method: "DELETE",
      headers: getApiHeaders(),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    return {
      success: true,
      message: "Insignia eliminada exitosamente",
    }
  } catch (error) {
    console.error("❌ Error deleting badge:", error)
    return {
      success: false,
      error: error.message,
      message: "Error al eliminar la insignia",
    }
  }
}

// Obtener una insignia por ID
export const getBadgeById = async (badgeId) => {
  try {
    const response = await fetchWithAutoTokenRecovery(`${API_BASE_URL}/${badgeId}`, {
      method: "GET",
      headers: getApiHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || result,
    }
  } catch (error) {
    console.error("❌ Error fetching badge by ID:", error)
    return {
      success: false,
      error: error.message,
      data: null,
    }
  }
}

// Obtener insignias de un usuario específico
export const getUserBadges = async (userId) => {
  try {
    const response = await fetchWithAutoTokenRecovery(`${API_BASE_URL}/user/${userId}`, {
      method: "GET",
      headers: getApiHeaders(),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()
    return {
      success: true,
      data: result.data || result,
    }
  } catch (error) {
    console.error("❌ Error fetching user badges:", error)
    return {
      success: false,
      error: error.message,
      data: [],
    }
  }
}

// Asignar insignia a un usuario
export const assignBadgeToUser = async (badgeId, userId) => {
  try {
    const response = await fetchWithAutoTokenRecovery(`${API_BASE_URL}/${badgeId}/assign`, {
      method: "POST",
      headers: getApiHeaders(),
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      success: true,
      data: data,
      message: "Insignia asignada exitosamente",
    }
  } catch (error) {
    console.error("❌ Error assigning badge to user:", error)
    return {
      success: false,
      error: error.message,
      message: "Error al asignar la insignia",
    }
  }
}

// Validaciones para insignias
export const validateBadgeData = (badgeData) => {
  const errors = {}

  // Validar nombre (puede venir como 'name' o 'badgeName')
  const badgeName = badgeData.badgeName || badgeData.name
  if (!badgeName || badgeName.trim() === "") {
    errors.badgeName = "El nombre de la insignia es requerido"
  } else if (badgeName.trim().length > 100) {
    errors.badgeName = "El nombre no puede exceder 100 caracteres"
  } else if (badgeName.trim().length < 3) {
    errors.badgeName = "El nombre debe tener al menos 3 caracteres"
  }

  // Validar puntos con mayor robustez
  const points = badgeData.points
  if (!points && points !== 0) {
    errors.points = "Los puntos son requeridos"
  } else if (isNaN(points) || !Number.isInteger(Number(points))) {
    errors.points = "Los puntos deben ser un número entero"
  } else if (Number(points) <= 0) {
    errors.points = "Los puntos deben ser un número mayor a 0"
  } else if (Number(points) > 100000) {
    errors.points = "Los puntos no pueden exceder 100,000"
  }

  // Validar descripción
  if (!badgeData.description || badgeData.description.trim() === "") {
    errors.description = "La descripción es requerida"
  } else if (badgeData.description.trim().length < 10) {
    errors.description = "La descripción debe tener al menos 10 caracteres"
  } else if (badgeData.description.trim().length > 500) {
    errors.description = "La descripción no puede exceder 500 caracteres"
  }

  // Validar imagen con mayor detalle
  const hasNewFile = badgeData.file && badgeData.file instanceof File
  const hasExistingImage = badgeData.filePreview || badgeData.existingImage || badgeData.image
  const isEditing = badgeData.existingImage || (badgeData.filePreview && !hasNewFile)
  
  // Solo requerir imagen si es creación nueva (no edición) y no hay archivo
  if (!hasNewFile && !hasExistingImage && !isEditing) {
    errors.file = "La imagen de la insignia es requerida"
  }

  // Validar tipo y tamaño de archivo si hay uno nuevo
  if (hasNewFile) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(badgeData.file.type)) {
      errors.file = "Solo se permiten archivos de imagen (JPG, PNG, SVG, WebP)"
    } else if (badgeData.file.size > 5 * 1024 * 1024) { // 5MB
      errors.file = "La imagen no puede exceder 5MB"
    }
  }

  // Validar fecha de inicio
  if (!badgeData.startDate) {
    errors.startDate = "La fecha de inicio es requerida"
  } else {
    const startDate = new Date(badgeData.startDate)
    if (isNaN(startDate.getTime())) {
      errors.startDate = "La fecha de inicio no es válida"
    }
  }

  // Validar fecha de fin
  if (!badgeData.endDate) {
    errors.endDate = "La fecha de fin es requerida"
  } else {
    const endDate = new Date(badgeData.endDate)
    if (isNaN(endDate.getTime())) {
      errors.endDate = "La fecha de fin no es válida"
    }
  }

  // Validar que la fecha de fin sea posterior a la de inicio
  if (badgeData.startDate && badgeData.endDate) {
    const startDate = new Date(badgeData.startDate)
    const endDate = new Date(badgeData.endDate)
    
    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      if (startDate >= endDate) {
        errors.endDate = "La fecha de fin debe ser posterior a la fecha de inicio"
      }
      
      // Validar que las fechas no sean demasiado en el pasado (opcional)
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      
      if (startDate < oneYearAgo) {
        errors.startDate = "La fecha de inicio no puede ser anterior a un año"
      }
      
      // Validar que la duración no sea excesiva
      const maxDuration = 5 * 365 * 24 * 60 * 60 * 1000 // 5 años en milisegundos
      if (endDate.getTime() - startDate.getTime() > maxDuration) {
        errors.endDate = "La duración de la insignia no puede exceder 5 años"
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

// Formatear datos de insignia para envío
export const formatBadgeForSubmission = (formData) => {
  // Formatear fechas correctamente para el backend
  const formatDateForBackend = (dateString) => {
    if (!dateString) return null
    // Si ya es una fecha válida, convertirla a ISO string
    const date = new Date(dateString)
    return isNaN(date.getTime()) ? null : date.toISOString()
  }

  return {
    name: formData.name?.trim(),
    points: parseInt(formData.points),
    description: formData.description?.trim(),
    startDate: formatDateForBackend(formData.startDate),
    endDate: formatDateForBackend(formData.endDate),
    file: formData.file, // Mantener como 'file' para consistencia
  }
}