// Definición de roles
export const ROLES = {
  ADMIN: "administrador",
  INSTRUCTOR: "instructor",
  APPRENTICE: "aprendiz",
}

// Rutas permitidas por rol
const ALLOWED_ROUTES = {
  [ROLES.ADMIN]: [
    "/dashboard",
    "/perfil",
    "/formacion/programas",
    "/formacion/fichas",
    "/formacion/instructores",
    "/formacion/aprendices",
    "/programacion/temas",
    "/programacion/materiales",
    "/programacion/evaluaciones",
    "/programacion/programacionCursos",
    "/programacion/escala",
    "/programacion/insigneas",
    "/programacion/insigneas2",
    "/programacion/insigneas3",
    "/progreso/cursosProgramados",
    "/progreso/ranking",
    "/progreso/retroalimentacion",
    "/configuracion/roles",
  ],
  [ROLES.INSTRUCTOR]: [
    "/dashboard",
    "/perfil",
    "/formacion/programas",
    "/formacion/fichas",
    "/formacion/instructores",
    "/formacion/aprendices",
    "/programacion/temas",
    "/programacion/materiales",
    "/programacion/evaluaciones",
    "/programacion/programacionCursos",
    "/programacion/escala",
    "/programacion/insigneas",
    "/programacion/insigneas2",
    "/programacion/insigneas3",
    "/progreso/cursosProgramados",
    "/progreso/ranking",
    "/progreso/retroalimentacion",
  ],
  [ROLES.APPRENTICE]: [
    "/perfil", 
    "/aprendiz/inicio", 
    "/aprendiz/ranking", 
    "/aprendiz/feedback",
    "/aprendiz/home",
    "/aprendiz/ranking-original",
    "/progreso/retroalimentacion"
  ],
}

// Función para verificar acceso a ruta
export const hasRouteAccess = (userRole, route) => {
  if (!userRole || !route) return false
  const allowedRoutes = ALLOWED_ROUTES[userRole] || []
  return allowedRoutes.includes(route)
}

// Función para obtener la ruta por defecto según el rol
export const getDefaultRouteByRole = (role) => {
  switch (role) {
    case ROLES.ADMIN:
    case ROLES.INSTRUCTOR:
      return "/dashboard"
    case ROLES.APPRENTICE:
      return "/aprendiz/inicio"
    default:
      return "/login"
  }
}
