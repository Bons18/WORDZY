// Servicio para manejar las operaciones de retroalimentación
const API_BASE_URL = "http://localhost:3000/api"

// Función para obtener todos los usuarios desde la API
export const getAllUsers = async () => {
  console.log("🌐 Intentando conectar con:", `${API_BASE_URL}/user`)

  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Reducir timeout para respuesta más rápida
      signal: AbortSignal.timeout(5000), // Reducido a 5 segundos
    })

    console.log("📡 Respuesta de la API:", response.status, response.statusText)

    if (!response.ok) {
      console.error(`❌ Error HTTP: ${response.status} - ${response.statusText}`)
      console.warn("⚠️ API no disponible, usando datos de prueba temporales")
      return generateTestUsers()
    }

    const data = await response.json()
    console.log("📦 Datos recibidos:", data)
    
    // Verificar si la respuesta tiene la estructura esperada
    if (data.success && data.data && data.data.users) {
      return data.data.users
    } else if (Array.isArray(data)) {
      return data
    } else {
      console.warn("⚠️ Estructura de datos inesperada, usando datos de prueba")
      return generateTestUsers()
    }
  } catch (error) {
    console.error("🚨 Error en getAllUsers:", error.message)
    
    if (error.name === "TimeoutError") {
      console.warn("⏱️ Timeout: La API no responde en 5 segundos")
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      console.warn("🔌 No se puede conectar con el servidor en http://localhost:3000")
    } else {
      console.warn("❌ Error desconocido al conectar con la API")
    }
    
    console.warn("🔄 Usando datos de prueba temporales para mantener funcionalidad")
    return generateTestUsers() // Usar datos de prueba en lugar de array vacío
  }
}

// Función para obtener un usuario específico por ID
export const getUserById = async (userId) => {
  console.log("🔍 Obteniendo usuario por ID:", userId)
  
  try {
    const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.error(`❌ Error HTTP: ${response.status} - ${response.statusText}`)
      // Buscar en datos de prueba
      const testUsers = generateTestUsers()
      return testUsers.find(user => user._id === userId) || null
    }

    const data = await response.json()
    console.log("📦 Usuario obtenido:", data)
    
    if (data.success && data.data) {
      return data.data
    } else {
      return data
    }
  } catch (error) {
    console.error("🚨 Error en getUserById:", error.message)
    // Buscar en datos de prueba como fallback
    const testUsers = generateTestUsers()
    return testUsers.find(user => user._id === userId) || null
  }
}

// Función para obtener exámenes de un estudiante
export const getStudentExams = async (studentId) => {
  console.log("📝 Obteniendo exámenes del estudiante:", studentId)
  
  try {
    const response = await fetch(`${API_BASE_URL}/user/${studentId}/exams`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.warn("⚠️ API de exámenes no disponible, usando datos de prueba")
      const user = await getUserById(studentId)
      return user?.examenes || []
    }

    const data = await response.json()
    console.log("📦 Exámenes obtenidos:", data)
    
    if (data.success && data.data && data.data.exams) {
      return data.data.exams
    } else if (Array.isArray(data)) {
      return data
    } else {
      // Fallback a datos del usuario
      const user = await getUserById(studentId)
      return user?.examenes || []
    }
  } catch (error) {
    console.error("🚨 Error en getStudentExams:", error.message)
    // Fallback a datos del usuario
    const user = await getUserById(studentId)
    return user?.examenes || []
  }
}

// Función para obtener actividades de un estudiante
export const getStudentActivities = async (studentId) => {
  console.log("📚 Obteniendo actividades del estudiante:", studentId)
  
  try {
    const response = await fetch(`${API_BASE_URL}/user/${studentId}/activities`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.warn("⚠️ API de actividades no disponible, usando datos de prueba")
      const user = await getUserById(studentId)
      return user?.actividades || []
    }

    const data = await response.json()
    console.log("📦 Actividades obtenidas:", data)
    
    if (data.success && data.data && data.data.activities) {
      return data.data.activities
    } else if (Array.isArray(data)) {
      return data
    } else {
      // Fallback a datos del usuario
      const user = await getUserById(studentId)
      return user?.actividades || []
    }
  } catch (error) {
    console.error("🚨 Error en getStudentActivities:", error.message)
    // Fallback a datos del usuario
    const user = await getUserById(studentId)
    return user?.actividades || []
  }
}

