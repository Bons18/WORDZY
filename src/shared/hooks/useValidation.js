import { useState, useCallback, useMemo } from 'react'

// Reglas de validación predefinidas
const validationRules = {
  required: (value, message = 'Este campo es requerido') => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return message
    }
    return null
  },
  
  email: (value, message = 'Ingrese un email válido') => {
    if (!value) return null
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? null : message
  },
  
  minLength: (min, message) => (value) => {
    if (!value) return null
    const defaultMessage = `Debe tener al menos ${min} caracteres`
    return value.length >= min ? null : (message || defaultMessage)
  },
  
  maxLength: (max, message) => (value) => {
    if (!value) return null
    const defaultMessage = `No debe exceder ${max} caracteres`
    return value.length <= max ? null : (message || defaultMessage)
  },
  
  pattern: (regex, message = 'Formato inválido') => (value) => {
    if (!value) return null
    return regex.test(value) ? null : message
  },
  
  phone: (value, message = 'Ingrese un número de teléfono válido') => {
    if (!value) return null
    const phoneRegex = /^[+]?[\d\s\-\(\)]{8,}$/
    return phoneRegex.test(value) ? null : message
  },
  
  password: (value, message = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número') => {
    if (!value) return null
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/
    return passwordRegex.test(value) ? null : message
  },
  
  confirmPassword: (originalPassword, message = 'Las contraseñas no coinciden') => (value) => {
    if (!value) return null
    return value === originalPassword ? null : message
  },
  
  numeric: (value, message = 'Solo se permiten números') => {
    if (!value) return null
    return /^\d+$/.test(value) ? null : message
  },
  
  alphanumeric: (value, message = 'Solo se permiten letras y números') => {
    if (!value) return null
    return /^[a-zA-Z0-9]+$/.test(value) ? null : message
  },
  
  url: (value, message = 'Ingrese una URL válida') => {
    if (!value) return null
    try {
      new URL(value)
      return null
    } catch {
      return message
    }
  }
}

/**
 * Hook personalizado para validación de formularios
 * @param {Object} initialValues - Valores iniciales del formulario
 * @param {Object} validationSchema - Esquema de validación
 * @returns {Object} - Objeto con valores, errores, funciones de validación y manejo
 */
export const useValidation = (initialValues = {}, validationSchema = {}) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Validar un campo específico
  const validateField = useCallback((fieldName, value) => {
    const fieldRules = validationSchema[fieldName]
    if (!fieldRules) return null
    
    for (const rule of fieldRules) {
      const error = rule(value)
      if (error) return error
    }
    return null
  }, [validationSchema])
  
  // Validar todos los campos
  const validateAll = useCallback(() => {
    const newErrors = {}
    let isValid = true
    
    Object.keys(validationSchema).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })
    
    setErrors(newErrors)
    return isValid
  }, [values, validateField, validationSchema])
  
  // Manejar cambio de valor
  const handleChange = useCallback((fieldName, value) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
    
    // Validar en tiempo real si el campo ya fue tocado
    if (touched[fieldName]) {
      const error = validateField(fieldName, value)
      setErrors(prev => ({ ...prev, [fieldName]: error }))
    }
  }, [touched, validateField])
  
  // Manejar blur (cuando el usuario sale del campo)
  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    const error = validateField(fieldName, values[fieldName])
    setErrors(prev => ({ ...prev, [fieldName]: error }))
  }, [values, validateField])
  
  // Resetear formulario
  const reset = useCallback((newValues = initialValues) => {
    setValues(newValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])
  
  // Manejar envío del formulario
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true)
    
    // Marcar todos los campos como tocados
    const allTouched = Object.keys(validationSchema).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setTouched(allTouched)
    
    const isValid = validateAll()
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Error en el envío del formulario:', error)
      }
    }
    
    setIsSubmitting(false)
    return isValid
  }, [values, validateAll, validationSchema])
  
  // Verificar si el formulario es válido
  const isValid = useMemo(() => {
    return Object.keys(validationSchema).every(fieldName => {
      return !validateField(fieldName, values[fieldName])
    })
  }, [values, validationSchema, validateField])
  
  // Verificar si hay campos con errores
  const hasErrors = useMemo(() => {
    return Object.values(errors).some(error => error !== null && error !== undefined)
  }, [errors])
  
  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    hasErrors,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateAll,
    reset,
    setValues,
    setErrors
  }
}

// Exportar reglas de validación para uso directo
export { validationRules }

// Hook simplificado para validación de un solo campo
export const useFieldValidation = (initialValue = '', rules = []) => {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState(null)
  const [touched, setTouched] = useState(false)
  
  const validate = useCallback((val = value) => {
    for (const rule of rules) {
      const errorMessage = rule(val)
      if (errorMessage) {
        setError(errorMessage)
        return false
      }
    }
    setError(null)
    return true
  }, [rules, value])
  
  const handleChange = useCallback((newValue) => {
    setValue(newValue)
    if (touched) {
      validate(newValue)
    }
  }, [touched, validate])
  
  const handleBlur = useCallback(() => {
    setTouched(true)
    validate()
  }, [validate])
  
  const reset = useCallback(() => {
    setValue(initialValue)
    setError(null)
    setTouched(false)
  }, [initialValue])
  
  return {
    value,
    error,
    touched,
    isValid: !error,
    handleChange,
    handleBlur,
    validate,
    reset
  }
}

export default useValidation