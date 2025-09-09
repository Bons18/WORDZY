"use client"

import { useState, useEffect, useContext } from "react"
import { AuthContext } from "@/shared/contexts/AuthContext"
import { loginUser } from "../services/authService"

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }

  const { user, setUser, isLoading: contextLoading, login: contextLogin, logout: contextLogout } = context
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const login = async (credentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await loginUser(credentials)
      const userData = response.user || response
      const token = response.token
      const sessionId = response.sessionId
      
      // Usar la función login del contexto que maneja sessionId
      contextLogin(userData, token, sessionId)

      // Guardar en localStorage si rememberMe está activado (ya se hace en contextLogin)
      if (credentials.rememberMe) {
        console.log('🔄 RememberMe activado - datos persistidos')
      }

      return userData
    } catch (err) {
      setError(err.message || "Error de autenticación")
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await contextLogout()
  }

  return {
    user,
    setUser,
    isAuthenticated: !!user,
    isLoading: contextLoading || isLoading,
    error,
    login,
    logout,
  }
}