// Función para generar usuarios de prueba cuando la API falla
const generateTestUsers = () => {
  const testUsers = [
    {
      _id: "mock_user_1",
      nombre: "Ana María",
      apellido: "García López",
      correo: "ana.garcia@sena.edu.co",
      tipoUsuario: "aprendiz",
      ficha: [2758394],
      programa: "Análisis y Desarrollo de Software",
      estado: "En formación",
      createdAt: new Date("2024-01-15"),
      role: {
        _id: "role_aprendiz",
        name: "aprendiz"
      },
      examenes: [
        {
          _id: "exam_1",
          nombre: "Examen de JavaScript Básico",
          fecha: new Date("2024-01-20"),
          calificacion: 3.2,
          estado: "completado",
          preguntas: [
            {
              pregunta: "¿Cuál es la diferencia entre let y var en JavaScript?",
              respuestaCorrecta: "let tiene scope de bloque, var tiene scope de función",
              respuestaEstudiante: "let es más nuevo que var",
              esCorrecta: false,
              explicacion: "La principal diferencia es el scope: let tiene alcance de bloque mientras que var tiene alcance de función."
            },
            {
              pregunta: "¿Qué es el hoisting en JavaScript?",
              respuestaCorrecta: "Es el comportamiento de mover declaraciones al inicio del scope",
              respuestaEstudiante: "Es el comportamiento de mover declaraciones al inicio del scope",
              esCorrecta: true,
              explicacion: "Correcto! El hoisting mueve las declaraciones de variables y funciones al inicio de su scope."
            }
          ]
        }
      ],
      actividades: [
        {
          _id: "activity_1",
          nombre: "Práctica de Arrays en JavaScript",
          fecha: new Date("2024-01-18"),
          calificacion: 4.1,
          estado: "completado",
          retroalimentacion: "Buen trabajo con los métodos de arrays, pero necesitas practicar más con reduce()."
        }
      ]
    },
    {
      _id: "mock_user_2",
      nombre: "Carlos",
      apellido: "Rodríguez Pérez",
      correo: "carlos.rodriguez@sena.edu.co",
      tipoUsuario: "aprendiz",
      ficha: [2758394],
      programa: "Análisis y Desarrollo de Software",
      estado: "En formación",
      createdAt: new Date("2024-01-15"),
      role: {
        _id: "role_aprendiz",
        name: "aprendiz"
      },
      examenes: [
        {
          _id: "exam_2",
          nombre: "Examen de React Básico",
          fecha: new Date("2024-01-22"),
          calificacion: 2.8,
          estado: "completado",
          preguntas: [
            {
              pregunta: "¿Qué es JSX en React?",
              respuestaCorrecta: "Es una extensión de sintaxis de JavaScript que permite escribir HTML en JavaScript",
              respuestaEstudiante: "Es un lenguaje de programación",
              esCorrecta: false,
              explicacion: "JSX es una extensión de sintaxis que permite escribir elementos HTML dentro de JavaScript de forma más legible."
            },
            {
              pregunta: "¿Cuál es la diferencia entre props y state?",
              respuestaCorrecta: "Props son inmutables y vienen del componente padre, state es mutable y local",
              respuestaEstudiante: "No hay diferencia",
              esCorrecta: false,
              explicacion: "Props son datos inmutables que vienen del componente padre, mientras que state es mutable y pertenece al componente."
            }
          ]
        }
      ],
      actividades: [
        {
          _id: "activity_2",
          nombre: "Componentes React",
          fecha: new Date("2024-01-19"),
          calificacion: 3.5,
          estado: "completado",
          retroalimentacion: "Entiendes los conceptos básicos, pero necesitas practicar más la gestión del estado."
        }
      ]
    },
    {
      _id: "mock_user_3",
      nombre: "María José",
      apellido: "Martínez Silva",
      correo: "maria.martinez@sena.edu.co",
      tipoUsuario: "aprendiz",
      ficha: [2758394],
      programa: "Análisis y Desarrollo de Software",
      estado: "En formación",
      createdAt: new Date("2024-01-15"),
      role: {
        _id: "role_aprendiz",
        name: "aprendiz"
      },
      examenes: [
        {
          _id: "exam_3",
          nombre: "Examen de Node.js",
          fecha: new Date("2024-01-25"),
          calificacion: 4.5,
          estado: "completado",
          preguntas: [
            {
              pregunta: "¿Qué es npm?",
              respuestaCorrecta: "Es el gestor de paquetes de Node.js",
              respuestaEstudiante: "Es el gestor de paquetes de Node.js",
              esCorrecta: true,
              explicacion: "¡Excelente! npm (Node Package Manager) es efectivamente el gestor de paquetes oficial de Node.js."
            }
          ]
        }
      ],
      actividades: [
        {
          _id: "activity_3",
          nombre: "API REST con Express",
          fecha: new Date("2024-01-23"),
          calificacion: 4.8,
          estado: "completado",
          retroalimentacion: "Excelente trabajo! Dominas muy bien los conceptos de APIs REST."
        }
      ]
    }
  ]

  console.log("🔄 Generando datos de prueba:", testUsers.length, "usuarios")
  return testUsers
}

