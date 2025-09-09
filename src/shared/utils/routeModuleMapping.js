/**
 * Mapeo entre rutas y módulos de permisos
 * Este archivo define qué módulo de permisos se requiere para acceder a cada ruta
 */

// Mapeo de rutas a módulos de permisos
export const ROUTE_MODULE_MAPPING = {
  // Dashboard
  "/dashboard": "Dashboard",
  
  // Formación
  "/formacion/programas": "Programas",
  "/formacion/fichas": "Fichas",
  "/formacion/instructores": "Instructores",
  "/formacion/aprendices": "Aprendices",
  
  // Programación
  "/programacion/temas": "Temas",
  "/programacion/materiales": "Material De Apoyo",
  "/programacion/evaluaciones": "Evaluaciones",
  "/programacion/programacionCursos": "Programacion De Cursos",
  "/programacion/escala": "Escala De Valoracion",
  "/programacion/insigneas": "Insignias",
  "/programacion/insigneas2": "Insignias",
  "/programacion/insigneas3": "Insignias",
  
  // Progreso
  "/progreso/cursosProgramados": "Cursos Programados",
  "/progreso/ranking": "Ranking",
  "/progreso/retroalimentacion": "Retroalimentacion",
  
  // Configuración
  "/configuracion/roles": "Roles",
  "/configuracion/asignacionNiveles": "Asignación de Niveles",
  
  // Rutas específicas para aprendices (siempre accesibles para aprendices)
  "/aprendiz/inicio": null, // Siempre accesible para aprendices
  "/aprendiz/home": null, // Siempre accesible para aprendices
  "/aprendiz/ranking": "Ranking", // Requiere permiso de ranking
  "/aprendiz/ranking-original": "Ranking", // Requiere permiso de ranking
  "/aprendiz/feedback": "Retroalimentacion", // Requiere permiso de retroalimentación
}

// Rutas que siempre están disponibles para todos los usuarios autenticados
export const PUBLIC_AUTHENTICATED_ROUTES = [
  "/perfil",
  "/aprendiz/inicio",
  "/aprendiz/home"
]

// Rutas por defecto según el rol
export const DEFAULT_ROUTES_BY_ROLE = {
  "administrador": "/dashboard",
  "instructor": "/dashboard",
  "aprendiz": "/aprendiz/inicio"
}

/**
 * Obtiene el módulo requerido para acceder a una ruta
 * @param {string} route - La ruta a verificar
 * @returns {string|null} - El módulo requerido o null si no requiere permisos específicos
 */
export const getRequiredModuleForRoute = (route) => {
  // Verificar rutas exactas primero
  if (ROUTE_MODULE_MAPPING.hasOwnProperty(route)) {
    return ROUTE_MODULE_MAPPING[route]
  }
  
  // Verificar rutas que empiecen con patrones conocidos
  for (const [routePattern, module] of Object.entries(ROUTE_MODULE_MAPPING)) {
    if (route.startsWith(routePattern)) {
      return module
    }
  }
  
  return null
}

/**
 * Verifica si una ruta es pública para usuarios autenticados
 * @param {string} route - La ruta a verificar
 * @returns {boolean} - True si la ruta es pública para usuarios autenticados
 */
export const isPublicAuthenticatedRoute = (route) => {
  return PUBLIC_AUTHENTICATED_ROUTES.some(publicRoute => 
    route === publicRoute || route.startsWith(publicRoute)
  )
}

/**
 * Obtiene la ruta por defecto según el rol del usuario
 * @param {string} role - El rol del usuario
 * @returns {string} - La ruta por defecto
 */
export const getDefaultRouteByRole = (role) => {
  return DEFAULT_ROUTES_BY_ROLE[role] || "/dashboard"
}

/**
 * Verifica si un usuario puede acceder a una ruta específica
 * @param {Object} user - El objeto usuario
 * @param {Function} hasPermission - Función para verificar permisos
 * @param {string} route - La ruta a verificar
 * @returns {boolean} - True si el usuario puede acceder a la ruta
 */
export const canAccessRoute = (user, hasPermission, route) => {
  if (!user) return false
  
  // Los administradores pueden acceder a todas las rutas
  if (user.role === 'administrador') return true
  
  // Verificar si es una ruta pública para usuarios autenticados
  if (isPublicAuthenticatedRoute(route)) return true
  
  // Obtener el módulo requerido para la ruta
  const requiredModule = getRequiredModuleForRoute(route)
  
  // Si no requiere módulo específico, permitir acceso
  if (!requiredModule) return true
  
  // Verificar si el usuario tiene permiso para ver el módulo
  return hasPermission(requiredModule, 'view')
}