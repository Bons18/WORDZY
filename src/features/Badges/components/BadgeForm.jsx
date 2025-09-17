import { useState, useEffect } from "react"
import { Upload, X } from "lucide-react"
import { useBadgeValidation } from "../hooks/useBadges"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"

const BadgeForm = ({ onSubmit, onCancel, initialData = null, isLoading = false }) => {
  const { errors, isValid, validateForm, clearErrors, setFieldError } = useBadgeValidation()
  const [showUpdateConfirmModal, setShowUpdateConfirmModal] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    points: "",
    description: "",
    file: null,
    filePreview: null,
    fileSize: null,
    startDate: "",
    endDate: ""
  })

  // Función para formatear fecha para input date (evita problemas de zona horaria)
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    
    // Si la fecha ya está en formato YYYY-MM-DD, devolverla tal como está
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString
    }
    
    // Si es una fecha ISO string, extraer solo la parte de la fecha
    if (typeof dateString === 'string' && dateString.includes('T')) {
      return dateString.split('T')[0]
    }
    
    // Para fechas en formato dd/mm/yyyy, parsear manualmente
    if (typeof dateString === 'string' && dateString.includes('/')) {
      const parts = dateString.split('/')
      if (parts.length === 3) {
        // Asumir formato dd/mm/yyyy
        const day = parts[0].padStart(2, '0')
        const month = parts[1].padStart(2, '0')
        const year = parts[2]
        return `${year}-${month}-${day}`
      }
    }
    
    // Para otros casos, crear fecha usando UTC para evitar problemas de zona horaria
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "" // Verificar si la fecha es válida
    
    // Usar UTC para evitar problemas de zona horaria
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  // Cargar datos iniciales si se está editando
  useEffect(() => {
    if (initialData) {
      console.log('🔍 BADGE FORM - initialData completo:', initialData)
      console.log('🔍 BADGE FORM - startDate original:', initialData.startDate)
      console.log('🔍 BADGE FORM - endDate original:', initialData.endDate)
      console.log('🔍 BADGE FORM - startDate tipo:', typeof initialData.startDate)
      console.log('🔍 BADGE FORM - endDate tipo:', typeof initialData.endDate)
      
      // Construir URL completa para la imagen si existe
      let imagePreview = null;
      if (initialData.image) {
        if (initialData.image.startsWith('http')) {
          imagePreview = initialData.image;
        } else {
          imagePreview = `http://localhost:3000${initialData.image}`;
        }
      }
      
      const formattedStartDate = formatDateForInput(initialData.startDate)
      const formattedEndDate = formatDateForInput(initialData.endDate)
      
      console.log('🔍 BADGE FORM - startDate formateado:', formattedStartDate)
      console.log('🔍 BADGE FORM - endDate formateado:', formattedEndDate)
      
      setFormData({
        name: initialData.name || "",
        points: initialData.points?.toString() || "",
        description: initialData.description || "",
        file: null,
        filePreview: imagePreview,
        fileSize: null,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      })
    }
  }, [initialData])

  // Validar formulario automáticamente cuando cambien los datos
  useEffect(() => {
    // Solo validar si hay datos en el formulario
    if (formData.name || formData.points || formData.description || formData.startDate || formData.endDate) {
      const validation = validateForm(formData)
      console.log('🔍 BADGE FORM - Validation result:', validation)
      console.log('🔍 BADGE FORM - isValid:', validation.isValid)
      console.log('🔍 BADGE FORM - errors:', validation.errors)
    }
  }, [formData, validateForm])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      clearErrors()
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(selectedFile.type)) {
        setFieldError('file', 'Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)')
        return
      }
      
      // Validar tamaño de archivo (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB en bytes
      if (selectedFile.size > maxSize) {
        setFieldError('file', 'El archivo no puede ser mayor a 5MB')
        return
      }
      
      setFormData(prev => ({
        ...prev,
        file: selectedFile,
        filePreview: URL.createObjectURL(selectedFile),
        fileSize: (selectedFile.size / (1024 * 1024)).toFixed(1)
      }))
    }
  }



  const removeFile = () => {
    if (formData.filePreview && formData.file) {
      URL.revokeObjectURL(formData.filePreview)
    }
    setFormData(prev => ({
      ...prev,
      file: null,
      filePreview: null,
      fileSize: null
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('🔍 BADGE FORM - handleSubmit called')
    console.log('🔍 BADGE FORM - formData:', formData)
    
    const validation = validateForm(formData)
    console.log('🔍 BADGE FORM - handleSubmit validation:', validation)
    if (!validation.isValid) {
      console.log('🔍 BADGE FORM - Validation failed, not submitting')
      return
    }
    
    // Si es una actualización, mostrar confirmación
    if (initialData) {
      setShowUpdateConfirmModal(true)
      return
    }
    
    console.log('🔍 BADGE FORM - Calling onSubmit with formData')
    onSubmit(formData)
  }

  const confirmUpdate = () => {
    setShowUpdateConfirmModal(false)
    console.log('🔍 BADGE FORM - Calling onSubmit with formData after confirmation')
    onSubmit(formData)
  }

  const cancelUpdate = () => {
    setShowUpdateConfirmModal(false)
  }

  const handleCancel = () => {
    clearErrors()
    onCancel()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-[#1f384c] mb-6">
        {initialData ? 'Editar Insignia' : 'Crear Nueva Insignia'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nombre de la insignia */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Nombre de la insignia * <span className="text-sm text-gray-500">({formData.name.length}/100)</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            maxLength={100}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name || errors.badgeName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ingrese el nombre de la insignia (mín. 3 caracteres)"
            disabled={isLoading}
          />
          {(errors.name || errors.badgeName) && (
            <p className="mt-1 text-sm text-red-600">{errors.name || errors.badgeName}</p>
          )}
        </div>

        {/* Puntos */}
        <div>
          <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-2">
            Puntos requeridos * <span className="text-sm text-gray-500">(1 - 100,000)</span>
          </label>
          <input
            type="number"
            id="points"
            name="points"
            value={formData.points}
            onChange={handleInputChange}
            min="1"
            max="100000"
            step="1"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.points ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ingrese los puntos requeridos (número entero)"
            disabled={isLoading}
          />
          {errors.points && (
            <p className="mt-1 text-sm text-red-600">{errors.points}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Descripción * <span className="text-sm text-gray-500">({formData.description.length}/500, mín. 10)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            minLength={10}
            maxLength={500}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ingrese la descripción de la insignia (mínimo 10 caracteres)"
            disabled={isLoading}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de inicio *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de fin *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        {/* Imagen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen de la insignia * <span className="text-sm text-gray-500">(JPG, PNG, SVG, WebP - máx. 5MB)</span>
          </label>
          
          {/* Solo mostrar preview si no estamos editando O si hay un archivo nuevo seleccionado */}
          {(!initialData && !formData.filePreview) || (initialData && !formData.file) ? (
            <div className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-gray-400 transition-colors ${
              errors.file ? 'border-red-300 bg-red-50' : 'border-gray-300'
            }`}>
              <input
                type="file"
                id="file"
                accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
              />
              <label htmlFor="file" className="cursor-pointer">
                <Upload className={`mx-auto h-12 w-12 mb-4 ${
                  errors.file ? 'text-red-400' : 'text-gray-400'
                }`} />
                <p className="text-sm text-gray-600 mb-2">
                  {initialData ? "Haz clic para cambiar la imagen" : "Haz clic para subir una imagen o arrastra y suelta"}
                </p>
                <p className="text-xs text-gray-500">
                  Formatos: JPG, PNG, SVG, WebP | Tamaño máximo: 5MB
                </p>
              </label>
            </div>
          ) : (
            formData.file && (
              <div className="relative inline-block">
                <img
                  src={formData.filePreview}
                  alt="Preview"
                  className="w-32 h-32 object-contain rounded-lg border border-gray-300 bg-white"
                />
                <button
                  type="button"
                  onClick={removeFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  disabled={isLoading}
                >
                  <X className="w-4 h-4" />
                </button>
                {formData.fileSize && (
                  <p className="text-xs text-gray-500 mt-2">
                    Tamaño: {formData.fileSize} MB
                  </p>
                )}
              </div>
            )
          )}
          
          {/* Mostrar imagen existente si estamos editando */}
          {initialData && formData.filePreview && !formData.file && (
            <div className="relative inline-block">
              <img
                src={formData.filePreview}
                alt="Imagen actual"
                className="w-32 h-32 object-contain rounded-lg border border-gray-300 bg-white"
              />
              <div className="mt-2">
                <input
                  type="file"
                  id="file-edit"
                  accept="image/jpeg,image/jpg,image/png,image/svg+xml,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="file-edit"
                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Cambiar imagen
                </label>
              </div>
            </div>
          )}
          
          {errors.file && (
            <p className="mt-1 text-sm text-red-600">{errors.file}</p>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !isValid}
          >
            {isLoading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear Insignia')}
          </button>
        </div>
      </form>

      {/* Modal de confirmación para actualización */}
      <ConfirmationModal
        isOpen={showUpdateConfirmModal}
        onClose={cancelUpdate}
        onConfirm={confirmUpdate}
        title="Confirmar actualización"
        message="¿Estás seguro de que deseas actualizar esta insignia con los cambios realizados? Esta acción no se puede deshacer."
        confirmText="Sí, actualizar"
        confirmColor="bg-green-500 hover:bg-green-600"
      />
    </div>
  )
}

export default BadgeForm