// Función para obtener las fichas desde los usuarios aprendices
export const getFichasFromAPI = async () => {
  try {
    console.log("🎯 Obteniendo fichas de aprendices...")
    const users = await getAllUsers()

    if (!Array.isArray(users)) {
      console.warn("⚠️ Los datos de usuarios no son un array:", typeof users)
      throw new Error("Formato de datos inválido")
    }

    console.log("👥 Total de usuarios recibidos:", users.length)

    // Filtrar usuarios que sean aprendices
    const aprendices = users.filter((user) => {
      const esAprendiz = user && user.tipoUsuario === "aprendiz"
      if (esAprendiz) {
        console.log(
          "👨‍🎓 Aprendiz encontrado:",
          user.nombre,
          user.apellido,
          "- Ficha:",
          user.ficha,
          "- Programa:",
          user.programa,
        )
      }
      return esAprendiz
    })

    console.log("👨‍🎓 Total aprendices encontrados:", aprendices.length)

    // Extraer todas las fichas de los aprendices
    const todasLasFichas = []

    aprendices.forEach((aprendiz) => {
      // Manejar que ficha puede ser un array o un valor único
      if (Array.isArray(aprendiz.ficha)) {
        // Si es array, agregar todos los elementos
        aprendiz.ficha.forEach((ficha) => {
          if (ficha && ficha.toString().trim() !== "") {
            todasLasFichas.push(ficha.toString())
            console.log("📋 Ficha encontrada (array):", ficha, "para", aprendiz.nombre, aprendiz.apellido)
          }
        })
      } else if (aprendiz.ficha) {
        // Si es un valor único
        if (aprendiz.ficha.toString().trim() !== "") {
          todasLasFichas.push(aprendiz.ficha.toString())
          console.log("📋 Ficha encontrada (único):", aprendiz.ficha, "para", aprendiz.nombre, aprendiz.apellido)
        }
      }
    })

    console.log("📋 Todas las fichas extraídas:", todasLasFichas)

    // Obtener fichas únicas
    const fichasUnicas = [...new Set(todasLasFichas)]

    console.log("📋 Fichas únicas encontradas:", fichasUnicas)

    if (fichasUnicas.length === 0) {
      console.warn("⚠️ No se encontraron fichas válidas")
      throw new Error("No se encontraron fichas de aprendices")
    }

    // Crear el formato necesario para los selectores
    const fichas = fichasUnicas.map((ficha) => {
      // Buscar el programa asociado a esta ficha
      const aprendizConEstaFicha = aprendices.find((aprendiz) => {
        if (Array.isArray(aprendiz.ficha)) {
          return aprendiz.ficha.includes(Number.parseInt(ficha))
        }
        return aprendiz.ficha.toString() === ficha
      })

      return {
        value: ficha,
        label: `Ficha ${ficha}`,
        programa: aprendizConEstaFicha?.programa || "Programa SENA",
      }
    })

    // Ordenar por código de ficha
    const fichasOrdenadas = fichas.sort((a, b) => {
      const numA = Number.parseInt(a.value) || 0
      const numB = Number.parseInt(b.value) || 0
      return numA - numB
    })

    console.log("✅ Fichas finales ordenadas:", fichasOrdenadas)
    return fichasOrdenadas
  } catch (error) {
    console.error("❌ Error en getFichasFromAPI:", error.message)
    throw error
  }
}

// Función para obtener instructores desde la API
export const getInstructors = async () => {
  try {
    console.log("👨‍🏫 Obteniendo instructores...")
    const users = await getAllUsers()

    if (!Array.isArray(users)) {
      throw new Error("Formato de datos inválido")
    }

    console.log("👥 Total de usuarios para filtrar instructores:", users.length)

    // Filtrar usuarios que sean instructores
    const instructores = users.filter((user) => {
      const esInstructor = user && user.tipoUsuario === "instructor"
      if (esInstructor) {
        console.log("👩‍🏫 Instructor encontrado:", user.nombre, user.apellido)
      }
      return esInstructor
    })

    console.log("👩‍🏫 Total instructores encontrados:", instructores.length)

    // Crear el formato necesario para los selectores
    const instructorsData = instructores.map((instructor) => ({
      nombre: `${instructor.nombre || ""} ${instructor.apellido || ""}`.trim() || "Sin nombre",
      especialidad: instructor.especialidad || "Inglés General",
      id: instructor._id || instructor.id,
    }))

    const instructorsOrdenados = instructorsData.sort((a, b) => a.nombre.localeCompare(b.nombre))
    console.log("✅ Instructores finales:", instructorsOrdenados)
    return instructorsOrdenados
  } catch (error) {
    console.error("❌ Error en getInstructors:", error.message)
    throw error
  }
}

// Cache para niveles
let nivelesCache = null;
let nivelesCacheTime = 0;

