import React from 'react'
import { InputField } from './InputField'
import { Button } from './Button'
import { Alert } from './Alert'
import { useValidation } from '../hooks/useValidation'
import { useNotification } from '../contexts/NotificationContext'
import { User, Mail, Phone, FileText, Building, Calendar, Hash, BookOpen } from 'lucide-react'

// Esquemas de validación por rol
const validationSchemas = {
  aprendiz: {
    nombre: ['required', 'minLength:2'],
    apellido: ['required', 'minLength:2'],
    correo: ['required', 'email'],
    telefono: ['phone'],
    documento: ['required', 'numeric'],
    tipoDocumento: ['required'],
    ficha: ['required'],
    programa: ['required']
  },
  instructor: {
    nombre: ['required', 'minLength:2'],
    apellido: ['required', 'minLength:2'],
    correo: ['required', 'email'],
    telefono: ['phone'],
    documento: ['required', 'numeric'],
    tipoDocumento: ['required'],
    especialidad: ['required'],
    experiencia: ['numeric']
  },
  coordinador: {
    nombre: ['required', 'minLength:2'],
    apellido: ['required', 'minLength:2'],
    correo: ['required', 'email'],
    telefono: ['phone'],
    documento: ['required', 'numeric'],
    tipoDocumento: ['required'],
    area: ['required'],
    nivel: ['required']
  },
  administrador: {
    nombre: ['required', 'minLength:2'],
    apellido: ['required', 'minLength:2'],
    correo: ['required', 'email'],
    telefono: ['phone'],
    documento: ['required', 'numeric'],
    tipoDocumento: ['required'],
    permisos: ['required']
  }
}

// Campos específicos por rol
const roleFields = {
  aprendiz: [
    { name: 'ficha', label: 'Ficha', type: 'text', icon: Hash, placeholder: 'Número de ficha' },
    { name: 'programa', label: 'Programa', type: 'text', icon: BookOpen, placeholder: 'Programa de formación' }
  ],
  instructor: [
    { name: 'especialidad', label: 'Especialidad', type: 'text', icon: BookOpen, placeholder: 'Área de especialidad' },
    { name: 'experiencia', label: 'Años de Experiencia', type: 'number', icon: Calendar, placeholder: 'Años de experiencia' }
  ],
  coordinador: [
    { name: 'area', label: 'Área', type: 'text', icon: Building, placeholder: 'Área de coordinación' },
    { name: 'nivel', label: 'Nivel', type: 'select', icon: FileText, placeholder: 'Nivel de coordinación',
      options: [
        { value: 'REGIONAL', label: 'Regional' },
        { value: 'CENTRO', label: 'Centro' },
        { value: 'PROGRAMA', label: 'Programa' }
      ]
    }
  ],
  administrador: [
    { name: 'permisos', label: 'Nivel de Permisos', type: 'select', icon: FileText, placeholder: 'Nivel de permisos',
      options: [
        { value: 'TOTAL', label: 'Acceso Total' },
        { value: 'LIMITADO', label: 'Acceso Limitado' },
        { value: 'LECTURA', label: 'Solo Lectura' }
      ]
    }
  ]
}

// Campos comunes para todos los roles
const commonFields = [
  { name: 'nombre', label: 'Nombre', type: 'text', icon: User, placeholder: 'Ingrese el nombre' },
  { name: 'apellido', label: 'Apellido', type: 'text', icon: User, placeholder: 'Ingrese el apellido' },
  { name: 'correo', label: 'Correo Electrónico', type: 'email', icon: Mail, placeholder: 'correo@ejemplo.com' },
  { name: 'telefono', label: 'Teléfono', type: 'tel', icon: Phone, placeholder: '+57 300 123 4567' },
  { name: 'documento', label: 'Número de Documento', type: 'text', icon: FileText, placeholder: 'Número de documento' },
  { name: 'tipoDocumento', label: 'Tipo de Documento', type: 'select', icon: FileText, placeholder: 'Seleccione tipo',
    options: [
      { value: 'CC', label: 'Cédula de Ciudadanía' },
      { value: 'TI', label: 'Tarjeta de Identidad' },
      { value: 'CE', label: 'Cédula de Extranjería' },
      { value: 'PP', label: 'Pasaporte' }
    ]
  }
]

const RoleForm = ({ 
  role = 'aprendiz', 
  initialData = {}, 
  onSubmit, 
  onCancel, 
  isEditing = false, 
  isLoading = false,
  className = '',
  showRoleSpecificFields = true 
}) => {
  const { addNotification } = useNotification()
  
  const validationSchema = validationSchemas[role] || validationSchemas.aprendiz
  
  const {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues
  } = useValidation(initialData, validationSchema)

  React.useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setValues(initialData)
    }
  }, [initialData, setValues])

  const handleFormSubmit = async (formData) => {
    try {
      await onSubmit(formData)
      addNotification({
        type: 'success',
        title: 'Éxito',
        message: `${isEditing ? 'Actualización' : 'Registro'} completado correctamente`
      })
      if (!isEditing) {
        reset()
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: error.message || `Error al ${isEditing ? 'actualizar' : 'registrar'} la información`
      })
    }
  }

  const renderField = (field) => {
    const { name, label, type, icon: Icon, placeholder, options } = field
    
    if (type === 'select') {
      return (
        <div key={name}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Icon className="w-4 h-4 inline mr-2" />
            {label}
          </label>
          <select
            name={name}
            value={values[name] || ''}
            onChange={(e) => handleChange(name, e.target.value)}
            onBlur={() => handleBlur(name)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1f384c] transition-colors ${
              touched[name] && errors[name] 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-gray-300 focus:border-[#1f384c]'
            }`}
          >
            <option value="">{placeholder}</option>
            {options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {touched[name] && errors[name] && (
            <p className="text-red-500 text-sm mt-1">{errors[name]}</p>
          )}
        </div>
      )
    }

    return (
      <div key={name}>
        <InputField
          label={label}
          name={name}
          type={type}
          value={values[name] || ''}
          onChange={(e) => handleChange(name, e.target.value)}
          onBlur={() => handleBlur(name)}
          placeholder={placeholder}
          error={touched[name] && errors[name]}
          leftIcon={<Icon className="w-4 h-4" />}
          required={validationSchema[name]?.includes('required')}
        />
      </div>
    )
  }

  const fieldsToRender = [
    ...commonFields,
    ...(showRoleSpecificFields ? (roleFields[role] || []) : [])
  ]

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-[#1f384c] capitalize">
          {isEditing ? 'Editar' : 'Registrar'} {role}
        </h2>
      </div>
      
      <div className="p-6">
        <form onSubmit={(e) => {
          e.preventDefault()
          handleSubmit(handleFormSubmit)
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldsToRender.map(renderField)}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={!isValid || isSubmitting || isLoading}
              loading={isSubmitting || isLoading}
              className="bg-[#1f384c] hover:bg-[#2a4a5f] text-white"
            >
              {isEditing ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RoleForm
export { validationSchemas, roleFields, commonFields }