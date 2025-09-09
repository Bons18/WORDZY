"use client";

import { useEffect, useState, useRef } from "react";
import GenericTable from "../../../shared/components/Table";
import { ChevronDown, RefreshCw, BarChart3 } from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay";
import { useParams, useNavigate } from "react-router-dom";
import ConfirmationModal from "../../../shared/components/ConfirmationModal";
import { useApprenticeProgress } from "../hooks/use-apprentice-progress";
import { useGetProgrammingByProgramName } from "../hooks/use-get-programming-by-program-name";
import { formatDate } from "../../../shared/utils/dateFormatter";
import CustomSelect from "../../CourseProgramming/components/course-programming/ui/custom-select";

const ProgressViewFinal = () => {
  const { nombre } = useParams();
  const navigate = useNavigate();
  const [learnerData, setLearnerData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [fichaNombre, setFichaNombre] = useState("");
  const [nivelNombre, setNivelNombre] = useState("");
  const [nivelNumber, setNivelNumber] = useState(1);
  const [apprenticeId, setApprenticeId] = useState(null);
  const [fichaPrograma, setFichaPrograma] = useState("");

  // Estados para el filtro por temas
  const [availableTopics, setAvailableTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [filteredProgress, setFilteredProgress] = useState([]);
  const [enrichedProgress, setEnrichedProgress] = useState([]);

  const { logout, user } = useAuth();
  const dropdownRef = useRef(null);

  // Hook para obtener progreso del aprendiz
  const {
    progress,
    statistics,
    loading: progressLoading,
    error: progressError,
    refetch,
  } = useApprenticeProgress(apprenticeId, nivelNumber);

  // Hook para obtener la programación del curso
  const { programming, loading: programmingLoading } =
    useGetProgrammingByProgramName(fichaPrograma);

  // Función para extraer evaluaciones de un nivel con información de temas
  const getEvaluationsFromLevel = (level) => {
    const evaluations = [];

    if (level.topics && level.topics.length > 0) {
      level.topics.forEach((topic) => {
        const topicId = topic.topicId;
        const topicName = topic.name || `Tema ${topicId}`;

        // Agregar actividades
        if (topic.activities && topic.activities.length > 0) {
          topic.activities.forEach((activity) => {
            evaluations.push({
              evaluationId: activity.evaluationId,
              type: "activity",
              value: activity.value,
              topicId: topicId,
              topicName: topicName,
            });
          });
        }

        // Agregar exámenes
        if (topic.exams && topic.exams.length > 0) {
          topic.exams.forEach((exam) => {
            evaluations.push({
              evaluationId: exam.evaluationId,
              type: "exam",
              value: exam.value,
              topicId: topicId,
              topicName: topicName,
            });
          });
        }
      });
    }

    return evaluations;
  };

  // Calcular estadísticas basadas en evaluaciones aprobadas
  const [calculatedStats, setCalculatedStats] = useState(null);

  // EFECTO PRINCIPAL: Enriquecer progreso con información de temas
  useEffect(() => {
    if (programming && nivelNumber && progress.length >= 0) {
      console.log("🔄 Enriqueciendo progreso con información de temas...");

      const currentLevel = programming.levels?.[nivelNumber - 1];
      if (!currentLevel) {
        console.log("❌ No se encontró el nivel actual en la programación");
        setEnrichedProgress([]);
        setAvailableTopics([]);
        return;
      }

      // Obtener evaluaciones programadas para este nivel
      const evaluacionesProgramadas = getEvaluationsFromLevel(currentLevel);
      console.log(
        "📚 Evaluaciones programadas encontradas:",
        evaluacionesProgramadas.length
      );

      // Extraer temas únicos de las evaluaciones programadas
      const uniqueTopics = [];
      const topicMap = new Map();

      evaluacionesProgramadas.forEach((evaluation) => {
        if (!topicMap.has(evaluation.topicId)) {
          topicMap.set(evaluation.topicId, {
            id: evaluation.topicId,
            name: evaluation.topicName,
          });
          uniqueTopics.push({
            id: evaluation.topicId,
            name: evaluation.topicName,
          });
        }
      });

      console.log("🏷️ Temas únicos encontrados:", uniqueTopics);
      setAvailableTopics(uniqueTopics);

      // Enriquecer el progreso con información de temas
      const progressWithTopics = progress.map((attempt) => {
        const attemptEvalId = attempt.evaluationId?._id || attempt.evaluationId;

        // Buscar la evaluación programada correspondiente
        const matchingEvaluation = evaluacionesProgramadas.find(
          (evalProgramada) => {
            const programmedEvalId = evalProgramada.evaluationId;
            return (
              attemptEvalId === programmedEvalId ||
              attemptEvalId?.toString() === programmedEvalId?.toString()
            );
          }
        );

        if (matchingEvaluation) {
          console.log(
            `✅ Match encontrado para evaluación ${attemptEvalId}: ${matchingEvaluation.topicName}`
          );
          return {
            ...attempt,
            topicId: matchingEvaluation.topicId,
            topicName: matchingEvaluation.topicName,
            evaluationType: matchingEvaluation.type,
          };
        } else {
          console.log(
            `❌ No se encontró match para evaluación ${attemptEvalId}`
          );
          return {
            ...attempt,
            topicId: null,
            topicName: "Tema no identificado",
            evaluationType: "unknown",
          };
        }
      });

      // NUEVO: Filtrar para mostrar solo el último intento de cada evaluación
      const ultimosIntentosPorEvaluacion = new Map();

      progressWithTopics.forEach((attempt) => {
        const evalId = attempt.evaluationId?._id || attempt.evaluationId;
        const evalKey = evalId.toString();

        // Si no existe la evaluación o este intento es más reciente, actualizar
        if (
          !ultimosIntentosPorEvaluacion.has(evalKey) ||
          new Date(attempt.createdAt) >
            new Date(ultimosIntentosPorEvaluacion.get(evalKey).createdAt)
        ) {
          ultimosIntentosPorEvaluacion.set(evalKey, attempt);
        }
      });

      // Convertir el Map a array - estos son los únicos intentos que se mostrarán
      const ultimosIntentosArray = Array.from(
        ultimosIntentosPorEvaluacion.values()
      );

      console.log(
        "📊 Progreso con últimos intentos únicamente:",
        ultimosIntentosArray.length,
        "elementos"
      );
      setEnrichedProgress(ultimosIntentosArray);

      // Calcular estadísticas basadas en los MISMOS últimos intentos que se muestran en la tabla
      const ultimosIntentosAprobados = ultimosIntentosArray.filter(
        (attempt) => attempt.passed === true
      );
      const puntosTotalesAprobadas = ultimosIntentosAprobados.reduce(
        (sum, p) => sum + (p.score || 0),
        0
      );

      // Contar evaluaciones únicas aprobadas en la programación (basado en últimos intentos)
      let evaluacionesAprobadasProgramadasTotales = 0;
      evaluacionesProgramadas.forEach((evalProgramada) => {
        const evalEnUltimosIntentos = ultimosIntentosArray.find((attempt) => {
          const attemptEvalId =
            attempt.evaluationId?._id || attempt.evaluationId;
          const programmedEvalId = evalProgramada.evaluationId;
          return (
            attemptEvalId === programmedEvalId ||
            attemptEvalId?.toString() === programmedEvalId?.toString()
          );
        });

        // Solo contar si existe en últimos intentos Y está aprobada
        if (evalEnUltimosIntentos && evalEnUltimosIntentos.passed) {
          evaluacionesAprobadasProgramadasTotales++;
        }
      });

      setCalculatedStats({
        evaluacionesAprobadas: evaluacionesAprobadasProgramadasTotales,
        evaluacionesProgramadas: evaluacionesProgramadas.length,
        puntosAprobadas: puntosTotalesAprobadas,
        totalEvaluacionesRealizadas: progressWithTopics.length, // Total de todos los intentos
        evaluacionesUnicasRealizadas: ultimosIntentosArray.length, // Solo últimos intentos
        ultimosIntentosAprobados: ultimosIntentosAprobados.length,
      });
    }
  }, [programming, nivelNumber, progress]);

  // EFECTO PARA FILTRAR POR TEMA SELECCIONADO
  useEffect(() => {
    const topicValue =
      typeof selectedTopic === "object" ? selectedTopic.value : selectedTopic;

    console.log("🔍 Aplicando filtro por tema:", topicValue);

    if (topicValue === "all") {
      console.log(
        "📋 Mostrando todas las evaluaciones:",
        enrichedProgress.length
      );
      setFilteredProgress(enrichedProgress);
    } else {
      const filtered = enrichedProgress.filter((attempt) => {
        const match = attempt.topicId === topicValue;
        if (match) {
          console.log(
            `✅ Evaluación incluida en filtro: ${attempt.evaluationId} - ${attempt.topicName}`
          );
        }
        return match;
      });

      console.log(
        `📋 Evaluaciones filtradas para tema ${topicValue}:`,
        filtered.length
      );
      setFilteredProgress(filtered);
    }
  }, [selectedTopic, enrichedProgress]);

  // Función para manejar el cambio de tema
  const handleTopicChange = (value) => {
    console.log("🔄 Cambiando tema seleccionado:", value);
    setSelectedTopic(value);
  };

  // Resto de efectos y funciones (sin cambios)
  useEffect(() => {
    const selectedFichaNombre = sessionStorage.getItem("selectedFichaNombre");
    const selectedNivelNombre = sessionStorage.getItem("selectedNivelNombre");
    const selectedNivelNumber = sessionStorage.getItem("selectedNivelNumber");
    const selectedTraineeData = sessionStorage.getItem("selectedTraineeData");
    const selectedFichaPrograma = sessionStorage.getItem(
      "selectedFichaPrograma"
    );

    if (selectedFichaNombre) setFichaNombre(selectedFichaNombre);
    if (selectedNivelNombre) setNivelNombre(selectedNivelNombre);
    if (selectedNivelNumber)
      setNivelNumber(Number.parseInt(selectedNivelNumber));
    if (selectedFichaPrograma) setFichaPrograma(selectedFichaPrograma);

    if (selectedTraineeData) {
      try {
        const traineeData = JSON.parse(selectedTraineeData);
        setApprenticeId(traineeData._id || traineeData.id);

        setLearnerData({
          nombre: `${traineeData.nombre} ${traineeData.apellido}`,
          nivelActual: selectedNivelNombre,
          ficha: selectedFichaNombre,
          correo: traineeData.correo,
          telefono: traineeData.telefono,
          estado: traineeData.estado,
          documento: traineeData.documento,
          tipoDocumento: traineeData.tipoDocumento,
        });
      } catch (error) {
        navigate("/progreso/cursosProgramados/niveles/aprendices");
      }
    } else {
      navigate("/progreso/cursosProgramados/niveles/aprendices");
    }

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate, nombre]);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutConfirm(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/progreso/cursosProgramados/niveles/aprendices");
  };

  const handleRefresh = () => {
    refetch();
  };

  if (!learnerData) {
    return (
      <div className="min-h-screen">
        <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-[#1f384c]">
              Cursos Programados
            </h1>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2"
              >
                <div className="text-right">
                  <div className="text-sm font-medium">{user?.nombre} {user?.apellido}</div>
                  <div className="text-xs text-gray-600">{getRoleDisplayName(getUserRole(user))}</div>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
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
            </div>
          </div>
        </header>
        <div className="flex justify-center my-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
          <span className="ml-2">Cargando...</span>
        </div>
      </div>
    );
  }

  // Formatear datos del aprendiz
  const formattedLearnerData = [
    { id: 1, atributo: "Nombre", valor: learnerData.nombre },
    { id: 2, atributo: "Nivel Actual", valor: learnerData.nivelActual },
    { id: 3, atributo: "Ficha", valor: learnerData.ficha },
    { id: 4, atributo: "Estado", valor: learnerData.estado },
    {
      id: 5,
      atributo: "Documento",
      valor: `${learnerData.tipoDocumento} ${learnerData.documento}`,
    },
    { id: 6, atributo: "Correo", valor: learnerData.correo },
    { id: 7, atributo: "Teléfono", valor: learnerData.telefono },
    {
      id: 8,
      atributo: "Evaluaciones Aprobadas",
      valor: calculatedStats
        ? `${calculatedStats.evaluacionesAprobadas}/${calculatedStats.evaluacionesProgramadas}`
        : "0/0",
    },
    {
      id: 9,
      atributo: "Puntos Totales Obtenidos",
      valor: calculatedStats?.puntosAprobadas || 0,
    },
  ];

  // Formatear progreso para la tabla - AHORA SOLO MUESTRA ÚLTIMOS INTENTOS
  const formattedProgress = filteredProgress.map((attempt) => {
    return {
      id: attempt._id,
      fecha: formatDate(attempt.createdAt),
      hora: new Date(attempt.createdAt).toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      tipo:
        attempt.evaluationId?.tipoEvaluacion ||
        attempt.evaluationType ||
        "Evaluación",
      nombreEvaluacion:
        attempt.evaluationId?.nombre || `Evaluación ${attempt.attemptNumber}`,
      tema: attempt.topicName || "Tema no identificado",
      puntajeObtenido: `${attempt.score}/${attempt.maxScore}`,
      porcentaje: `${attempt.percentage}%`,
      estado: attempt.passed ? "Aprobado" : "No Aprobado",
      duracion: `${attempt.timeSpent || 0} min`,
      intentos: attempt.attemptNumber, // Muestra el número de intento que es
      rawData: attempt,
    };
  });

  // Columnas de la tabla
  const progressColumns = [
    { key: "fecha", label: "Fecha", width: "13%" },
    { key: "hora", label: "Hora", width: "12%" },
    { key: "tipo", label: "Tipo", width: "12%" },
    {
      key: "tema",
      label: "Tema",
      render: (item) => (
        <div className="whitespace-normal break-words max-w-md">
          {item.tema}
        </div>
      ),
      width: "18%",
    },
    {
      key: "nombreEvaluacion",
      label: "Evaluación",
      render: (item) => (
        <div className="whitespace-normal break-words max-w-md">
          {item.nombreEvaluacion}
        </div>
      ),
      width: "23%",
    },
    { key: "puntajeObtenido", label: "Puntaje", width: "12%" },
    {
      key: "estado",
      label: "Estado",
      width: "15%",
      render: (item) => (
        <div
          className={`px-2 py-1 rounded-full text-xs text-white text-center w-25 ${
            item.estado === "Aprobado" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {item.estado}
        </div>
      ),
    },
    { key: "intentos", label: "Intento", width: "10%" },
  ];

  // Preparar opciones para el CustomSelect
  const topicSelectOptions = [
    { value: "all", label: "Todos los temas" },
    ...availableTopics.map((topic) => ({
      value: topic.id,
      label: topic.name,
    })),
  ];

  // Obtener el valor actual para mostrar en el select
  const currentTopicValue =
    typeof selectedTopic === "object" ? selectedTopic.value : selectedTopic;

  return (
    <div className="min-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[#1f384c]">
            Cursos Programados
          </h1>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[#1f384c] font-medium px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              <span>{user?.nombre} {user?.apellido} - {getRoleDisplayName(getUserRole(user))}</span>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
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
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6">
        <div className="container mx-auto p-4 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-1 bg-gray-200 text-black px-3 py-1.5 text-sm rounded-lg hover:bg-gray-300 transition-colors"
            >
              ← Volver a Aprendices
            </button>
            <button
              onClick={handleRefresh}
              disabled={progressLoading}
              className="flex items-center gap-1 bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} />
              {progressLoading ? "Cargando..." : "Actualizar"}
            </button>
          </div>

          {/* Información del aprendiz */}
          <div className="mb-6 flex flex-col items-center">
            <h2 className="text-lg font-bold text-[#1F384C] mb-4 text-center">
              PROGRESO DEL APRENDIZ
            </h2>
            <div className="border border-gray-200 rounded-lg overflow-hidden max-w-4xl w-full">
              <table className="w-full text-sm">
                <tbody>
                  {formattedLearnerData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-200 last:border-b-0"
                    >
                      <td className="py-2 px-4 font-semibold text-[#1F384C] bg-gray-50 w-[30%]">
                        {item.atributo}
                      </td>
                      <td className="py-2 px-4 w-[70%]">
                        {typeof item.valor === "object"
                          ? item.valor
                          : item.valor || "0"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Información de debug mejorada */}
          {/* <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">🔍 Estado del Sistema:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Temas disponibles:</span> {availableTopics.length}
              </div>
              <div>
                <span className="font-medium">Evaluaciones únicas:</span> {enrichedProgress.length}
              </div>
              <div>
                <span className="font-medium">Mostrando:</span> {filteredProgress.length}
              </div>
              <div>
                <span className="font-medium">Tema seleccionado:</span>{" "}
                {currentTopicValue === "all"
                  ? "Todos"
                  : availableTopics.find((t) => t.id === currentTopicValue)?.name || "Desconocido"}
              </div>
            </div>

            {calculatedStats && (
              <div className="mt-3 pt-3 border-t border-blue-200">
                <h5 className="font-medium text-blue-700 mb-1 flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Estadísticas:</h5>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="font-medium">Total intentos realizados:</span>{" "}
                    {calculatedStats.totalEvaluacionesRealizadas}
                  </div>
                  <div>
                    <span className="font-medium">Evaluaciones únicas:</span>{" "}
                    {calculatedStats.evaluacionesUnicasRealizadas}
                  </div>
                  <div>
                    <span className="font-medium">Puntos (últimos aprobados):</span> {calculatedStats.puntosAprobadas}
                  </div>
                </div>
              </div>
            )}
          </div> */}

          {/* Filtro por temas */}
          <div className="p-4 bg-gray-50 rounded-[10px] mb-6">
            <div className="flex items-center gap-4">
              <div className="flex-1 max-w-xs">
                <label
                  htmlFor="topic-select"
                  className="text-base font-semibold text-gray-700 mb-2 block"
                >
                  Filtrar por Tema:
                </label>
                <CustomSelect
                  options={topicSelectOptions}
                  value={currentTopicValue}
                  onChange={handleTopicChange}
                />
              </div>
              <div className="text-sm text-gray-600">
                {availableTopics.length === 0 && (
                  <div className="text-orange-600 font-medium">
                    ⚠️ No se encontraron temas para este nivel
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabla de progreso */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#1F384C]">
                TABLA DE PROGRESO
                {currentTopicValue !== "all" && (
                  <span className="text-sm font-medium text-gray-600 ml-2">
                    -{" "}
                    {availableTopics.find((t) => t.id === currentTopicValue)
                      ?.name || "Tema seleccionado"}
                  </span>
                )}
              </h2>
              <div className="text-sm text-gray-600 flex gap-4">
                <span>Mostrando: {formattedProgress.length}</span>
                <span>Evaluaciones: {enrichedProgress.length}</span>
              </div>
            </div>

            {progressLoading || programmingLoading ? (
              <div className="flex justify-center my-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                <span className="ml-2">Cargando...</span>
              </div>
            ) : progressError ? (
              <div className="text-red-500 text-center py-4 bg-red-50 rounded-lg">
                <p className="font-semibold">
                  Error al cargar las evaluaciones
                </p>
                <p className="text-sm">{progressError}</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Reintentar
                </button>
              </div>
            ) : (
              <GenericTable
                data={formattedProgress}
                columns={progressColumns}
                showActions={{
                  show: true,
                  edit: false,
                  delete: false,
                  add: false,
                }}
                defaultItemsPerPage={10}
                tooltipText="Ver Retroalimentación"
                emptyMessage={
                  currentTopicValue === "all"
                    ? "No hay evaluaciones registradas para este nivel"
                    : `No hay evaluaciones para el tema: ${
                        availableTopics.find((t) => t.id === currentTopicValue)
                          ?.name || "seleccionado"
                      }`
                }
              />
            )}

            <ConfirmationModal
              isOpen={showLogoutConfirm}
              onClose={() => setShowLogoutConfirm(false)}
              onConfirm={handleLogout}
              title="Cerrar Sesión"
              message="¿Está seguro de que desea cerrar la sesión actual?"
              confirmText="Cerrar Sesión"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressViewFinal;
