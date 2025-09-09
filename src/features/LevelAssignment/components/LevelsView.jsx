"use client"
import { ArrowLeft } from "lucide-react"
import LevelCard from "./LevelCard"
import QuickActions from "./QuickActions"

const LevelsView = ({
  selectedFicha,
  currentLevelStates,
  tempLevelStates,
  hasChanges,
  onLevelToggle,
  onQuickAction,
  onSaveChanges,
  onChangeFicha,
  isSaving,
  fichaInfo,
}) => {
  // Si no hay programación, mostrar mensaje específico
  if (fichaInfo?.hasNoProgramming || !fichaInfo?.programmingInfo) {
    return (
      <div className="max-h-screen p-2">
        <div className="max-w-6xl mx-auto">
          {/* Información de la ficha */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-4 mb-2">
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedFicha.codigo}</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    Sin programación
                  </span>
                </div>
                <p className="text-gray-700 mb-1">{selectedFicha.programa}</p>
                {fichaInfo?.programInfo && (
                  <>
                    <p className="text-gray-600 text-sm">Modalidad: {fichaInfo.programInfo.modality}</p>
                    <p className="text-gray-600 text-sm">Nivel: {fichaInfo.programInfo.level}</p>
                  </>
                )}
                <p className="text-gray-600 text-sm">Instructor: {selectedFicha.instructor}</p>
                <p className="text-gray-600 text-sm">Aprendices: {selectedFicha.aprendices}</p>
              </div>
              <button
                onClick={onChangeFicha}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cambiar Ficha
              </button>
            </div>
          </div>

          {/* Mensaje de no programación */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay niveles asignados a la ficha</h3>
              <p className="text-gray-600 mb-4">
                No hay una programación de inglés disponible para el programa{" "}
                <strong>{fichaInfo?.programInfo?.name}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Para poder asignar niveles de inglés a esta ficha, primero debe crear una programación para este
                programa en el módulo de programaciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const activeLevels = Object.values(currentLevelStates).filter(Boolean).length
  const programmingLevels = fichaInfo?.programmingInfo?.levels || []
  const isTenico = fichaInfo?.programInfo?.level === "TECNICO"
  const maxLevelsForProgram = isTenico ? Math.min(programmingLevels.length, 3) : programmingLevels.length

  return (
    <div className="max-h-screen p-2">
      <div className="max-w-6xl mx-auto">
        {/* Información de la ficha mejorada */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-sm border border-blue-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h2 className="text-xl font-semibold text-gray-900">{selectedFicha.codigo}</h2>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {activeLevels}/{maxLevelsForProgram} activos
                </span>
                {fichaInfo?.programInfo?.level && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    {fichaInfo.programInfo.level}
                  </span>
                )}
                {hasChanges && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                    Cambios sin guardar
                  </span>
                )}
              </div>
              <p className="text-gray-800 mb-2 font-medium">{selectedFicha.programa}</p>
              {fichaInfo?.programInfo && (
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <p>
                    <span className="font-medium">Modalidad:</span> {fichaInfo.programInfo.modality}
                  </p>
                  <p>
                    <span className="font-medium">Instructor:</span> {selectedFicha.instructor}
                  </p>
                  <p>
                    <span className="font-medium">Aprendices:</span> {selectedFicha.aprendices}
                  </p>
                  <p>
                  <span className="font-medium">Estado:</span> {fichaInfo.courseInfo.status}
                </p>
                </div>
              )}
             
            </div>
            <button
              onClick={onChangeFicha}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cambiar Ficha
            </button>
          </div>
        </div>

        {/* Gestión de niveles mejorada */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Niveles de Inglés</h1>
              <p className="text-gray-600 text-sm">
                Activa o desactiva los niveles disponibles para los aprendices de esta ficha
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onSaveChanges}
                disabled={!hasChanges || isSaving}
                className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </button>
            </div>
          </div>

          <QuickActions
            onAction={onQuickAction}
            isTenico={isTenico}
            programmingLevels={programmingLevels}
            maxLevels={maxLevelsForProgram}
          />

          {/* Grid de niveles mejorado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {programmingLevels.slice(0, maxLevelsForProgram).map((nivel, index) => {
              const isActive = tempLevelStates[nivel.id]
              const hasChanged = currentLevelStates[nivel.id] !== tempLevelStates[nivel.id]

              return (
                <LevelCard
                  key={nivel.id}
                  nivel={nivel}
                  isActive={isActive}
                  hasChanged={hasChanged}
                  onToggle={onLevelToggle}
                  disabled={false}
                  levelIndex={index}
                />
              )
            })}
          </div>

          {programmingLevels.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">No hay niveles definidos en la programación</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LevelsView
