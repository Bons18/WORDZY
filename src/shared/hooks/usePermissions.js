"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../../features/auth/hooks/useAuth"

/**
 * Hook personalizado para manejar permisos del usuario
 * Basado en el rol del usuario y sus permisos específicos
 */
export const usePermissions = () => {
  const { user } = useAuth()
  const [userPermissions, setUserPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar permisos del usuario cuando cambie el usuario
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!user || !user.roleDetails) {
        setUserPermissions({})
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        // Si el usuario es administrador, tiene todos los permisos
        if (user.role === 'administrador') {
          // Obtener todos los módulos disponibles
          const response = await fetch('http://localhost:3000/api/permission', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('wordzy_token')}`
            }
          })

          if (response.ok) {
            const permissions = await response.json()
            const adminPermissions = {}
            
            permissions.forEach(permission => {
              adminPermissions[permission.module] = {
                canView: true,
                canCreate: true,
                canEdit: true,
                canDelete: true
              }
            })
            
            setUserPermissions(adminPermissions)
          }
        } else {
          // Para otros roles, usar los permisos específicos del rol
          const rolePermissions = {}
          
          console.log('🔍 DEBUG PERMISSIONS - User role:', user.role)
          console.log('🔍 DEBUG PERMISSIONS - User roleDetails:', user.roleDetails)
          
          if (user.roleDetails && user.roleDetails.permissions) {
            console.log('🔍 DEBUG PERMISSIONS - Processing permissions:', user.roleDetails.permissions)
            user.roleDetails.permissions.forEach(permission => {
              // La estructura es: permission.permission contiene el objeto Permission con el campo module
              const permissionData = permission.permission
              const moduleName = permissionData?.module
              
              console.log('🔍 DEBUG PERMISSIONS - Processing module:', moduleName, permission)
              console.log('🔍 DEBUG PERMISSIONS - Permission data:', permissionData)
              
              if (moduleName) {
                rolePermissions[moduleName] = {
                  canView: permission.canView || false,
                  canCreate: permission.canCreate || false,
                  canEdit: permission.canEdit || false,
                  canDelete: permission.canDelete || false
                }
              }
            })
          } else {
            console.log('❌ DEBUG PERMISSIONS - No roleDetails or permissions found')
          }
          
          console.log('🔍 DEBUG PERMISSIONS - Final rolePermissions:', rolePermissions)
          setUserPermissions(rolePermissions)
        }
      } catch (err) {
        console.error('Error cargando permisos del usuario:', err)
        setError('Error al cargar permisos')
        setUserPermissions({})
      } finally {
        setLoading(false)
      }
    }

    loadUserPermissions()
  }, [user])

  // Función para verificar si el usuario tiene un permiso específico
  const hasPermission = useMemo(() => {
    return (module, action) => {
      if (!user || !module || !action) return false
      
      // Los administradores tienen todos los permisos
      if (user.role === 'administrador') return true
      
      const modulePermissions = userPermissions[module]
      if (!modulePermissions) return false
      
      switch (action) {
        case 'view':
        case 'ver':
          return modulePermissions.canView
        case 'create':
        case 'crear':
          return modulePermissions.canCreate
        case 'edit':
        case 'editar':
          return modulePermissions.canEdit
        case 'delete':
        case 'eliminar':
          return modulePermissions.canDelete
        default:
          return false
      }
    }
  }, [user, userPermissions])

  // Función para verificar si el usuario puede acceder a un módulo (al menos ver)
  const canAccessModule = useMemo(() => {
    return (module) => {
      if (!user || !module) return false
      
      // Los administradores pueden acceder a todos los módulos
      if (user.role === 'administrador') return true
      
      const modulePermissions = userPermissions[module]
      return modulePermissions?.canView || false
    }
  }, [user, userPermissions])

  // Función para obtener todos los módulos a los que el usuario tiene acceso
  const getAccessibleModules = useMemo(() => {
    return () => {
      if (!user) return []
      
      // Los administradores tienen acceso a todos los módulos
      if (user.role === 'administrador') {
        return Object.keys(userPermissions)
      }
      
      return Object.keys(userPermissions).filter(module => 
        userPermissions[module]?.canView
      )
    }
  }, [user, userPermissions])

  // Función para verificar múltiples permisos a la vez
  const hasAnyPermission = useMemo(() => {
    return (permissions) => {
      if (!Array.isArray(permissions)) return false
      
      return permissions.some(({ module, action }) => 
        hasPermission(module, action)
      )
    }
  }, [hasPermission])

  // Función para verificar todos los permisos
  const hasAllPermissions = useMemo(() => {
    return (permissions) => {
      if (!Array.isArray(permissions)) return false
      
      return permissions.every(({ module, action }) => 
        hasPermission(module, action)
      )
    }
  }, [hasPermission])

  return {
    userPermissions,
    loading,
    error,
    hasPermission,
    canAccessModule,
    getAccessibleModules,
    hasAnyPermission,
    hasAllPermissions,
    isAdmin: user?.role === 'administrador'
  }
}

export default usePermissions