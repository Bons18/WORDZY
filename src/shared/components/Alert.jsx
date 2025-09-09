import { forwardRef } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const Alert = forwardRef(({
  children,
  variant = 'info',
  size = 'md',
  dismissible = false,
  onDismiss,
  icon: customIcon,
  title,
  className = '',
  ...props
}, ref) => {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-500',
      defaultIcon: CheckCircle
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-500',
      defaultIcon: AlertCircle
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-500',
      defaultIcon: AlertTriangle
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-500',
      defaultIcon: Info
    }
  }
  
  const sizes = {
    sm: 'p-3 text-sm',
    md: 'p-4 text-sm',
    lg: 'p-5 text-base'
  }
  
  const variantConfig = variants[variant]
  const IconComponent = customIcon || variantConfig.defaultIcon
  
  const containerClasses = `
    relative border rounded-lg flex items-start gap-3 transition-all duration-200
    ${variantConfig.container}
    ${sizes[size]}
    ${className}
  `.trim().replace(/\s+/g, ' ')
  
  return (
    <div ref={ref} className={containerClasses} {...props}>
      {/* Icon */}
      <div className={`flex-shrink-0 ${variantConfig.icon}`}>
        <IconComponent className="w-5 h-5" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-medium mb-1">{title}</h4>
        )}
        <div className={title ? 'text-sm opacity-90' : ''}>
          {children}
        </div>
      </div>
      
      {/* Dismiss Button */}
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className={`flex-shrink-0 ml-2 p-1 rounded-md hover:bg-black/5 transition-colors ${variantConfig.icon}`}
          aria-label="Cerrar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
})

Alert.displayName = 'Alert'

export default Alert