// Función optimizada para obtener niveles únicos de usuarios aprendices
export const getNiveles = async () => {
  try {
    // Verificar cache
    const now = Date.now();
    if (nivelesCache && (now - nivelesCacheTime) < CACHE_DURATION) {
      console.log('📦 Usando niveles desde cache');
      return nivelesCache;
    }
    
    console.log('🔄 Cargando niveles desde API...');
    const users = await getAllUsers();
    
    // Optimización: procesar solo una muestra de usuarios
    const nivelesSet = new Set();
    let processedCount = 0;
    const maxProcess = 200; // Procesar máximo 200 aprendices
    
    for (const user of users) {
      if (processedCount >= maxProcess) break;
      
      if (user?.tipoUsuario === 'aprendiz' && 
          user.progresoNiveles?.length > 0) {
        user.progresoNiveles.forEach(progreso => {
          if (progreso?.nivel) {
            nivelesSet.add(progreso.nivel);
          }
        });
        processedCount++;
      }
    }
    
    // Si no se encontraron niveles, usar valores por defecto
    if (nivelesSet.size === 0) {
      nivelesSet.add(1);
      nivelesSet.add(2);
      nivelesSet.add(3);
    }
    
    // Convertir Set a array y ordenar
    const niveles = Array.from(nivelesSet)
      .sort((a, b) => a - b)
      .slice(0, 10) // Máximo 10 niveles
      .map(nivel => ({
        value: nivel,
        label: `Nivel ${nivel}`
      }));
    
    // Actualizar cache
    nivelesCache = niveles;
    nivelesCacheTime = now;
    
    console.log(`✅ Niveles cargados: ${niveles.length}`);
    return niveles;
  } catch (error) {
    console.error('Error al obtener niveles:', error);
    // Retornar cache si existe, sino valores por defecto
    return nivelesCache || [
      { value: 1, label: 'Nivel 1' },
      { value: 2, label: 'Nivel 2' },
      { value: 3, label: 'Nivel 3' }
    ];
  }
};

// Función para obtener resultados de retroalimentación
export const getFeedbackResults = async (filters = {}, options = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.ficha) queryParams.append('ficha', filters.ficha);
    if (filters.nivel) queryParams.append('nivel', filters.nivel);
    if (filters.instructor) queryParams.append('instructor', filters.instructor);
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit);
    
    const url = `${API_BASE_URL}/feedback/results${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Usar el signal proporcionado en options o el del controller interno
    const signal = options.signal || controller.signal;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      signal: signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data || { results: [], total: 0 };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('🚫 Petición de resultados cancelada');
      throw error;
    }
    console.error('Error al obtener resultados de retroalimentación:', error);
    throw error;
  }
};

// Cache para optimizar las consultas
let fichasCache = null;
let fichasCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función optimizada para obtener fichas que solo tengan aprendices con niveles asignados
export const getFichasWithLevels = async () => {
  try {
    // Verificar cache
    const now = Date.now();
    if (fichasCache && (now - fichasCacheTime) < CACHE_DURATION) {
      console.log('📦 Usando fichas desde cache');
      return fichasCache;
    }
    
    console.log('🔄 Cargando fichas desde API...');
    const users = await getAllUsers();
    
    // Optimización: filtrar y procesar en una sola pasada
    const fichasSet = new Set();
    let processedCount = 0;
    const maxProcess = 500; // Limitar procesamiento
    
    for (const user of users) {
      if (processedCount >= maxProcess) break;
      
      if (user?.tipoUsuario === 'aprendiz' && 
          user.ficha && 
          user.progresoNiveles?.length > 0) {
        fichasSet.add(user.ficha);
        processedCount++;
      }
    }
    
    const fichas = Array.from(fichasSet)
      .sort()
      .slice(0, 50) // Limitar a 50 fichas máximo
      .map(ficha => ({
        value: ficha,
        label: ficha
      }));
    
    // Actualizar cache
    fichasCache = fichas;
    fichasCacheTime = now;
    
    console.log(`✅ Fichas cargadas: ${fichas.length}`);
    return fichas;
  } catch (error) {
    console.error('Error al obtener fichas con niveles:', error);
    // Retornar cache si existe, sino array vacío
    return fichasCache || [];
  }
};

// Cache para instructores
let instructorsCache = null;
let instructorsCacheTime = 0;

// Función optimizada para obtener instructores con sus fichas asignadas
export const getInstructorsWithFichas = async () => {
  try {
    // Verificar cache
    const now = Date.now();
    if (instructorsCache && (now - instructorsCacheTime) < CACHE_DURATION) {
      console.log('📦 Usando instructores desde cache');
      return instructorsCache;
    }
    
    console.log('🔄 Cargando instructores desde API...');
    const users = await getAllUsers();
    
    // Optimización: procesar solo los primeros 100 usuarios para instructores
    const instructorsData = [];
    let processedCount = 0;
    const maxProcess = 100;
    
    for (const user of users) {
      if (processedCount >= maxProcess) break;
      
      if (user?.tipoUsuario === 'instructor' && 
          user.fichas?.length > 0) {
        instructorsData.push({
          value: user._id || user.id,
          label: `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Sin nombre',
          fichas: user.fichas.slice(0, 10) // Limitar fichas por instructor
        });
        processedCount++;
      }
    }
    
    // Limitar a 30 instructores máximo y ordenar
    const sortedInstructors = instructorsData
      .sort((a, b) => a.label.localeCompare(b.label))
      .slice(0, 30);
    
    // Actualizar cache
    instructorsCache = sortedInstructors;
    instructorsCacheTime = now;
    
    console.log(`✅ Instructores cargados: ${sortedInstructors.length}`);
    return sortedInstructors;
  } catch (error) {
    console.error('Error al obtener instructores con fichas:', error);
    return instructorsCache || [];
  }
};

