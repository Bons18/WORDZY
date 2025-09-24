"use client"

import React, { useState, useEffect, useRef } from "react"
import { ChevronDown, Eye, RefreshCw, User } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import Tooltip from "../../../shared/components/Tooltip"
import { useDashboardData } from "../hooks/use-dashboard-data"
import DashboardDebugInfo from "./dashboard-debug-info"
// Removido import del componente Ranking completo - ahora usamos estadísticas
// Importar las funciones de utilidad para mostrar el rol del usuario
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import { useGetRankingMetrics } from "../../Ranking/hooks/useGetRankingMetrics"
import { generateRealRanking, getUniqueFichas, getUniqueProgramas } from "../../Ranking/services/rankingService"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"

// Datos de ranking (mantenemos los datos estáticos para el ranking)
const rankingDataByFicha = {
  "2889927-801": [
    { id: 1, name: "Rafael Pereira", points: 967 },
    { id: 2, name: "Brayan Restrepo", points: 724 },
    { id: 3, name: "Zurangely Portillo", points: 601 },
    { id: 4, name: "Dickson Mosquera", points: 510 },
    { id: 5, name: "Diego Alejandro", points: 508 },
  ],
  "2889927-802": [
    { id: 1, name: "María González", points: 892 },
    { id: 2, name: "Carlos Mendoza", points: 756 },
    { id: 3, name: "Ana Rodríguez", points: 643 },
    { id: 4, name: "Luis Herrera", points: 587 },
    { id: 5, name: "Sofia Martínez", points: 521 },
  ],
}

const rankingDataByPrograma = {
  "analisis-software": [
    { id: 1, name: "Kevin Ospina", points: 945 },
    { id: 2, name: "Natalia Pérez", points: 823 },
    { id: 3, name: "Julián Gómez", points: 767 },
    { id: 4, name: "Paola Díaz", points: 692 },
    { id: 5, name: "Esteban Rojas", points: 638 },
  ],
  "tecnico-programacion": [
    { id: 1, name: "Melissa Aguilar", points: 889 },
    { id: 2, name: "Nicolás Vega", points: 734 },
    { id: 3, name: "Laura Ortiz", points: 681 },
    { id: 4, name: "Felipe Guerrero", points: 625 },
    { id: 5, name: "Andrea Mejía", points: 573 },
  ],
}

const defaultRankingData = [
  { id: 1, name: "Rafael Pereira", points: 967 },
  { id: 2, name: "Brayan Restrepo", points: 724 },
  { id: 3, name: "Zurangely Portillo", points: 601 },
  { id: 4, name: "Dickson Mosquera", points: 510 },
  { id: 5, name: "Diego Alejandro", points: 508 },
]

const fichasData = [
  { id: "2889927-801", name: "2889927-801" },
  { id: "2889927-802", name: "2889927-802" },
  { id: "2889927-803", name: "2889927-803" },
  { id: "2889927-804", name: "2889927-804" },
]

const programasData = [
  { id: "analisis-software", name: "Análisis y desarrollo de software" },
  { id: "tecnico-programacion", name: "Técnico en programación" },
]

