"use client"

import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "@/shared/contexts/AuthContext"
import { usePermissions } from "../hooks/usePermissions"
import { hasRouteAccess, getDefaultRouteByRole } from "../utils/rolePermissions"
import { isRoutePermitted } from "../utils/navigationPermissions"

const ProtectedRoute = ({ children, requiredRoute, requiredRole }) => {
  const { user, isLoading } = useContext(AuthContext)
  const { userPermissions, loading: permissionsLoading } = usePermissions()

  // Mostrar loading mientras se verifica la autenticación o se cargan permisos
  if (isLoading || permissionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#1f384c]"></div>
      </div>
    )
  }

  // Verificar si hay usuario y token válido
  const token = localStorage.getItem("wordzy_token")
  if (!user || !token) {
    return <Navigate to="/login" replace />
  }

  // Si se especifica un rol requerido, verificar que el usuario tenga ese rol
  if (requiredRole && user.role !== requiredRole) {
    // Redirigir a la ruta por defecto del rol del usuario
    const defaultRoute = getDefaultRouteByRole(user.role)
    return <Navigate to={defaultRoute} replace />
  }

  // Si se especifica una ruta requerida, verificar acceso usando el nuevo sistema de permisos
  if (requiredRoute) {
    // Primero verificar con el sistema de permisos dinámicos
    const hasPermissionAccess = isRoutePermitted(requiredRoute, userPermissions, user.role)
    
    // Si no tiene acceso por permisos, verificar con el sistema legacy como fallback
    const hasLegacyAccess = hasRouteAccess(user.role, requiredRoute)
    
    if (!hasPermissionAccess && !hasLegacyAccess) {
      // En lugar de mostrar error, redirigir a la ruta por defecto del rol
      const defaultRoute = getDefaultRouteByRole(user.role)
      return <Navigate to={defaultRoute} replace />
    }
  }

  return children
}

export default ProtectedRoute
