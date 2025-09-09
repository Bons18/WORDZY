import { createContext, useContext, useState, useCallback } from 'react'
import Alert from '../components/Alert'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification debe ser usado dentro de NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random()
    const newNotification = {
      id,
      variant: 'info',
      duration: 5000,
      dismissible: true,
      ...notification
    }
    
    setNotifications(prev => [...prev, newNotification])
    
    // Auto remove notification after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, newNotification.duration)
    }
    
    return id
  }, [])
  
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])
  
  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])
  
  // Métodos de conveniencia
  const success = useCallback((message, options = {}) => {
    return addNotification({
      variant: 'success',
      children: message,
      ...options
    })
  }, [addNotification])
  
  const error = useCallback((message, options = {}) => {
    return addNotification({
      variant: 'error',
      children: message,
      duration: 7000, // Errores duran más tiempo
      ...options
    })
  }, [addNotification])
  
  const warning = useCallback((message, options = {}) => {
    return addNotification({
      variant: 'warning',
      children: message,
      ...options
    })
  }, [addNotification])
  
  const info = useCallback((message, options = {}) => {
    return addNotification({
      variant: 'info',
      children: message,
      ...options
    })
  }, [addNotification])
  
  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info
  }
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  )
}

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification()
  
  if (notifications.length === 0) return null
  
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className="transform transition-all duration-300 ease-in-out animate-in slide-in-from-right"
        >
          <Alert
            variant={notification.variant}
            dismissible={notification.dismissible}
            onDismiss={() => removeNotification(notification.id)}
            title={notification.title}
            className="shadow-lg border-l-4"
          >
            {notification.children}
          </Alert>
        </div>
      ))}
    </div>
  )
}

export default NotificationProvider