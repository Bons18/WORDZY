import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowLeft, BookOpen, Award, CheckCircle, XCircle, Clock, ChevronRight, RefreshCw } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { getRoleDisplayName, getUserRole } from '../../../shared/utils/roleDisplay'
import ConfirmationModal from '../../../shared/components/ConfirmationModal'
import { generateQuestionFeedback, needsFeedbackGeneration } from '../services/questionFeedbackService'

const StudentDetails = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState('examenes')
  const [selectedItem, setSelectedItem] = useState(null)
  const [expandedItems, setExpandedItems] = useState({})
  const [expandedQuestions, setExpandedQuestions] = useState({}) // Nuevo estado para preguntas expandidas
  const [generatingFeedback, setGeneratingFeedback] = useState({}) // Estado para controlar la generación de feedback
  const [feedbackCache, setFeedbackCache] = useState({}) // Cache para evitar regenerar feedback
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const dropdownRef = useRef(null)
  
  const studentData = location.state?.student || null
  const focusTab = location.state?.focusTab || 'examenes'
  
  useEffect(() => {
    setActiveTab(focusTab)
  }, [focusTab])
  
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
  
  const handleGoBack = () => {
    navigate(-1)
  }

  // Función para alternar la expansión de preguntas
  const toggleQuestionExpansion = async (questionIndex) => {
    const isExpanding = !expandedQuestions[questionIndex]
    
    setExpandedQuestions(prev => ({
      ...prev,
      [questionIndex]: isExpanding
    }))

    // Si se está expandiendo y la pregunta necesita retroalimentación, generarla automáticamente
    if (isExpanding && selectedItem?.preguntas?.[questionIndex]) {
      const question = selectedItem.preguntas[questionIndex]
      const questionKey = `${selectedItem._id || selectedItem.nombre}-${questionIndex}`
      
      // Verificar si necesita generar retroalimentación y no está ya en cache
      if (needsFeedbackGeneration(question) && !feedbackCache[questionKey] && !generatingFeedback[questionKey]) {
        console.log(`🤖 Generando retroalimentación automática para pregunta ${questionIndex + 1}`);
        
        setGeneratingFeedback(prev => ({ ...prev, [questionKey]: true }))
        
        try {
          const feedback = await generateQuestionFeedback(
            question,
            `${studentData.nombre} ${studentData.apellido}`,
            selectedItem.nombre
          )
          
          // Guardar en cache
          setFeedbackCache(prev => ({ ...prev, [questionKey]: feedback }))
          
          // Actualizar la pregunta con la nueva retroalimentación
          setSelectedItem(prevItem => {
            if (!prevItem || !prevItem.preguntas) return prevItem
            
            const updatedQuestions = [...prevItem.preguntas]
            updatedQuestions[questionIndex] = {
              ...updatedQuestions[questionIndex],
              retroalimentacion: feedback
            }
            
            return {
              ...prevItem,
              preguntas: updatedQuestions
            }
          })
          
          console.log(`✅ Retroalimentación generada para pregunta ${questionIndex + 1}`)
        } catch (error) {
          console.error(`❌ Error generando retroalimentación para pregunta ${questionIndex + 1}:`, error)
        } finally {
          setGeneratingFeedback(prev => ({ ...prev, [questionKey]: false }))
        }
      }
    }
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No se encontraron datos del estudiante
          </h2>
          <p className="text-gray-600 mb-4">
            Por favor, regresa y selecciona un estudiante válido.
          </p>
          <button
            onClick={handleGoBack}
            className="px-4 py-2 bg-[#1f384c] text-white rounded-md hover:bg-[#2d4a5c] transition-colors"
          >
            Regresar
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (date) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'aprobado':
        return 'bg-green-100 text-green-800'
      case 'reprobado':
        return 'bg-red-100 text-red-800'
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getGradeColor = (calificacion) => {
    if (calificacion >= 4.0) return 'text-green-600'
    if (calificacion >= 3.0) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleShowDetails = (item) => {
    setSelectedItem(item)
  }

  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const getOtherItems = (currentItem, type) => {
    if (type === 'examenes') {
      return studentData.examenes?.filter(exam => exam._id !== currentItem._id) || []
    } else {
      return studentData.actividades?.filter(activity => activity._id !== currentItem._id) || []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {studentData.nombre} {studentData.apellido}
                </h1>
                <p className="text-sm text-gray-500">
                  {studentData.email}
                </p>
              </div>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <span className="text-sm font-medium">
                  {user?.nombre} {user?.apellido}
                </span>
                <span className="text-xs text-gray-500">
                  {getRoleDisplayName(getUserRole(user))}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
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
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'examenes', label: 'Exámenes', icon: BookOpen, count: studentData.examenes?.length || 0 },
                { id: 'actividades', label: 'Actividades', icon: Award, count: studentData.actividades?.length || 0 }
              ].map(({ id, label, icon: Icon, count }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-[#1f384c] text-[#1f384c]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label} ({count})
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'examenes' && (
              <div>
                <h3 className="text-lg font-medium text-[#1f384c] mb-4">
                  Exámenes Realizados ({studentData.examenes?.length || 0})
                </h3>
                {studentData.examenes && studentData.examenes.length > 0 ? (
                  <div className="space-y-4">
                    {studentData.examenes.map((examen) => {
                      const otherItems = getOtherItems(examen, 'examenes')
                      const isExpanded = expandedItems[examen._id]
                      
                      return (
                        <div key={examen._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{examen.nombre}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-500">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  {formatDate(examen.fecha)}
                                </span>
                                <span className={`text-sm font-medium ${getGradeColor(examen.calificacion)}`}>
                                  Calificación: {examen.calificacion}/5.0
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(examen.estado)}`}>
                                  {examen.estado}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleShowDetails(examen)}
                                className="px-3 py-1 bg-[#1f384c] text-white text-sm rounded-md hover:bg-[#2d4a5c] transition-colors"
                              >
                                Ver Detalles
                              </button>
                              {otherItems.length > 0 && (
                                <button
                                  onClick={() => toggleItemExpansion(examen._id)}
                                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                                  title="Ver otros exámenes"
                                >
                                  <ChevronRight 
                                    className={`w-4 h-4 text-gray-500 transition-transform ${
                                      isExpanded ? 'rotate-90' : ''
                                    }`} 
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Retroalimentación */}
                          {examen.retroalimentacion && (
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
                              <p className="text-sm text-blue-800">
                                <strong>Retroalimentación:</strong> {examen.retroalimentacion}
                              </p>
                            </div>
                          )}

                          {/* Lista desplegable de otros exámenes */}
                          {isExpanded && otherItems.length > 0 && (
                            <div className="mt-4 pl-4 border-l-2 border-gray-200">
                              <h5 className="text-sm font-medium text-gray-700 mb-3">
                                Otros Exámenes:
                              </h5>
                              <div className="space-y-3">
                                {otherItems.map((otherExamen) => (
                                  <div key={otherExamen._id} className="bg-gray-50 rounded-md p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h6 className="font-medium text-gray-800 text-sm">{otherExamen.nombre}</h6>
                                        <div className="flex items-center space-x-3 mt-1">
                                          <span className="text-xs text-gray-500">
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            {formatDate(otherExamen.fecha)}
                                          </span>
                                          <span className={`text-xs font-medium ${getGradeColor(otherExamen.calificacion)}`}>
                                            {otherExamen.calificacion}/5.0
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(otherExamen.estado)}`}>
                                            {otherExamen.estado}
                                          </span>
                                        </div>
                                        {/* Mostrar retroalimentación si existe */}
                                        {otherExamen.retroalimentacion && (
                                          <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                                            <p className="text-xs text-blue-800">
                                              <strong>Retroalimentación:</strong> {otherExamen.retroalimentacion}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleShowDetails(otherExamen)}
                                        className="px-2 py-1 bg-[#1f384c] text-white text-xs rounded hover:bg-[#2d4a5c] transition-colors ml-2"
                                      >
                                        Ver
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay exámenes registrados para este aprendiz</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'actividades' && (
              <div>
                <h3 className="text-lg font-medium text-[#1f384c] mb-4">
                  Actividades Realizadas ({studentData.actividades?.length || 0})
                </h3>
                {studentData.actividades && studentData.actividades.length > 0 ? (
                  <div className="space-y-4">
                    {studentData.actividades.map((actividad) => {
                      const otherItems = getOtherItems(actividad, 'actividades')
                      const isExpanded = expandedItems[actividad._id]
                      
                      return (
                        <div key={actividad._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{actividad.nombre}</h4>
                              <div className="flex items-center space-x-4 mt-1">
                                <span className="text-sm text-gray-500">
                                  <Clock className="w-4 h-4 inline mr-1" />
                                  {formatDate(actividad.fecha)}
                                </span>
                                <span className={`text-sm font-medium ${getGradeColor(actividad.calificacion)}`}>
                                  Calificación: {actividad.calificacion}/5.0
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(actividad.estado)}`}>
                                  {actividad.estado}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleShowDetails(actividad)}
                                className="px-3 py-1 bg-[#1f384c] text-white text-sm rounded-md hover:bg-[#2d4a5c] transition-colors"
                              >
                                Ver Detalles
                              </button>
                              {otherItems.length > 0 && (
                                <button
                                  onClick={() => toggleItemExpansion(actividad._id)}
                                  className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                                  title="Ver otras actividades"
                                >
                                  <ChevronRight 
                                    className={`w-4 h-4 text-gray-500 transition-transform ${
                                      isExpanded ? 'rotate-90' : ''
                                    }`} 
                                  />
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {/* Retroalimentación */}
                          {actividad.retroalimentacion && (
                            <div className="bg-green-50 border-l-4 border-green-400 p-3 rounded">
                              <p className="text-sm text-green-800">
                                <strong>Retroalimentación:</strong> {actividad.retroalimentacion}
                              </p>
                            </div>
                          )}

                          {/* Lista desplegable de otras actividades */}
                          {isExpanded && otherItems.length > 0 && (
                            <div className="mt-4 pl-4 border-l-2 border-gray-200">
                              <h5 className="text-sm font-medium text-gray-700 mb-3">
                                Otras Actividades:
                              </h5>
                              <div className="space-y-3">
                                {otherItems.map((otraActividad) => (
                                  <div key={otraActividad._id} className="bg-gray-50 rounded-md p-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <h6 className="font-medium text-gray-800 text-sm">{otraActividad.nombre}</h6>
                                        <div className="flex items-center space-x-3 mt-1">
                                          <span className="text-xs text-gray-500">
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            {formatDate(otraActividad.fecha)}
                                          </span>
                                          <span className={`text-xs font-medium ${getGradeColor(otraActividad.calificacion)}`}>
                                            {otraActividad.calificacion}/5.0
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(otraActividad.estado)}`}>
                                            {otraActividad.estado}
                                          </span>
                                        </div>
                                        {/* Mostrar retroalimentación si existe */}
                                        {otraActividad.retroalimentacion && (
                                          <div className="mt-2 p-2 bg-green-50 rounded border-l-4 border-green-400">
                                            <p className="text-xs text-green-800">
                                              <strong>Retroalimentación:</strong> {otraActividad.retroalimentacion}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                      <button
                                        onClick={() => handleShowDetails(otraActividad)}
                                        className="px-2 py-1 bg-[#1f384c] text-white text-xs rounded hover:bg-[#2d4a5c] transition-colors ml-2"
                                      >
                                        Ver
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No hay actividades registradas para este aprendiz</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-[#1f384c]">
                  Detalles: {selectedItem.nombre}
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{formatDate(selectedItem.fecha)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Calificación</p>
                  <p className={`font-medium ${getGradeColor(selectedItem.calificacion)}`}>
                    {selectedItem.calificacion}/5.0
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedItem.estado)}`}>
                    {selectedItem.estado}
                  </span>
                </div>
              </div>

              {/* Retroalimentación */}
              {selectedItem.retroalimentacion && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Retroalimentación</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-blue-800">{selectedItem.retroalimentacion}</p>
                  </div>
                </div>
              )}

              {/* Preguntas (solo para exámenes) */}
              {selectedItem.preguntas && selectedItem.preguntas.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">
                    Preguntas y Respuestas ({selectedItem.preguntas.length})
                  </h4>
                  <div className="space-y-4">
                    {selectedItem.preguntas.map((pregunta, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Header clickeable de la pregunta */}
                        <div 
                          className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleQuestionExpansion(index)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3 flex-1">
                              <h5 className="font-medium text-gray-900">
                                {index + 1}. {pregunta.pregunta}
                              </h5>
                              {pregunta.esCorrecta ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <XCircle className="w-5 h-5 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-medium ${
                                pregunta.esCorrecta ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {pregunta.esCorrecta ? 'Correcta' : 'Incorrecta'}
                              </span>
                              <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                                expandedQuestions[index] ? 'rotate-90' : ''
                              }`} />
                            </div>
                          </div>
                        </div>
                        
                        {/* Contenido expandible */}
                        {expandedQuestions[index] && (
                          <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                            <div className="space-y-3 pt-3">
                              <div>
                                <p className="text-sm text-gray-600 mb-1">Respuesta del estudiante:</p>
                                <p className={`px-3 py-2 rounded-md ${
                                  pregunta.esCorrecta 
                                    ? 'bg-green-50 text-green-800 border border-green-200' 
                                    : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                  {pregunta.respuestaEstudiante}
                                </p>
                              </div>
                              
                              {!pregunta.esCorrecta && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Respuesta correcta:</p>
                                  <p className="px-3 py-2 bg-green-50 text-green-800 border border-green-200 rounded-md">
                                    {pregunta.respuestaCorrecta}
                                  </p>
                                </div>
                              )}
                              
                              {pregunta.retroalimentacion && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Retroalimentación:</p>
                                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                    <p className="text-blue-800 text-sm">{pregunta.retroalimentacion}</p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Indicador de carga para retroalimentación */}
                              {generatingFeedback[`${selectedItem._id || selectedItem.nombre}-${index}`] && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Retroalimentación:</p>
                                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                                    <div className="flex items-center space-x-2">
                                      <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />
                                      <p className="text-blue-800 text-sm">Generando retroalimentación automática...</p>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Mensaje cuando no hay retroalimentación */}
                              {!pregunta.retroalimentacion && !generatingFeedback[`${selectedItem._id || selectedItem.nombre}-${index}`] && (
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Retroalimentación:</p>
                                  <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                                    <p className="text-gray-500 text-sm italic">La retroalimentación se generará automáticamente al expandir esta pregunta.</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de logout */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
      />
    </div>
  )
}

export default StudentDetails