"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, Search, AlertCircle, CheckCircle, X, Brain, MessageCircle } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import GenericTable from "../../../shared/components/Table"
import { useFeedbackData } from "../hooks/useFeedbackData"
import { useFeedbackResults } from "../hooks/useFeedbackResults"
import StudentDetailPanel from "../components/StudentDetailPanel"
import AIFeedbackPanel from "../components/AIFeedbackPanel"
import ChatMentorPanel from "../components/ChatMentorPanel"
import { useStudentDetails } from "../hooks/useStudentDetails"
import aiService from "../services/aiService"

const Feedback = () => {
  console.log("🚀 Renderizando componente Feedback")

  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const dropdownRef = useRef(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedFeedbackItem, setSelectedFeedbackItem] = useState(null)
  const [showAIFeedback, setShowAIFeedback] = useState(false)
  const [selectedStudentForAI, setSelectedStudentForAI] = useState(null)
  const [showChatMentor, setShowChatMentor] = useState(false)

  // Hooks para datos y búsqueda
  const { fichas, instructors, niveles, loading: dataLoading, error: dataError } = useFeedbackData()
  const { 
    results, 
    loading: resultsLoading, 
    error: resultsError, 
    total, 
    hasMore,
    searchFeedbackResults, 
    loadMoreResults,
    resetResults 
  } = useFeedbackResults()

  const [searchFilters, setSearchFilters] = useState({
    ficha: '',
    nivel: '',
    instructor: ''
  })

  console.log("📊 Estado actual:", {
    fichas: fichas?.length || 0,
    instructors: instructors?.length || 0,
    niveles: niveles?.length || 0,
    dataLoading,
    dataError,
  })

  // Columnas para la tabla de resultados de retroalimentación
  const columns = [
    { key: "programa", label: "Programa", width: "20%" },
    { key: "ficha", label: "Ficha", width: "10%" },
    { key: "nivel", label: "Nivel", width: "10%" },
    { key: "tema", label: "Tema", width: "25%" },
    { key: "actividad", label: "Actividad", width: "20%" },
    {
      key: "ejecutada",
      label: "Ejecutada",
      width: "10%",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-md text-xs font-medium ${
            item.ejecutada === "Sí" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {item.ejecutada}
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

  const handleSearch = async (filters) => {
    console.log("🔍 Ejecutando búsqueda con filtros:", filters)
    setSearchFilters(filters)
    resetResults() // Limpiar resultados anteriores
    
    // Convertir filtros al formato esperado por la API
    const apiFilters = {
      ficha: filters.ficha,
      nivel: filters.nivel,
      instructor: filters.instructor
    }
    
    await searchFeedbackResults(apiFilters)
  }

  const handleLoadMore = () => {
    if (hasMore && !resultsLoading) {
      loadMoreResults(searchFilters)
    }
  }

  const handleViewDetail = (item) => {
    console.log("👁️ Mostrando detalle:", item)
    setSelectedFeedbackItem(item)
    setShowDetailModal(true)
    // Navegar a la página de detalles de retroalimentación
    navigate(`/progreso/retroalimentacion/${item.id}`)
  }

  // Mostrar pantalla de carga mientras se cargan los datos iniciales
  if (dataLoading) {
    console.log("⏳ Mostrando pantalla de carga")
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1f384c] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando módulo de retroalimentación...</p>
          <p className="text-gray-500 text-sm mt-2">Obteniendo fichas y niveles de aprendices...</p>
        </div>
      </div>
    )
  }

  console.log("✅ Renderizando vista principal")

  const FeedbackDetailsContent = ({ feedbackItem }) => {
    const { studentData, loading, error, loadStudentData } = useStudentDetails()
    const [showStudentPanel, setShowStudentPanel] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState(null)

    useEffect(() => {
      if (feedbackItem?.id) {
        console.log("🔄 Cargando datos para feedback ID:", feedbackItem.id)
        loadStudentData(feedbackItem.id)
      }
    }, [feedbackItem?.id, loadStudentData])

    // Log para verificar cambios en studentData
    useEffect(() => {
      console.log("📊 StudentData actualizado:", studentData.length, "estudiantes")
      console.log("📋 Datos de estudiantes:", studentData)
    }, [studentData])

    const studentColumns = [
      { key: "aprendiz", label: "Aprendiz", width: "20%" },
      { key: "ficha", label: "Ficha", width: "12%" },
      { key: "hora", label: "Hora", width: "12%" },
      {
        key: "estado",
        label: "Estado",
        width: "12%",
        render: (item) => (
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              item.estado === "Presente" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {item.estado}
          </span>
        ),
      },
      {
        key: "calificacion",
        label: "Calificación",
        width: "12%",
        render: (item) => (
          <span
            className={`font-medium ${
              Number.parseFloat(item.calificacion) >= 4.0
                ? "text-green-600"
                : Number.parseFloat(item.calificacion) >= 3.0
                  ? "text-yellow-600"
                  : "text-red-600"
            }`}
          >
            {item.calificacion}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Acciones",
        width: "22%",
        render: (item) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewStudentDetail(item)}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
            >
              Ver Detalle
            </button>
          </div>
        ),
      },
    ]

    const handleViewStudentDetail = (student) => {
      setSelectedStudent(student)
      setShowStudentPanel(true)
    }

    const handleShowAIFeedback = (student) => {
      setSelectedStudentForAI(student)
      setShowAIFeedback(true)
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f384c] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando detalles...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error al cargar los detalles: {error}</p>
        </div>
      )
    }

    return (
      <>
        {/* Información de la retroalimentación */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-6 mb-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-[#1f384c] mb-4">Información de la Actividad</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Programa</p>
              <p className="font-medium">{feedbackItem.programa}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ficha</p>
              <p className="font-medium">{feedbackItem.ficha}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Nivel</p>
              <p className="font-medium">{feedbackItem.nivel}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tema</p>
              <p className="font-medium">{feedbackItem.tema}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Actividad</p>
              <p className="font-medium">{feedbackItem.actividad}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Estado</p>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  feedbackItem.ejecutada === "Sí" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {feedbackItem.ejecutada === "Sí" ? "Ejecutada" : "Pendiente"}
              </span>
            </div>
          </div>
        </div>

        {/* Tabla de aprendices */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-[#1f384c]">Lista de Aprendices ({studentData.length})</h4>
          </div>
          <GenericTable
            key={`feedback-table-${feedbackItem?.id}-${studentData.length}`}
            data={studentData}
            columns={studentColumns}
            onShow={handleViewStudentDetail}
            defaultItemsPerPage={5}
            showActions={{ show: true, edit: false, delete: false, add: false }}
            tooltipText="Ver detalle del aprendiz"
            showSearch={true}
          />
        </div>

        {/* Modal de detalle del estudiante */}
        <StudentDetailPanel
          isOpen={showStudentPanel}
          onClose={() => setShowStudentPanel(false)}
          selectedStudent={selectedStudent}
          feedbackItem={feedbackItem}
        />
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-[#1f384c]">Retroalimentación</h1>
            <p className="text-sm text-gray-600 mt-1">Gestión de retroalimentación de actividades de inglés</p>
            {dataError && <p className="text-sm text-orange-600 mt-1">⚠️ {dataError}</p>}
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="text-right">
                <div className="text-sm font-medium">{user?.name}</div>
                <div className="text-xs text-gray-600">{getRoleDisplayName(getUserRole(user))}</div>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left px-4 py-2 text-[#f44144] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6">
        {/* Botones de acción para retroalimentación */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-medium text-[#1f384c] mb-4">Retroalimentación con IA</h3>
          <p className="text-gray-600 mb-4">
            Utiliza la inteligencia artificial para generar retroalimentación personalizada para tus estudiantes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2">Retroalimentación de Exámenes</h4>
              <p className="text-sm text-blue-700 mb-4">
                Analiza las respuestas de los estudiantes en exámenes y obtén retroalimentación detallada.
              </p>
              <button
                onClick={() => navigate("/progreso/retroalimentacion/examenes")}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Ver Exámenes
              </button>
            </div>

          </div>
        </div>





        {/* Tabla de resultados */}
        {(results.length > 0 || resultsLoading) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#1f384c]">
                  Resultados de Retroalimentación
                </h3>
                {total > 0 && (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      Mostrando {results.length} de {total} resultado{total !== 1 ? 's' : ''}
                    </span>
                    {hasMore && (
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Hay más resultados disponibles
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {resultsLoading && results.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f384c] mx-auto mb-4"></div>
                  <p className="text-gray-600">Buscando datos...</p>
                </div>
              </div>
            ) : results.length > 0 ? (
              <>
                <GenericTable
                  data={results}
                  columns={columns}
                  onShow={handleViewDetail}
                  defaultItemsPerPage={10}
                  showActions={{ show: true, edit: false, delete: false, add: false }}
                  tooltipText="Ver detalle de retroalimentación"
                  showSearch={true}
                />
                
                {/* Botón Cargar Más */}
                {hasMore && (
                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex justify-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={resultsLoading}
                        className="px-6 py-2 bg-[#1f384c] text-white rounded-md hover:bg-[#2a4a5f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        {resultsLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Cargando...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Cargar más resultados</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron resultados con los filtros aplicados</p>
              </div>
            )}
          </div>
        )}

        {/* Mostrar mensaje cuando no hay resultados después de una búsqueda */}
        {resultsError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{resultsError}</p>
          </div>
        )}


      </div>

      {/* Modal de detalle de retroalimentación */}
      {showDetailModal && selectedFeedbackItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-[#1f384c]">Detalle de Retroalimentación</h2>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <FeedbackDetailsContent feedbackItem={selectedFeedbackItem} />
            </div>
          </div>
        </div>
      )}

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

export default Feedback
