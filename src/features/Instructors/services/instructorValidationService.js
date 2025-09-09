// src/features/Instructors/services/instructorValidationService.js

import { API_ENDPOINTS } from "../../../shared/config/api"

// --- VALIDACIONES INDIVIDUALES Y SÍNCRONAS ---

export const validateNombre = (nombre) => {
  if (!nombre?.trim()) return "El nombre es obligatorio"
  if (nombre.trim().length < 2) return "El nombre debe tener al menos 2 caracteres"
  if (nombre.trim().length > 50) return "El nombre no puede exceder 50 caracteres"
  return null
}

export const validateApellido = (apellido) => {
  if (!apellido?.trim()) return "El apellido es obligatorio"
  if (apellido.trim().length < 2) return "El apellido debe tener al menos 2 caracteres"
  if (apellido.trim().length > 50) return "El apellido no puede exceder 50 caracteres"
  return null
}

export const validateDocumento = (documento, tipoDocumento) => {
  if (!documento?.trim()) return "El documento es obligatorio"
  const doc = documento.trim()
  if (!/^\d+$/.test(doc)) return "El documento solo debe contener números."

  switch (tipoDocumento) {
    case "CC":
      if (doc.length < 6 || doc.length > 10) return "La cédula debe tener entre 6 y 10 dígitos."
      break
    case "TI":
      if (doc.length < 8 || doc.length > 11) return "La tarjeta de identidad debe tener entre 8 y 11 dígitos."
      break
    case "PPT":
    case "PEP":
      if (doc.length < 6 || doc.length > 15) return "El documento debe tener entre 6 y 15 caracteres."
      break
    default:
      if (doc.length < 6 || doc.length > 15) return "El documento debe tener entre 6 y 15 caracteres."
  }
  return null
}

export const validateTelefono = (telefono) => {
  if (!telefono?.trim()) return "El teléfono es obligatorio"
  const phone = telefono.trim()
  if (!/^\d+$/.test(phone)) return "El teléfono solo debe contener números."
  if (phone.length < 7 || phone.length > 10) return "El teléfono debe tener entre 7 y 10 dígitos."
  return null
}

export const validateCorreo = (correo) => {
  if (!correo?.trim()) return "El correo es obligatorio"
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(correo.trim())) return "El formato del correo no es válido"
  return null
}

// --- VERIFICACIONES ASÍNCRONAS CONTRA LA API ---

const checkUniqueness = async (field, value, excludeId = null) => {
  try {
    // Usamos el endpoint de usuarios para verificar la existencia
    const response = await fetch(API_ENDPOINTS.USERS)
    if (!response.ok) {
      console.error(`Error en la respuesta de la API: ${response.statusText}`)
      // En caso de error de red, no bloqueamos al usuario, pero lo notificamos en consola.
      return { unique: true }
    }

    const users = await response.json()
    const normalizedValue = value.toLowerCase().trim()

    const existingUser = users.find((user) => {
      // Asegurarse de que el usuario y el campo existen antes de comparar
      return user && user[field] && user[field].toLowerCase() === normalizedValue
    })

    // Si se encuentra un usuario y su ID no es el que estamos editando
    if (existingUser && existingUser._id !== excludeId) {
      return { unique: false, message: `El ${field} ya se encuentra registrado.` }
    }

    return { unique: true }
  } catch (error) {
    console.error(`Error verificando la unicidad del ${field}:`, error)
    return { unique: true, error: `No se pudo verificar el ${field}.` }
  }
}

export const checkDocumentUniqueness = (documento, excludeId = null) => {
  return checkUniqueness("documento", documento, excludeId)
}

export const checkEmailUniqueness = (correo, excludeId = null) => {
  return checkUniqueness("correo", correo, excludeId)
}

// --- VALIDACIÓN COMPLETA DEL FORMULARIO (PARA EL SUBMIT) ---

export const validateInstructorData = async (formData, isEditMode = false, instructorId = null) => {
  const errors = {}

  const nombreError = validateNombre(formData.nombre)
  if (nombreError) errors.nombre = nombreError

  const apellidoError = validateApellido(formData.apellido)
  if (apellidoError) errors.apellido = apellidoError

  const documentoError = validateDocumento(formData.documento, formData.tipoDocumento)
  if (documentoError) errors.documento = documentoError

  const telefonoError = validateTelefono(formData.telefono)
  if (telefonoError) errors.telefono = telefonoError

  const correoError = validateCorreo(formData.correo)
  if (correoError) errors.correo = correoError

  if (isEditMode && !formData.estado) {
    errors.estado = "El estado es obligatorio"
  }

  // Si no hay errores de formato, verificar unicidad en la BD
  if (!documentoError) {
    const { unique, message } = await checkDocumentUniqueness(formData.documento, instructorId)
    if (!unique) errors.documento = message
  }
  if (!correoError) {
    const { unique, message } = await checkEmailUniqueness(formData.correo, instructorId)
    if (!unique) errors.correo = message
  }

  return errors
}

// Función para procesar errores del servidor
export const processServerError = (error) => {
  const errors = {}
  if (error.message) {
    errors.general = error.message
  } else {
    errors.general = "Ha ocurrido un error inesperado. Por favor, inténtelo de nuevo."
  }
  return errors
}
