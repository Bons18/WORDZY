// Servicio de autenticación actualizado para usar la API local
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"
const AUTH_API_URL = `${API_BASE_URL}/auth`

// Función para determinar el rol basado en el documento
const determineUserRole = (document) => {
  // Usuarios de prueba específicos
  const roleMapping = {
    32143550: "administrador",
    1000660906: "instructor",
    28488747: "aprendiz",
  }

  return roleMapping[document] || "aprendiz" // Por defecto aprendiz
}

// Función para buscar estudiante por documento en la API local
export const findStudentByDocument = async (document) => {
  try {
    const token = localStorage.getItem("wordzy_token")
    const response = await fetch(`${API_BASE_URL}?documento=${document}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Error al buscar el estudiante")
    }

    const responseData = await response.json()
    console.log('📊 Respuesta recibida:', response.status)
    console.log('📋 Datos completos:', responseData)
    
    // El backend devuelve los datos dentro de responseData.data
    const data = responseData.data || responseData
    console.log('📋 Datos extraídos:', data)
    
    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error("Error en findStudentByDocument:", error)
    throw error
  }
}

// Función para recuperar contraseña
export const recoverPassword = async (email) => {
  try {
    // Validar que se proporcione el email
    if (!email) {
      throw new Error('El correo electrónico es requerido')
    }

    // Validar formato de email
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
    if (!emailRegex.test(email)) {
      throw new Error('El formato del correo electrónico no es válido')
    }

    const response = await fetch(`${AUTH_API_URL}/recover-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        correo: email
      })
    })

    const data = await response.json()

    if (!response.ok) {
      // Manejo específico de errores de rate limiting
      if (response.status === 429) {
        throw new Error(data.message || 'Demasiados intentos. Inténtalo más tarde.')
      }
      throw new Error(data.message || 'Error al procesar la solicitud')
    }

    return {
      success: true,
      message: data.message || 'Se ha enviado un correo con las instrucciones de recuperación.'
    }

  } catch (error) {
    // Si es un error de red o API, mostrar mensaje genérico
    if (error.message.includes('fetch') || error.name === 'TypeError') {
      throw new Error('Error de conexión. Intente nuevamente')
    }
    throw error
  }
}

// Función para validar email sin enviar correo de recuperación
export const validateEmailOnly = async (email) => {
  try {
    // Validar que se proporcione el email
    if (!email) {
      throw new Error('El correo electrónico es requerido')
    }

    const response = await fetch(`${AUTH_API_URL}/validate-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Error al validar el correo electrónico')
    }

    // Procesar la respuesta del backend correctamente
    // El backend devuelve la validación en data.message.validation
    const validationData = data.message || data
    
    return {
      success: true,
      validation: validationData.validation,
      user: validationData.user,
      email: validationData.email,
      overall: validationData.overall,
      message: 'Validación completada exitosamente'
    }

  } catch (error) {
    // Si es un error de red o API, mostrar mensaje genérico
    if (error.message.includes('fetch') || error.name === 'TypeError') {
      throw new Error('Error de conexión. Intente nuevamente')
    }
    throw error
  }
}

export const loginUser = async (credentials) => {
  // Basic validation
  if (!credentials.document || !credentials.password) {
    throw new Error("Todos los campos son requeridos")
  }

  // Validar que el documento solo contenga números y tenga entre 6 y 10 dígitos
  if (!/^\d{6,10}$/.test(credentials.document)) {
    throw new Error("El documento debe tener entre 6 y 10 dígitos numéricos")
  }

  try {
    console.log('🚀 Intentando login con URL:', `${AUTH_API_URL}/login`);
    console.log('🚀 Credenciales:', { documento: credentials.document, contraseña: '***' });
    
    // Llamar al endpoint de login del backend
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documento: credentials.document,
        contraseña: credentials.password,
      }),
    })
    
    console.log('📡 Respuesta recibida:', response.status, response.statusText);

    const responseData = await response.json()
    console.log('📊 Respuesta recibida:', response.status)
    console.log('📋 Datos completos:', responseData)
    
    // El backend devuelve los datos dentro de responseData.data
    const data = responseData.data || responseData
    console.log('📋 Datos extraídos:', data)

    if (!response.ok) {
      // Manejo específico para rol desactivado (403)
      if (response.status === 403) {
        throw new Error(data.message || "Tu rol ha sido desactivado. No puedes acceder al sistema.")
      }
      throw new Error(data.message || "Error en el login")
    }

    // Guardar el token en localStorage para futuras peticiones
    if (data.token) {
      localStorage.setItem("wordzy_token", data.token)
    }
    
    // Guardar sessionId si está disponible
    if (data.sessionId) {
      localStorage.setItem("wordzy_session_id", data.sessionId)
    }

    // Formatear el usuario correctamente antes de retornarlo
    const formattedUser = {
      ...data.user,
      name: data.user.name || `${data.user.nombre || ''} ${data.user.apellido || ''}`.trim()
    }
    
    // Retornar toda la respuesta (usuario, token y sessionId)
    return {
      user: formattedUser,
      token: data.token,
      sessionId: data.sessionId
    }
  } catch (error) {
    // Si es un error de red o API, mostrar mensaje genérico
    if (error.message.includes("fetch") || error.name === "TypeError") {
      throw new Error("Error de conexión. Intente nuevamente")
    }
    throw error
  }
}

export const registerUser = async (userData) => {
  // Simulamos un retraso de red
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Validación básica
  if (!userData.email || !userData.password || !userData.name) {
    throw new Error("Todos los campos son requeridos")
  }

  // Simulación de registro exitoso
  return {
    id: Math.floor(Math.random() * 1000).toString(),
    name: userData.name,
    email: userData.email,
  }
}

export const verifyToken = async () => {
  try {
    const token = localStorage.getItem("wordzy_token")
    if (!token) {
      return null
    }

    const response = await fetch(`${AUTH_API_URL}/verify`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      // Token inválido o expirado, pero NO limpiar localStorage aquí
      // Dejar que el AuthContext maneje la persistencia
      console.warn('⚠️ Token inválido, pero manteniendo datos locales')
      return null
    }

    const data = await response.json()
    
    // Formatear el usuario correctamente
    const formattedUser = {
      ...data.message.user,
      name: data.message.user.name || `${data.message.user.nombre || ''} ${data.message.user.apellido || ''}`.trim()
    }
    
    return formattedUser
  } catch (error) {
    console.error("Error verificando token:", error)
    // En caso de error de red, NO limpiar localStorage
    // Dejar que el AuthContext maneje la persistencia
    console.warn('⚠️ Error de red, manteniendo datos locales')
    return null
  }
}

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem("wordzy_token")
    if (token) {
      // Llamar al endpoint de logout del backend
      await fetch(`${AUTH_API_URL}/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    }
  } catch (error) {
    console.error("Error en logout:", error)
  } finally {
    // Limpiar datos de sesión independientemente del resultado
    localStorage.removeItem("wordzy_user")
    localStorage.removeItem("wordzy_token")
    sessionStorage.clear()
  }
}