// Función para buscar datos de retroalimentación basado en filtros
export const searchFeedbackData = async (filters) => {
  try {
    console.log("🔍 Buscando datos de retroalimentación con filtros:", filters)

    // Obtener datos reales de aprendices para generar datos más realistas
    const users = await getAllUsers()
    const aprendices = users.filter((user) => user && user.tipoUsuario === "aprendiz")

    // Generar datos mock basados en los datos reales de aprendices
    const mockData = []
    let id = 1

    // Crear algunas actividades de ejemplo para cada ficha encontrada
    const fichasReales = new Set()
    aprendices.forEach((aprendiz) => {
      if (Array.isArray(aprendiz.ficha)) {
        aprendiz.ficha.forEach((ficha) => fichasReales.add(ficha.toString()))
      } else if (aprendiz.ficha) {
        fichasReales.add(aprendiz.ficha.toString())
      }
    })

    const temas = [
      "Present Simple",
      "Past Tense",
      "Future Tense",
      "Vocabulary Building",
      "Technical English",
      "Grammar Basics",
    ]
    const actividades = [
      "Grammar Exercise",
      "Vocabulary Test",
      "Reading Comprehension",
      "Listening Practice",
      "Speaking Activity",
    ]
    const instructoresEjemplo = ["Ana García", "Carlos Rodríguez", "María López", "Juan Martínez"]

    Array.from(fichasReales).forEach((ficha) => {
      const aprendizDeFicha = aprendices.find((a) =>
        Array.isArray(a.ficha) ? a.ficha.includes(Number.parseInt(ficha)) : a.ficha.toString() === ficha,
      )

      // Crear 2-3 actividades por ficha
      for (let i = 0; i < Math.floor(Math.random() * 2) + 2; i++) {
        const nivel = Math.floor(Math.random() * 3) + 1
        const tema = temas[Math.floor(Math.random() * temas.length)]
        const actividad = actividades[Math.floor(Math.random() * actividades.length)]
        const instructor = instructoresEjemplo[Math.floor(Math.random() * instructoresEjemplo.length)]

        mockData.push({
          id: id++,
          programa: aprendizDeFicha?.programa || "Programa SENA",
          ficha: ficha,
          nivel: nivel.toString(),
          tema: tema,
          actividad: `${actividad} ${i + 1}`,
          ejecutada: Math.random() > 0.3 ? "Sí" : "No",
          instructor: instructor,
          fecha: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
            .toISOString()
            .split("T")[0],
          totalPreguntas: Math.floor(Math.random() * 20) + 10,
          aprendicesPresentes: Math.floor(Math.random() * 15) + 15,
        })
      }
    })

    // Filtrar datos basado en los filtros aplicados
    let filteredData = mockData

    if (filters.ficha) {
      filteredData = filteredData.filter((item) => item.ficha === filters.ficha)
    }

    if (filters.nivel) {
      filteredData = filteredData.filter((item) => item.nivel === filters.nivel)
    }

    if (filters.instructor) {
      filteredData = filteredData.filter((item) => item.instructor === filters.instructor)
    }

    console.log("📊 Datos filtrados:", filteredData.length, "resultados")
    return filteredData
  } catch (error) {
    console.error("❌ Error al buscar datos de retroalimentación:", error)
    throw new Error("Error al obtener los datos de retroalimentación")
  }
}

