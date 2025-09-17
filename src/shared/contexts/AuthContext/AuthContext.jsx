"use client"

import { createContext, useState, useEffect } from "react"
import { verifyToken } from "../../../features/auth/services/authService"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoggedOut, setHasLoggedOut] = useState(false)

  // Función para verificar si hay conectividad con el backend
  const checkBackendConnectivity = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/health', {
        method: 'GET',
        timeout: 5000 // 5 segundos de timeout
      })
      return response.ok
    } catch (error) {
      console.warn('⚠️ Backend no disponible:', error.message)
      return false
    }
  }

  // Función para obtener token válido del backend
  const getValidTokenFromBackend = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/get-valid-token')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.token) {
          // Formatear el usuario correctamente
          const formattedUser = {
            ...data.user,
            name: data.user.name || `${data.user.nombre || ''} ${data.user.apellido || ''}`.trim()
          }
          
          localStorage.setItem('wordzy_token', data.token)
          localStorage.setItem('wordzy_user', JSON.stringify(formattedUser))
          if (data.sessionId) {
            localStorage.setItem('wordzy_session_id', data.sessionId)
          }
          return { user: formattedUser, token: data.token }
        }
      }
    } catch (error) {
      console.error('Error obteniendo token del backend:', error)
    }
    return null
  }

  useEffect(() => {
    const initializeAuth = async () => {
      // Si el usuario acaba de hacer logout, no intentar cargar datos
      if (hasLoggedOut) {
        console.log('🚪 Usuario hizo logout, saltando inicialización')
        setIsLoading(false)
        return
      }
      
      try {
        // Verificar si hay un token y datos de usuario guardados
        const token = localStorage.getItem("wordzy_token")
        const savedUser = localStorage.getItem("wordzy_user")
        
        if (token && savedUser) {
          try {
            // Intentar parsear los datos del usuario guardados
            const userData = JSON.parse(savedUser)
            
            // Siempre establecer el usuario primero para evitar logout automático
            setUser(userData)
            console.log('🔄 Usuario cargado desde localStorage:', userData.name)
            
            // Verificar el token con el backend en segundo plano
            try {
              const verifiedUserData = await verifyToken()
              
              if (verifiedUserData) {
                // Token válido, actualizar con datos verificados del backend
                setUser(verifiedUserData)
                localStorage.setItem("wordzy_user", JSON.stringify(verifiedUserData))
                console.log('✅ Usuario verificado y actualizado:', verifiedUserData.name || `${verifiedUserData.nombre} ${verifiedUserData.apellido}`)
              } else {
                // Token inválido, pero mantener sesión local
                console.log('⚠️ Token inválido, manteniendo sesión local para:', userData.name)
              }
            } catch (verifyError) {
              // Error de verificación (probablemente red), mantener sesión local
              console.log('⚠️ Error verificando token, manteniendo sesión local:', verifyError.message)
            }
          } catch (parseError) {
            console.error('Error parseando datos de usuario:', parseError)
            // Si hay error parseando, limpiar datos corruptos
            localStorage.removeItem("wordzy_user")
            localStorage.removeItem("wordzy_token")
            setUser(null)
          }
        } else if (token && !savedUser) {
          // Hay token pero no datos de usuario, verificar con backend
          try {
            const userData = await verifyToken()
            if (userData) {
              setUser(userData)
              localStorage.setItem("wordzy_user", JSON.stringify(userData))
              console.log('✅ Usuario recuperado del backend:', userData.name || `${userData.nombre} ${userData.apellido}`)
            } else {
              console.log('❌ Token inválido, limpiando sesión')
              localStorage.removeItem("wordzy_token")
              localStorage.removeItem("wordzy_session_id")
              setUser(null)
            }
          } catch (error) {
            console.error('Error recuperando usuario:', error)
            localStorage.removeItem("wordzy_token")
            setUser(null)
          }
        } else if (!token && savedUser) {
          // Hay datos de usuario pero no token, limpiar datos obsoletos
          console.log('🧹 Limpiando datos de usuario sin token válido')
          localStorage.removeItem("wordzy_user")
          setUser(null)
        } else {
          // No hay token ni datos de usuario
          setUser(null)
          console.log('🔒 No hay sesión activa')
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        // En caso de error de red, mantener sesión local si existe
        const savedUser = localStorage.getItem("wordzy_user")
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser)
            setUser(userData)
            console.log('🔄 Manteniendo sesión local debido a error de red:', userData.name)
          } catch (parseError) {
            console.error('Error parseando datos guardados:', parseError)
            localStorage.removeItem("wordzy_user")
            setUser(null)
          }
        } else {
          setUser(null)
        }
        console.log('⚠️ Error de inicialización, sesión mantenida localmente si existe')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [hasLoggedOut])

  const login = (userData, token, sessionId = null) => {
    // Resetear la bandera de logout
    setHasLoggedOut(false)
    
    // Asegurar que el usuario tenga un nombre formateado correctamente
    const formattedUser = {
      ...userData,
      name: userData.name || `${userData.nombre || ''} ${userData.apellido || ''}`.trim()
    }
    
    setUser(formattedUser)
    localStorage.setItem("wordzy_user", JSON.stringify(formattedUser))
    
    if (token) {
      localStorage.setItem("wordzy_token", token)
      console.log('✅ Token activado y guardado en localStorage')
    }
    if (sessionId) {
      localStorage.setItem("wordzy_session_id", sessionId)
      console.log('🔑 Session ID guardado para gestión de sesión')
    }
    console.log('🚀 Sesión iniciada correctamente para:', formattedUser.name)
  }

  const logout = async () => {
    try {
      // Obtener sessionId y token antes de limpiar localStorage
      const sessionId = localStorage.getItem("wordzy_session_id")
      const token = localStorage.getItem("wordzy_token")
      
      // Invalidar sesión en el backend si hay sessionId o token
      if (sessionId || token) {
        try {
          const response = await fetch('http://localhost:3000/api/auth/invalidate-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId, token })
          })
          
          if (response.ok) {
            console.log('🔒 Sesión invalidada correctamente en el backend')
          } else {
            console.warn('⚠️ No se pudo invalidar la sesión en el backend')
          }
        } catch (error) {
          console.error('Error invalidando sesión:', error)
        }
      }
    } catch (error) {
      console.error('Error durante logout:', error)
    } finally {
      // Limpiar localStorage y estado local
      setUser(null)
      setHasLoggedOut(true)
      localStorage.removeItem("wordzy_user")
      localStorage.removeItem("wordzy_token")
      localStorage.removeItem("wordzy_session_id")
      // También limpiar credenciales recordadas si existen
      localStorage.removeItem("rememberedCredentials")
      console.log('🚪 Sesión cerrada completamente - todos los datos limpiados')
    }
  }

  const value = {
    user,
    setUser,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}