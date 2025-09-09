import { useState, useEffect } from 'react'
import { User, Mail, Phone, FileText, Edit2, Save, X, AlertCircle } from 'lucide-react'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { getRoleDisplayName, getUserRole } from '../../../shared/utils/roleDisplay'

const UserProfile = () => {
  const { user } = useAuth()
  const { profile, isLoading, error, isUpdating, updateProfile, clearError } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Actualizar formData cuando se carga el perfil
  useEffect(() => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        telefono: profile.telefono || '',
        correo: profile.correo || ''
      })
    }
  }, [profile])

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio'
    }
    
    if (!formData.apellido.trim()) {
      errors.apellido = 'El apellido es obligatorio'
    }
    
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es obligatorio'
    }
    
    if (!formData.correo.trim()) {
      errors.correo = 'El correo es obligatorio'
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
      if (!emailRegex.test(formData.correo)) {
        errors.correo = 'Formato de correo inválido'
      }
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return
    
    try {
      await updateProfile(formData)
      setIsEditing(false)
      setSuccessMessage('Perfil actualizado exitosamente')
      clearError()
    } catch (err) {
      console.error('Error updating profile:', err)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        nombre: profile.nombre || '',
        apellido: profile.apellido || '',
        telefono: profile.telefono || '',
        correo: profile.correo || ''
      })
    }
    setFormErrors({})
    setIsEditing(false)
    clearError()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f384c]"></div>
          <span className="text-[#1f384c] font-medium">Cargando perfil...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1f384c] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-[#1f384c]">Mi Perfil</h1>
                    <p className="text-gray-600">
                      {getRoleDisplayName(getUserRole(user))}
                    </p>
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1f384c] text-white rounded-lg hover:bg-[#2a4a5c] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-green-700">{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Profile Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-[#1f384c]">Información Personal</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Nombre
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                          formErrors.nombre ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ingrese su nombre"
                      />
                      {formErrors.nombre && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.nombre}</p>
                      )}
                    </div>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {profile?.nombre || 'No especificado'}
                    </p>
                  )}
                </div>

                {/* Apellido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Apellido
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        name="apellido"
                        value={formData.apellido}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                          formErrors.apellido ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ingrese su apellido"
                      />
                      {formErrors.apellido && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.apellido}</p>
                      )}
                    </div>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {profile?.apellido || 'No especificado'}
                    </p>
                  )}
                </div>

                {/* Correo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Correo Electrónico
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="email"
                        name="correo"
                        value={formData.correo}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                          formErrors.correo ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ingrese su correo"
                      />
                      {formErrors.correo && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.correo}</p>
                      )}
                    </div>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {profile?.correo || 'No especificado'}
                    </p>
                  )}
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Teléfono
                  </label>
                  {isEditing ? (
                    <div>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f384c] ${
                          formErrors.telefono ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ingrese su teléfono"
                      />
                      {formErrors.telefono && (
                        <p className="text-red-500 text-sm mt-1">{formErrors.telefono}</p>
                      )}
                    </div>
                  ) : (
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {profile?.telefono || 'No especificado'}
                    </p>
                  )}
                </div>
              </div>

              {/* Información de solo lectura */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-700 mb-4">Información del Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Documento
                    </label>
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {profile?.tipoDocumento} {profile?.documento}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                      {profile?.estado || 'No especificado'}
                    </p>
                  </div>
                  {profile?.programa && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Programa
                      </label>
                      <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        {profile.programa}
                      </p>
                    </div>
                  )}
                  {profile?.ficha && profile.ficha.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ficha(s)
                      </label>
                      <p className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                        {profile.ficha.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              {isEditing && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3 justify-end">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex items-center gap-2 px-4 py-2 bg-[#1f384c] text-white rounded-lg hover:bg-[#2a4a5c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Guardar Cambios
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserProfile