// Servicio para manejar las operaciones de retroalimentación
const API_BASE_URL = "http://localhost:3000/api"

// Función para obtener todos los usuarios desde la API
const getAllUsers = async () => {
  console.log("🌐 Intentando conectar con:", `${API_BASE_URL}/user`)

  try {
    const response = await fetch(`${API_BASE_URL}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Agregar timeout
      signal: AbortSignal.timeout(10000), // 10 segundos timeout
    })

    console.log("📡 Respuesta de la API:", response.status, response.statusText)

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
    }

    const data = await response.json()
    console.log("📦 Datos recibidos:", data?.length || 0, "usuarios")
    return data || []
  } catch (error) {
    console.error("🚨 Error en getAllUsers:", error.message)
    if (error.name === "TimeoutError") {
      throw new Error("Timeout: La API no responde")
    }
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("No se puede conectar con el servidor. Verifique que esté ejecutándose en http://localhost:3000")
    }
    throw error
  }
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
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
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

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1500))

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

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 800))

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
      throw new Error("No se encontraron datos para esta retroalimentación")
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
    throw new Error("Error al cargar los detalles de la retroalimentación")
  }
}

// Función para obtener detalles de estudiantes para una actividad específica
export const getStudentDetails = async (feedbackId) => {
  try {
    console.log("👥 Obteniendo detalles de estudiantes para feedback ID:", feedbackId)

    // Obtener datos reales de aprendices
    const users = await getAllUsers()
    const aprendices = users.filter((user) => user && user.tipoUsuario === "aprendiz")

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Obtener los detalles de la retroalimentación para saber qué ficha usar
    const feedbackDetails = await getFeedbackDetails(feedbackId)

    // Filtrar aprendices de la ficha específica
    const aprendicesDeLaFicha = aprendices.filter((aprendiz) => {
      if (Array.isArray(aprendiz.ficha)) {
        return aprendiz.ficha.includes(Number.parseInt(feedbackDetails.ficha))
      }
      return aprendiz.ficha?.toString() === feedbackDetails.ficha
    })

    console.log(`👨‍🎓 Aprendices encontrados para ficha ${feedbackDetails.ficha}:`, aprendicesDeLaFicha.length)

    const horas = ["08:00", "10:00", "14:00", "16:00"]

    const students = aprendicesDeLaFicha.map((aprendiz, index) => {
      const isPresent = Math.random() > 0.15 // 85% probabilidad de estar presente
      const calificacion = isPresent
        ? (Math.random() * 2 + 3).toFixed(1) // Entre 3.0 y 5.0 si está presente
        : "0.0" // 0.0 si está ausente

      // Obtener la primera ficha del aprendiz
      const fichaAprendiz = Array.isArray(aprendiz.ficha) ? aprendiz.ficha[0] : aprendiz.ficha

      return {
        id: index + 1,
        aprendiz: `${aprendiz.nombre} ${aprendiz.apellido}`,
        ficha: fichaAprendiz?.toString() || "Sin ficha",
        documento: aprendiz.documento || "Sin documento",
        programa: aprendiz.programa || "Sin programa",
        estado: aprendiz.estado || "Activo",
        hora: horas[Math.floor(Math.random() * horas.length)],
        estado: isPresent ? "Presente" : "Ausente",
        calificacion: calificacion,
        preguntasFalladas: isPresent ? Math.floor(Math.random() * 5) : 0,
        observaciones: isPresent ? "Participación activa" : "No asistió a clase",
        progresoActual: aprendiz.progresoActual || 0,
        puntos: aprendiz.puntos || 0,
      }
    })

    const studentsOrdenados = students.sort((a, b) => a.aprendiz.localeCompare(b.aprendiz))
    console.log("✅ Estudiantes procesados:", studentsOrdenados.length)
    return studentsOrdenados
  } catch (error) {
    console.error("❌ Error al obtener detalles de estudiantes:", error)
    throw new Error("Error al cargar los detalles de los estudiantes")
  }
}

// Función para obtener preguntas falladas de un estudiante
export const getStudentFailedQuestions = async (studentId, feedbackId) => {
  try {
    console.log("❓ Obteniendo preguntas falladas para estudiante:", studentId)

    // Simular delay de API
    await new Promise((resolve) => setTimeout(resolve, 800))

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
      })
    }

    return failedQuestions
  } catch (error) {
    console.error("❌ Error al obtener preguntas falladas:", error)
    throw new Error("Error al cargar las preguntas falladas")
  }
}
