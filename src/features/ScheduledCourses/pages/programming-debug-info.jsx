"use client"

import { useGetProgrammingByProgramName } from "../hooks/use-get-programming-by-program-name"

const ProgrammingDebugInfo = ({ programName }) => {
  const { programming, loading, error } = useGetProgrammingByProgramName(programName)

  if (loading) return <div className="p-4 bg-yellow-50 rounded-lg">🔄 Cargando programación...</div>

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <h4 className="font-semibold text-red-800">❌ Error cargando programación:</h4>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!programming) {
    return (
      <div className="p-4 bg-orange-50 rounded-lg">
        <h4 className="font-semibold text-orange-800">⚠️ No se encontró programación para:</h4>
        <p className="text-orange-600">Programa: {programName}</p>
      </div>
    )
  }

  // Función para extraer evaluaciones de un nivel
  const getEvaluationsFromLevel = (level) => {
    const evaluations = []
    if (level.topics && level.topics.length > 0) {
      level.topics.forEach((topic) => {
        if (topic.activities && topic.activities.length > 0) {
          topic.activities.forEach((activity) => {
            evaluations.push({
              evaluationId: activity.evaluationId,
              type: "activity",
              value: activity.value,
            })
          })
        }
        if (topic.exams && topic.exams.length > 0) {
          topic.exams.forEach((exam) => {
            evaluations.push({
              evaluationId: exam.evaluationId,
              type: "exam",
              value: exam.value,
            })
          })
        }
      })
    }
    return evaluations
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg mb-4">
      <h4 className="font-semibold text-green-800 mb-2">✅ Programación Encontrada:</h4>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <strong>ID:</strong> {programming._id}
        </div>
        <div>
          <strong>Programa:</strong> {programming.programId?.name}
        </div>
        <div>
          <strong>Fecha Inicio:</strong> {new Date(programming.startDate).toLocaleDateString()}
        </div>
        <div>
          <strong>Estado:</strong> {programming.status ? "Activo" : "Inactivo"}
        </div>
      </div>

      <div className="mb-4">
        <h5 className="font-semibold text-green-700 mb-2">📚 Niveles ({programming.levels?.length || 0}):</h5>
        {programming.levels && programming.levels.length > 0 ? (
          <div className="space-y-2">
            {programming.levels.map((level, index) => {
              const evaluations = getEvaluationsFromLevel(level)
              return (
                <div key={level._id} className="bg-white p-3 rounded border">
                  <div className="font-medium">
                    Nivel {index + 1}: {level.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    Topics: {level.topics?.length || 0} | Evaluaciones: {evaluations.length}
                  </div>
                  {evaluations.length > 0 && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500">Evaluaciones:</div>
                      {evaluations.map((evaluation, evalIndex) => (
                        <div key={evalIndex} className="text-xs ml-2">
                          • {evaluation.type}: {evaluation.evaluationId} (valor: {evaluation.value})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-600">No hay niveles configurados</p>
        )}
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer font-medium text-green-700">🔍 Ver JSON completo</summary>
        <pre className="text-xs bg-white p-2 rounded mt-2 overflow-auto max-h-60">
          {JSON.stringify(programming, null, 2)}
        </pre>
      </details>
    </div>
  )
}

export default ProgrammingDebugInfo