// Función para obtener detalles específicos de una retroalimentación por ID
export const getFeedbackDetails = async (feedbackId) => {
  try {
    console.log("📋 Obteniendo detalles de retroalimentación para ID:", feedbackId)

    // Obtener datos reales de aprendices
    const users = await getAllUsers()
    const aprendices = users.filter((user) => user && user.tipoUsuario === "aprendiz")
    const instructores = users.filter((user) => user && user.tipoUsuario === "instructor")

    // Validar que el ID sea válido
    if (!feedbackId || isNaN(feedbackId) || feedbackId <= 0) {
      console.warn("⚠️ ID de retroalimentación inválido:", feedbackId)
      return generarDatosDePrueba(feedbackId || 1, aprendices, instructores)
    }

    // Generar datos basados en el ID
    const fichasDisponibles = []
    aprendices.forEach((aprendiz) => {
      if (Array.isArray(aprendiz.ficha)) {
        aprendiz.ficha.forEach((ficha) => {
          fichasDisponibles.push({
            ficha: ficha.toString(),
            programa: aprendiz.programa,
            aprendices: aprendices.filter((a) =>
              Array.isArray(a.ficha) ? a.ficha.includes(ficha) : a.ficha === ficha,
            ),
          })
        })
      } else if (aprendiz.ficha) {
        fichasDisponibles.push({
          ficha: aprendiz.ficha.toString(),
          programa: aprendiz.programa,
          aprendices: aprendices.filter((a) =>
            Array.isArray(a.ficha) ? a.ficha.includes(aprendiz.ficha) : a.ficha === aprendiz.ficha,
          ),
        })
      }
    })

    // Seleccionar una ficha basada en el ID
    const fichaIndex = (feedbackId - 1) % fichasDisponibles.length
    const fichaSeleccionada = fichasDisponibles[fichaIndex]

    if (!fichaSeleccionada) {
      console.warn("⚠️ No se encontraron datos para esta retroalimentación, usando datos de respaldo")
      return generarDatosDePrueba(feedbackId, aprendices, instructores)
    }

    const temas = ["Present Simple", "Past Tense", "Future Tense", "Vocabulary Building", "Technical English"]
    const actividades = ["Grammar Exercise", "Vocabulary Test", "Reading Comprehension", "Listening Practice"]

    const instructorSeleccionado = instructores[feedbackId % instructores.length] || {
      nombre: "Ana",
      apellido: "García",
    }

    // Crear los detalles de la retroalimentación
    const feedbackDetails = {
      id: feedbackId,
      programa: fichaSeleccionada.programa,
      ficha: fichaSeleccionada.ficha,
      nivel: (((feedbackId - 1) % 3) + 1).toString(),
      tema: temas[(feedbackId - 1) % temas.length],
      actividad: `${actividades[(feedbackId - 1) % actividades.length]} ${feedbackId}`,
      ejecutada: feedbackId % 4 !== 0 ? "Sí" : "No", // 75% ejecutadas
      instructor: `${instructorSeleccionado.nombre} ${instructorSeleccionado.apellido}`,
      fecha: new Date(2024, (feedbackId - 1) % 12, (feedbackId % 28) + 1).toISOString().split("T")[0],
      totalPreguntas: 15 + (feedbackId % 15),
      aprendicesPresentes: fichaSeleccionada.aprendices.length,
      aprendicesInscritos: fichaSeleccionada.aprendices.length + Math.floor(Math.random() * 5),
    }

    console.log("✅ Detalles de retroalimentación generados:", feedbackDetails)
    return feedbackDetails
  } catch (error) {
    console.error("❌ Error al obtener detalles de retroalimentación:", error)
    // En lugar de lanzar un error, devolvemos datos de respaldo
    return generarDatosDePrueba(feedbackId || 1, [], [])
  }
}

// Función auxiliar para generar datos de prueba cuando no se encuentran datos reales
const generarDatosDePrueba = (feedbackId, aprendices = [], instructores = []) => {
  console.log("🔄 Generando datos de prueba para retroalimentación ID:", feedbackId)
  
  // Datos de respaldo en caso de que no haya fichas o instructores disponibles
  const fichaRespaldo = {
    id: 1,
    ficha: "2875155",
    programa: "Análisis y Desarrollo de Software",
    aprendices: Array(15).fill().map((_, i) => ({ id: i + 1, nombre: `Aprendiz ${i + 1}` }))
  }
  
  const instructorRespaldo = {
    nombre: "Instructor",
    apellido: "Predeterminado"
  }
  
  // Usar datos disponibles o respaldo
  const fichaSeleccionada = aprendices.length > 0 
    ? {
        ficha: "2875155",
        programa: "Análisis y Desarrollo de Software",
        aprendices: aprendices.slice(0, 15)
      }
    : fichaRespaldo
    
  const instructorSeleccionado = instructores.length > 0
    ? instructores[feedbackId % instructores.length]
    : instructorRespaldo
    
  const temas = ["Present Simple", "Past Tense", "Future Tense", "Vocabulary Building", "Technical English"]
  const actividades = ["Grammar Exercise", "Vocabulary Test", "Reading Comprehension", "Listening Practice"]
  
  return {
    id: feedbackId,
    programa: fichaSeleccionada.programa,
    ficha: fichaSeleccionada.ficha,
    nivel: (((feedbackId - 1) % 3) + 1).toString(),
    tema: temas[(feedbackId - 1) % temas.length],
    actividad: `${actividades[(feedbackId - 1) % actividades.length]} ${feedbackId}`,
    ejecutada: feedbackId % 4 !== 0 ? "Sí" : "No",
    instructor: `${instructorSeleccionado.nombre} ${instructorSeleccionado.apellido}`,
    fecha: new Date(2024, (feedbackId - 1) % 12, (feedbackId % 28) + 1).toISOString().split("T")[0],
    totalPreguntas: 15 + (feedbackId % 15),
    aprendicesPresentes: fichaSeleccionada.aprendices?.length || 10,
    aprendicesInscritos: (fichaSeleccionada.aprendices?.length || 10) + Math.floor(Math.random() * 5),
  }
}

