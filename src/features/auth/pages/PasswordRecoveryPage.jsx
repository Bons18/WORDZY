"use client"

import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Mail, CheckCircle, AlertCircle, Inbox, FolderOpen, Clock } from "lucide-react"
import { recoverPassword, validateEmailOnly } from "../services/authService"
import logo from "../../../assets/logo.png"

const PasswordRecoveryPage = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("") // 'success', 'error', 'info'
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [emailValidation, setEmailValidation] = useState(null)
  const [isValidating, setIsValidating] = useState(false)

  // Función para validar email en tiempo real
  const handleEmailValidation = async (emailValue) => {
    if (!emailValue || emailValue.length < 5) {
      setEmailValidation(null)
      return
    }

    setIsValidating(true)
    try {
      const result = await validateEmailOnly(emailValue)
      setEmailValidation(result)
    } catch (error) {
      setEmailValidation({
        validation: {
          format: { isValid: false, message: 'Error al validar formato' },
          existence: { exists: false, message: 'Error al verificar existencia' },
          recovery: { canRecover: false, message: 'Error en validación' }
        },
        overall: { isValid: false, message: error.message }
      })
    } finally {
      setIsValidating(false)
    }
  }

  // Debounce para la validación de email
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (email) {
        handleEmailValidation(email)
      }
    }, 800) // Esperar 800ms después de que el usuario deje de escribir

    return () => clearTimeout(timeoutId)
  }, [email])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage("")
    setMessageType("")

    try {
      const result = await recoverPassword(email)
      setMessage(result.message || 'Correo enviado exitosamente')
      setMessageType("success")
      setIsSubmitted(true)
    } catch (error) {
      // Asegurar que siempre sea una cadena de texto
      const errorMessage = typeof error === 'object' && error.message 
        ? error.message 
        : typeof error === 'string' 
        ? error 
        : 'Error al enviar el correo de recuperación. Inténtalo más tarde.'
      setMessage(errorMessage)
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTryAgain = () => {
    setIsSubmitted(false)
    setMessage("")
    setMessageType("")
    setEmail("")
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-16 lg:py-0 items-center lg:items-start bg-white">
        <div className="mb-6 lg:mb-10">
          <img src={logo || "/placeholder.svg"} alt="Wordzy Logo" className="h-40 lg:h-48 w-auto" />
        </div>
        <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-center lg:text-left">
          Recupera tu acceso a<br />
          <span className="text-[#1F384C]">plataforma Wordzy</span>
        </h1>
        <p className="text-[#64748B] text-base lg:text-lg max-w-md text-center lg:text-left">
          Ingresa tu correo electrónico registrado y te enviaremos tu contraseña actual para que puedas acceder nuevamente.
        </p>
      </div>

      {/* Right Section */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-0 bg-gradient-to-br from-gray-30 to-white">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_25px_60px_rgb(0,0,0,0.12)] transition-all duration-500 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8">
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft size={16} className="mr-2" />
              Volver al inicio de sesión
            </Link>
            <div className="text-center">
                <h2 className="text-xl lg:text-2xl font-bold text-[#1F384C] mb-4">
                  {isSubmitted ? "¡Correo Enviado!" : "Recuperar Contraseña"}
                </h2>
                <p className="text-gray-600 text-sm mb-2">
                  {isSubmitted
                    ? "Hemos enviado las instrucciones a tu correo electrónico"
                    : "Ingresa tu correo electrónico registrado para continuar"}
                </p>
              </div>
          </div>

          {!isSubmitted ? (
            /* Recovery Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="w-full">
                <label className="block text-sm font-semibold text-gray-800 mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full pl-10 pr-4 py-3.5
                             border-2 border-gray-200 rounded-xl
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             text-base text-gray-900 font-medium
                             placeholder:text-gray-400
                             hover:border-gray-300 transition-all duration-200
                             bg-gray-50 focus:bg-white"
                    required
                  />
                  {/* Email Validation Status */}
                  {isValidating && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                
                {/* Email Validation Status - Improved Design */}
                {emailValidation && emailValidation.validation && (
                  <div className="mt-3">
                    {/* Success State - User Found and Can Recover */}
                    {emailValidation.validation.recovery && emailValidation.validation.recovery.canRecover && emailValidation.user && (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-green-800 font-semibold text-sm mb-1">
                              ✓ Correo verificado correctamente
                            </h4>
                            <p className="text-green-700 text-sm mb-2">
                              Usuario encontrado: <span className="font-medium">{emailValidation.user.nombre} {emailValidation.user.apellido}</span>
                            </p>
                            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {emailValidation.user.tipoUsuario} • {emailValidation.user.estado}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Error States */}
                    {emailValidation.validation.format && !emailValidation.validation.format.isValid && (
                      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <p className="text-red-700 text-sm font-medium">
                            {emailValidation.validation.format.message}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {emailValidation.validation.format && emailValidation.validation.format.isValid && 
                     emailValidation.validation.existence && !emailValidation.validation.existence.exists && (
                      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                          <div>
                            <p className="text-orange-700 text-sm font-medium mb-1">
                              Correo no registrado
                            </p>
                            <p className="text-orange-600 text-xs">
                              Este correo no está asociado a ninguna cuenta en el sistema
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {emailValidation.validation.existence && emailValidation.validation.existence.exists && 
                     emailValidation.validation.recovery && !emailValidation.validation.recovery.canRecover && (
                      <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl p-4 shadow-sm">
                        <div className="flex items-center space-x-3">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <div>
                            <p className="text-red-700 text-sm font-medium mb-1">
                              No se puede recuperar la contraseña
                            </p>
                            <p className="text-red-600 text-xs">
                              {emailValidation.validation.recovery.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message Display */}
              {message && (
                <div
                  className={`w-full p-4 rounded-lg border ${
                    messageType === "success"
                      ? "bg-green-50 border-green-200 text-green-800"
                      : messageType === "error"
                      ? "bg-red-50 border-red-200 text-red-800"
                      : "bg-blue-50 border-blue-200 text-blue-800"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {messageType === "success" ? (
                      <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium">{typeof message === 'string' ? message : 'Mensaje no disponible'}</span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isValidating || !emailValidation?.validation?.recovery?.canRecover}
                className={`w-full py-4 px-6 rounded-xl font-bold text-base
                         focus:outline-none focus:ring-4 focus:ring-offset-2
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-300
                         transform hover:scale-[1.02] active:scale-[0.98]
                         shadow-lg hover:shadow-xl ${
                           emailValidation?.validation?.recovery?.canRecover
                             ? 'bg-gradient-to-r from-[#1F384C] to-[#2A4A5C] text-white hover:from-[#162A3A] hover:to-[#1F384C] focus:ring-[#1F384C]/30'
                             : 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 cursor-not-allowed'
                         }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Enviando...</span>
                  </div>
                ) : isValidating ? (
                  "Validando..."
                ) : (
                  "Enviar Instrucciones"
                )}
              </button>
              
              {/* Helper text for button state */}
              {email && !isValidating && emailValidation && emailValidation.validation && (
                <div className="text-center">
                  {emailValidation.validation.recovery && emailValidation.validation.recovery.canRecover ? (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ Listo para enviar instrucciones de recuperación
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Ingresa un correo válido y registrado para continuar
                    </p>
                  )}
                </div>
              )}
            </form>
          ) : (
            /* Success State */
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>

              {/* Success Message */}
              {message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm font-medium">{typeof message === 'string' ? message : 'Correo enviado exitosamente'}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Inbox className="w-4 h-4 text-blue-500" />
                  <p>Revisa tu bandeja de entrada</p>
                </div>
                <div className="flex items-center space-x-2">
                  <FolderOpen className="w-4 h-4 text-orange-500" />
                  <p>Si no lo encuentras, revisa tu carpeta de spam</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <p>El correo puede tardar unos minutos en llegar</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="w-full inline-block py-3 px-4
                           bg-[#1F384C] text-white rounded-lg font-semibold text-base text-center
                           hover:bg-[#162A3A] active:bg-[#0F1F2A]
                           focus:outline-none focus:ring-2 focus:ring-[#1F384C] focus:ring-offset-2
                           transition-all duration-200
                           transform hover:scale-[1.02] active:scale-[0.98]
                           shadow-md hover:shadow-lg"
                >
                  Ir al Inicio de Sesión
                </Link>
                <button
                  onClick={handleTryAgain}
                  className="w-full py-3 px-4
                           bg-gray-100 text-gray-700 rounded-lg font-semibold text-base
                           hover:bg-gray-200 active:bg-gray-300
                           focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
                           transition-all duration-200
                           transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Intentar con otro correo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PasswordRecoveryPage