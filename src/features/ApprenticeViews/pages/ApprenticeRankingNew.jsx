"use client"
import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Award,
  Flame,
  Rocket,
  Zap,
  BookOpen,
  GraduationCap,
  Building2,
  BadgeCheck,
  Sparkles,
  Gem,
  Diamond,
  Hexagon,
  Shield,
  Flag,
  Target,
  TrendingUp,
  Trophy,
  Medal,
  Crown,
  Search,
  X,
  ChevronDown,
  SlidersHorizontal,
  Users,
  FileText,
  Trash2,
  BarChart3,
  User,
  Star,
} from "lucide-react"
import ApprenticeHeader from "../components/ApprenticeHeader"

const ApprenticeRankingNew = () => {
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState("aprendices")
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [displayedItems, setDisplayedItems] = useState([])

  // Estados para los filtros
  const [selectedFicha, setSelectedFicha] = useState("")
  const [selectedPrograma, setSelectedPrograma] = useState("")
  const [showFichaDropdown, setShowFichaDropdown] = useState(false)
  const [showProgramaDropdown, setShowProgramaDropdown] = useState(false)

  // Lista de fichas disponibles (simuladas)
  const fichas = [
    "2889927-801",
    "2889927-802",
    "2889927-803",
    "2889927-804",
    "2889927-805",
    "2889927-806",
    "2889927-807",
    "2889927-808",
  ]

  // Lista de programas disponibles
  const programas = ["Análisis y desarrollo de software", "Técnico en programación"]

  // Datos para cada categoría (ampliados para demostrar la paginación)
  const categoryData = {
    ficha: {
      podium: [
        { position: 2, name: "Carlos M.", points: 685 },
        { position: 1, name: "Laura S.", points: 890 },
        { position: 3, name: "Miguel A.", points: 542 },
      ],
      currentUser: {
        position: 5,
        name: "Laura S.",
        points: 890,
        ficha: "2889927-801",
      },
      ranking: [
        { id: 1, name: "Laura S.", points: 890, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        { id: 2, name: "Carlos M.", points: 685, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        { id: 3, name: "Miguel A.", points: 542, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        { id: 4, name: "Ana Gómez", points: 520, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        { id: 5, name: "Pedro Ruiz", points: 480, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 6,
          name: "Sofía Vargas",
          points: 450,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 7,
          name: "Daniel López",
          points: 420,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 8,
          name: "Valentina Torres",
          points: 410,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 9,
          name: "Javier Mendoza",
          points: 390,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 10,
          name: "Camila Rojas",
          points: 370,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
      ],
    },
    aprendices: {
      podium: [
        { position: 2, name: "Brayan R.", points: 724 },
        { position: 1, name: "Rafael P.", points: 967 },
        { position: 3, name: "Zurangely P.", points: 601 },
      ],
      currentUser: {
        position: 8,
        name: "Rafael P.",
        points: 967,
        ficha: "2889927-801",
      },
      ranking: [
        { id: 1, name: "Rafael P.", points: 967, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 2,
          name: "Dickson Mosquera",
          points: 508,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 3,
          name: "Zurangely Mota",
          points: 490,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        { id: 4, name: "Juan Pérez", points: 475, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 5,
          name: "Diego Alejandro",
          points: 450,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 6,
          name: "María González",
          points: 430,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 7,
          name: "Juan Martínez",
          points: 410,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 8,
          name: "Brayan Cortez",
          points: 400,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 9,
          name: "Ana Martínez",
          points: 395,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 10,
          name: "Carlos Rodríguez",
          points: 390,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
      ],
    },
    programa: {
      podium: [
        { position: 2, name: "Alejandro G.", points: 845 },
        { position: 1, name: "Carolina M.", points: 1024 },
        { position: 3, name: "Santiago R.", points: 780 },
      ],
      currentUser: {
        position: 4,
        name: "Carolina M.",
        points: 1024,
        ficha: "2889927-801",
      },
      ranking: [
        {
          id: 1,
          name: "Carolina M.",
          points: 1024,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 2,
          name: "Alejandro G.",
          points: 845,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 3,
          name: "Santiago R.",
          points: 780,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 4,
          name: "Valentina T.",
          points: 720,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        { id: 5, name: "Mateo L.", points: 650, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 6,
          name: "Isabella S.",
          points: 580,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 7,
          name: "Sebastián V.",
          points: 520,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        { id: 8, name: "Camila F.", points: 490, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        { id: 9, name: "Nicolás H.", points: 450, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 10,
          name: "Mariana L.",
          points: 420,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
      ],
    },
  }

  // Función para obtener el icono según la posición
  const getPositionIcon = (position) => {
    const iconProps = { size: 20, className: "mr-2" }
    switch (position) {
      case 1:
        return <Crown {...iconProps} className="mr-2 text-yellow-500" />
      case 2:
        return <Medal {...iconProps} className="mr-2 text-gray-400" />
      case 3:
        return <Award {...iconProps} className="mr-2 text-amber-600" />
      case 4:
        return <Trophy {...iconProps} className="mr-2 text-blue-500" />
      case 5:
        return <Target {...iconProps} className="mr-2 text-green-500" />
      case 6:
        return <Flame {...iconProps} className="mr-2 text-red-500" />
      case 7:
        return <Rocket {...iconProps} className="mr-2 text-purple-500" />
      case 8:
        return <Zap {...iconProps} className="mr-2 text-yellow-400" />
      case 9:
        return <BookOpen {...iconProps} className="mr-2 text-indigo-500" />
      case 10:
        return <GraduationCap {...iconProps} className="mr-2 text-pink-500" />
      default:
        return <BadgeCheck {...iconProps} className="mr-2 text-gray-500" />
    }
  }

  // Función para obtener el color del podio
  const getPodiumColor = (position) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-b from-yellow-400 to-yellow-600 text-white"
      case 2:
        return "bg-gradient-to-b from-gray-300 to-gray-500 text-white"
      case 3:
        return "bg-gradient-to-b from-amber-500 to-amber-700 text-white"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  // Función para obtener el icono del podio
  const getPodiumIcon = (position) => {
    switch (position) {
      case 1:
        return <Crown size={24} className="text-yellow-200" />
      case 2:
        return <Medal size={24} className="text-gray-200" />
      case 3:
        return <Award size={24} className="text-amber-200" />
      default:
        return null
    }
  }

  // Función para filtrar datos según los filtros seleccionados
  const getFilteredData = () => {
    let data = categoryData[activeTab].ranking

    if (selectedFicha) {
      data = data.filter((item) => item.ficha === selectedFicha)
    }

    if (selectedPrograma) {
      data = data.filter((item) => item.programa === selectedPrograma)
    }

    return data
  }

  // Efecto para actualizar la paginación cuando cambian los filtros o la pestaña
  useEffect(() => {
    const filteredData = getFilteredData()
    const totalItems = filteredData.length
    const newTotalPages = Math.ceil(totalItems / itemsPerPage)
    setTotalPages(newTotalPages)

    // Resetear a la primera página si la página actual es mayor que el total
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(1)
    }

    // Calcular los elementos a mostrar
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const itemsToShow = filteredData.slice(startIndex, endIndex)

    setDisplayedItems(itemsToShow)
  }, [activeTab, selectedFicha, selectedPrograma, currentPage, itemsPerPage])

  // Función para cambiar de página
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage)
    }
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedFicha("")
    setSelectedPrograma("")
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ApprenticeHeader title="Ranking" subtitle="Compite con otros aprendices y ve tu progreso" />
      
      {/* Main Content */}
      <main className="container mx-auto py-4 sm:py-6 lg:py-8 px-2 sm:px-4 lg:px-6 max-w-7xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">

          {/* Tabs */}
          <div className="bg-gradient-to-r from-indigo-100 via-blue-100 to-purple-100 border-b border-indigo-200">
            <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
              {[
                { key: "aprendices", label: "Aprendices", icon: <Users className="w-4 h-4" /> },
        { key: "ficha", label: "Por Ficha", icon: <Building2 className="w-4 h-4" /> },
        { key: "programa", label: "Por Programa", icon: <GraduationCap className="w-4 h-4" /> },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key)
                    setCurrentPage(1)
                  }}
                  className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 transform hover:scale-105 ${
                    activeTab === tab.key
                      ? "bg-gradient-to-r from-[#1f384c] to-[#2a4a64] text-white shadow-xl border-2 border-[#1f384c]"
                      : "bg-white text-gray-700 hover:text-[#1f384c] hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 border-2 border-gray-200 hover:border-blue-300 shadow-lg hover:shadow-xl"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label.replace(/^[^\s]+ /, '')}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Filters */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b border-blue-200">
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 lg:gap-6 items-start sm:items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                  <SlidersHorizontal size={20} className="text-white" />
                </div>
                <span className="text-lg font-bold text-gray-800 bg-white px-4 py-2 rounded-full shadow-md"><Target className="w-4 h-4 inline mr-2" />Filtros Avanzados:</span>
              </div>

              {/* Filtro por Ficha */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowFichaDropdown(!showFichaDropdown)
                    setShowProgramaDropdown(false)
                  }}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-white to-blue-50 border-2 border-blue-200 rounded-xl text-sm font-bold hover:from-blue-50 hover:to-blue-100 hover:border-blue-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[180px]"
                >
                  <span className="text-blue-700"><Building2 className="w-4 h-4 inline mr-1" />{selectedFicha || "Todas las fichas"}</span>
                  <ChevronDown size={16} className="text-blue-500" />
                </button>

                {showFichaDropdown && (
                  <div className="absolute top-full left-0 mt-3 w-64 bg-white border-2 border-blue-200 rounded-xl shadow-2xl z-10 overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedFicha("")
                        setShowFichaDropdown(false)
                      }}
                      className="w-full text-left px-6 py-4 text-sm font-semibold hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 border-b border-blue-100 text-blue-700"
                    >
                      <Building2 className="w-4 h-4 inline mr-1" />Todas las fichas
                    </button>
                    {fichas.map((ficha) => (
                      <button
                        key={ficha}
                        onClick={() => {
                          setSelectedFicha(ficha)
                          setShowFichaDropdown(false)
                        }}
                        className="w-full text-left px-6 py-4 text-sm font-medium hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 text-gray-700 hover:text-blue-700"
                      >
                        <FileText className="w-4 h-4 inline mr-1" />{ficha}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filtro por Programa */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowProgramaDropdown(!showProgramaDropdown)
                    setShowFichaDropdown(false)
                  }}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-white to-purple-50 border-2 border-purple-200 rounded-xl text-sm font-bold hover:from-purple-50 hover:to-purple-100 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 min-w-[220px]"
                >
                  <span className="text-purple-700"><GraduationCap className="w-4 h-4 inline mr-1" />{selectedPrograma || "Todos los programas"}</span>
                  <ChevronDown size={16} className="text-purple-500" />
                </button>

                {showProgramaDropdown && (
                  <div className="absolute top-full left-0 mt-3 w-80 bg-white border-2 border-purple-200 rounded-xl shadow-2xl z-10 overflow-hidden">
                    <button
                      onClick={() => {
                        setSelectedPrograma("")
                        setShowProgramaDropdown(false)
                      }}
                      className="w-full text-left px-6 py-4 text-sm font-semibold hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200 border-b border-purple-100 text-purple-700"
                    >
                      <GraduationCap className="w-4 h-4 inline mr-1" />Todos los programas
                    </button>
                    {programas.map((programa) => (
                      <button
                        key={programa}
                        onClick={() => {
                          setSelectedPrograma(programa)
                          setShowProgramaDropdown(false)
                        }}
                        className="w-full text-left px-6 py-4 text-sm font-medium hover:bg-gradient-to-r hover:from-purple-50 hover:to-purple-100 transition-all duration-200 text-gray-700 hover:text-purple-700"
                      >
                        <BookOpen className="w-4 h-4 inline mr-1" />{programa}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón para limpiar filtros */}
              {(selectedFicha || selectedPrograma) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-3 px-6 py-3 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 border-2 border-red-400 rounded-xl hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <X size={16} />
                  <Trash2 className="w-4 h-4 inline mr-1" />Limpiar filtros
                </button>
              )}
            </div>
          </div>

          {/* Podium */}
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Top 3
              <Trophy className="w-8 h-8 text-yellow-500" />
            </h2>
            <div className="flex justify-center items-end gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto">
              {/* Segundo lugar */}
              <div className="text-center transform hover:scale-105 transition-transform duration-200">
                <div
                  className={`w-16 h-20 sm:w-20 sm:h-24 lg:w-24 lg:h-28 rounded-xl ${getPodiumColor(
                    2
                  )} flex flex-col items-center justify-center mb-3 shadow-xl border-2 border-white`}
                >
                  <div className="text-4xl mb-2">{getPodiumIcon(2)}</div>
                  <span className="text-sm font-bold">2°</span>
                </div>
                <p className="font-bold text-lg text-gray-800 mb-1">{categoryData[activeTab].podium[0].name}</p>
                <p className="text-sm font-semibold text-gray-600 bg-white bg-opacity-70 rounded-full px-3 py-1">{categoryData[activeTab].podium[0].points} pts</p>
              </div>

              {/* Primer lugar */}
              <div className="text-center transform hover:scale-105 transition-transform duration-200">
                <div
                  className={`w-20 h-28 sm:w-24 sm:h-32 lg:w-28 lg:h-36 rounded-xl ${getPodiumColor(
                    1
                  )} flex flex-col items-center justify-center mb-3 shadow-xl border-2 border-white`}
                >
                  <div className="text-5xl mb-3">{getPodiumIcon(1)}</div>
                  <span className="text-base font-bold">1°</span>
                </div>
                <p className="font-bold text-xl text-gray-800 mb-1">{categoryData[activeTab].podium[1].name}</p>
                <p className="text-base font-semibold text-gray-600 bg-white bg-opacity-70 rounded-full px-4 py-1">{categoryData[activeTab].podium[1].points} pts</p>
              </div>

              {/* Tercer lugar */}
              <div className="text-center transform hover:scale-105 transition-transform duration-200">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-xl ${getPodiumColor(
                    3
                  )} flex flex-col items-center justify-center mb-3 shadow-xl border-2 border-white`}
                >
                  <div className="text-4xl mb-2">{getPodiumIcon(3)}</div>
                  <span className="text-sm font-bold">3°</span>
                </div>
                <p className="font-bold text-lg text-gray-800 mb-1">{categoryData[activeTab].podium[2].name}</p>
                <p className="text-sm font-semibold text-gray-600 bg-white bg-opacity-70 rounded-full px-3 py-1">{categoryData[activeTab].podium[2].points} pts</p>
              </div>
            </div>
          </div>

          {/* Current User Position */}
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white rounded-xl p-4 sm:p-6 shadow-md border border-blue-200 gap-4 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#1f384c] to-[#162a3a] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {getPositionIcon(categoryData[activeTab].currentUser.position)}
                </div>
                <div>
                  <div className="font-semibold text-lg text-gray-800">Tu posición</div>
                  <div className="text-sm text-gray-600 font-medium">{categoryData[activeTab].currentUser.name}</div>
                  <div className="text-xs text-gray-500">{categoryData[activeTab].currentUser.ficha}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl text-[#1f384c]">{categoryData[activeTab].currentUser.points} pts</div>
                <div className="text-sm text-gray-500 font-medium bg-[#1f384c] bg-opacity-10 px-3 py-1 rounded-full">Posición #{categoryData[activeTab].currentUser.position}</div>
              </div>
            </div>
          </div>

          {/* Ranking Table */}
          <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Ranking Completo</h3>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-200">
                      <th className="text-left py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8 font-bold text-gray-800 text-sm sm:text-base flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-blue-600" />
                        Posición
                      </th>
                      <th className="text-left py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8 font-bold text-gray-800 text-sm sm:text-base">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          Nombre
                        </div>
                      </th>
                      <th className="text-left py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8 font-bold text-gray-800 text-sm sm:text-base hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          Información
                        </div>
                      </th>
                      <th className="text-right py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8 font-bold text-gray-800 text-sm sm:text-base">
                        <div className="flex items-center justify-end gap-2">
                          <Target className="w-4 h-4 text-blue-600" />
                          Puntos
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-gray-100">
                    {displayedItems.map((item, index) => {
                      const globalPosition = (currentPage - 1) * itemsPerPage + index + 1
                      const isCurrentUser = item.name === categoryData[activeTab].currentUser.name

                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:shadow-lg group sm:hover:-translate-y-1 ${
                            isCurrentUser ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-blue-500 shadow-md' : ''
                          }`}
                        >
                          <td className="py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8">
                            <div className="flex items-center gap-4">
                              {globalPosition <= 3 ? (
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base lg:text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300 ${
                                  globalPosition === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                                  globalPosition === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                                  'bg-gradient-to-r from-orange-400 to-orange-600'
                                }`}>
                                  {globalPosition === 1 ? <Medal className="w-6 h-6 text-yellow-500" /> : globalPosition === 2 ? <Medal className="w-6 h-6 text-gray-400" /> : <Medal className="w-6 h-6 text-amber-600" />}
                                </div>
                              ) : (
                                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center border-2 border-blue-200 group-hover:border-blue-400 transition-all duration-300">
                                  <span className="text-gray-700 font-bold text-sm sm:text-base lg:text-lg">#{globalPosition}</span>
                                </div>
                              )}
                              <span className={`font-bold text-sm sm:text-base lg:text-lg hidden sm:inline ${
                                isCurrentUser ? 'text-[#1f384c]' : 'text-gray-800'
                              }`}>
                                Posición #{globalPosition}
                              </span>
                            </div>
                          </td>
                          <td className={`py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8 font-bold text-sm sm:text-base lg:text-lg ${
                            isCurrentUser ? 'text-[#1f384c]' : 'text-gray-800'
                          }`}>
                            <div className="flex items-center space-x-2 sm:space-x-3">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-blue-200 group-hover:border-blue-400 transition-all duration-300 shadow-md">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-bold text-sm sm:text-base lg:text-lg group-hover:text-[#1f384c] transition-colors">{item.name}{isCurrentUser ? ' (Tú)' : ''}</p>
                                <p className="text-sm text-gray-600 font-medium">Aprendiz SENA</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8 hidden lg:table-cell">
                            <div className="space-y-3">
                              <div className="flex items-center">
                                <Building2 size={16} className="mr-3 text-blue-600" />
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium border border-blue-200">
                                  {item.ficha}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <GraduationCap size={16} className="mr-3 text-gray-600" />
                                <span className="bg-gray-50 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium border border-gray-200">
                                  {item.programa}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className={`py-3 sm:py-4 lg:py-6 px-3 sm:px-4 lg:px-8 text-right font-bold text-sm sm:text-base lg:text-lg ${
                            isCurrentUser ? 'text-[#1f384c]' : 'text-gray-800'
                          }`}>
                            <div className="flex flex-col items-end space-y-1 sm:space-y-2">
                              <div className="flex items-center space-x-2 sm:space-x-3">
                                <div className="p-2 bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-lg shadow-md">
                                  <Star className="text-yellow-600 h-5 w-5" />
                                </div>
                                <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">{item.points}</span>
                              </div>
                              <span className="text-sm text-gray-500 font-medium bg-gray-100 px-3 py-1 rounded-full">puntos</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-b-xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 gap-4 sm:gap-0">
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="bg-white px-4 py-2 rounded-xl shadow-lg border-2 border-blue-200">
                    <span className="text-sm font-bold text-gray-700"><BarChart3 className="w-4 h-4 inline mr-1" />Mostrar:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value))
                        setCurrentPage(1)
                      }}
                      className="border-2 border-blue-300 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#1f384c] focus:border-[#1f384c] bg-gradient-to-r from-white to-blue-50 shadow-md hover:shadow-lg transition-all duration-300 ml-2"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-sm font-bold text-gray-700 ml-2">elementos por página</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 sm:space-x-3">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-3 rounded-xl border-2 border-[#1f384c] disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#162a3a] hover:to-[#1f384c] transition-all duration-300 bg-gradient-to-r from-[#1f384c] to-[#2a4a64] text-white shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  <div className="flex space-x-1 sm:space-x-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber
                      if (totalPages <= 5) {
                        pageNumber = i + 1
                      } else if (currentPage <= 3) {
                        pageNumber = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNumber = totalPages - 4 + i
                      } else {
                        pageNumber = currentPage - 2 + i
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-2 sm:px-3 lg:px-4 py-2 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                            currentPage === pageNumber
                              ? "bg-gradient-to-r from-[#1f384c] to-[#2a4a64] text-white border-2 border-[#1f384c]"
                              : "bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 text-gray-700"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="p-3 rounded-xl border-2 border-[#1f384c] disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#162a3a] hover:to-[#1f384c] transition-all duration-300 bg-gradient-to-r from-[#1f384c] to-[#2a4a64] text-white shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="bg-white px-6 py-3 rounded-xl shadow-lg border-2 border-blue-200">
                  <span className="text-sm font-bold text-gray-700"><FileText className="w-4 h-4 inline mr-1" />Página</span>
                  <span className="font-bold text-[#1f384c] mx-2 text-lg">{currentPage}</span>
                  <span className="text-sm font-bold text-gray-700">de</span>
                  <span className="font-bold text-[#1f384c] mx-2 text-lg">{totalPages}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ApprenticeRankingNew