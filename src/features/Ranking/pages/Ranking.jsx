"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { ChevronDown, Globe, FileText, Calendar, Filter, X } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { useGetRankingMetrics } from "../hooks/useGetRankingMetrics"
import { useGetStudentsByCourse } from "../hooks/useGetStudentsByCourse"
import { useGetStudentsByProgram } from "../hooks/useGetStudentsByProgram"
import { generateRealRanking } from "../services/rankingService"
import FilterDropdown from "../components/FilterDropdown"
import RankingCard from "../components/RankingCard"
// Importar las funciones de utilidad para mostrar el rol
import { getUserRole, getRoleDisplayName } from "../../../shared/utils/roleDisplay"

const Ranking = () => {
  // Estado para el año y mes seleccionados
  const [selectedYear, setSelectedYear] = useState(2025)
  const [selectedMonth, setSelectedMonth] = useState("")
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { user, logout } = useAuth()  // Obtener el usuario actual
  const navigate = useNavigate()
  const dropdownRef = useRef(null)
  const monthDropdownRef = useRef(null)
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false)
  const yearDropdownRef = useRef(null)

  // Estados para los filtros
  const [selectedFicha, setSelectedFicha] = useState("")
  const [selectedPrograma, setSelectedPrograma] = useState("")

  // Hook para obtener datos generales de la API
  const {
    metrics,
    fichas,
    programas,
    students,
    allStudents,
    loading,
    error,
    refetch,
    updateFichasByPrograma,
    updateProgramasByFicha,
  } = useGetRankingMetrics(selectedYear, selectedMonth)

  // Hooks para obtener estudiantes específicos por ficha y programa
  const { students: studentsByFicha, loading: loadingStudentsByFicha } = useGetStudentsByCourse(selectedFicha)
  const { students: studentsByPrograma, loading: loadingStudentsByPrograma } = useGetStudentsByProgram(selectedPrograma)

  // Lista de meses
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  // Add click outside handler for user dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(event.target)) {
        setIsMonthDropdownOpen(false)
      }
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target)) {
        setIsYearDropdownOpen(false)
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

  // Función para seleccionar un año
  const handleYearSelect = (year) => {
    setSelectedYear(year)
    setIsYearDropdownOpen(false)
  }

  // Función para seleccionar un mes
  const handleMonthSelect = (month) => {
    setSelectedMonth(month)
    setIsMonthDropdownOpen(false)
  }

  // Función para limpiar filtros de fecha
  const clearDateFilters = () => {
    setSelectedYear(2025)
    setSelectedMonth("")
  }

  // Función para alternar el menú desplegable de meses
  const toggleMonthDropdown = () => {
    setIsMonthDropdownOpen(!isMonthDropdownOpen)
  }

  // Función para alternar el menú desplegable de años
  const toggleYearDropdown = () => {
    setIsYearDropdownOpen(!isYearDropdownOpen)
  }

  // Manejar selección de ficha
  const handleFichaSelect = (ficha) => {
    console.log("🎯 Ficha selected:", ficha)
    setSelectedFicha(ficha)

    if (ficha) {
      // Actualizar programas basado en la ficha seleccionada
      updateProgramasByFicha(ficha)

      // Limpiar selección de programa si no está relacionado con la ficha
      if (selectedPrograma) {
        const programasRelacionados = programas.filter((p) =>
          allStudents.some((student) => student.ficha?.includes(ficha) && student.programa === p.id),
        )
        if (!programasRelacionados.some((p) => p.id === selectedPrograma)) {
          setSelectedPrograma("")
        }
      }
    } else {
      // Si se limpia la ficha, restaurar todos los programas
      updateProgramasByFicha(null)
    }
  }

  // Manejar selección de programa
  const handleProgramaSelect = (programa) => {
    console.log("🎯 Programa selected:", programa)
    setSelectedPrograma(programa)

    if (programa) {
      // Actualizar fichas basado en el programa seleccionado
      updateFichasByPrograma(programa)

      // Limpiar selección de ficha si no está relacionada con el programa
      if (selectedFicha) {
        const fichasRelacionadas = fichas.filter((f) =>
          allStudents.some((student) => student.programa === programa && student.ficha?.includes(f.id)),
        )
        if (!fichasRelacionadas.some((f) => f.id === selectedFicha)) {
          setSelectedFicha("")
        }
      }
    } else {
      // Si se limpia el programa, restaurar todas las fichas
      updateFichasByPrograma(null)
    }
  }

  // Memoizar los datos de ranking para cada tipo
  const aprendicesRankingData = useMemo(() => {
    console.log(`🎯 Calculating aprendices ranking data`)
    return generateRealRanking(allStudents, "general", null, selectedYear, selectedMonth)
  }, [allStudents, selectedYear, selectedMonth])

  const fichaRankingData = useMemo(() => {
    console.log(`🎯 Calculating ficha ranking data for: ${selectedFicha}`)
    if (selectedFicha) {
      return generateRealRanking(allStudents, "ficha", selectedFicha, selectedYear, selectedMonth)
    }
    return generateRealRanking(allStudents, "general", null, selectedYear, selectedMonth)
  }, [allStudents, selectedFicha, selectedYear, selectedMonth])

  const programaRankingData = useMemo(() => {
    console.log(`🎯 Calculating programa ranking data for: ${selectedPrograma}`)
    if (selectedPrograma) {
      return generateRealRanking(allStudents, "programa", selectedPrograma, selectedYear, selectedMonth)
    }
    return generateRealRanking(allStudents, "general", null, selectedYear, selectedMonth)
  }, [allStudents, selectedPrograma, selectedYear, selectedMonth])

  // Generar datos de ranking basados en datos reales de la API
  const generateRankingData = (type, filterValue = null) => {
    console.log(`🎯 generateRankingData called with type: ${type}, filterValue: ${filterValue}`)

    switch (type) {
      case "aprendices":
        return aprendicesRankingData

      case "ficha":
        return fichaRankingData

      case "programa":
        return programaRankingData

      default:
        return aprendicesRankingData
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md w-full">
          <div className="text-red-500 text-lg mb-2">Error al cargar los datos</div>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
          <button onClick={refetch} className="px-4 py-2 bg-[#1f384c] text-white rounded hover:bg-[#2a4a5c] text-sm sm:text-base">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white py-3 px-4 sm:px-6 border-b border-[#d6dade] shadow-sm">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#1f384c]">Ranking</h1>
          <div className="relative w-full sm:w-auto" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors w-full sm:w-auto justify-between sm:justify-start"
            >
              <div className="text-left sm:text-right">
                <div className="text-sm font-medium">{user?.name}</div>
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

            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 transform transition-all">
                  <div className="p-4 sm:p-6">
                    <div className="text-center mb-4 sm:mb-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-[#1f384c]">Cerrar Sesión</h3>
                      <p className="mt-2 text-sm sm:text-base text-[#627b87]">¿Está seguro de que desea cerrar la sesión actual?</p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-3">
                      <button
                        className="px-4 sm:px-6 py-2.5 border border-[#d9d9d9] rounded-lg text-[#627b87] hover:bg-gray-50 font-medium transition-colors text-sm sm:text-base"
                        onClick={() => setShowLogoutConfirm(false)}
                      >
                        Cancelar
                      </button>
                      <button
                        className="px-4 sm:px-6 py-2.5 bg-[#f44144] text-white rounded-lg hover:bg-red-600 font-medium transition-colors text-sm sm:text-base"
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

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        {/* Filtros de año y mes */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex items-center">
              <div className="bg-gray-50 p-2 rounded-full mr-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-[#1f384c]" />
              </div>
              <span className="text-sm font-medium text-[#1f384c] mr-3">Filtros:</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
              <div className="flex items-center">
                <span className="text-xs font-medium text-[#1f384c] mr-2 min-w-[30px]">Año</span>
                <div className="relative" ref={yearDropdownRef}>
                  <button
                    className="flex items-center justify-between min-w-[80px] px-3 py-1.5 bg-white text-[#1f384c] text-xs rounded-md border border-[#d6dade] hover:bg-gray-50 transition-all duration-200 shadow-sm"
                    onClick={toggleYearDropdown}
                  >
                    <span className="font-medium">{selectedYear}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 ml-2 transition-transform duration-200 ${
                        isYearDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isYearDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[100px] bg-white border border-[#d6dade] rounded-lg shadow-lg z-20 py-2">
                      {[2023, 2024, 2025].map((year) => (
                        <button
                          key={year}
                          className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                            selectedYear === year
                              ? "bg-blue-50 text-[#1f384c] font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => handleYearSelect(year)}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center">
                <span className="text-xs font-medium text-[#1f384c] mr-2 min-w-[30px]">Mes</span>
                <div className="relative" ref={monthDropdownRef}>
                  <button
                    className="flex items-center justify-between min-w-[120px] px-3 py-1.5 bg-white text-[#1f384c] text-xs rounded-md border border-[#d6dade] hover:bg-gray-50 transition-all duration-200 shadow-sm"
                    onClick={toggleMonthDropdown}
                  >
                    <span className="font-medium">{selectedMonth || "Seleccionar"}</span>
                    <ChevronDown
                      className={`h-3.5 w-3.5 ml-2 transition-transform duration-200 ${
                        isMonthDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isMonthDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-[180px] bg-white border border-[#d6dade] rounded-lg shadow-lg z-20 py-2">
                      {months.map((month) => (
                        <button
                          key={month}
                          className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                            selectedMonth === month
                              ? "bg-blue-50 text-[#1f384c] font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => handleMonthSelect(month)}
                        >
                          {month}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botón para limpiar filtros */}
              <button
                onClick={clearDateFilters}
                className="flex items-center px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-md border border-gray-300 transition-all duration-200 shadow-sm w-fit"
                title="Limpiar filtros de fecha"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Limpiar
              </button>
            </div>

            <div className="flex items-center justify-center sm:justify-end">
              <div className="bg-blue-50 px-3 py-1.5 rounded-md text-xs text-[#1f384c] font-medium flex items-center">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                <span className="hidden sm:inline">Periodo: </span>
                {selectedMonth || "Todos"} {selectedYear}
              </div>
            </div>
          </div>
        </div>

        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Tarjeta Top Ranking de Aprendices */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="bg-blue-50 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#627b87]">Top Ranking de Aprendices</p>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1f384c]">{loading ? "..." : metrics.aprendices}</h2>
              </div>
            </div>
          </div>

          {/* Tarjeta Total de Fichas */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center">
              <div className="bg-purple-50 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#627b87]">Total de Fichas</p>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1f384c]">{loading ? "..." : metrics.fichas}</h2>
              </div>
            </div>
          </div>

          {/* Tarjeta Total de Programas */}
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="bg-green-50 p-2 sm:p-3 rounded-full mr-3 sm:mr-4">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-500" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-[#627b87]">Total de Programas</p>
                <h2 className="text-xl sm:text-2xl font-bold text-[#1f384c]">{loading ? "..." : metrics.programas}</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Información de filtros activos */}
        {(selectedFicha || selectedPrograma) && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-[#d6dade]">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-[#1f384c]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#627b87]" />
                <span className="font-medium">Filtros activos:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                {selectedFicha && (
                  <span className="bg-white px-3 py-1 rounded-md text-xs border border-[#d6dade] text-[#1f384c] w-fit">
                    Ficha: {selectedFicha} ({studentsByFicha.length} estudiantes)
                  </span>
                )}
                {selectedPrograma && (
                  <span className="bg-white px-3 py-1 rounded-md text-xs border border-[#d6dade] text-[#1f384c] w-fit">
                    Programa: {selectedPrograma} ({studentsByPrograma.length} estudiantes)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sección de tablas */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 p-3 min-h-0">
            {/* Top Ranking de Aprendices */}
            <RankingCard
              title="Top Ranking de Aprendices"
              icon={<Globe className="h-4 w-4" />}
              color="blue"
              data={generateRankingData("aprendices")}
              loading={loading}
              error={error}
            />

            {/* Total de Fichas */}
            <RankingCard
              title="Total de Fichas"
              icon={<FileText className="h-4 w-4" />}
              color="purple"
              data={generateRankingData("ficha")}
              loading={loading}
              error={error}
              filterComponent={
                <FilterDropdown
                  options={fichas}
                  selectedValue={selectedFicha}
                  onSelect={handleFichaSelect}
                  placeholder="Seleccionar ficha"
                  displayKey="name"
                  valueKey="id"
                  loading={loading}
                />
              }
            />

            {/* Total de Programas */}
            <RankingCard
              title="Total de Programas"
              icon={<Calendar className="h-4 w-4" />}
              color="green"
              data={generateRankingData("programa")}
              loading={loading}
              error={error}
              filterComponent={
                <FilterDropdown
                  options={programas}
                  selectedValue={selectedPrograma}
                  onSelect={handleProgramaSelect}
                  placeholder="Seleccionar programa"
                  displayKey="name"
                  valueKey="id"
                  loading={loading}
                />
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ranking