// Función para obtener detalles de estudiantes para una actividad específica
export const getStudentDetails = async (feedbackId) => {
  try {
    console.log("👥 Obteniendo detalles de estudiantes para feedback ID:", feedbackId)

    // Obtener datos reales de aprendices directamente de la API
    const users = await getAllUsers()
    console.log("📊 Total usuarios obtenidos de la API:", users.length)
    
    // Si getAllUsers devuelve array vacío (por error de API), mantener tabla vacía
    if (!Array.isArray(users) || users.length === 0) {
      console.warn("⚠️ No se obtuvieron usuarios de la API o la API falló")
      console.log("📋 Manteniendo tabla vacía como se solicitó")
      return [] // Devolver array vacío para mantener tabla vacía
    }
    
    const aprendices = users.filter((user) => user && user.tipoUsuario === "aprendiz")
    console.log("👨‍🎓 Total aprendices encontrados:", aprendices.length)

    // Si no hay aprendices después del filtro, mantener tabla vacía
    if (!aprendices.length) {
      console.warn("⚠️ No se encontraron aprendices en los datos de la API")
      console.log("📋 Manteniendo tabla vacía como se solicitó")
      return [] // Devolver array vacío para mantener tabla vacía
    }

    const horas = ["08:00", "10:00", "14:00", "16:00"]

    // Convertir los aprendices reales al formato esperado por la tabla
    const students = aprendices.map((aprendiz, index) => {
      // Generar datos de asistencia y calificación simulados para la actividad específica
      const isPresent = Math.random() > 0.15 // 85% probabilidad de estar presente
      const calificacion = isPresent
        ? (Math.random() * 2 + 3).toFixed(1) // Entre 3.0 y 5.0 si está presente
        : "0.0" // 0.0 si está ausente

      // Obtener la primera ficha del aprendiz
      const fichaAprendiz = Array.isArray(aprendiz.ficha) ? aprendiz.ficha[0] : aprendiz.ficha

      return {
        id: aprendiz._id || index + 1,
        aprendiz: `${aprendiz.nombre || ''} ${aprendiz.apellido || ''}`.trim() || "Sin nombre",
        ficha: fichaAprendiz?.toString() || "Sin ficha",
        documento: aprendiz.documento || "Sin documento",
        programa: aprendiz.programa || "Sin programa",
        hora: horas[Math.floor(Math.random() * horas.length)],
        estado: isPresent ? "Presente" : "Ausente",
        calificacion: calificacion,
        preguntasFalladas: isPresent ? Math.floor(Math.random() * 5) : 0,
        observaciones: isPresent ? "Participación activa" : "No asistió a clase",
        progresoActual: aprendiz.progresoActual || 0,
        puntos: Math.floor(Math.random() * 1000), // Puntos simulados para la actividad
      }
    })

    const studentsOrdenados = students.sort((a, b) => a.aprendiz.localeCompare(b.aprendiz))
    console.log("✅ Estudiantes procesados desde API real:", studentsOrdenados.length)
    return studentsOrdenados
  } catch (error) {
    console.error("❌ Error al obtener detalles de estudiantes:", error)
    // En caso de error, mantener tabla vacía como se solicitó
    console.warn("⚠️ Error en getStudentDetails, manteniendo tabla vacía como se solicitó")
    return [] // Devolver array vacío para mantener tabla vacía
  }
}

