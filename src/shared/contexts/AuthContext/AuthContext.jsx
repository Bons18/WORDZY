"use client"

import { createContext, useState, useEffect } from "react"
import { verifyToken } from "../../../features/auth/services/authService"

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoggedOut, setHasLoggedOut] = useState(false)

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
        // Verificar si hay un token válido
        let token = localStorage.getItem("wordzy_token")
        
        if (token) {
          // Verificar el token con el backend
          const userData = await verifyToken()
          if (userData) {
            // Token válido, cargar usuario
            setUser(userData)
            localStorage.setItem("wordzy_user", JSON.stringify(userData))
            console.log('✅ Usuario autenticado correctamente:', userData.name || `${userData.nombre} ${userData.apellido}`)
          } else {
            // Token inválido, limpiar todo y no intentar obtener uno nuevo automáticamente
            console.log('❌ Token inválido, limpiando sesión')
            localStorage.removeItem("wordzy_token")
            localStorage.removeItem("wordzy_user")
            localStorage.removeItem("wordzy_session_id")
            setUser(null)
          }
        } else {
          // No hay token, verificar si hay datos de usuario guardados y limpiarlos
          const savedUser = localStorage.getItem("wordzy_user")
          if (savedUser) {
            console.log('🧹 Limpiando datos de usuario sin token válido')
            localStorage.removeItem("wordzy_user")
          }
          setUser(null)
          console.log('🔒 No hay sesión activa')
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        // En caso de error, limpiar todo y no intentar recuperar automáticamente
        localStorage.removeItem("wordzy_token")
        localStorage.removeItem("wordzy_user")
        localStorage.removeItem("wordzy_session_id")
        setUser(null)
        console.log('🔒 Sesión limpiada debido a error de inicialización')
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
      console.log('🚪 Sesión cerrada localmente')
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