const LOCAL_API_BASE_URL = "http://localhost:3000/api"

const localApiHeaders = {
  "Content-Type": "application/json",
}

// Servicio principal para obtener todos los datos desde la API local
export const getStudentPoints = async () => {
  try {
    console.log("🔄 Fetching all data from local API...")
    const response = await fetch(`${LOCAL_API_BASE_URL}/user`, {
      method: "GET",
      headers: localApiHeaders,
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    console.log("✅ Data fetched successfully:", Array.isArray(data) ? data.length : 0)

    // Filtrar solo aprendices
    const aprendices = Array.isArray(data) ? data.filter((user) => user.tipoUsuario === "aprendiz") : []

    console.log("👨‍🎓 Aprendices filtered:", aprendices.length)

    return {
      success: true,
      data: aprendices,
    }
  } catch (error) {
    console.error("❌ Error fetching data from local API:", error)
    console.log("🔧 Using test data instead...")

    // Datos de prueba cuando la API local no está disponible
    const testData = [
      {
        _id: "test1",
        tipoUsuario: "aprendiz",
        nombre: "ADRIANA",
        apellido: "GOMEZ",
        documento: "1234567890",
        estado: "Activo",
        puntos: 200,
        ficha: ["2875155"],
        programa: "COORDINACION DE SERVICIOS HOTELEROS",
      },
      {
        _id: "test2",
        tipoUsuario: "aprendiz",
        nombre: "ALBA NURIS",
        apellido: "MORALES",
        documento: "1234567891",
        estado: "Activo",
        puntos: 195,
        ficha: ["2875156"],
        programa: "ADSO",
      },
      {
        _id: "test3",
        tipoUsuario: "aprendiz",
        nombre: "ALEJANDRA",
        apellido: "BOTERO",
        documento: "1234567892",
        estado: "Activo",
        puntos: 190,
        ficha: ["2875155"],
        programa: "COORDINACION DE SERVICIOS HOTELEROS",
      },
      {
        _id: "test4",
        tipoUsuario: "aprendiz",
        nombre: "ALEXANDER",
        apellido: "VIDALES",
        documento: "1234567893",
        estado: "Activo",
        puntos: 185,
        ficha: ["2875157"],
        programa: "MULTIMEDIA",
      },
      {
        _id: "test5",
        tipoUsuario: "aprendiz",
        nombre: "ANA MARIA",
        apellido: "DURAN",
        documento: "1234567894",
        estado: "Activo",
        puntos: 180,
        ficha: ["2875156"],
        programa: "ADSO",
      },
      {
        _id: "test6",
        tipoUsuario: "aprendiz",
        nombre: "CARLOS",
        apellido: "RODRIGUEZ",
        documento: "1234567895",
        estado: "Activo",
        puntos: 175,
        ficha: ["2875155"],
        programa: "COORDINACION DE SERVICIOS HOTELEROS",
      },
      {
        _id: "test7",
        tipoUsuario: "aprendiz",
        nombre: "DIANA",
        apellido: "MARTINEZ",
        documento: "1234567896",
        estado: "Activo",
        puntos: 170,
        ficha: ["2875158"],
        programa: "DISEÑO GRAFICO",
      },
      {
        _id: "test8",
        tipoUsuario: "aprendiz",
        nombre: "EDUARDO",
        apellido: "LOPEZ",
        documento: "1234567897",
        estado: "Activo",
        puntos: 165,
        ficha: ["2875156"],
        programa: "ADSO",
      },
      {
        _id: "test9",
        tipoUsuario: "aprendiz",
        nombre: "FERNANDA",
        apellido: "GARCIA",
        documento: "1234567898",
        estado: "Activo",
        puntos: 160,
        ficha: ["2875157"],
        programa: "MULTIMEDIA",
      },
      {
        _id: "test10",
        tipoUsuario: "aprendiz",
        nombre: "GABRIEL",
        apellido: "TORRES",
        documento: "1234567899",
        estado: "Activo",
        puntos: 155,
        ficha: ["2875159"],
        programa: "CONTABILIDAD",
      },
      {
        _id: "test11",
        tipoUsuario: "aprendiz",
        nombre: "HELENA",
        apellido: "VARGAS",
        documento: "1234567800",
        estado: "Activo",
        puntos: 150,
        ficha: ["2875155"],
        programa: "COORDINACION DE SERVICIOS HOTELEROS",
      },
      {
        _id: "test12",
        tipoUsuario: "aprendiz",
        nombre: "IVAN",
        apellido: "CASTRO",
        documento: "1234567801",
        estado: "Activo",
        puntos: 145,
        ficha: ["2875158"],
        programa: "DISEÑO GRAFICO",
      },
      {
        _id: "test13",
        tipoUsuario: "aprendiz",
        nombre: "JULIANA",
        apellido: "HERRERA",
        documento: "1234567802",
        estado: "Activo",
        puntos: 140,
        ficha: ["2875156"],
        programa: "ADSO",
      },
      {
        _id: "test14",
        tipoUsuario: "aprendiz",
        nombre: "KEVIN",
        apellido: "MORENO",
        documento: "1234567803",
        estado: "Activo",
        puntos: 135,
        ficha: ["2875160"],
        programa: "MERCADEO",
      },
      {
        _id: "test15",
        tipoUsuario: "aprendiz",
        nombre: "LAURA",
        apellido: "JIMENEZ",
        documento: "1234567804",
        estado: "Activo",
        puntos: 130,
        ficha: ["2875157"],
        programa: "MULTIMEDIA",
      },
    ]

    return {
      success: true,
      data: testData,
      isTestData: true,
    }
  }
}

// Función helper para obtener nombre completo del estudiante
export const getStudentFullName = (student) => {
  if (student.nombre && student.apellido) {
    return `${student.nombre} ${student.apellido}`.trim()
  }
  return student.nombre || `Estudiante ${student.documento || "N/A"}`
}

// Función para obtener fichas del estudiante
export const getStudentFichas = (student) => {
  if (student.ficha && Array.isArray(student.ficha)) {
    return student.ficha
  }
  return []
}

// Función para obtener el programa del estudiante
export const getStudentProgram = (student) => {
  return student.programa || "N/A"
}

// Función para extraer fichas únicas de los datos de estudiantes activos
export const getUniqueFichas = (students) => {
  const uniqueFichas = new Set()

  console.log('🔍 getUniqueFichas - Total students:', students?.length)
  
  // Filtrar solo aprendices (temporalmente sin filtro de estado para debug)
  const activeStudents = students.filter(
    (student) => student.tipoUsuario === "aprendiz"
  )
  
  console.log('🎓 Filtered aprendices:', activeStudents.length)
  console.log('📋 Sample student states:', activeStudents.slice(0, 3).map(s => ({ nombre: s.nombre, estado: s.estado, tipoUsuario: s.tipoUsuario })))

  activeStudents.forEach((student) => {
    const fichas = getStudentFichas(student)
    console.log(`👤 Student ${student.nombre} fichas:`, fichas)
    fichas.forEach((ficha) => {
      if (ficha) {
        uniqueFichas.add(ficha)
      }
    })
  })

  const result = Array.from(uniqueFichas)
    .sort()
    .map((ficha) => ({
      id: ficha,
      name: `Ficha ${ficha}`,
      code: ficha,
    }))
    
  console.log('🏫 Final unique fichas:', result)
  return result
}

// Función para extraer programas únicos de los datos de estudiantes activos
export const getUniqueProgramas = (students) => {
  const uniqueProgramas = new Set()

  // Filtrar solo aprendices activos
  const activeStudents = students.filter(
    (student) => student.tipoUsuario === "aprendiz" && 
    (student.estado === "En formación" || student.estado === "Activo")
  )

  activeStudents.forEach((student) => {
    const programa = getStudentProgram(student)
    if (programa !== "N/A") {
      uniqueProgramas.add(programa)
    }
  })

  return Array.from(uniqueProgramas)
    .sort()
    .map((programa) => ({
      id: programa,
      name: programa,
      code: programa.replace(/\s+/g, "_").toUpperCase(),
    }))
}

// Función para obtener fichas activas relacionadas con un programa específico
export const getFichasByPrograma = (students, programa) => {
  const fichasRelacionadas = new Set()

  students
    .filter((student) => 
      student.tipoUsuario === "aprendiz" && 
      student.estado === "En formación" &&
      getStudentProgram(student) === programa
    )
    .forEach((student) => {
      const fichas = getStudentFichas(student)
      fichas.forEach((ficha) => {
        if (ficha) {
          fichasRelacionadas.add(ficha)
        }
      })
    })

  return Array.from(fichasRelacionadas)
    .sort()
    .map((ficha) => ({
      id: ficha,
      name: `Ficha ${ficha}`,
      code: ficha,
    }))
}

// Función para obtener programas activos relacionados con una ficha específica
export const getProgramasByFicha = (students, ficha) => {
  const programasRelacionados = new Set()

  students
    .filter((student) => {
      const fichas = getStudentFichas(student)
      return student.tipoUsuario === "aprendiz" && 
             student.estado === "En formación" &&
             fichas.includes(ficha)
    })
    .forEach((student) => {
      const programa = getStudentProgram(student)
      if (programa !== "N/A") {
        programasRelacionados.add(programa)
      }
    })

  return Array.from(programasRelacionados)
    .sort()
    .map((programa) => ({
      id: programa,
      name: programa,
      code: programa.replace(/\s+/g, "_").toUpperCase(),
    }))
}

// Servicio para obtener estudiantes por ficha específica
export const getStudentsByFicha = async (fichaCode) => {
  try {
    const response = await getStudentPoints()

    if (response.success && response.data) {
      const filteredStudents = response.data.filter((student) => {
        const fichas = getStudentFichas(student)
        return fichas.includes(fichaCode)
      })

      console.log(`🎯 Students filtered by ficha ${fichaCode}:`, filteredStudents.length)

      return {
        success: true,
        data: filteredStudents,
        message: `Estudiantes de la ficha ${fichaCode} obtenidos exitosamente`,
      }
    }

    return response
  } catch (error) {
    console.error("Error fetching students by ficha:", error)
    throw error
  }
}

// Servicio para obtener estudiantes por programa específico
export const getStudentsByPrograma = async (programa) => {
  try {
    const response = await getStudentPoints()

    if (response.success && response.data) {
      const filteredStudents = response.data.filter((student) => {
        const studentPrograma = getStudentProgram(student)
        return studentPrograma === programa
      })

      console.log(`🎯 Students filtered by programa ${programa}:`, filteredStudents.length)

      return {
        success: true,
        data: filteredStudents,
        message: `Estudiantes del programa ${programa} obtenidos exitosamente`,
      }
    }

    return response
  } catch (error) {
    console.error("Error fetching students by programa:", error)
    throw error
  }
}

// Servicio para obtener métricas del ranking
export const getRankingMetrics = async () => {
  try {
    console.log("🚀 Starting getRankingMetrics...")

    const pointsResponse = await getStudentPoints()

    if (!pointsResponse.success) {
      throw new Error("No se pudo conectar a la API local")
    }

    const studentsWithPoints = pointsResponse.data || []
    console.log("📊 Students loaded:", studentsWithPoints.length)

    // Extraer fichas y programas únicos de los datos de estudiantes
    const uniqueFichas = getUniqueFichas(studentsWithPoints)
    const uniqueProgramas = getUniqueProgramas(studentsWithPoints)

    console.log("🏫 Unique fichas found:", uniqueFichas.length)
    console.log("📚 Unique programas found:", uniqueProgramas.length)

    const metrics = {
      aprendices: studentsWithPoints.length,
      fichas: uniqueFichas.length,
      programas: uniqueProgramas.length,
    }

    console.log("✅ Metrics calculated:", metrics)

    return {
      success: true,
      data: metrics,
      courses: uniqueFichas, // Para compatibilidad
      students: studentsWithPoints,
      programs: uniqueProgramas, // Para compatibilidad
      fichas: uniqueFichas,
      programas: uniqueProgramas,
      pointsData: studentsWithPoints,
    }
  } catch (error) {
    console.error("❌ Error fetching ranking metrics:", error)
    throw error
  }
}

// Función para generar ranking real basado en datos de la API local
export const generateRealRanking = (students, type = "general", filterValue = null, yearFilter = null, monthFilter = null) => {
  console.log(
    `🎯 generateRealRanking called with ${students?.length || 0} students, type: ${type}, filter: ${filterValue}, year: ${yearFilter}, month: ${monthFilter}`,
  )

  if (!students || students.length === 0) {
    console.log("❌ No students provided to generateRealRanking")
    return []
  }

  let filteredStudents = [...students]

  // Filtrar solo estudiantes activos y que sean aprendices
  console.log('🔍 generateRealRanking - Before filtering:', filteredStudents.length)
  console.log('🔍 Sample student states before filter:', filteredStudents.slice(0, 3).map(s => ({ nombre: s.nombre, estado: s.estado, tipoUsuario: s.tipoUsuario })))
  
  // Temporalmente sin filtro de estado para debug
  filteredStudents = filteredStudents.filter(
    (student) => student.tipoUsuario === "aprendiz"
  )
  
  console.log('🔍 generateRealRanking - After filtering:', filteredStudents.length)

  // Filtrar por año y mes si se proporcionan
  if (yearFilter || monthFilter) {
    filteredStudents = filteredStudents.filter((student) => {
      if (!student.createdAt) return false
      
      const studentDate = new Date(student.createdAt)
      const studentYear = studentDate.getFullYear()
      const studentMonth = studentDate.getMonth() + 1 // getMonth() returns 0-11
      
      let yearMatch = true
      let monthMatch = true
      
      if (yearFilter) {
        yearMatch = studentYear === yearFilter
      }
      
      if (monthFilter && monthFilter !== "") {
        // Convertir nombre del mes a número
        const monthNames = {
          "Enero": 1, "Febrero": 2, "Marzo": 3, "Abril": 4,
          "Mayo": 5, "Junio": 6, "Julio": 7, "Agosto": 8,
          "Septiembre": 9, "Octubre": 10, "Noviembre": 11, "Diciembre": 12
        }
        const monthNumber = monthNames[monthFilter]
        if (monthNumber) {
          monthMatch = studentMonth === monthNumber
        }
      }
      
      return yearMatch && monthMatch
    })
    
    console.log(`🗓️ Students after date filter (${yearFilter}/${monthFilter}): ${filteredStudents.length}`)
  }

  console.log(`🔍 Active apprentices after filtering: ${filteredStudents.length}`)

  // Aplicar filtros específicos
  if (type === "ficha" && filterValue) {
    filteredStudents = filteredStudents.filter((student) => {
      const fichas = getStudentFichas(student)
      return fichas.includes(filterValue.toString())
    })
    console.log(`🎯 Students after ficha filter (${filterValue}): ${filteredStudents.length}`)
  } else if (type === "programa" && filterValue) {
    filteredStudents = filteredStudents.filter((student) => {
      const programa = getStudentProgram(student)
      return programa === filterValue
    })
    console.log(`🎯 Students after programa filter (${filterValue}): ${filteredStudents.length}`)
  }

  // Mapear a formato de ranking
  const rankingData = filteredStudents.map((student) => {
    const puntos = Number.parseInt(student.puntos) || 0
    const nombre = getStudentFullName(student)
    const fichas = getStudentFichas(student)

    const studentData = {
      nombre: nombre,
      puntos: puntos,
      ficha: fichas.length > 0 ? fichas[0] : "N/A", // Primera ficha para compatibilidad
      fichas: fichas, // Todas las fichas
      programa: getStudentProgram(student),
      estado: student.estado || "N/A",
      documento: student.documento || "N/A",
      nivel: student.nivel || 1,
      progreso: student.progresoActual || 0,
      tipoUsuario: student.tipoUsuario || "aprendiz",
    }

    return studentData
  })

  // Filtrar estudiantes con puntos válidos (mayor a 0)
  const validStudents = rankingData.filter((student) => student.puntos > 0)
  console.log(`🏆 Students with valid points: ${validStudents.length}`)

  // Ordenar por puntos de mayor a menor, luego por nombre para desempatar
  const sortedRanking = validStudents
    .sort((a, b) => {
      if (b.puntos !== a.puntos) {
        return b.puntos - a.puntos
      }
      return a.nombre.localeCompare(b.nombre)
    })
    .map((student, index) => ({
      ...student,
      posicion: index + 1,
    }))

  console.log(`🏆 Final ranking generated: ${sortedRanking.length} students`)
  if (sortedRanking.length > 0) {
    console.log(
      `🎯 Top 3 with points:`,
      sortedRanking.slice(0, 3).map((s) => `${s.nombre}: ${s.puntos} pts`),
    )
  }

  return sortedRanking
}

// Funciones legacy mantenidas para compatibilidad
export const getCourses = async () => {
  const response = await getStudentPoints()
  if (response.success) {
    const fichas = getUniqueFichas(response.data)
    return { data: fichas }
  }
  return { data: [] }
}

export const getPrograms = async () => {
  const response = await getStudentPoints()
  if (response.success) {
    const programas = getUniqueProgramas(response.data)
    return { data: programas }
  }
  return { data: [] }
}

export const getStudents = async () => {
  return await getStudentPoints()
}

// Nuevas funciones específicas para la funcionalidad solicitada
export const getStudentsByCourse = getStudentsByFicha
export const getStudentsByProgram = getStudentsByPrograma