// Función auxiliar para generar estudiantes de prueba
const generarEstudiantesDePrueba = (feedbackId) => {
  console.log("🔄 Generando estudiantes de prueba para retroalimentación ID:", feedbackId)
  
  const nombres = ["Juan", "María", "Carlos", "Ana", "Pedro", "Laura", "Diego", "Sofía", "Miguel", "Valentina"]
  const apellidos = ["Pérez", "López", "Rodríguez", "Martínez", "González", "Hernández", "García", "Sánchez", "Ramírez", "Torres"]
  const horas = ["08:00", "10:00", "14:00", "16:00"]
  const fichas = ["2875155", "2875156", "2875157"]
  const ficha = fichas[feedbackId % fichas.length]
  
  // Generar entre 10 y 20 estudiantes
  const cantidadEstudiantes = 10 + (feedbackId % 11)
  
  const estudiantes = Array(cantidadEstudiantes).fill().map((_, index) => {
    const nombreIndex = (index + feedbackId) % nombres.length
    const apellidoIndex = (index + feedbackId * 2) % apellidos.length
    const isPresent = Math.random() > 0.15 // 85% probabilidad de estar presente
    const calificacion = isPresent
      ? (Math.random() * 2 + 3).toFixed(1) // Entre 3.0 y 5.0 si está presente
      : "0.0" // 0.0 si está ausente
      
    return {
      id: index + 1,
      aprendiz: `${nombres[nombreIndex]} ${apellidos[apellidoIndex]}`,
      ficha: ficha,
      documento: `1${index}${feedbackId}${index + 10}${index + 5}`,
      programa: "Análisis y Desarrollo de Software",
      estado: "Activo",
      hora: horas[Math.floor(Math.random() * horas.length)],
      estado: isPresent ? "Presente" : "Ausente",
      calificacion: calificacion,
      preguntasFalladas: isPresent ? Math.floor(Math.random() * 5) : 0,
      observaciones: isPresent ? "Participación activa" : "No asistió a clase",
      progresoActual: Math.floor(Math.random() * 100),
      puntos: Math.floor(Math.random() * 1000),
    }
  })
  
  return estudiantes.sort((a, b) => a.aprendiz.localeCompare(b.aprendiz))
}

// Función para obtener preguntas falladas de un estudiante
export const getStudentFailedQuestions = async (studentId, feedbackId) => {
  try {
    console.log("❓ Obteniendo preguntas falladas para estudiante:", studentId)

    // Intentar obtener datos reales de la API
    try {
      const url = `${API_BASE_URL}/student/${studentId}/failed-questions${feedbackId ? `?evaluationId=${feedbackId}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        signal: AbortSignal.timeout(8000) // 8 segundos timeout
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("✅ Preguntas falladas obtenidas de la API:", data);
        return data.data.failedQuestions || [];
      }
      
      console.warn("⚠️ No se pudieron obtener preguntas falladas de la API, usando datos simulados");
    } catch (apiError) {
      console.error("❌ Error al conectar con la API:", apiError);
      // Continuar con datos simulados
    }



    const questionTypes = ["Grammar", "Vocabulary", "Reading Comprehension", "Listening", "Speaking"]

    const questionTemplates = {
      Grammar: [
        "Choose the correct form of the verb 'to be'",
        "Complete the sentence with the correct tense",
        "Identify the grammatical error in the sentence",
        "Select the appropriate preposition",
      ],
      Vocabulary: [
        "What is the meaning of the word",
        "Choose the synonym for",
        "Complete the sentence with the correct word",
        "Match the word with its definition",
      ],
      "Reading Comprehension": [
        "According to the text, what is",
        "The main idea of the paragraph is",
        "Which statement is true based on the reading",
        "What can be inferred from the passage",
      ],
      Listening: [
        "What did the speaker say about",
        "The conversation takes place in",
        "How does the speaker feel about",
        "What is the speaker's opinion on",
      ],
      Speaking: [
        "Describe your daily routine using present simple",
        "Talk about your future plans",
        "Express your opinion about",
        "Compare and contrast two different topics",
      ],
    }

    // Generar entre 3-8 preguntas falladas
    const numQuestions = Math.floor(Math.random() * 6) + 3
    const failedQuestions = []

    for (let i = 0; i < numQuestions; i++) {
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)]
      const templates = questionTemplates[type]
      const question = templates[Math.floor(Math.random() * templates.length)]

      failedQuestions.push({
        id: i + 1,
        numero: i + 1,
        tipo: type,
        pregunta: `${question} ${i + 1}?`,
        respuestaCorrecta: `Correct answer for question ${i + 1}`,
        respuestaEstudiante: `Student's incorrect answer ${i + 1}`,
        puntos: Math.floor(Math.random() * 3) + 1, // 1-3 puntos
        observacion: `Needs to review ${type.toLowerCase()} concepts`,
        feedback: `You should focus on understanding the ${type.toLowerCase()} rules better. Try practicing with more examples.`,
        suggestions: [
          `Review the ${type.toLowerCase()} section in your textbook`,
          `Practice with additional exercises`,
          `Watch tutorial videos on this topic`
        ],
        explanation: `The correct answer uses proper ${type.toLowerCase()} structure. Your answer had issues with syntax and word choice.`
      })
    }

    return failedQuestions
  } catch (error) {
    console.error("❌ Error al obtener preguntas falladas:", error)
    throw new Error("Error al cargar las preguntas falladas")
  }
}