const DashboardUpdated = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [activeRankingTab, setActiveRankingTab] = useState("aprendices")
  const [selectedYear, setSelectedYear] = useState(2025)
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [currentRankingData, setCurrentRankingData] = useState(defaultRankingData)
  
  // Estados para filtros del ranking
  const [activeRankingFilter, setActiveRankingFilter] = useState("general")
  
  // Estados para filtros del dashboard
  const [dashboardFilters, setDashboardFilters] = useState({
    year: new Date().getFullYear().toString(),
    fichaId: null,
    programId: null
  })

  // Estados para los selects de Ficha y Programa
  const [selectedFicha, setSelectedFicha] = useState("")
  const [showFichaDropdown, setShowFichaDropdown] = useState(false)
  const [selectedPrograma, setSelectedPrograma] = useState("")
  const [showProgramaDropdown, setShowProgramaDropdown] = useState(false)




  // Obtener el usuario actual del contexto de autenticación
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const yearDropdownRef = useRef(null)
  const fichaDropdownRef = useRef(null)
  const programaDropdownRef = useRef(null)
  


  // Hook para obtener datos del dashboard desde el backend
  const { 
    dashboardData, 
    rankingData, 
    competenciesData, 
    lessonStats,
    loading, 
    error, 
    refetch,
    fetchDashboardData,
    refreshRanking,
    refreshCompetencies,
    refreshLessonStats
  } = useDashboardData(dashboardFilters)

  // Hook para obtener datos del ranking desde la API
  const {
    metrics: rankingMetrics,
    students: allStudents,
    loading: rankingLoading,
    error: rankingError
  } = useGetRankingMetrics()
  
  console.log('🚀 Dashboard - rankingLoading:', rankingLoading, 'allStudents:', allStudents?.length, 'rankingError:', rankingError)

  // Sample data for the dashboard (mantenemos algunos datos estáticos)
  const competencyData = {
    listening: 85,
    vocabulary: 50,
    grammar: 32,
    reading: 18,
    writing: 60,
  }

  const studentPoints = 862
  const completionRate = 20.79

  // Generar ranking real desde la API o usar datos de ejemplo
  const topRankingData = React.useMemo(() => {
    if (!rankingLoading && allStudents && allStudents.length > 0) {
      try {
        return generateRealRanking(allStudents, "general", null, null, null).slice(0, 5);
      } catch (error) {
        console.warn('Error generating real ranking, using default data:', error);
        return defaultRankingData;
      }
    }
    return defaultRankingData;
  }, [allStudents, rankingLoading]);



  // Generar ranking real por programas desde la API (top programas con sus mejores aprendices)
  const programaRankingData = React.useMemo(() => {
    if (!rankingLoading && allStudents && allStudents.length > 0) {
      try {
        const uniqueProgramas = getUniqueProgramas(allStudents);
        const programaRankings = uniqueProgramas.map(programa => {
          // Obtener el mejor aprendiz de este programa
          const programaStudents = generateRealRanking(allStudents, "programa", programa.id, null, null);
          const bestStudent = programaStudents.length > 0 ? programaStudents[0] : null;
          
          if (bestStudent) {
            return {
              id: programa.id,
              nombre: programa.name,
              puntos: bestStudent.puntos,
              bestStudent: bestStudent.nombre,
              totalStudents: programaStudents.length,
              programa: programa.id,
              ficha: bestStudent.ficha || bestStudent.fichas?.[0] || 'Sin ficha'
            };
          }
          return null;
        }).filter(Boolean);
        
        return programaRankings.sort((a, b) => b.puntos - a.puntos).slice(0, 5);
      } catch (error) {
        console.warn('Error generating programa ranking, using static data:', error);
        return defaultRankingData;
      }
    }
    return defaultRankingData;
  }, [allStudents, rankingLoading]);

  // Función para obtener estadísticas de lecciones dinámicamente
  const getCurrentLessonStats = (level) => {
    if (lessonStats && lessonStats.level === level) {
      return {
        won: lessonStats.stats.porcentajeGanadas || 0,
        lost: lessonStats.stats.porcentajePerdidas || 0
      };
    }
    return { won: 0, lost: 0 };
  };

  const [showLevelDropdown, setShowLevelDropdown] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(1)
  const levelDropdownRef = useRef(null)
  const [showLessonsLevelDropdown, setShowLessonsLevelDropdown] = useState(false)
  const [selectedLessonsLevel, setSelectedLessonsLevel] = useState(1)
  const lessonsLevelDropdownRef = useRef(null)
  const [lessonsStats, setLessonsStats] = useState({ won: 0, lost: 0 })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setShowYearDropdown(false)
      }
      if (fichaDropdownRef.current && !fichaDropdownRef.current.contains(event.target)) {
        setShowFichaDropdown(false)
      }
      if (programaDropdownRef.current && !programaDropdownRef.current.contains(event.target)) {
        setShowProgramaDropdown(false)
      }
      if (levelDropdownRef.current && !levelDropdownRef.current.contains(event.target)) {
        setShowLevelDropdown(false)
      }
      if (lessonsLevelDropdownRef.current && !lessonsLevelDropdownRef.current.contains(event.target)) {
        setShowLessonsLevelDropdown(false)
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

  const handleViewProfile = () => {
    setIsDropdownOpen(false)
    navigate("/perfil")
  }

  const handleYearSelect = (year) => {
    setSelectedYear(year)
    setShowYearDropdown(false)
    // Aquí podrías agregar lógica para filtrar por año si es necesario
  }

  const navigateToLevelDetail = (level) => {
    sessionStorage.setItem("selectedNivelId", level.id)
    sessionStorage.setItem("selectedNivelNombre", level.nivel)
    navigate("/progreso/cursosProgramados/fichas")
  }

  // Helper function to get status color based on progress percentage
  const getStatusColor = (progress) => {
    const percentage = Number.parseInt(progress)
    if (percentage >= 80) return "bg-blue-500"
    if (percentage >= 50) return "bg-yellow-300"
    return "bg-red-500"
  }

  // Helper function to get color for competency bars based on percentage
  const getCompetencyColor = (value) => {
    if (value >= 80) return "bg-blue-400"
    if (value >= 50) return "bg-yellow-400"
    return "bg-red-500"
  }

  const updateRankingData = async (tab, filters = {}) => {
    try {
      const rankingFilters = {
        ...dashboardFilters,
        ...filters
      };
      
      if (tab === 'programa' && selectedPrograma) {
        rankingFilters.programId = selectedPrograma;
      }
      
      await refreshRanking(rankingFilters);
    } catch (error) {
      console.error('Error updating ranking data:', error);
    }
  };

  // Efecto para actualizar datos cuando cambian los filtros de ficha o programa
  useEffect(() => {
    if (activeRankingTab && (selectedFicha || selectedPrograma)) {
      updateRankingData(activeRankingTab);
    }
  }, [selectedFicha, selectedPrograma])



  // Generar años disponibles (2025 en adelante)
  const currentYear = new Date().getFullYear()
  const availableYears = []
  for (let year = Math.max(2025, currentYear); year <= currentYear + 5; year++) {
    availableYears.push(year)
  }
  
  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetchDashboardData(dashboardFilters);
  }, [fetchDashboardData, dashboardFilters]);
  
  // Función para manejar cambios en filtros
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...dashboardFilters,
      [filterType]: value
    };
    setDashboardFilters(newFilters);
  };
  
  // Función para manejar cambio de nivel en competencias
  const handleLevelChange = async (level) => {
    setSelectedLevel(level);
    await Promise.all([
      refreshCompetencies(level),
      refreshLessonStats(level)
    ]);
  };

  // Función para manejar cambio de nivel en lecciones
  const handleLessonsLevelChange = async (level) => {
    setSelectedLessonsLevel(level);
    await refreshLessonStats(level);
    // Actualizar el estado local con los nuevos datos
    const newStats = getCurrentLessonStats(level);
    setLessonsStats(newStats);
  };

  // Efecto para actualizar estadísticas de lecciones cuando cambian los datos del backend
  useEffect(() => {
    const currentStats = getCurrentLessonStats(selectedLessonsLevel);
    setLessonsStats(currentStats);
  }, [lessonStats, selectedLessonsLevel]);




  // Efecto para cargar competencias cuando cambia el nivel
  useEffect(() => {
    if (selectedLevel) {
      refreshCompetencies(selectedLevel);
    }
  }, [selectedLevel, refreshCompetencies]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white py-3 px-4 sm:px-6 border-b border-[#d6dade] shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1f384c]">Dashboard</h1>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 text-[#1f384c] px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col items-end text-right">
                <span className="text-sm font-medium">{user?.name} {user?.lastName}</span>
                <span className="text-xs text-gray-500">{getRoleDisplayName(getUserRole(user))}</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform text-gray-400 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <button
                  onClick={handleViewProfile}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <User className="w-4 h-4 mr-2" />
                  Ver Perfil
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all">
                  <div className="p-6">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-semibold text-[#1f384c]">Cerrar Sesión</h3>
                      <p className="mt-2 text-[#627b87]">¿Está seguro de que desea cerrar la sesión actual?</p>
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        className="px-6 py-2.5 border border-[#d9d9d9] rounded-lg text-[#627b87] hover:bg-gray-50 font-medium transition-colors"
                        onClick={() => setShowLogoutConfirm(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="px-6 py-2.5 bg-[#f44144] text-white rounded-lg hover:bg-red-600 font-medium transition-colors"
                        onClick={handleLogout}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* El resto del componente permanece igual */}
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Promedio de lecciones */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-[#1f384c]">Promedio de lecciones</h2>
                <div className="relative" ref={lessonsLevelDropdownRef}>
                  <button
                    onClick={() => setShowLessonsLevelDropdown(!showLessonsLevelDropdown)}
                    className="flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    NIVEL {selectedLessonsLevel || 1}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform ${showLessonsLevelDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showLessonsLevelDropdown && (
                    <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[100px]">
                      {[1, 2, 3, 4, 5, 6].map((level) => (
                        <button
                          key={level}
                          onClick={() => {
                            handleLessonsLevelChange(level)
                            setShowLessonsLevelDropdown(false)
                          }}
                          className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-gray-100 ${
                            level === selectedLessonsLevel ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-700"
                          }`}
                        >
                          Nivel {level}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Div para lecciones completadas */}
                <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-green-800 mb-1">Lecciones Completadas</h3>
                      <p className="text-sm text-green-600">Material de apoyo aprobado</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-700">
                        {lessonStats ? Math.round(lessonStats.stats?.porcentajeGanadas || 0) : 0}%
                      </div>
                      <div className="text-sm text-green-600">
                        {lessonStats ? lessonStats.stats?.leccionesGanadas || 0 : 0} de {lessonStats ? lessonStats.stats?.totalLecciones || 0 : 0}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-green-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${lessonStats ? lessonStats.stats?.porcentajeGanadas || 0 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Div para lecciones pendientes */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-orange-800 mb-1">Lecciones Pendientes</h3>
                      <p className="text-sm text-orange-600">Material de apoyo por completar</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-orange-700">
                        {lessonStats ? Math.round(lessonStats.stats?.porcentajePerdidas || 0) : 0}%
                      </div>
                      <div className="text-sm text-orange-600">
                        {lessonStats ? lessonStats.stats?.leccionesPerdidas || 0 : 0} de {lessonStats ? lessonStats.stats?.totalLecciones || 0 : 0}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-orange-200 rounded-full h-2">
                      <div 
                        className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${lessonStats ? lessonStats.stats?.porcentajePerdidas || 0 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Resumen total */}
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">Total de Lecciones:</span>
                    <span className="text-blue-900 font-bold text-lg">
                      {lessonStats ? lessonStats.stats?.totalLecciones || 0 : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-blue-700 text-sm">Promedio de Puntuación:</span>
                    <span className="text-blue-800 font-semibold">
                      {lessonStats ? Math.round(lessonStats.stats?.promedioScore || 0) : 0}/100
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Estadísticas del Ranking */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#1f384c]">Estadísticas del Ranking</h2>
                <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md text-sm font-medium">TOP 5</div>
              </div>

              {/* Pestañas de filtro del ranking */}
              <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setActiveRankingTab("aprendices");
                    updateRankingData("aprendices");
                  }}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeRankingTab === "aprendices"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Aprendices
                </button>
                <button
                  onClick={() => {
                    setActiveRankingTab("programa");
                    updateRankingData("programa");
                  }}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeRankingTab === "programa"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  Programa
                </button>
              </div>



              {/* Métricas principales según la pestaña activa */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {rankingLoading ? "..." : (
                      activeRankingTab === "aprendices" ? (topRankingData.length > 0 ? topRankingData[0]?.puntos || 200 : 200) :
                      (programaRankingData.length > 0 ? programaRankingData[0]?.puntos || 200 : 200)
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Puntos Máximos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {rankingLoading ? "..." : (
                      activeRankingTab === "aprendices" ? (rankingMetrics?.aprendices || 280) :
                      (programasData?.length || 2)
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {activeRankingTab === "aprendices" && "Aprendices"}
                    {activeRankingTab === "programa" && "Programas"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {rankingLoading ? "..." : (
                      activeRankingTab === "aprendices" ? (rankingMetrics?.fichas || 10) :
                      (rankingMetrics?.fichas || 10)
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {activeRankingTab === "aprendices" && "Fichas"}
                    {activeRankingTab === "programa" && "Fichas"}
                  </div>
                </div>
              </div>

              {/* Top 5 según la pestaña activa */}
              {rankingLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Cargando estadísticas...</span>
                </div>
              ) : rankingError ? (
                <div className="text-center py-8">
                  <div className="text-red-500 mb-2">⚠️ Error al cargar datos</div>
                  <div className="text-sm text-gray-500">Mostrando datos de ejemplo</div>
                </div>
              ) : null}

              {/* Contenido del ranking siempre visible */}
              <div className="space-y-3">
                {(() => {
                  let currentData = [];
                  
                  if (activeRankingTab === "aprendices") {
                    currentData = topRankingData && topRankingData.length > 0 ? topRankingData : defaultRankingData;
                  } else if (activeRankingTab === "programa") {
                    // Mostrar ranking por programas usando datos reales de la API
                    currentData = programaRankingData;
                  }
                  
                  return currentData.length > 0 ? (
                    currentData.map((item, index) => {
                      const colors = [
                        { bg: 'bg-yellow-50', border: 'border-yellow-400', badge: 'bg-yellow-400', text: 'text-yellow-600' },
                        { bg: 'bg-gray-50', border: 'border-gray-400', badge: 'bg-gray-400', text: 'text-gray-600' },
                        { bg: 'bg-orange-50', border: 'border-orange-400', badge: 'bg-orange-400', text: 'text-orange-600' },
                        { bg: 'bg-blue-50', border: 'border-blue-400', badge: 'bg-blue-400', text: 'text-blue-600' },
                        { bg: 'bg-green-50', border: 'border-green-400', badge: 'bg-green-400', text: 'text-green-600' }
                      ];
                      const color = colors[index] || colors[4];
                      
                      return (
                        <div key={item.documento || item.id || index} className={`flex items-center justify-between p-4 ${color.bg} rounded-lg border-l-4 ${color.border} mx-2`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 ${color.badge} text-white rounded-full flex items-center justify-center text-sm font-bold`}>
                              {index + 1}
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">
                                {activeRankingTab === "aprendices" 
                                  ? (item.nombre || item.name || `Estudiante ${item.documento || 'N/A'}`)
                                  : activeRankingTab === "programa" 
                                    ? item.bestStudent
                                    : item.nombre
                                }
                              </span>
                              <div className="text-xs text-gray-600 mt-1">
                                {activeRankingTab === "aprendices" && (
                                  item.ficha && Array.isArray(item.ficha) && item.ficha.length > 0 
                                    ? `Ficha ${item.ficha[0]}` 
                                    : item.ficha 
                                      ? `Ficha ${item.ficha}` 
                                      : 'Sin ficha'
                                )}
                                {activeRankingTab === "ficha" && (
                                  <div>
                                    <div>Ficha: {item.fichaName}</div>
                                  </div>
                                )}
                                {activeRankingTab === "programa" && (
                                  <div>
                                    <div>Programa: {item.nombre}</div>
                                    <div>Ficha: {item.ficha || 'Sin ficha'}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className={`text-lg font-bold ${color.text}`}>{item.puntos || item.points || 0} pts</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <div className="text-2xl mb-2">📊</div>
                      <p className="text-sm">No hay datos de ranking disponibles</p>
                    </div>
                  );
                })()
                }
              </div>

              {/* Enlace para ver ranking completo */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button 
                  onClick={() => {
                    // Navegar a la página de ranking con la pestaña correspondiente
                    navigate('/ranking', { state: { activeTab: activeRankingTab } });
                  }}
                  className="w-full text-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                >
                  Ver ranking completo de {activeRankingTab} →
                </button>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardUpdated
