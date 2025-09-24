import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, Search, AlertCircle, CheckCircle, X, Brain, Target, BarChart3, MessageCircle } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import GenericTable from "../../../shared/components/Table"
import { getAllUsers } from "../services/feedbackService"
import AIFeedbackPanel from "../components/AIFeedbackPanel"
import StudentRecommendationsPanel from "../components/StudentRecommendationsPanel"
import PerformanceAnalysisPanel from "../components/PerformanceAnalysisPanel"
import ChatMentorPanel from "../components/ChatMentorPanel"

const FeedbackExams = () => {
  console.log("🚀 Renderizando componente FeedbackExams")

  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const dropdownRef = useRef(null)
  const [showAIFeedback, setShowAIFeedback] = useState(false)
  const [selectedStudentForAI, setSelectedStudentForAI] = useState(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [selectedStudentForRecommendations, setSelectedStudentForRecommendations] = useState(null)
  const [showPerformanceAnalysis, setShowPerformanceAnalysis] = useState(false)
  const [selectedStudentForAnalysis, setSelectedStudentForAnalysis] = useState(null)
  const [showChatMentor, setShowChatMentor] = useState(false)

  // Estados para datos de estudiantes con exámenes
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStudentsWithExams()
  }, [])

  const loadStudentsWithExams = async () => {
    try {
      setLoading(true)
      const users = await getAllUsers()
      
      // Filtrar solo aprendices que tengan exámenes y transformar datos para la tabla
      let studentsWithExams = users
        .filter(user => 
          user.tipoUsuario === "aprendiz" && 
          user.examenes && 
          user.examenes.length > 0
        )
        .map(student => {
          const examStats = calculateExamStats(student.examenes)
          return {
            id: student._id,
            aprendiz: `${student.nombre} ${student.apellido}`,
            ficha: student.ficha?.[0] || 'N/A',
            programa: student.programa || 'N/A',
            totalExamenes: examStats.total,
            promedio: examStats.average,
            aprobados: examStats.passed,
            estado: examStats.average >= 3.0 ? "Aprobado" : "Reprobado",
            studentData: student // Guardar datos completos del estudiante
          }
        })

      // Si no hay datos reales, usar datos de demostración para la presentación
      if (studentsWithExams.length === 0) {
        console.log("📋 Usando datos de demostración para exámenes")
        studentsWithExams = generateDemoStudentsWithExams()
      }

      setStudents(studentsWithExams)
    } catch (err) {
      console.error("Error cargando estudiantes con exámenes:", err)
      // En caso de error, usar datos de demostración
      console.log("📋 Usando datos de demostración por error en API")
      setStudents(generateDemoStudentsWithExams())
    } finally {
      setLoading(false)
    }
  }

  // Función para generar datos de demostración de estudiantes con exámenes
  const generateDemoStudentsWithExams = () => {
    return [
      {
        id: "demo_1",
        aprendiz: "Ana María García López",
        ficha: "2758394",
        programa: "Inglés Técnico para Desarrollo de Software",
        totalExamenes: 5,
        promedio: "4.2",
        aprobados: 5,
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
              retroalimentacion: "Excelente comprensión del presente perfecto. Continúa practicando con ejercicios más complejos."
            },
            {
              _id: "activity_2",
              nombre: "Vocabulary Building - Tech Terms",
              fecha: new Date("2024-01-22"),
              calificacion: 4.0,
              estado: "completado",
              retroalimentacion: "Buen dominio del vocabulario técnico. Recomiendo practicar más términos de programación."
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
          examenes: [
            {
              _id: "exam_1",
              nombre: "English Grammar - Present and Past Tenses",
              fecha: new Date("2024-01-20"),
              calificacion: 4.5,
              estado: "completado",
              preguntas: [
                {
                  pregunta: "Choose the correct form: 'I _____ working on this project since Monday.'",
                  respuestaCorrecta: "have been",
                  respuestaEstudiante: "have been",
                  esCorrecta: true
                },
                {
                  pregunta: "What is the past tense of 'write'?",
                  respuestaCorrecta: "wrote",
                  respuestaEstudiante: "writed",
                  esCorrecta: false
                },
                {
                  pregunta: "Complete the sentence: 'They _____ to the store yesterday.'",
                  respuestaCorrecta: "went",
                  respuestaEstudiante: "go",
                  esCorrecta: false
                },
                {
                  pregunta: "Choose the correct form: 'She _____ English for 5 years.'",
                  respuestaCorrecta: "has been studying",
                  respuestaEstudiante: "studies",
                  esCorrecta: false
                }
              ]
            },
            {
              _id: "exam_2",
              nombre: "Technical Vocabulary - Software Development",
              fecha: new Date("2024-01-25"),
              calificacion: 4.0,
              estado: "completado"
            },
            {
              _id: "exam_3",
              nombre: "Reading Comprehension - Tech Articles",
              fecha: new Date("2024-02-01"),
              calificacion: 3.8,
              estado: "completado"
            },
            {
              _id: "exam_4",
              nombre: "Business English - Email Communication",
              fecha: new Date("2024-02-10"),
              calificacion: 4.5,
              estado: "completado"
            },
            {
              _id: "exam_5",
              nombre: "Listening Comprehension - Tech Presentations",
              fecha: new Date("2024-02-15"),
              calificacion: 4.2,
              estado: "completado"
            }
          ]
        }
      },
      {
        id: "demo_2",
        aprendiz: "Carlos Andrés Rodríguez",
        ficha: "2758394",
        programa: "Inglés Técnico para Desarrollo de Software",
        totalExamenes: 4,
        promedio: "3.4",
        aprobados: 3,
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
              calificacion: 3.8,
              estado: "completado",
              retroalimentacion: "Buen progreso en condicionales. Continuar con ejercicios prácticos."
            }
          ],
          examenes: [
            {
              _id: "exam_6",
              nombre: "English Vocabulary - Programming Terms",
              fecha: new Date("2024-01-18"),
              calificacion: 3.2,
              estado: "completado",
              preguntas: [
                {
                  pregunta: "What does 'debugging' mean in programming?",
                  respuestaCorrecta: "Finding and fixing errors in code",
                  respuestaEstudiante: "Writing new code",
                  esCorrecta: false
                },
                {
                  pregunta: "What is an 'array' in programming?",
                  respuestaCorrecta: "A collection of elements",
                  respuestaEstudiante: "A single variable",
                  esCorrecta: false
                }
              ]
            },
            {
              _id: "exam_7",
              nombre: "Writing Skills - Technical Documentation",
              fecha: new Date("2024-01-28"),
              calificacion: 3.0,
              estado: "completado",
              preguntas: [
                {
                  pregunta: "Which is the correct way to write a function description?",
                  respuestaCorrecta: "This function calculates the sum of two numbers",
                  respuestaEstudiante: "This function do math",
                  esCorrecta: false
                }
              ]
            },
            {
              _id: "exam_8",
              nombre: "Speaking Practice - Code Reviews",
              fecha: new Date("2024-02-05"),
              calificacion: 3.8,
              estado: "completado"
            },
            {
              _id: "exam_9",
              nombre: "Listening - Software Tutorials",
              fecha: new Date("2024-02-12"),
              calificacion: 3.6,
              estado: "completado"
            }
          ]
        }
      },
      {
        id: "demo_3",
        aprendiz: "María Fernanda López",
        ficha: "2889927",
        programa: "Inglés Básico para Principiantes",
        totalExamenes: 3,
        promedio: "2.8",
        aprobados: 1,
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
          examenes: [
            {
              _id: "exam_10",
              nombre: "Basic Grammar - Verb To Be",
              fecha: new Date("2024-01-22"),
              calificacion: 2.5,
              estado: "completado",
              preguntas: [
                {
                  pregunta: "Complete the sentence: 'She _____ a teacher.'",
                  respuestaCorrecta: "is",
                  respuestaEstudiante: "are",
                  esCorrecta: false
                },
                {
                  pregunta: "Choose the correct form: 'I _____ happy.'",
                  respuestaCorrecta: "am",
                  respuestaEstudiante: "is",
                  esCorrecta: false
                },
                {
                  pregunta: "What is the correct form: 'They _____ students.'",
                  respuestaCorrecta: "are",
                  respuestaEstudiante: "is",
                  esCorrecta: false
                }
              ]
            },
            {
              _id: "exam_11",
              nombre: "Basic Vocabulary - Daily Activities",
              fecha: new Date("2024-02-03"),
              calificacion: 2.8,
              estado: "completado"
            },
            {
              _id: "exam_12",
              nombre: "Simple Present Tense",
              fecha: new Date("2024-02-14"),
              calificacion: 3.2,
              estado: "completado"
            }
          ]
        }
      },
      {
        id: "demo_4",
        aprendiz: "Juan Pablo Martínez",
        ficha: "2758394",
        programa: "Inglés Avanzado - Business Communication",
        totalExamenes: 6,
        promedio: "4.7",
        aprobados: 6,
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
          examenes: [
            {
              _id: "exam_13",
              nombre: "Advanced Grammar - Conditional Sentences",
              fecha: new Date("2024-01-15"),
              calificacion: 4.8,
              estado: "completado",
              preguntas: [
                {
                  pregunta: "If I _____ more time, I would finish the project.",
                  respuestaCorrecta: "had",
                  respuestaEstudiante: "have",
                  esCorrecta: false
                }
              ]
            },
            {
              _id: "exam_14",
              nombre: "Business Vocabulary - Finance & Marketing",
              fecha: new Date("2024-01-30"),
              calificacion: 4.9,
              estado: "completado",
              preguntas: [
                {
                  pregunta: "What does ROI stand for?",
                  respuestaCorrecta: "Return on Investment",
                  respuestaEstudiante: "Rate of Interest",
                  esCorrecta: false
                }
              ]
            },
            {
              _id: "exam_15",
              nombre: "Presentation Skills - Public Speaking",
              fecha: new Date("2024-02-08"),
              calificacion: 4.5,
              estado: "completado"
            },
            {
              _id: "exam_16",
              nombre: "Writing - Business Reports",
              fecha: new Date("2024-02-16"),
              calificacion: 4.7,
              estado: "completado"
            },
            {
              _id: "exam_17",
              nombre: "Listening - Conference Calls",
              fecha: new Date("2024-02-20"),
              calificacion: 4.6,
              estado: "completado"
            },
            {
              _id: "exam_18",
              nombre: "Reading Comprehension - Business Articles",
              fecha: new Date("2024-02-25"),
              calificacion: 4.7,
              estado: "completado"
            }
          ]
        }
      },
      {
        id: "demo_5",
        aprendiz: "Laura Sofía Hernández",
        ficha: "2996778",
        programa: "Inglés Intermedio - Conversational Skills",
        totalExamenes: 4,
        promedio: "3.6",
        aprobados: 4,
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
              retroalimentacion: "Excelente desempeño en simulacro de entrevista. Muy natural y confiada."
            },
            {
              _id: "activity_18",
              nombre: "Cultural Topics Discussion",
              fecha: new Date("2024-02-14"),
              calificacion: 3.6,
              estado: "completado",
              retroalimentacion: "Buena participación en discusiones culturales. Ampliar vocabulario temático."
            }
          ],
          examenes: [
            {
              _id: "exam_19",
              nombre: "Conversation Practice - Daily Situations",
              fecha: new Date("2024-01-25"),
              calificacion: 3.8,
              estado: "completado",
              preguntas: [
                {
                  pregunta: "How do you respond to 'How are you?'",
                  respuestaCorrecta: "I'm fine, thank you",
                  respuestaEstudiante: "I'm good, thanks you",
                  esCorrecta: false
                },
                {
                  pregunta: "What's the correct way to ask for directions?",
                  respuestaCorrecta: "Excuse me, could you tell me how to get to...?",
                  respuestaEstudiante: "Where is...?",
                  esCorrecta: false
                }
              ]
            },
            {
              _id: "exam_20",
              nombre: "Pronunciation & Phonetics",
              fecha: new Date("2024-02-02"),
              calificacion: 3.5,
              estado: "completado",
              preguntas: [
                {
                  pregunta: "Which word has the /θ/ sound?",
                  respuestaCorrecta: "think",
                  respuestaEstudiante: "sink",
                  esCorrecta: false
                }
              ]
            },
            {
              _id: "exam_21",
              nombre: "Vocabulary Building - Idioms & Expressions",
              fecha: new Date("2024-02-09"),
              calificacion: 3.7,
              estado: "completado"
            },
            {
              _id: "exam_22",
              nombre: "Cultural Communication - International Context",
              fecha: new Date("2024-02-18"),
              calificacion: 3.4,
              estado: "completado"
            }
          ]
        }
      },
      {
        id: "demo_6",
        aprendiz: "Diego Alejandro Morales",
        ficha: "2996779",
        programa: "Inglés Básico - Foundations",
        totalExamenes: 2,
        promedio: "3.2",
        aprobados: 2,
        estado: "Aprobado",
        studentData: {
          _id: "demo_6",
          nombre: "Diego Alejandro",
          apellido: "Morales",
          correo: "diego.morales@sena.edu.co",
          tipoUsuario: "aprendiz",
          ficha: ["2996779"],
          programa: "Inglés Básico - Foundations",
          estado: "En formación",
          // Sin actividades - mostrará "No hay actividades disponibles"
          examenes: [
            {
              _id: "exam_23",
              nombre: "Basic Grammar - Present Tense",
              fecha: new Date("2024-01-20"),
              calificacion: 3.3,
              estado: "completado"
            },
            {
              _id: "exam_24",
              nombre: "Vocabulary - Common Words",
              fecha: new Date("2024-02-01"),
              calificacion: 3.1,
              estado: "completado"
            }
          ]
        }
      },
      {
        id: "demo_7",
        aprendiz: "Camila Andrea Jiménez",
        ficha: "2996780",
        programa: "Inglés Básico - Elementary",
        totalExamenes: 3,
        promedio: "2.8",
        aprobados: 1,
        estado: "Reprobado",
        studentData: {
          _id: "demo_7",
          nombre: "Camila Andrea",
          apellido: "Jiménez",
          correo: "camila.jimenez@sena.edu.co",
          tipoUsuario: "aprendiz",
          ficha: ["2996780"],
          programa: "Inglés Básico - Elementary",
          estado: "En formación",
          actividades: [], // Array vacío - mostrará "Este estudiante no tiene actividades registradas para analizar."
          examenes: [
            {
              _id: "exam_25",
              nombre: "Listening Skills - Basic Conversations",
              fecha: new Date("2024-01-18"),
              calificacion: 2.5,
              estado: "completado"
            },
            {
              _id: "exam_26",
              nombre: "Reading Comprehension - Simple Texts",
              fecha: new Date("2024-01-25"),
              calificacion: 3.2,
              estado: "completado"
            },
            {
              _id: "exam_27",
              nombre: "Speaking Practice - Introductions",
              fecha: new Date("2024-02-03"),
              calificacion: 2.7,
              estado: "completado"
            }
          ]
        }
      }
    ]
  }

  const calculateExamStats = (examenes) => {
    if (!examenes || examenes.length === 0) return { average: 0, total: 0, passed: 0 }

    const total = examenes.length
    const totalScore = examenes.reduce((sum, exam) => sum + (exam.calificacion || 0), 0)
    const average = totalScore / total
    const passed = examenes.filter(exam => (exam.calificacion || 0) >= 3.0).length

    return { average: average.toFixed(1), total, passed }
  }

  // Columnas para la tabla de estudiantes con exámenes
  const columns = [
    { key: "aprendiz", label: "Aprendiz", width: "20%" },
    { key: "ficha", label: "Ficha", width: "10%" },
    { key: "programa", label: "Programa", width: "20%" },
    { key: "totalExamenes", label: "Total Exámenes", width: "12%" },
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
    { key: "aprobados", label: "Aprobados", width: "10%" },
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

  ]

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
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
        focusTab: 'examenes'
      }
    })
  }

  const handleShowAIFeedback = (student) => {
    setSelectedStudentForAI(student)
    setShowAIFeedback(true)
  }

  const handleShowRecommendations = (student) => {
    setSelectedStudentForRecommendations(student)
    setShowRecommendations(true)
  }

  const handleShowPerformanceAnalysis = (student) => {
    setSelectedStudentForAnalysis(student)
    setShowPerformanceAnalysis(true)
  }

  // Mostrar pantalla de carga mientras se cargan los datos iniciales
  if (loading) {
    console.log("⏳ Mostrando pantalla de carga")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f384c] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando retroalimentación de exámenes...</p>
          <p className="text-gray-500 text-sm mt-2">Obteniendo datos de estudiantes con exámenes...</p>
        </div>
      </div>
    )
  }

  console.log("✅ Renderizando vista de exámenes")

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
              <h1 className="text-2xl font-bold text-[#1f384c]">Retroalimentación de Exámenes y actividades</h1>
            </div>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <div className="text-right">
                  <div className="text-sm font-medium">{user?.nombre} {user?.apellido}</div>
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
          <h3 className="text-lg font-medium text-[#1f384c] mb-4">Estudiantes con Exámenes y actividades</h3>
          <p className="text-gray-600 mb-4">
            Revisa el rendimiento de los estudiantes en sus exámenes y actividades, y genera retroalimentación personalizada con IA.
          </p>
        </div>

        {/* Tabla de estudiantes con exámenes */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        ) : students.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#1f384c]">
                  Estudiantes con Exámenes y actividades
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
              No se encontraron estudiantes con exámenes
            </h3>
            <p className="text-gray-600">
              No hay estudiantes que tengan exámenes registrados en el sistema.
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

      {/* Panel de Recomendaciones Personalizadas */}
      {showRecommendations && selectedStudentForRecommendations && (
        <StudentRecommendationsPanel
          student={selectedStudentForRecommendations}
          isOpen={showRecommendations}
          onClose={() => {
            setShowRecommendations(false)
            setSelectedStudentForRecommendations(null)
          }}
        />
      )}

      {/* Panel de Análisis de Rendimiento */}
      {showPerformanceAnalysis && selectedStudentForAnalysis && (
        <PerformanceAnalysisPanel
          student={selectedStudentForAnalysis}
          isOpen={showPerformanceAnalysis}
          onClose={() => {
            setShowPerformanceAnalysis(false)
            setSelectedStudentForAnalysis(null)
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

export default FeedbackExams