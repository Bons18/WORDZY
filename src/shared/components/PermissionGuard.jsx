"use client"

import { usePermissions } from "../hooks/usePermissions"

/**
 * Componente para proteger elementos de la UI basado en permisos
 * 
 * @param {Object} props
 * @param {string} props.module - Módulo requerido para el permiso
 * @param {string} props.action - Acción requerida (view, create, edit, delete)
 * @param {React.ReactNode} props.children - Elementos a renderizar si tiene permisos
 * @param {React.ReactNode} props.fallback - Elemento a renderizar si no tiene permisos (opcional)
 * @param {boolean} props.showFallback - Si mostrar el fallback o no renderizar nada (default: false)
 */
const PermissionGuard = ({ 
  module, 
  action, 
  children, 
  fallback = null, 
  showFallback = false 
}) => {
  const { hasPermission, loading, isAdmin } = usePermissions()

  // Mostrar loading si aún se están cargando los permisos
  if (loading) {
    return null // O un spinner si prefieres
  }

  // Si es admin, mostrar siempre (los admins tienen todos los permisos)
  if (isAdmin) {
    return children
  }

  // Verificar si tiene el permiso específico
  const hasRequiredPermission = hasPermission(module, action)

  if (hasRequiredPermission) {
    return children
  }

  // Si no tiene permisos, mostrar fallback o nada
  return showFallback ? fallback : null
}

export default PermissionGuard

/**
 * Hook para usar PermissionGuard de forma condicional en componentes
 * 
 * @param {string} module - Módulo requerido
 * @param {string} action - Acción requerida
 * @returns {boolean} - true si tiene permisos, false si no
 */
export const usePermissionGuard = (module, action) => {
  const { hasPermission, loading, isAdmin } = usePermissions()

  if (loading) return false
  if (isAdmin) return true
  
  return hasPermission(module, action)
}

/**
 * Componente para proteger múltiples acciones en un módulo
 * Útil para botones que requieren diferentes permisos
 */
export const MultiPermissionGuard = ({ 
  permissions, // Array de {module, action}
  requireAll = false, // Si requiere todos los permisos o solo uno
  children, 
  fallback = null, 
  showFallback = false 
}) => {
  const { hasAnyPermission, hasAllPermissions, loading, isAdmin } = usePermissions()

  if (loading) return null
  if (isAdmin) return children

  const hasRequiredPermissions = requireAll 
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions)

  if (hasRequiredPermissions) {
    return children
  }

  return showFallback ? fallback : null
}

/**
 * Componente para proteger acceso a módulos completos
 */
export const ModuleGuard = ({ 
  module, 
  children, 
  fallback = null, 
  showFallback = false 
}) => {
  const { canAccessModule, loading, isAdmin } = usePermissions()

  if (loading) return null
  if (isAdmin) return children

  const canAccess = canAccessModule(module)

  if (canAccess) {
    return children
  }

  return showFallback ? fallback : null
}