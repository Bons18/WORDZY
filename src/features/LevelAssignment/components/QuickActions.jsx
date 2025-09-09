"use client"

const QuickActions = ({ onAction, isTenico = false, programmingLevels = [], maxLevels = 6 }) => {
  const actions = [
    { key: "activar-todos", label: "Activar Todos", color: "bg-green-100 text-green-700 hover:bg-green-200" },
    { key: "desactivar-todos", label: "Desactivar Todos", color: "bg-red-100 text-red-700 hover:bg-red-200" },
  ]

  // Agregar acciones dinámicas basadas en los niveles de programación
  const levelColors = [
    "bg-blue-100 text-blue-700 hover:bg-blue-200",
    "bg-purple-100 text-purple-700 hover:bg-purple-200",
  ]

  programmingLevels.slice(0, maxLevels).forEach((level, index) => {
    if (index < 2) {
      // Máximo 2 acciones rápidas adicionales para mantener compacto
      actions.push({
        key: `hasta-${level.id}`,
        label: `Hasta ${level.name}`,
        color: levelColors[index] || "bg-gray-100 text-gray-700 hover:bg-gray-200",
      })
    }
  })

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {actions.map((action) => (
        <button
          key={action.key}
          onClick={() => onAction(action.key)}
          className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${action.color}`}
        >
          {action.label}
        </button>
      ))}
    </div>
  )
}

export default QuickActions
