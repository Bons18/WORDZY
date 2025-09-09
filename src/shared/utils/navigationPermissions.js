/**
 * Configuración de navegación basada en permisos
 * Este archivo define la estructura de navegación que se muestra según los permisos del usuario
 */

// Definición de elementos de navegación
const NAVIGATION_ITEMS = {
  // Elementos standalone (no agrupados)
  dashboard: {
    label: "Dashboard",
    route: "/dashboard",
    icon: "LayoutDashboard",
    requiredModule: "Dashboard",
    requiredPermission: "view"
  },
  
  // Elementos para aprendices
  apprenticeHome: {
    label: "Inicio",
    route: "/aprendiz/inicio",
    icon: "LayoutDashboard",
    requiredModule: null, // Siempre disponible para aprendices
    requiredPermission: null
  },
  apprenticeRanking: {
    label: "Ranking",
    route: "/aprendiz/ranking",
    icon: "TrendingUp",
    requiredModule: "Ranking",
    requiredPermission: "view"
  },
  apprenticeFeedback: {
    label: "Retroalimentación",
    route: "/aprendiz/feedback",
    icon: "MessageSquare",
    requiredModule: "Retroalimentacion",
    requiredPermission: "view"
  },
  
  // Sección Formación
  programs: {
    label: "Programas",
    route: "/formacion/programas",
    icon: "BookOpenText",
    requiredModule: "Programas",
    requiredPermission: "view"
  },
  files: {
    label: "Fichas",
    route: "/formacion/fichas",
    icon: "ClipboardList",
    requiredModule: "Fichas",
    requiredPermission: "view"
  },
  instructors: {
    label: "Instructores",
    route: "/formacion/instructores",
    icon: "Users",
    requiredModule: "Instructores",
    requiredPermission: "view"
  },
  apprentices: {
    label: "Aprendices",
    route: "/formacion/aprendices",
    icon: "GraduationCap",
    requiredModule: "Aprendices",
    requiredPermission: "view"
  },
  
  // Sección Programación
  topics: {
    label: "Temas",
    route: "/programacion/temas",
    icon: "BookOpenText",
    requiredModule: "Temas",
    requiredPermission: "view"
  },
  materials: {
    label: "Material de Apoyo",
    route: "/programacion/materiales",
    icon: "Paperclip",
    requiredModule: "Material De Apoyo",
    requiredPermission: "view"
  },
  evaluations: {
    label: "Evaluaciones",
    route: "/programacion/evaluaciones",
    icon: "TestTubes",
    requiredModule: "Evaluaciones",
    requiredPermission: "view"
  },
  courseProgramming: {
    label: "Programación de Cursos",
    route: "/programacion/programacionCursos",
    icon: "CalendarCheck",
    requiredModule: "Programacion De Cursos",
    requiredPermission: "view"
  },
  badges: {
    label: "Insignias",
    route: "/programacion/insigneas2",
    icon: "Award",
    requiredModule: "Insignias",
    requiredPermission: "view"
  },
  
  // Sección Progreso
  scheduledCourses: {
    label: "Cursos Programados",
    route: "/progreso/cursosProgramados",
    icon: "Calendar",
    requiredModule: "Cursos Programados",
    requiredPermission: "view"
  },
  ranking: {
    label: "Ranking",
    route: "/progreso/ranking",
    icon: "TrendingUp",
    requiredModule: "Ranking",
    requiredPermission: "view"
  },
  feedback: {
    label: "Retroalimentación",
    route: "/progreso/retroalimentacion",
    icon: "MessageSquare",
    requiredModule: "Retroalimentacion",
    requiredPermission: "view"
  },
  
  // Sección Configuración
  roles: {
    label: "Roles",
    route: "/configuracion/roles",
    icon: "ShieldCheck",
    requiredModule: "Roles",
    requiredPermission: "view"
  },
  levelAssignment: {
    label: "Asignación de Niveles",
    route: "/programacion/asignacionNiveles",
    icon: "ListChecks",
    requiredModule: "Asignación de Niveles",
    requiredPermission: "view"
  }
}

/**
 * Verifica si un usuario tiene acceso a un elemento de navegación
 * @param {Object} item - El elemento de navegación
 * @param {Object} userPermissions - Los permisos del usuario
 * @param {string} userRole - El rol del usuario
 * @returns {boolean} - True si el usuario tiene acceso
 */
const hasAccessToItem = (item, userPermissions, userRole) => {
  // Los administradores tienen acceso a todo
  if (userRole === 'administrador') return true
  
  // Si no requiere módulo específico, permitir acceso
  if (!item.requiredModule) return true
  
  // Verificar si el usuario tiene el permiso requerido para el módulo
  const modulePermissions = userPermissions[item.requiredModule]
  if (!modulePermissions) return false
  
  switch (item.requiredPermission) {
    case 'view':
      return modulePermissions.canView
    case 'create':
      return modulePermissions.canCreate
    case 'edit':
      return modulePermissions.canEdit
    case 'delete':
      return modulePermissions.canDelete
    default:
      return false
  }
}

