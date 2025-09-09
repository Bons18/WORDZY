import { Edit, Trash2, Eye } from "lucide-react"

const BadgeCard = ({ badge, onEdit, onDelete, onView, showActions = true }) => {
  const handleImageError = (e) => {
    e.target.src = "/placeholder.png"
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    
    // Si la fecha viene en formato ISO, extraer solo la parte de la fecha
    let dateToFormat = dateString
    if (typeof dateString === 'string' && dateString.includes('T')) {
      dateToFormat = dateString.split('T')[0]
    }
    
    // Si está en formato YYYY-MM-DD, crear fecha local para evitar problemas de zona horaria
    if (typeof dateToFormat === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateToFormat)) {
      const [year, month, day] = dateToFormat.split('-').map(Number)
      const date = new Date(year, month - 1, day) // month - 1 porque los meses en JS van de 0-11
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    // Para otros formatos, usar el método original
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isExpired = () => {
    if (!badge.endDate) return false
    const endDate = new Date(badge.endDate)
    const today = new Date()
    return endDate < today
  }

  const getStatusColor = () => {
    if (isExpired()) return "bg-red-100 text-red-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusText = () => {
    if (isExpired()) return "Expirada"
    return "Activa"
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      {/* Header con imagen y estado */}
      <div className="relative p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-shrink-0">
            <img
              src={badge.image || badge.icon || "/placeholder.png"}
              alt={badge.name}
              className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-sm"
              onError={handleImageError}
            />
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {badge.name}
        </h3>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-blue-600">
            {badge.points} pts
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {badge.description}
        </p>
        
        {/* Fechas */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Inicio:</span>
            <span>{formatDate(badge.startDate)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Fin:</span>
            <span>{formatDate(badge.endDate)}</span>
          </div>
        </div>
        
        {/* Acciones */}
        {showActions && (
          <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
            {onView && (
              <button
                onClick={() => onView(badge)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            
            {onEdit && (
              <button
                onClick={() => onEdit(badge)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Editar insignia"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={() => onDelete(badge)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar insignia"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default BadgeCard