"use client"

import { useState } from "react"
import { ChevronDown, BarChart3 } from "lucide-react"

const DashboardDebugInfo = ({ dashboardData, programmings, courses, apprentices }) => {
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="mb-4 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
      >
        🔍 Mostrar Debug Info
      </button>
    )
  }

  // Función para encontrar programación
  const findProgrammingForCourse = (course, programmings) => {
    const courseProgramName = course.fk_programs?.toUpperCase().trim()
    return programmings.find((prog) => {
      const progName = prog.programId?.name?.toUpperCase().trim()
      const progAbbr = prog.programId?.abbreviation?.toUpperCase().trim()
      return progName === courseProgramName || progAbbr === courseProgramName
    })
  }

  // Filtrar cursos válidos por año
  const currentYear = new Date().getFullYear()
  const validCourses = courses.filter((course) => {
    const startYear = new Date(course.start_date).getFullYear()
    return startYear >= Math.max(2025, currentYear)
  })

  const coursesWithProgramming = validCourses.filter((course) => {
    const programming = findProgrammingForCourse(course, programmings)
    return programming && programming.levels && programming.levels.length > 0
  })

  const coursesWithoutProgramming = validCourses.filter((course) => {
    const programming = findProgrammingForCourse(course, programmings)
    return !programming || !programming.levels || programming.levels.length === 0
  })

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex justify-between items-center mb-3">
        <h4 className="font-semibold text-blue-800">🔍 Información de Debug del Dashboard</h4>
        <button onClick={() => setShowDebug(false)} className="text-blue-600 hover:text-blue-800">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
        <div className="bg-white p-3 rounded border">
          <div className="font-medium text-gray-700">Total Programaciones</div>
          <div className="text-xl font-bold text-blue-600">{programmings.length}</div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="font-medium text-gray-700">Cursos Válidos (2025+)</div>
          <div className="text-xl font-bold text-green-600">{validCourses.length}</div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="font-medium text-gray-700">Con Programación</div>
          <div className="text-xl font-bold text-green-600">{coursesWithProgramming.length}</div>
        </div>
        <div className="bg-white p-3 rounded border">
          <div className="font-medium text-gray-700">Sin Programación</div>
          <div className="text-xl font-bold text-red-600">{coursesWithoutProgramming.length}</div>
        </div>
      </div>

      {/* Detalle de programaciones disponibles */}
      <div className="mb-4">
        <h5 className="font-medium text-blue-700 mb-2">📚 Programaciones Disponibles:</h5>
        <div className="bg-white p-3 rounded border">
          {programmings.length === 0 ? (
            <div className="text-red-500 text-sm">❌ No hay programaciones disponibles</div>
          ) : (
            programmings.map((prog, index) => (
              <div key={prog._id} className="text-xs mb-2 p-2 bg-gray-50 rounded">
                <div className="font-medium text-green-600">
                  {index + 1}. "{prog.programId?.name}"
                </div>
                <div className="text-gray-600">Total niveles: {prog.levels?.length || 0}</div>
                <div className="text-gray-500">
                  Niveles con evaluaciones: {prog.levels?.filter((l) => l.topics && l.topics.length > 0).length || 0}
                </div>
                {/* Mostrar detalle de cada nivel */}
                {prog.levels?.map((level, levelIndex) => (
                  <div key={levelIndex} className="ml-4 mt-1 text-xs">
                    <span className="font-medium">Nivel {levelIndex + 1}:</span> {level.name}
                    <span className="ml-2">
                      ({level.topics?.length || 0} temas,{" "}
                      {level.topics?.reduce(
                        (acc, topic) => acc + (topic.activities?.length || 0) + (topic.exams?.length || 0),
                        0,
                      ) || 0}{" "}
                      evaluaciones)
                    </span>
                    {(!level.topics || level.topics.length === 0) && (
                      <span className="text-red-500 ml-2">⚠️ Sin contenido</span>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Fichas CON programación */}
      <div className="mb-4">
        <h5 className="font-medium text-green-700 mb-2">
          ✅ Fichas CON Programación de Inglés ({coursesWithProgramming.length}):
        </h5>
        <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
          {coursesWithProgramming.length === 0 ? (
            <div className="text-gray-500 text-sm">No hay fichas con programación</div>
          ) : (
            coursesWithProgramming.map((course) => {
              const programming = findProgrammingForCourse(course, programmings)
              return (
                <div key={course.id} className="text-xs mb-1 p-1 bg-green-50 rounded">
                  <span className="font-medium">Ficha {course.code}:</span> "{course.fk_programs}"
                  <span className="text-green-600 ml-2">
                    → "{programming.programId?.name}" ({programming.levels?.length || 0} niveles)
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Fichas SIN programación */}
      <div className="mb-4">
        <h5 className="font-medium text-red-700 mb-2">
          ❌ Fichas SIN Programación de Inglés ({coursesWithoutProgramming.length}):
        </h5>
        <div className="bg-white p-3 rounded border max-h-32 overflow-y-auto">
          {coursesWithoutProgramming.length === 0 ? (
            <div className="text-gray-500 text-sm">Todas las fichas tienen programación</div>
          ) : (
            <div className="text-xs text-gray-600">
              <div className="mb-2 font-medium">Programas que necesitan programación de inglés:</div>
              {Array.from(new Set(coursesWithoutProgramming.map((c) => c.fk_programs))).map((program) => (
                <div key={program} className="mb-1 p-1 bg-red-50 rounded">
                  <span className="font-medium">"{program}"</span>
                  <span className="ml-2 text-gray-500">
                    ({coursesWithoutProgramming.filter((c) => c.fk_programs === program).length} fichas)
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Niveles calculados */}
      <div>
        <h5 className="font-medium text-blue-700 mb-2 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Niveles Calculados:</h5>
        <div className="bg-white p-3 rounded border">
          {dashboardData.levelProgress.length === 0 ? (
            <div className="text-gray-500 text-sm">No hay niveles con datos suficientes</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {dashboardData.levelProgress.map((level) => (
                <div key={level.id} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="font-medium">{level.nivel}</div>
                  <div className="text-gray-600">
                    Fichas: {level.cantidadFichas} | Aprendices: {level.cantidadAprendices}
                  </div>
                  <div className="text-gray-600">Progreso: {level.progreso}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardDebugInfo
