import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, Search, AlertCircle, CheckCircle, X, Brain, MessageCircle } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import GenericTable from "../../../shared/components/Table"
import { getAllUsers } from "../services/feedbackService"
import AIFeedbackPanel from "../components/AIFeedbackPanel"
import ChatMentorPanel from "../components/ChatMentorPanel"

const FeedbackActivities = () => {
  console.log("🚀 Renderizando componente FeedbackActivities")

  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const dropdownRef = useRef(null)
  const [showAIFeedback, setShowAIFeedback] = useState(false)
  const [selectedStudentForAI, setSelectedStudentForAI] = useState(null)
  const [showChatMentor, setShowChatMentor] = useState(false)

  // Estados para datos de estudiantes con actividades
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStudentsWithActivities()
  }, [])

  const loadStudentsWithActivities = async () => {
    try {
      setLoading(true)
      const users = await getAllUsers()
      
      // Filtrar solo aprendices que tengan actividades y transformar datos para la tabla
      let studentsWithActivities = users
        .filter(user => 
          user.tipoUsuario === "aprendiz" && 
          user.actividades && 
          user.actividades.length > 0
        )
        .map(student => {
          const activityStats = calculateActivityStats(student.actividades)
          return {
            id: student._id,
            aprendiz: `${student.nombre} ${student.apellido}`,
            ficha: student.ficha?.[0] || 'N/A',
            programa: student.programa || 'N/A',
            totalActividades: activityStats.total,
            promedio: activityStats.average,
            completadas: activityStats.completed,
            estado: activityStats.average >= 3.0 ? "Aprobado" : "Reprobado",
            studentData: student // Guardar datos completos del estudiante
          }
        })

      // Si no hay datos reales, usar datos de demostración para la presentación
      if (studentsWithActivities.length === 0) {
        console.log("📋 Usando datos de demostración para actividades")
        studentsWithActivities = generateDemoStudentsWithActivities()
      }

      setStudents(studentsWithActivities)
    } catch (err) {
      console.error("Error cargando estudiantes con actividades:", err)
      // En caso de error, usar datos de demostración
      console.log("📋 Usando datos de demostración por error en API")
      setStudents(generateDemoStudentsWithActivities())
    } finally {
      setLoading(false)
    }
  }

  // Función para generar datos de demostración de estudiantes con actividades
  const generateDemoStudentsWithActivities = () => {
    return [
      {
        id: "demo_1",
        aprendiz: "Ana María García López",
        ficha: "2758394",
        programa: "Inglés Técnico para Desarrollo de Software",
        totalActividades: 4,
        promedio: "4.1",
        completadas: 4,
        estado: "Aprobado",
        studentData: {
          _id: "demo_1",
          nombre: "Ana María",
          apellido: "García López",
          correo: "ana.garcia@sena.edu.co",
          tipoUsuario: "aprendiz",
          ficha: ["2758394"],
          programa: "Inglés Técnico para Desarrollo de Software",
          estado: "En formación",
          actividades: [
            {
              _id: "activity_1",
              nombre: "Grammar Practice - Present Perfect",
              fecha: new Date("2024-01-18"),
              calificacion: 4.2,
              estado: "completado",
              retroalimentacion: "Excelente comprensión del presente perfecto. Continúa practicando con ejercicios más complejos.",
              preguntas: [
                {
                  pregunta: "Complete the sentence: 'I _____ lived here for five years.'",
                  respuestaCorrecta: "have",
                  respuestaEstudiante: "have",
                  esCorrecta: true
                },
                {
                  pregunta: "Choose the correct form: 'She _____ finished her homework.'",
                  respuestaCorrecta: "has",
                  respuestaEstudiante: "has",
                  esCorrecta: true
                },
                {
                  pregunta: "What is the past participle of 'write'?",
                  respuestaCorrecta: "written",
                  respuestaEstudiante: "wrote",
                  esCorrecta: false
                }
              ]
            },
            {
              _id: "activity_2",
              nombre: "Vocabulary Building - Tech Terms",
              fecha: new Date("2024-01-22"),
              calificacion: 4.0,
              estado: "completado",
              retroalimentacion: "Buen dominio del vocabulario técnico. Recomiendo practicar más términos de programación.",
              preguntas: [
                {
                  pregunta: "What does 'API' stand for?",
                  respuestaCorrecta: "Application Programming Interface",
                  respuestaEstudiante: "Application Programming Interface",
                  esCorrecta: true
                },
                {
                  pregunta: "Define 'debugging' in software development.",
                  respuestaCorrecta: "The process of finding and fixing errors in code",
                  respuestaEstudiante: "Finding errors in code",
                  esCorrecta: true
                },
                {
                  pregunta: "What is a 'framework' in programming?",
                  respuestaCorrecta: "A pre-written code structure that provides a foundation for developing applications",
                  respuestaEstudiante: "A library of functions",
                  esCorrecta: false
                }
              ]
            },
            {
              _id: "activity_3",
              nombre: "Writing Exercise - Code Documentation",
              fecha: new Date("2024-01-30"),
              calificacion: 4.5,
              estado: "completado",
              retroalimentacion: "Excelente capacidad para documentar código. Muy clara y precisa en las explicaciones."
            },
            {
              _id: "activity_4",
              nombre: "Speaking Practice - Technical Presentations",
              fecha: new Date("2024-02-08"),
              calificacion: 3.8,
              estado: "completado",
              retroalimentacion: "Buena presentación técnica. Trabajar en la fluidez y confianza al hablar."
            }
          ],
          examenes: []
        }
      },
      {
        id: "demo_2",
        aprendiz: "Carlos Andrés Rodríguez",
        ficha: "2758394",
        programa: "Inglés Técnico para Desarrollo de Software",
        totalActividades: 3,
        promedio: "3.2",
        completadas: 3,
        estado: "Aprobado",
        studentData: {
          _id: "demo_2",
          nombre: "Carlos Andrés",
          apellido: "Rodríguez",
          correo: "carlos.rodriguez@sena.edu.co",
          tipoUsuario: "aprendiz",
          ficha: ["2758394"],
          programa: "Inglés Técnico para Desarrollo de Software",
          estado: "En formación",
          actividades: [
            {
              _id: "activity_5",
              nombre: "Reading Comprehension - API Documentation",
              fecha: new Date("2024-01-15"),
              calificacion: 3.5,
              estado: "completado",
              retroalimentacion: "Buena comprensión general. Necesita mejorar en términos técnicos específicos."
            },
            {
              _id: "activity_6",
              nombre: "Listening Exercise - Tech Podcasts",
              fecha: new Date("2024-01-25"),
              calificacion: 3.0,
              estado: "completado",
              retroalimentacion: "Comprensión básica adecuada. Practicar más con acentos nativos."
            },
            {
              _id: "activity_7",
              nombre: "Grammar Review - Conditional Sentences",
              fecha: new Date("2024-02-02"),
              calificacion: 3.1,
              estado: "completado",
              retroalimentacion: "Comprende conceptos básicos. Necesita más práctica con estructuras complejas."
            }
          ],
          examenes: []
        }
      },
      {
        id: "demo_3",
        aprendiz: "María Fernanda López",
        ficha: "2889927",
        programa: "Inglés Básico para Principiantes",
        totalActividades: 3,
        promedio: "2.6",
        completadas: 3,
        estado: "Reprobado",
        studentData: {
          _id: "demo_3",
          nombre: "María Fernanda",
          apellido: "López",
          correo: "maria.lopez@sena.edu.co",
          tipoUsuario: "aprendiz",
          ficha: ["2889927"],
          programa: "Inglés Básico para Principiantes",
          estado: "En formación",
          actividades: [
            {
              _id: "activity_8",
              nombre: "Basic Pronunciation - Alphabet Sounds",
              fecha: new Date("2024-01-20"),
              calificacion: 2.5,
              estado: "completado",
              retroalimentacion: "Necesita practicar más los sonidos básicos del inglés. Recomiendo ejercicios de repetición."
            },
            {
              _id: "activity_9",
              nombre: "Vocabulary Practice - Numbers and Colors",
              fecha: new Date("2024-02-01"),
              calificacion: 3.2,
              estado: "completado",
              retroalimentacion: "Buen progreso con vocabulario básico. Continuar con más palabras cotidianas."
            },
            {
              _id: "activity_10",
              nombre: "Simple Conversations - Greetings",
              fecha: new Date("2024-02-10"),
              calificacion: 2.8,
              estado: "completado",
              retroalimentacion: "Comprende saludos básicos. Necesita más confianza para hablar."
            }
          ],
          examenes: []
        }
      },
      {
        id: "demo_4",
        aprendiz: "Juan Pablo Martínez",
        ficha: "2758394",
        programa: "Inglés Avanzado - Business Communication",
        totalActividades: 4,
        promedio: "4.6",
        completadas: 4,
        estado: "Aprobado",
        studentData: {
          _id: "demo_4",
          nombre: "Juan Pablo",
          apellido: "Martínez",
          correo: "juan.martinez@sena.edu.co",
          tipoUsuario: "aprendiz",
          ficha: ["2758394"],
          programa: "Inglés Avanzado - Business Communication",
          estado: "En formación",
          actividades: [
            {
              _id: "activity_11",
              nombre: "Business Writing - Formal Emails",
              fecha: new Date("2024-01-12"),
              calificacion: 4.8,
              estado: "completado",
              retroalimentacion: "Excelente dominio del lenguaje formal empresarial. Muy profesional y claro."
            },
            {
              _id: "activity_12",
              nombre: "Negotiation Skills - Role Play",
              fecha: new Date("2024-01-28"),
              calificacion: 4.6,
              estado: "completado",
              retroalimentacion: "Muy buenas habilidades de negociación. Maneja bien el lenguaje persuasivo."
            },
            {
              _id: "activity_13",
              nombre: "Financial Reports Analysis",
              fecha: new Date("2024-02-05"),
              calificacion: 4.9,
              estado: "completado",
              retroalimentacion: "Análisis excepcional de reportes financieros. Domina perfectamente la terminología."
            },
            {
              _id: "activity_14",
              nombre: "Cross-Cultural Communication",
              fecha: new Date("2024-02-15"),
              calificacion: 4.5,
              estado: "completado",
              retroalimentacion: "Excelente comprensión de diferencias culturales en comunicación empresarial."
            }
          ],
          examenes: []
        }
      },
      {
        id: "demo_5",
        aprendiz: "Laura Sofía Hernández",
        ficha: "2996778",
        programa: "Inglés Intermedio - Conversational Skills",
        totalActividades: 3,
        promedio: "3.6",
        completadas: 3,
        estado: "Aprobado",
        studentData: {
          _id: "demo_5",
          nombre: "Laura Sofía",
          apellido: "Hernández",
          correo: "laura.hernandez@sena.edu.co",
          tipoUsuario: "aprendiz",
          ficha: ["2996778"],
          programa: "Inglés Intermedio - Conversational Skills",
          estado: "En formación",
          actividades: [
            {
              _id: "activity_15",
              nombre: "Dialogue Practice - Restaurant Scenarios",
              fecha: new Date("2024-01-22"),
              calificacion: 3.7,
              estado: "completado",
              retroalimentacion: "Buena fluidez en conversaciones cotidianas. Mejorar pronunciación de algunos sonidos."
            },
            {
              _id: "activity_16",
              nombre: "Listening Comprehension - News Reports",
              fecha: new Date("2024-01-30"),
              calificacion: 3.4,
              estado: "completado",
              retroalimentacion: "Comprende ideas principales. Necesita trabajar en detalles específicos."
            },
            {
              _id: "activity_17",
              nombre: "Role Play - Job Interview",
              fecha: new Date("2024-02-07"),
              calificacion: 3.8,
              estado: "completado",
              retroalimentacion: "Buen desempeño en situaciones formales. Mejorar vocabulario específico de entrevistas."
            }
          ],
          examenes: []
        }
      }
    ]
  }

  // Función para calcular estadísticas de actividades
  const calculateActivityStats = (activities) => {
    if (!activities || activities.length === 0) {
      return { total: 0, average: "0.0", completed: 0 }
    }

    const total = activities.length
    const completed = activities.filter(activity => activity.estado === "completado").length
    const totalScore = activities.reduce((sum, activity) => sum + (activity.calificacion || 0), 0)
    const average = (totalScore / total).toFixed(1)

    return { total, average, completed }
  }

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleViewDetail = (item) => {
    console.log("👁️ Mostrando detalle del estudiante:", item)
    navigate(`/progreso/retroalimentacion/detallesaprendiz`, {
      state: { 
        student: item.studentData,
        focusTab: 'actividades'
      }
    })
  }

  const handleShowAIFeedback = (student) => {
    setSelectedStudentForAI(student)
    setShowAIFeedback(true)
  }

  // Columnas para la tabla de estudiantes con actividades
  const columns = [
    { key: "aprendiz", label: "Aprendiz", width: "20%" },
    { key: "ficha", label: "Ficha", width: "10%" },
    { key: "programa", label: "Programa", width: "20%" },
    { key: "totalActividades", label: "Total Actividades", width: "12%" },
    {
      key: "promedio",
      label: "Promedio",
      width: "10%",
      render: (item) => (
        <span
          className={`font-medium ${
            Number.parseFloat(item.promedio) >= 4.0
              ? "text-green-600"
              : Number.parseFloat(item.promedio) >= 3.0
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          {item.promedio}
        </span>
      ),
    },
    { key: "completadas", label: "Completadas", width: "10%" },
    {
      key: "estado",
      label: "Estado",
      width: "10%",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            item.estado === "Aprobado" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {item.estado}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      width: "8%",
      render: (item) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleShowAIFeedback(item.studentData)}
            className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
            title="Generar retroalimentación con IA"
          >
            <Brain className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ]

  // Mostrar pantalla de carga mientras se cargan los datos iniciales
  if (loading) {
    console.log("⏳ Mostrando pantalla de carga")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f384c] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando retroalimentación de actividades...</p>
          <p className="text-gray-500 text-sm mt-2">Obteniendo datos de estudiantes con actividades...</p>
        </div>
      </div>
    )
  }

  console.log("✅ Renderizando vista de actividades")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/progreso/retroalimentacion")}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Volver a Retroalimentación
              </button>
              <h1 className="text-2xl font-bold text-[#1f384c]">Retroalimentación de Actividades</h1>
            </div>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="text-right">
                  <div className="text-sm font-medium">{user?.nombre || "Usuario"}</div>
                  <div className="text-xs text-gray-500">{getRoleDisplayName(getUserRole(user))}</div>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <button
                    onClick={handleLogoutClick}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6">
        {/* Información de la sección */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-[#1f384c] mb-4">Estudiantes con Actividades</h3>
          <p className="text-gray-600 mb-4">
            Revisa el rendimiento de los estudiantes en sus actividades y genera retroalimentación personalizada con IA.
          </p>
        </div>

        {/* Tabla de estudiantes con actividades */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        ) : students.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#1f384c]">
                  Estudiantes con Actividades
                </h3>
                <span className="text-sm text-gray-500">
                  {students.length} estudiante{students.length !== 1 ? 's' : ''} encontrado{students.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <GenericTable
              data={students}
              columns={columns}
              onShow={handleViewDetail}
              defaultItemsPerPage={10}
              showActions={{ show: true, edit: false, delete: false, add: false }}
              tooltipText="Ver detalle del estudiante"
              showSearch={true}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No se encontraron estudiantes con actividades
            </h3>
            <p className="text-gray-600">
              No hay estudiantes que tengan actividades registradas en el sistema.
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmación para cerrar sesión */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Cerrar Sesión"
        message="¿Está seguro de que desea cerrar la sesión actual?"
        confirmButtonText="Cerrar Sesión"
        confirmButtonClass="bg-[#f44144] hover:bg-red-600"
      />

      {/* Panel de Retroalimentación IA */}
      {showAIFeedback && selectedStudentForAI && (
        <AIFeedbackPanel
          student={selectedStudentForAI}
          isOpen={showAIFeedback}
          onClose={() => {
            setShowAIFeedback(false)
            setSelectedStudentForAI(null)
          }}
        />
      )}

      {/* Botón flotante de Chat/Mentor */}
      <button
        onClick={() => setShowChatMentor(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 z-40"
        title="Chat con Mentor IA"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Panel de Chat/Mentor */}
      {showChatMentor && (
        <ChatMentorPanel
          isOpen={showChatMentor}
          onClose={() => setShowChatMentor(false)}
        />
      )}
    </div>
  )
}

export default FeedbackActivities