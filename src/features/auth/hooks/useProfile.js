import { useState, useEffect } from 'react'
import { getUserProfile, updateUserProfile } from '../../../shared/services/profileService'
import { useAuth } from './useAuth'

export const useProfile = () => {
  const { user, setUser } = useAuth()
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Cargar perfil del usuario
  const loadProfile = async () => {
    if (!user?.id) return

    setIsLoading(true)
    setError(null)

    try {
      const profileData = await getUserProfile(user.id)
      setProfile(profileData)
    } catch (err) {
      setError(err.message || 'Error al cargar el perfil')
      console.error('Error loading profile:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Actualizar perfil del usuario
  const updateProfile = async (profileData) => {
    if (!user?.id) {
      throw new Error('Usuario no autenticado')
    }

    setIsUpdating(true)
    setError(null)

    try {
      const updatedProfile = await updateUserProfile(user.id, profileData)
      setProfile(updatedProfile)
      
      // Actualizar también el contexto de usuario con los nuevos datos
      const updatedUser = {
        ...user,
        name: `${updatedProfile.nombre} ${updatedProfile.apellido}`,
        nombre: updatedProfile.nombre,
        apellido: updatedProfile.apellido,
        email: updatedProfile.correo,
        phone: updatedProfile.telefono
      }
      
      setUser(updatedUser)
      
      // Actualizar localStorage si existe
      const storedUser = localStorage.getItem('wordzy_user')
      if (storedUser) {
        localStorage.setItem('wordzy_user', JSON.stringify(updatedUser))
      }
      
      return updatedProfile
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil')
      throw err
    } finally {
      setIsUpdating(false)
    }
  }

  // Cargar perfil cuando el usuario cambie
  useEffect(() => {
    if (user?.id) {
      loadProfile()
    }
  }, [user?.id])

  return {
    profile,
    isLoading,
    error,
    isUpdating,
    loadProfile,
    updateProfile,
    clearError: () => setError(null)
  }
}