/**
 * Obtiene la estructura de navegación basada en los permisos del usuario
 * @param {Object} userPermissions - Los permisos del usuario
 * @param {string} userRole - El rol del usuario
 * @returns {Object} - La estructura de navegación
 */
// Función para verificar si una ruta está permitida
export const isRoutePermitted = (route, userPermissions, userRole) => {
  // Buscar el item de navegación que corresponde a la ruta
  const navigationItem = Object.values(NAVIGATION_ITEMS).find(item => item.route === route)
  
  if (!navigationItem) {
    // Si no se encuentra la ruta en los items de navegación, permitir acceso por defecto
    return true
  }
  
  return hasAccessToItem(navigationItem, userPermissions, userRole)
}

export const getNavigationStructure = (userPermissions, userRole) => {
  const structure = {
    standalone: [],
    sections: {
      formacion: { hasItems: false, items: [] },
      programacion: { hasItems: false, items: [] },
      progreso: { hasItems: false, items: [] },
      configuracion: { hasItems: false, items: [] }
    }
  }
  
  // Para aprendices, organizar elementos en secciones de acordeón
  if (userRole === 'aprendiz') {
    // Siempre mostrar inicio
    structure.standalone.push(NAVIGATION_ITEMS.apprenticeHome)
    
    // Mostrar dashboard si tiene permisos
    if (hasAccessToItem(NAVIGATION_ITEMS.dashboard, userPermissions, userRole)) {
      structure.standalone.push(NAVIGATION_ITEMS.dashboard)
    }
    
    // Sección Formación para aprendices
    const apprenticeFormacionItems = []
    if (hasAccessToItem(NAVIGATION_ITEMS.programs, userPermissions, userRole)) {
      apprenticeFormacionItems.push(NAVIGATION_ITEMS.programs)
    }
    if (hasAccessToItem(NAVIGATION_ITEMS.files, userPermissions, userRole)) {
      apprenticeFormacionItems.push(NAVIGATION_ITEMS.files)
    }
    if (hasAccessToItem(NAVIGATION_ITEMS.instructors, userPermissions, userRole)) {
      apprenticeFormacionItems.push(NAVIGATION_ITEMS.instructors)
    }
    if (hasAccessToItem(NAVIGATION_ITEMS.apprentices, userPermissions, userRole)) {
      apprenticeFormacionItems.push(NAVIGATION_ITEMS.apprentices)
    }
    
    if (apprenticeFormacionItems.length > 0) {
      structure.sections.formacion.hasItems = true
      structure.sections.formacion.items = apprenticeFormacionItems
    }
    
    // Sección Programación para aprendices
    const apprenticeProgramacionItems = []
    if (hasAccessToItem(NAVIGATION_ITEMS.topics, userPermissions, userRole)) {
      apprenticeProgramacionItems.push(NAVIGATION_ITEMS.topics)
    }
    if (hasAccessToItem(NAVIGATION_ITEMS.materials, userPermissions, userRole)) {
      apprenticeProgramacionItems.push(NAVIGATION_ITEMS.materials)
    }
    if (hasAccessToItem(NAVIGATION_ITEMS.evaluations, userPermissions, userRole)) {
      apprenticeProgramacionItems.push(NAVIGATION_ITEMS.evaluations)
    }
    if (hasAccessToItem(NAVIGATION_ITEMS.courseProgramming, userPermissions, userRole)) {
      apprenticeProgramacionItems.push(NAVIGATION_ITEMS.courseProgramming)
    }
    if (hasAccessToItem(NAVIGATION_ITEMS.badges, userPermissions, userRole)) {
      apprenticeProgramacionItems.push(NAVIGATION_ITEMS.badges)
    }
    if (hasAccessToItem(NAVIGATION_ITEMS.levelAssignment, userPermissions, userRole)) {
      apprenticeProgramacionItems.push(NAVIGATION_ITEMS.levelAssignment)
    }
    
    if (apprenticeProgramacionItems.length > 0) {
      structure.sections.programacion.hasItems = true
      structure.sections.programacion.items = apprenticeProgramacionItems
    }
    
    // Sección Progreso para aprendices
    const apprenticeProgresoItems = []
    if (hasAccessToItem(NAVIGATION_ITEMS.scheduledCourses, userPermissions, userRole)) {
      apprenticeProgresoItems.push(NAVIGATION_ITEMS.scheduledCourses)
    }
    // Solo usar las versiones específicas de aprendiz para evitar duplicados
    if (hasAccessToItem(NAVIGATION_ITEMS.apprenticeRanking, userPermissions, userRole)) {
      apprenticeProgresoItems.push(NAVIGATION_ITEMS.apprenticeRanking)
    }
    if (hasAccessToItem(NAVIGATION_ITEMS.apprenticeFeedback, userPermissions, userRole)) {
      apprenticeProgresoItems.push(NAVIGATION_ITEMS.apprenticeFeedback)
    }
    
    if (apprenticeProgresoItems.length > 0) {
      structure.sections.progreso.hasItems = true
      structure.sections.progreso.items = apprenticeProgresoItems
    }
    
    // Sección Configuración para aprendices
    const apprenticeConfiguracionItems = []
    if (hasAccessToItem(NAVIGATION_ITEMS.roles, userPermissions, userRole)) {
      apprenticeConfiguracionItems.push(NAVIGATION_ITEMS.roles)
    }
    
    if (apprenticeConfiguracionItems.length > 0) {
      structure.sections.configuracion.hasItems = true
      structure.sections.configuracion.items = apprenticeConfiguracionItems
    }
    
    return structure
  }
  
  // Para administradores e instructores
  
  // Elementos standalone
  if (hasAccessToItem(NAVIGATION_ITEMS.dashboard, userPermissions, userRole)) {
    structure.standalone.push(NAVIGATION_ITEMS.dashboard)
  }
  
  // Sección Formación
  const formacionItems = []
  if (hasAccessToItem(NAVIGATION_ITEMS.programs, userPermissions, userRole)) {
    formacionItems.push(NAVIGATION_ITEMS.programs)
  }
  if (hasAccessToItem(NAVIGATION_ITEMS.files, userPermissions, userRole)) {
    formacionItems.push(NAVIGATION_ITEMS.files)
  }
  if (hasAccessToItem(NAVIGATION_ITEMS.instructors, userPermissions, userRole)) {
    formacionItems.push(NAVIGATION_ITEMS.instructors)
  }
  if (hasAccessToItem(NAVIGATION_ITEMS.apprentices, userPermissions, userRole)) {
    formacionItems.push(NAVIGATION_ITEMS.apprentices)
  }
  
  if (formacionItems.length > 0) {
    structure.sections.formacion.hasItems = true
    structure.sections.formacion.items = formacionItems
  }
  
  // Sección Programación
  const programacionItems = []
  if (hasAccessToItem(NAVIGATION_ITEMS.topics, userPermissions, userRole)) {
    programacionItems.push(NAVIGATION_ITEMS.topics)
  }
  if (hasAccessToItem(NAVIGATION_ITEMS.materials, userPermissions, userRole)) {
    programacionItems.push(NAVIGATION_ITEMS.materials)
  }
  if (hasAccessToItem(NAVIGATION_ITEMS.evaluations, userPermissions, userRole)) {
    programacionItems.push(NAVIGATION_ITEMS.evaluations)
  }
  if (hasAccessToItem(NAVIGATION_ITEMS.courseProgramming, userPermissions, userRole)) {
    programacionItems.push(NAVIGATION_ITEMS.courseProgramming)
  }
  if (hasAccessToItem(NAVIGATION_ITEMS.badges, userPermissions, userRole)) {
    programacionItems.push(NAVIGATION_ITEMS.badges)
  }
  if (hasAccessToItem(NAVIGATION_ITEMS.levelAssignment, userPermissions, userRole)) {
    programacionItems.push(NAVIGATION_ITEMS.levelAssignment)
  }
  
  if (programacionItems.length > 0) {
    structure.sections.programacion.hasItems = true
    structure.sections.programacion.items = programacionItems
  }
  
  // Sección Progreso
  const progresoItems = []
  if (hasAccessToItem(NAVIGATION_ITEMS.scheduledCourses, userPermissions, userRole)) {
    progresoItems.push(NAVIGATION_ITEMS.scheduledCourses)
  }
  if (hasAccessToItem(NAVIGATION_ITEMS.ranking, userPermissions, userRole)) {
    progresoItems.push(NAVIGATION_ITEMS.ranking)
  }
  if (hasAccessToItem(NAVIGATION_ITEMS.feedback, userPermissions, userRole)) {
    progresoItems.push(NAVIGATION_ITEMS.feedback)
  }
  
  if (progresoItems.length > 0) {
    structure.sections.progreso.hasItems = true
    structure.sections.progreso.items = progresoItems
  }
  
  // Sección Configuración
  const configuracionItems = []
  if (hasAccessToItem(NAVIGATION_ITEMS.roles, userPermissions, userRole)) {
    configuracionItems.push(NAVIGATION_ITEMS.roles)
  }
  
  if (configuracionItems.length > 0) {
    structure.sections.configuracion.hasItems = true
    structure.sections.configuracion.items = configuracionItems
  }
  
  return structure
}

export default getNavigationStructure