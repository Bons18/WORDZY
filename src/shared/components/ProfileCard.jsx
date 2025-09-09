import React from 'react'
import { Button } from './Button'
import { Badge } from './Badge'
import { User, Mail, Phone, FileText, Edit2, Eye, Trash2, MoreVertical } from 'lucide-react'

// Mapeo de roles a colores y etiquetas
const roleConfig = {
  aprendiz: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    label: 'Aprendiz'
  },
  instructor: {
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    label: 'Instructor'
  },
  coordinador: {
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    label: 'Coordinador'
  },
  administrador: {
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    label: 'Administrador'
  }
}

// Campos específicos por rol para mostrar
const roleSpecificFields = {
  aprendiz: [
    { key: 'ficha', label: 'Ficha', icon: FileText },
    { key: 'programa', label: 'Programa', icon: FileText }
  ],
  instructor: [
    { key: 'especialidad', label: 'Especialidad', icon: FileText },
    { key: 'experiencia', label: 'Experiencia', icon: FileText, suffix: ' años' }
  ],
  coordinador: [
    { key: 'area', label: 'Área', icon: FileText },
    { key: 'nivel', label: 'Nivel', icon: FileText }
  ],
  administrador: [
    { key: 'permisos', label: 'Permisos', icon: FileText }
  ]
}

const ProfileCard = ({
  profile,
  role = 'aprendiz',
  onEdit,
  onView,
  onDelete,
  showActions = true,
  compact = false,
  className = ''
}) => {
  const config = roleConfig[role] || roleConfig.aprendiz
  const specificFields = roleSpecificFields[role] || []

  const getDisplayValue = (key, value, suffix = '') => {
    if (!value) return 'No especificado'
    if (key === 'tipoDocumento') {
      const docTypes = {
        'CC': 'Cédula de Ciudadanía',
        'TI': 'Tarjeta de Identidad',
        'CE': 'Cédula de Extranjería',
        'PP': 'Pasaporte'
      }
      return docTypes[value] || value
    }
    if (key === 'nivel') {
      const levels = {
        'REGIONAL': 'Regional',
        'CENTRO': 'Centro',
        'PROGRAMA': 'Programa'
      }
      return levels[value] || value
    }
    if (key === 'permisos') {
      const permissions = {
        'TOTAL': 'Acceso Total',
        'LIMITADO': 'Acceso Limitado',
        'LECTURA': 'Solo Lectura'
      }
      return permissions[value] || value
    }
    return `${value}${suffix}`
  }

  if (compact) {
    return (
      <div className={`bg-white rounded-lg border ${config.borderColor} p-4 hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${config.color} rounded-full flex items-center justify-center`}>
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">
                {profile?.nombre && profile?.apellido 
                  ? `${profile.nombre} ${profile.apellido}`
                  : 'Sin nombre'
                }
              </h3>
              <p className="text-sm text-gray-500">{profile?.correo || 'Sin correo'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className={`${config.bgColor} ${config.textColor}`}>
              {config.label}
            </Badge>
            {showActions && (
              <div className="flex space-x-1">
                {onView && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(profile)}
                    icon={<Eye className="w-4 h-4" />}
                  />
                )}
                {onEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(profile)}
                    icon={<Edit2 className="w-4 h-4" />}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow ${className}`}>
      {/* Header */}
      <div className={`${config.bgColor} px-6 py-4 border-b ${config.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 ${config.color} rounded-full flex items-center justify-center`}>
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.nombre && profile?.apellido 
                  ? `${profile.nombre} ${profile.apellido}`
                  : 'Sin nombre'
                }
              </h2>
              <Badge variant="secondary" className={`${config.bgColor} ${config.textColor} mt-1`}>
                {config.label}
              </Badge>
            </div>
          </div>
          {showActions && (
            <div className="flex space-x-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(profile)}
                  icon={<Eye className="w-4 h-4" />}
                >
                  Ver
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(profile)}
                  icon={<Edit2 className="w-4 h-4" />}
                >
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(profile)}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                  icon={<Trash2 className="w-4 h-4" />}
                >
                  Eliminar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Información básica */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Información Personal</h3>
            
            <div className="flex items-center space-x-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Correo</p>
                <p className="text-sm font-medium text-gray-900">{profile?.correo || 'No especificado'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="text-sm font-medium text-gray-900">{profile?.telefono || 'No especificado'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Documento</p>
                <p className="text-sm font-medium text-gray-900">
                  {profile?.documento 
                    ? `${getDisplayValue('tipoDocumento', profile.tipoDocumento)} - ${profile.documento}`
                    : 'No especificado'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Información específica del rol */}
          {specificFields.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Información de {config.label}
              </h3>
              
              {specificFields.map((field) => {
                const { key, label, icon: Icon, suffix = '' } = field
                return (
                  <div key={key} className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="text-sm font-medium text-gray-900">
                        {getDisplayValue(key, profile?.[key], suffix)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfileCard
export { roleConfig, roleSpecificFields }