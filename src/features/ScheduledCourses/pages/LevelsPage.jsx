"use client"

import { useNavigate } from "react-router-dom"
import GenericTable from "../../../shared/components/Table"
import { useState, useEffect, useRef } from "react"
import { ChevronDown, BarChart3 } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import { useGetApprenticesByFicha } from "../hooks/use-get-apprentices-by-ficha"
import { useGetProgrammingByProgramName } from "../hooks/use-get-programming-by-program-name"
import ProgrammingDebugInfo from "./programming-debug-info"

const columns = [
  { key: "name", label: "Nivel", width: "15%" },
  { key: "cantidadAprendices", label: "N° Aprendices", width: "15%" },
  { key: "evaluacionesProgramadas", label: "Evaluaciones", width: "15%" },
  { key: "topicsProgramados", label: "Temas", width: "15%" },
  {
    key: "progreso",
    label: "Progreso General",
    width: "25%",
    render: (item) => (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 min-w-[100px]">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: item.progreso }}></div>
          </div>
        </div>
        <span className="text-sm text-gray-600 w-13 text-right">{item.progreso}</span>
      </div>
    ),
  },
]

const LevelsPageUpdated = () => {
  const navigate = useNavigate()
  const [levels, setLevels] = useState([])
  const [fichaNombre, setFichaNombre] = useState("")
  const [fichaPrograma, setFichaPrograma] = useState("")
  const [fichaId, setFichaId] = useState(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const { logout, user } = useAuth()
  const dropdownRef = useRef(null)

  // Hooks para obtener datos
  const {
    programming,
    loading: programmingLoading,
    error: programmingError,
  } = useGetProgrammingByProgramName(fichaPrograma)
  const { apprentices, loading: apprenticesLoading, error: apprenticesError } = useGetApprenticesByFicha(fichaNombre)

  // Función para extraer todas las evaluaciones de un nivel
  const getEvaluationsFromLevel = (level) => {
    const evaluations = []

    if (level.topics && level.topics.length > 0) {
      level.topics.forEach((topic) => {
        // Agregar actividades
        if (topic.activities && topic.activities.length > 0) {
          topic.activities.forEach((activity) => {
            evaluations.push({
              evaluationId: activity.evaluationId,
              type: "activity",
              value: activity.value,
              topicId: topic.topicId,
            })
          })
        }

        // Agregar exámenes
        if (topic.exams && topic.exams.length > 0) {
          topic.exams.forEach((exam) => {
            evaluations.push({
              evaluationId: exam.evaluationId,
              type: "exam",
              value: exam.value,
              topicId: topic.topicId,
            })
          })
        }
      })
    }

    return evaluations
  }

  // Función para obtener progreso de todos los aprendices de la ficha
  const fetchAllApprenticesProgress = async () => {
    if (!apprentices.length) return []

    try {
      const allProgress = await Promise.all(
        apprentices.map(async (apprentice) => {
          const apprenticeId = apprentice._id || apprentice.id
          const response = await fetch(`http://localhost:3000/api/apprentice-progress?apprenticeId=${apprenticeId}`)
          const data = await response.json()
          return {
            apprenticeId,
            progress: data.success ? data.data : [],
          }
        }),
      )
      return allProgress
    } catch (error) {
      console.error("Error fetching all apprentices progress:", error)
      return []
    }
  }

  useEffect(() => {
    // Recuperar la ficha seleccionada de sessionStorage
    const selectedFichaId = sessionStorage.getItem("selectedFichaId")
    const selectedFichaNombre = sessionStorage.getItem("selectedFichaNombre")
    const selectedFichaPrograma = sessionStorage.getItem("selectedFichaPrograma")

    if (selectedFichaId) {
      setFichaId(Number.parseInt(selectedFichaId))
      setFichaNombre(selectedFichaNombre || `Ficha ${selectedFichaId}`)
      setFichaPrograma(selectedFichaPrograma || "")
    } else {
      navigate("/progreso/cursosProgramados")
    }
  }, [navigate])

  useEffect(() => {
    const calculateLevelsProgress = async () => {
      if (programming && !programmingLoading && !apprenticesLoading) {
        // Obtener progreso de todos los aprendices
        const allApprenticesProgress = await fetchAllApprenticesProgress()

        if (programming.levels && programming.levels.length > 0) {
          const processedLevels = programming.levels.map((level, index) => {
            const nivelNumero = index + 1
            const evaluacionesProgramadas = getEvaluationsFromLevel(level)
            const topicsProgramados = level.topics?.length || 0

            // Calcular progreso promedio de todos los aprendices en este nivel
            let totalPorcentajeCompletitud = 0
            let aprendicesConProgreso = 0

            if (apprentices.length > 0 && evaluacionesProgramadas.length > 0) {
              allApprenticesProgress.forEach(({ apprenticeId, progress }) => {
                const evaluacionesRealizadas = progress.filter((p) => p.level === nivelNumero)

                // Contar evaluaciones APROBADAS vs programadas
                let evaluacionesAprobadas = 0
                evaluacionesProgramadas.forEach((evalProgramada) => {
                  const evalId = evalProgramada.evaluationId
                  const evalRealizada = evaluacionesRealizadas.find(
                    (er) =>
                      (er.evaluationId === evalId ||
                        er.evaluationId?._id === evalId ||
                        er.evaluationId?.toString() === evalId?.toString()) &&
                      er.passed === true, // SOLO CONTAR SI ESTÁ APROBADA
                  )

                  if (evalRealizada) {
                    evaluacionesAprobadas++ // Solo cuenta si está aprobada
                  }
                })

                // Porcentaje de completitud para este aprendiz (basado en evaluaciones aprobadas)
                const porcentajeCompletitud = (evaluacionesAprobadas / evaluacionesProgramadas.length) * 100
                totalPorcentajeCompletitud += porcentajeCompletitud
                aprendicesConProgreso++ // Contar TODOS los aprendices, incluso los que tienen 0%
              })
            }

            // CAMBIO CRÍTICO: El promedio debe incluir TODOS los aprendices de la ficha
            // Si un aprendiz no tiene evaluaciones aprobadas, su progreso es 0%
            const promedioProgreso =
              apprentices.length > 0 ? Math.round(totalPorcentajeCompletitud / apprentices.length) : 0

            return {
              id: level._id,
              name: level.name,
              cantidadAprendices: apprentices.length,
              progreso: `${promedioProgreso}%`,
              nivel: nivelNumero,
              evaluacionesProgramadas: evaluacionesProgramadas.length,
              topicsProgramados: topicsProgramados,
            }
          })

          setLevels(processedLevels)
        } else {
          setLevels([])
        }
      }
    }

    calculateLevelsProgress()
  }, [programming, programmingLoading, apprentices, apprenticesLoading])

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

  const handleShowAprendices = (nivel) => {
    // Guardar el nivel seleccionado en sessionStorage
    sessionStorage.setItem("selectedNivelId", nivel.id)
    sessionStorage.setItem("selectedNivelNombre", nivel.name)
    sessionStorage.setItem("selectedNivelNumber", nivel.nivel)
    navigate("/progreso/cursosProgramados/niveles/aprendices")
  }

  const handleBack = () => {
    navigate("/progreso/cursosProgramados")
  }

  if (programmingLoading || apprenticesLoading) {
    return (
      <div className="min-h-screen">
        <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#1f384c]">Cursos Programados</h1>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="text-right">
                  <div className="text-sm font-medium">{user?.name} {user?.lastName}</div>
                  <div className="text-xs text-gray-600">{getRoleDisplayName(getUserRole(user))}</div>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full text-left px-4 py-2 text-[#f44144] hover:bg-gray-50 rounded-lg"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex justify-center my-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          <span className="ml-2">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">Cursos Programados</h1>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2"
            >
              <div className="text-right">
                <div className="text-sm font-medium">{user?.name} {user?.lastName}</div>
                <div className="text-xs text-gray-600">{getRoleDisplayName(getUserRole(user))}</div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2 text-[#f44144] hover:bg-gray-50 rounded-lg"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 bg-gray-200 text-black px-3 py-1.5 text-sm rounded-lg hover:bg-gray-300 transition-colors"
          >
            ← Volver a Fichas
          </button>
          {/* <button
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showDebug ? "🔍 Ocultar Debug" : "🔍 Mostrar Debug"}
          </button> */}
        </div>

        {/* Información de debug de la programación */}
        {showDebug && <ProgrammingDebugInfo programName={fichaPrograma} />}

        {/* Estado de carga y errores */}
        {(programmingError || apprenticesError) && (
          <div className="mb-4 p-4 bg-red-50 rounded-lg">
            <h4 className="font-semibold text-red-800">❌ ¡ERROR!</h4>
            {programmingError && <p className="text-red-600">{programmingError}</p>}
            {apprenticesError && <p className="text-red-600">{apprenticesError}</p>}
          </div>
        )}

        {/* Información de estado */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Estado Actual:</h4>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
            <div>
              <span className="font-medium">Ficha:</span> {fichaNombre}
            </div>
            <div>
              <span className="font-medium">Programa:</span> {fichaPrograma || "No especificado"}
            </div>
          </div>
        </div>

        {/* Tabla de niveles */}
        <GenericTable
          data={levels}
          columns={columns}
          onShow={handleShowAprendices}
          tooltipText="Ver Aprendices"
          showActions={{ show: true, edit: false, delete: false, add: false }}
        />

        <ConfirmationModal
          isOpen={showLogoutConfirm}
          onClose={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
          title="Cerrar Sesión"
          message="¿Está seguro de que desea cerrar la sesión actual?"
          confirmText="Cerrar Sesión"
        />
      </div>
    </div>
  )
}

export default LevelsPageUpdated
