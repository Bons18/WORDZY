import { useState, useEffect, useCallback } from "react"
import {
  getBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  getBadgeById,
  getUserBadges,
  assignBadgeToUser,
  validateBadgeData,
  formatBadgeForSubmission,
} from "../services/badgeService"

// Hook principal para manejo de badges
export const useBadges = () => {
  const [badges, setBadges] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Cargar todas las insignias
  const fetchBadges = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await getBadges()
      if (result.success) {
        setBadges(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Crear nueva insignia
  const createNewBadge = useCallback(async (badgeData) => {
    setLoading(true)
    setError(null)

    try {
      const validation = validateBadgeData(badgeData)
      console.log('🔍 USE BADGES - Validation result:', validation)
      if (!validation.isValid) {
        console.log('🔍 USE BADGES - Validation failed, errors:', validation.errors)
        setError(validation.errors)
        setLoading(false)
        return { success: false, errors: validation.errors }
      }
      console.log('🔍 USE BADGES - Validation passed, proceeding...')

      const formattedData = formatBadgeForSubmission(badgeData)
      const result = await createBadge(formattedData)
      
      if (result.success) {
        setBadges(prev => [...prev, result.data])
        return { success: true, data: result.data, message: result.message }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Actualizar insignia existente
  const updateExistingBadge = useCallback(async (badgeId, badgeData) => {
    setLoading(true)
    setError(null)

    try {
      const validation = validateBadgeData(badgeData)
      console.log('🔍 UPDATE BADGES - Validation result:', validation)
      if (!validation.isValid) {
        console.log('🔍 UPDATE BADGES - Validation failed, errors:', validation.errors)
        setError(validation.errors)
        setLoading(false)
        return { success: false, errors: validation.errors }
      }
      console.log('🔍 UPDATE BADGES - Validation passed, proceeding...')

      const formattedData = formatBadgeForSubmission(badgeData)
      console.log('🔍 USE BADGES - badgeId:', badgeId)
      console.log('🔍 USE BADGES - badgeData original:', badgeData)
      console.log('🔍 USE BADGES - formattedData:', formattedData)
      const result = await updateBadge(badgeId, formattedData)
      
      if (result.success) {
        setBadges(prev => prev.map(badge => 
          badge._id === badgeId ? result.data : badge
        ))
        return { success: true, data: result.data, message: result.message }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Eliminar insignia
  const removeBadge = useCallback(async (badgeId) => {
    setLoading(true)
    setError(null)

    try {
      const result = await deleteBadge(badgeId)
      
      if (result.success) {
        setBadges(prev => prev.filter(badge => badge._id !== badgeId))
        return { success: true, message: result.message }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar badges al montar el componente
  useEffect(() => {
    fetchBadges()
  }, [])

  return {
    badges,
    loading,
    error,
    fetchBadges,
    createNewBadge,
    updateBadge: updateExistingBadge,
    deleteBadge: removeBadge,
    setBadges,
    setError,
  }
}

// Hook para manejo de una insignia específica
export const useBadge = (badgeId) => {
  const [badge, setBadge] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchBadge = useCallback(async () => {
    if (!badgeId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await getBadgeById(badgeId)
      if (result.success) {
        setBadge(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [badgeId])

  useEffect(() => {
    fetchBadge()
  }, [fetchBadge])

  return {
    badge,
    loading,
    error,
    fetchBadge,
    setBadge,
  }
}

// Hook para manejo de badges de usuario
export const useUserBadges = (userId) => {
  const [userBadges, setUserBadges] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUserBadges = useCallback(async () => {
    if (!userId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await getUserBadges(userId)
      if (result.success) {
        setUserBadges(result.data)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  // Asignar insignia a usuario
  const assignBadge = useCallback(async (badgeId) => {
    if (!userId || !badgeId) return { success: false, error: "Faltan parámetros" }
    
    setLoading(true)
    setError(null)

    try {
      const result = await assignBadgeToUser(badgeId, userId)
      
      if (result.success) {
        await fetchUserBadges() // Recargar badges del usuario
        return { success: true, message: result.message }
      } else {
        setError(result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [userId, fetchUserBadges])

  useEffect(() => {
    fetchUserBadges()
  }, [fetchUserBadges])

  return {
    userBadges,
    loading,
    error,
    fetchUserBadges,
    assignBadge,
    setUserBadges,
  }
}

// Hook para validación de formularios de badges
export const useBadgeValidation = () => {
  const [errors, setErrors] = useState({})
  const [isValid, setIsValid] = useState(false)

  const validateForm = useCallback((formData) => {
    const validation = validateBadgeData(formData)
    setErrors(validation.errors)
    setIsValid(validation.isValid)
    return validation
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
    setIsValid(false)
  }, [])

  const setFieldError = useCallback((field, error) => {
    setErrors(prev => ({ ...prev, [field]: error }))
    setIsValid(false)
  }, [])

  return {
    errors,
    isValid,
    validateForm,
    clearErrors,
    setFieldError,
  }
}