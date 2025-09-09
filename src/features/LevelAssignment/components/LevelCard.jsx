"use client";

const LevelCard = ({
  nivel,
  isActive,
  hasChanged,
  onToggle,
  disabled = false,
  levelIndex,
}) => {
  // Colores para cada nivel (solo para el indicador N1, N2, etc.)
  const levelColors = [
    "bg-emerald-500 text-white", // N1 - Verde esmeralda
    "bg-blue-500 text-white", // N2 - Azul
    "bg-amber-500 text-white", // N3 - Ámbar
    "bg-orange-500 text-white", // N4 - Naranja
    "bg-purple-500 text-white", // N5 - Púrpura
    "bg-red-500 text-white", // N6 - Rojo
  ];

  const colorIndex = (levelIndex || 0) % levelColors.length;
  const levelColor = levelColors[colorIndex];
  const levelNumber = `N${(levelIndex || 0) + 1}`;

  // Usar descripción por defecto si no hay descripción o es muy genérica
  const getDescription = () => {
    if (
      !nivel.description ||
      nivel.description === `Nivel ${nivel.name}` ||
      nivel.description.length < 20
    ) {
      return "Nivel de inglés con contenidos específicos del programa.";
    }
    return nivel.description;
  };

  // Determinar el estilo de la tarjeta (colores neutros con estados)
  const getCardStyle = () => {
    if (disabled) {
      return "border-gray-200 bg-gray-100 opacity-60";
    }

    if (hasChanged) {
      return "border-yellow-300 bg-yellow-50 ring-2 ring-yellow-200";
    }

    if (isActive) {
      return "border-green-300 bg-green-50 ring-2 ring-green-200";
    }

    return "border-gray-200 bg-gray-50 hover:bg-gray-100";
  };

  return (
    <div
      className={`p-6 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${getCardStyle()}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          {/* Indicador de nivel con color específico */}
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold shadow-sm ${levelColor}`}
          >
            {levelNumber}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-base mb-1">
              {nivel.name}
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">
              {getDescription()}
            </p>
            {nivel.duration && (
              <p className="text-xs text-gray-500">
                Duración: {nivel.duration} horas
              </p>
            )}
          </div>
        </div>

        {/* Toggle switch */}
        <label className="relative inline-flex items-center cursor-pointer group">
          <input
            type="checkbox"
            checked={isActive}
            onChange={() => onToggle(nivel.id)}
            disabled={disabled}
            className="sr-only peer"
          />
          <div
            className={`
      w-11 h-6 rounded-full transition-all duration-300 ease-in-out
      ${
        disabled
          ? "bg-gray-300 cursor-not-allowed"
          : isActive
          ? "bg-green-500 shadow-md shadow-green-200"
          : "bg-gray-300 group-hover:bg-gray-400"
      }
      peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-200
      after:content-[''] after:absolute after:top-[2px] after:left-[3px] 
      after:bg-white after:rounded-full after:h-5 after:w-5
      after:transition-all after:duration-300 after:ease-in-out
      after:shadow-md
      ${isActive ? "after:translate-x-5" : "after:translate-x-0"}
      ${disabled ? "after:opacity-60" : ""}
    `}
          ></div>
        </label>
      </div>

      {/* Indicadores de estado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm">
          {/* Estados de activación */}
          {isActive && !disabled && (
            <div className="flex items-center text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <span className="font-medium">
                {hasChanged ? "Se activará al guardar" : "Nivel activo"}
              </span>
            </div>
          )}

          {!isActive && hasChanged && (
            <div className="flex items-center text-red-700">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span className="font-medium">Se desactivará al guardar</span>
            </div>
          )}

          {disabled && (
            <div className="flex items-center text-gray-500">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              <span>No disponible para programas técnicos</span>
            </div>
          )}

          {!isActive && !hasChanged && !disabled && (
            <div className="flex items-center text-gray-500">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              <span>Nivel inactivo</span>
            </div>
          )}
        </div>
        {/* ✅ Badge de completitud usando el campo completed de la programación */}
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            nivel.completed
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {nivel.completed ? "Completado" : "Sin completar"}
        </span>
      </div>
    </div>
  );
};

export default LevelCard;
