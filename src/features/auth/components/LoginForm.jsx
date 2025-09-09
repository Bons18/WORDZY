"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { User, Eye, EyeOff, Lock, AlertCircle, CheckCircle } from "lucide-react"

const LoginForm = ({ onLoginSuccess, login }) => {
  const [formData, setFormData] = useState({
    document: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({
    document: "",
    password: ""
  })
  const [touched, setTouched] = useState({
    document: false,
    password: false
  })

  // Cargar credenciales guardadas al inicializar el componente
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials')
    if (savedCredentials) {
      try {
        const { document, rememberMe } = JSON.parse(savedCredentials)
        setFormData(prev => ({
          ...prev,
          document: document || '',
          rememberMe: rememberMe || false
        }))
      } catch (error) {
        console.error('Error al cargar credenciales guardadas:', error)
        localStorage.removeItem('rememberedCredentials')
      }
    }
  }, [])

  // Función de validación para cada campo
  const validateField = (name, value) => {
    switch (name) {
      case 'document':
        if (!value) return 'El número de documento es requerido'
        if (value.length < 6) return 'El documento debe tener al menos 6 dígitos'
        if (!/^[0-9]+$/.test(value)) return 'Solo se permiten números'
        return ''
      case 'password':
        if (!value) return 'La contraseña es requerida'
        if (value.length < 4) return 'La contraseña debe tener al menos 4 caracteres'
        return ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === "checkbox" ? checked : value
    
    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    // Validar campo si ya fue tocado
    if (touched[name] && name !== 'rememberMe') {
      const error = validateField(name, newValue)
      setFieldErrors(prev => ({
        ...prev,
        [name]: error
      }))
    }
  }

  const handleBlur = (e) => {
    const { name, value } = e.target
    setTouched(prev => ({
      ...prev,
      [name]: true
    }))
    
    const error = validateField(name, value)
    setFieldErrors(prev => ({
      ...prev,
      [name]: error
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validar todos los campos
    const documentError = validateField('document', formData.document)
    const passwordError = validateField('password', formData.password)
    
    setFieldErrors({
      document: documentError,
      password: passwordError
    })
    
    setTouched({
      document: true,
      password: true
    })

    // Si hay errores, no enviar el formulario
    if (documentError || passwordError) {
      setIsLoading(false)
      setError("Por favor, corrija los errores antes de continuar")
      return
    }

    try {
      const result = await login({
        document: formData.document,
        password: formData.password,
        rememberMe: formData.rememberMe
      })
      if (result) {
        // Manejar la funcionalidad de "Recuérdame"
        if (formData.rememberMe) {
          // Guardar credenciales en localStorage (solo el documento, no la contraseña por seguridad)
          const credentialsToSave = {
            document: formData.document,
            rememberMe: true
          }
          localStorage.setItem('rememberedCredentials', JSON.stringify(credentialsToSave))
        } else {
          // Eliminar credenciales guardadas si el usuario desmarca "Recuérdame"
          localStorage.removeItem('rememberedCredentials')
        }
        
        onLoginSuccess(result)
      }
    } catch (err) {
      setError("Error de conexión. Intente nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="w-full max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Número de Documento */}
        <div className="w-full">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Número de Documento</label>
          <div className="relative">
            <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
              fieldErrors.document && touched.document 
                ? 'text-red-400' 
                : formData.document && !fieldErrors.document && touched.document
                ? 'text-green-400'
                : 'text-gray-400'
            }`} size={20} />
            <input
              name="document"
              type="text"
              value={formData.document}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ingrese su número de documento"
              className={`w-full pl-10 pr-12 py-3.5
                         border-2 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-offset-1
                         text-base text-gray-900 font-medium
                         placeholder:text-gray-400
                         hover:border-gray-300 transition-all duration-200
                         bg-gray-50 focus:bg-white ${
                fieldErrors.document && touched.document
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : formData.document && !fieldErrors.document && touched.document
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              }`}
              pattern="[0-9]*"
              inputMode="numeric"
              required
            />
            {/* Icono de validación */}
            {touched.document && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {fieldErrors.document ? (
                  <AlertCircle className="text-red-400" size={20} />
                ) : formData.document ? (
                  <CheckCircle className="text-green-400" size={20} />
                ) : null}
              </div>
            )}
          </div>
          {/* Mensaje de error */}
          {fieldErrors.document && touched.document && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
              <span className="text-sm text-red-600 font-medium">{fieldErrors.document}</span>
            </div>
          )}
        </div>

        {/* Contraseña */}
        <div className="w-full">
          <label className="block text-sm font-semibold text-gray-800 mb-2">Contraseña</label>
          <div className="relative">
            <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors ${
              fieldErrors.password && touched.password 
                ? 'text-red-400' 
                : formData.password && !fieldErrors.password && touched.password
                ? 'text-green-400'
                : 'text-gray-400'
            }`} size={20} />
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Ingrese su contraseña"
              className={`w-full pl-10 pr-20 py-3.5
                         border-2 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-offset-1
                         text-base text-gray-900 font-medium
                         placeholder:text-gray-400
                         hover:border-gray-300 transition-all duration-200
                         bg-gray-50 focus:bg-white ${
                fieldErrors.password && touched.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  : formData.password && !fieldErrors.password && touched.password
                  ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                  : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
              }`}
              required
            />
            {/* Icono de validación */}
            {touched.password && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                {fieldErrors.password ? (
                  <AlertCircle className="text-red-400" size={20} />
                ) : formData.password ? (
                  <CheckCircle className="text-green-400" size={20} />
                ) : null}
              </div>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2
                         text-gray-400 hover:text-gray-600 transition-colors
                         focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {/* Mensaje de error */}
          {fieldErrors.password && touched.password && (
            <div className="mt-2 flex items-center space-x-2">
              <AlertCircle className="text-red-400 flex-shrink-0" size={16} />
              <span className="text-sm text-red-600 font-medium">{fieldErrors.password}</span>
            </div>
          )}
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 border-2 border-gray-300 rounded transition-all duration-200 hover:border-blue-400 cursor-pointer"
            />
            <label 
              htmlFor="rememberMe" 
              className="ml-2 block text-sm text-gray-700 font-medium cursor-pointer hover:text-gray-900 transition-colors duration-200 select-none"
            >
              Recuérdame
            </label>
          </div>

          <Link
            to="/recover-password"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium focus:outline-none focus:underline transition-colors"
          >
            Recuperar contraseña
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 00-1.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || (touched.document && fieldErrors.document) || (touched.password && fieldErrors.password)}
          className={`w-full py-4 px-6 rounded-xl font-bold text-base
                     focus:outline-none focus:ring-4 focus:ring-offset-2
                     transition-all duration-300
                     transform active:scale-[0.98]
                     shadow-lg ${
            isLoading || (touched.document && fieldErrors.document) || (touched.password && fieldErrors.password)
              ? 'bg-gray-400 cursor-not-allowed opacity-60'
              : 'bg-gradient-to-r from-[#1F384C] to-[#2A4A5C] text-white hover:from-[#162A3A] hover:to-[#1F384C] hover:scale-[1.02] hover:shadow-xl focus:ring-[#1F384C]/30'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Verificando documento...</span>
            </div>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </form>
    </div>
  )
}

export default LoginForm
