"use client"

import { useState, useEffect, useRef } from "react"
import { getApprenticeById, getApprenticeStatsByLevel } from "../services/apprenticeService"
import { getAllCourses, getAllPrograms, getAllCourseProgrammings } from "../services/programDataService"

const ApprenticeDetailModal = ({ apprentice, isOpen, onClose }) => {
  const [apprenticeData, setApprenticeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [progressData, setProgressData] = useState({ levels: [], totalPoints: 0 })
  const [isProgressLoading, setIsProgressLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const modalRef = useRef(null)

  useEffect(() => {
    const fetchAllData = async () => {
      if (!apprentice?._id || !isOpen) return

      // Reset states
      setLoading(true)
      setIsProgressLoading(true)
      setApprenticeData(null)
      setProgressData({ levels: [], totalPoints: 0 })
      setErrorMessage("")

      try {
        // Step 1: Fetch basic apprentice data
        console.log("🔍 Cargando detalles del aprendiz:", apprentice._id)
        const detailedApprentice = await getApprenticeById(apprentice._id)
        setApprenticeData(detailedApprentice)
        setLoading(false)
        console.log("✅ Detalles básicos cargados:", detailedApprentice)

        // Step 2: Chain requests to get program levels
        if (!detailedApprentice.ficha || detailedApprentice.ficha.length === 0) {
          throw new Error("El aprendiz no tiene una ficha asignada.")
        }
        const fichaCode = detailedApprentice.ficha[0]
        console.log(`🔍 Buscando ficha con código: ${fichaCode}`)

        const allCourses = await getAllCourses()
        const course = allCourses.find((c) => c.code == fichaCode)
        if (!course) throw new Error(`No se encontró la ficha con el código ${fichaCode}.`)
        const programName = course.fk_programs
        console.log(`🔍 Buscando programa con nombre: ${programName}`)

        const allPrograms = await getAllPrograms()
        const program = allPrograms.find((p) => p.name === programName)
        if (!program) throw new Error(`No se encontró el programa "${programName}".`)
        const programId = program._id
        console.log(`🔍 Buscando programación para el programa con ID: ${programId}`)

        const allProgrammings = await getAllCourseProgrammings()
        const programming = allProgrammings.find((cp) => cp.programId?._id === programId)
        if (!programming || !programming.levels) {
          throw new Error(`No se encontró una programación de curso para el programa "${programName}".`)
        }

        const fetchedLevels = programming.levels
        console.log(`✅ Niveles encontrados: ${fetchedLevels.length}`, fetchedLevels)

        // Step 3: Fetch progress for each dynamic level
        console.log("🔄 Calculando progreso y puntos para los niveles encontrados...")
        let accumulatedPoints = 0
        const progressPromises = fetchedLevels.map((level, index) =>
          getApprenticeStatsByLevel(apprentice._id, index + 1),
        )

        const results = await Promise.all(progressPromises)
        const newLevelProgressData = []

        results.forEach((stats, index) => {
          const levelInfo = fetchedLevels[index]
          const levelNumber = index + 1
          let percentage = 0
          if (stats) {
            accumulatedPoints += stats.puntos
            percentage =
              stats.evaluacionesProgramadas > 0
                ? Math.round((stats.evaluacionesAprobadas / stats.evaluacionesProgramadas) * 100)
                : 0
          }
          newLevelProgressData.push({
            nivel: levelNumber,
            nombre: levelInfo.name || `Nivel ${levelNumber}`, // Fallback name
            porcentaje: percentage,
          })
        })

        setProgressData({
          levels: newLevelProgressData,
          totalPoints: accumulatedPoints,
        })
        console.log("✅ Progreso y puntos calculados:", {
          levels: newLevelProgressData,
          totalPoints: accumulatedPoints,
        })
      } catch (error) {
        console.error("❌ Error al obtener los datos de progreso del aprendiz:", error)
        setErrorMessage(error.message || "Ocurrió un error al cargar los datos del progreso.")
        setApprenticeData(apprentice) // Fallback to basic data
        setLoading(false)
      } finally {
        setIsProgressLoading(false)
      }
    }

    fetchAllData()
  }, [apprentice, isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {apprenticeData ? `${apprenticeData.nombre} ${apprenticeData.apellido}` : "Cargando..."}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Cerrar modal">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1f384c]"></div>
            </div>
          ) : apprenticeData ? (
            <div className="p-4">
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-3">Información General</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* General Info Fields */}
                  <div>
                    <p className="font-bold text-sm">Nombre:</p>
                    <p className="text-gray-600 text-sm">{apprenticeData.nombre}</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Apellido:</p>
                    <p className="text-gray-600 text-sm">{apprenticeData.apellido}</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Documento:</p>
                    <p className="text-gray-600 text-sm">{apprenticeData.documento}</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Tipo Documento:</p>
                    <p className="text-gray-600 text-sm">{apprenticeData.tipoDocumento}</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Teléfono:</p>
                    <p className="text-gray-600 text-sm">{apprenticeData.telefono}</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Correo:</p>
                    <p className="text-gray-600 text-sm">{apprenticeData.correo}</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Estado:</p>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        apprenticeData.estado === "En formación"
                          ? "bg-green-100 text-green-800"
                          : apprenticeData.estado === "Condicionado"
                            ? "bg-yellow-100 text-yellow-800"
                            : apprenticeData.estado === "Graduado"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {apprenticeData.estado}
                    </span>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Ficha:</p>
                    <p className="text-gray-600 text-sm">{apprenticeData.ficha?.[0] || "No asignada"}</p>
                  </div>
                  <div>
                    <p className="font-bold text-sm">Programa:</p>
                    <p className="text-gray-600 text-sm">{apprenticeData.programa || "No asignado"}</p>
                  </div>
                  {apprenticeData && (
                    <div>
                      <p className="font-bold text-sm">Puntos:</p>
                      {isProgressLoading ? (
                        <p className="text-gray-600 text-sm">Calculando...</p>
                      ) : (
                        <p className="text-gray-600 text-sm">{progressData.totalPoints}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-3">Progreso por Niveles</h4>
                {isProgressLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f384c]"></div>
                    <span className="ml-2 text-gray-600">Calculando progreso...</span>
                  </div>
                ) : errorMessage ? (
                  <div className="text-center py-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-red-700 text-sm font-semibold">Error al cargar el progreso</p>
                    <p className="text-red-600 text-xs mt-1">{errorMessage}</p>
                  </div>
                ) : progressData.levels.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {progressData.levels.map((nivelData) => (
                      <div key={nivelData.nivel} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-center mb-2">
                          <h5 className="font-bold text-sm text-gray-800 capitalize">{nivelData.nombre}</h5>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                              className={`h-3 rounded-full transition-all duration-300 ${
                                nivelData.porcentaje >= 80
                                  ? "bg-green-500"
                                  : nivelData.porcentaje >= 50
                                    ? "bg-yellow-500"
                                    : nivelData.porcentaje > 0
                                      ? "bg-blue-500"
                                      : "bg-gray-300"
                              }`}
                              style={{ width: `${nivelData.porcentaje}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">{nivelData.porcentaje}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-sm">No hay niveles programados para este aprendiz.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-gray-500 text-sm">Error al buscar los usuarios</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ApprenticeDetailModal
