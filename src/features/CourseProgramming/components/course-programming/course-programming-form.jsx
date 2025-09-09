"use client"

import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import ConfirmationModal from "../../../../shared/components/ConfirmationModal"
import LevelsList from "./levels-list"
import CustomSelect from "./ui/custom-select"
import ToggleSwitch from "./ui/toggle-switch"
import { useGetPrograms } from "../../../Programs/hooks/useGetPrograms"
import { usePostCourseProgramming } from "../../hooks/usePostCoursePrograming"
import { usePutCourseProgramming } from "../../hooks/usePutCoursePrograming"
import { useGetCourseProgrammingById } from "../../hooks/useGetCourseProgrammingById"
import { useGetCourseProgrammings } from "../../hooks/useGetCoursePrograming"
import { useGetTopics } from "../../../Topics/hooks/useGetTopics"

export default function CourseProgrammingForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { programming } = useGetCourseProgrammingById(id)
  const { programs } = useGetPrograms()
  const { topics } = useGetTopics()
  const { postCourseProgramming, loading: postLoading, error: postError } = usePostCourseProgramming()
  const { putCourseProgramming, loading: putLoading, error: putError } = usePutCourseProgramming()
  const { programmings } = useGetCourseProgrammings()

  const [selectedProgram, setSelectedProgram] = useState("")
  const [levels, setLevels] = useState([])
  const [activeStatus, setActiveStatus] = useState(true)
  const [startDate, setStartDate] = useState(() => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, "0")
    const day = String(today.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })
  const [endDate, setEndDate] = useState("")
  const [isFormDirty, setIsFormDirty] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [activeTabs, setActiveTabs] = useState({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])
  const [showValidationModal, setShowValidationModal] = useState(false)

  // Cargar datos de programación existente para edición
  useEffect(() => {
    if (id && programming) {
      setIsEditMode(true)

      setSelectedProgram({
        value: programming.programId._id,
        label: programming.programId.name,
      })

      // ✅ Formatear fechas correctamente desde la base de datos
      const formatDateFromDB = (dateString) => {
        if (!dateString) return ""

        // Crear fecha desde el string de la BD y extraer solo la parte de fecha
        const date = new Date(dateString)
        const year = date.getUTCFullYear()
        const month = String(date.getUTCMonth() + 1).padStart(2, "0")
        const day = String(date.getUTCDate()).padStart(2, "0")
        return `${year}-${month}-${day}`
      }

      setStartDate(formatDateFromDB(programming.startDate))
      setEndDate(formatDateFromDB(programming.endDate))
      setActiveStatus(programming.status)

      // ✅ CORREGIDO: Transformación mejorada para modo edición
      const transformedLevels = (programming.levels || []).map((level) => ({
        _id: level._id,
        id: level._id,
        name: level.name,
        expanded: false,
        themes: (level.topics || []).map((topic) => {
          let selectedOption = null
          if (topic.topicId) {
            // ✅ IMPORTANTE: Usar el ID correcto del topic
            const topicId = typeof topic.topicId === "object" ? topic.topicId._id : topic.topicId
            selectedOption = {
              value: topicId,
              label: topic.name,
            }
          }

          return {
            _id: topic._id,
            id: topic._id,
            selectedTheme: selectedOption,
            progress: topic.value,
            expanded: false,
            showActivities: false,
            activities: [
              ...(topic.activities || []).map((act) => ({
                id: act._id,
                name: act.evaluationId?.nombre || "Actividad",
                value: `${act.value}%`,
                type: "Actividades",
                evaluationData: act.evaluationId ? { ...act, ...act.evaluationId } : act,
                evaluationId: act.evaluationId?._id || act.evaluationId,
              })),
              ...(topic.exams || []).map((exam) => ({
                id: exam._id,
                name: exam.evaluationId?.nombre || "Examen",
                value: `${exam.value}%`,
                type: "Exámenes",
                evaluationData: exam.evaluationId ? { ...exam, ...exam.evaluationId } : exam,
                evaluationId: exam.evaluationId?._id || exam.evaluationId,
              })),
              ...(topic.materials || []).map((mat) => ({
                id: mat._id,
                name: mat.materialId?.titulo || "Material",
                value: "N/A",
                type: "Material",
                evaluationData: mat.materialId ? { ...mat, ...mat.materialId } : mat,
              })),
            ],
          }
        }),
      }))

      console.log("🔄 Datos transformados para edición:", transformedLevels)
      setLevels(transformedLevels)
    }
  }, [id, programming])

  const getTopicNameById = (topicId) => {
    if (!topics || !topicId) return "Sin nombre"
    const topic = topics.find((t) => t._id === topicId)
    return topic ? topic.name : "Sin nombre"
  }

  const getSelectedProgramValue = () => {
    if (!selectedProgram) return null
    if (typeof selectedProgram === "object" && selectedProgram.value) {
      return selectedProgram.value
    }
    if (typeof selectedProgram === "string") {
      return selectedProgram
    }
    return null
  }

  const transformDataForBackend = () => {
    // ✅ Nueva función para manejar fechas correctamente
    const formatDateForBackend = (dateString) => {
      if (!dateString) return null

      // Parsear la fecha como YYYY-MM-DD y crear una fecha en UTC a las 12:00 PM
      // Esto evita problemas de zona horaria
      const [year, month, day] = dateString.split("-")
      const date = new Date(Date.UTC(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day), 12, 0, 0))
      return date.toISOString()
    }

    const data = {
      programId: getSelectedProgramValue(),
      startDate: formatDateForBackend(startDate),
      endDate: formatDateForBackend(endDate),
      status: activeStatus,
      levels: levels.map((level, index) => ({
        name: level.name && level.name.trim() !== "" ? level.name : `Nivel ${index + 1}`,
        topics: level.themes.map((theme) => {
          const activities = theme.activities?.filter((a) => a.type === "Actividades") || []
          const exams = theme.activities?.filter((a) => a.type === "Exámenes") || []
          const materials = theme.activities?.filter((a) => a.type === "Material") || []

          let topicId = null
          let topicName = "Sin nombre"

          if (theme.selectedTheme) {
            if (typeof theme.selectedTheme === "object" && theme.selectedTheme.value) {
              topicId = theme.selectedTheme.value
              topicName = theme.selectedTheme.label || getTopicNameById(theme.selectedTheme.value)
            } else if (typeof theme.selectedTheme === "string") {
              topicId = theme.selectedTheme
              topicName = getTopicNameById(theme.selectedTheme)
            }
          }

          console.log(`📝 Tema procesado - Nivel: ${level.name}, Tema: ${topicName}, ID: ${topicId}`)

          return {
            topicId: topicId,
            name: topicName,
            value: theme.progress || 0,
            activities: activities.map((a) => ({
              evaluationId: a.evaluationData._id,
              value: Number.parseInt(a.value.replace("%", "")),
            })),
            exams: exams.map((e) => ({
              evaluationId: e.evaluationData._id,
              value: Number.parseInt(e.value.replace("%", "")),
            })),
            materials: materials.map((m) => ({
              materialId: m.evaluationData._id,
            })),
          }
        }),
      })),
    }

    console.log("🟢 Datos transformados para backend:")
    data.levels.forEach((level, index) => {
      console.log(`Nivel ${index + 1} (${level.name}):`)
      level.topics.forEach((topic, topicIndex) => {
        console.log(`  Tema ${topicIndex + 1}: ${topic.name} (ID: ${topic.topicId})`)
      })
    })

    return data
  }

  const getAvailableProgramsForSelect = () => {
    if (!programs || !programmings) return []

    const programsWithActiveProgramming = new Set(
      programmings.filter((prog) => prog.status === true).map((prog) => prog.programId._id || prog.programId),
    )

    return programs
      .filter((program) => {
        const selectedProgramId = getSelectedProgramValue()
        if (isEditMode && programming && program._id === programming.programId._id) {
          return true
        }
        return !programsWithActiveProgramming.has(program._id)
      })
      .map((program) => ({
        value: program._id,
        label: program.name,
      }))
  }

  // ✅ MEJORADA: Validación que incluye verificación de temas duplicados
  const validateForm = () => {
    const errors = []
    const selectedProgramId = getSelectedProgramValue()
    if (!selectedProgramId) {
      errors.push("Debe seleccionar un programa")
    }
    if (!startDate) {
      errors.push("Debe ingresar una fecha de inicio")
    }
    if (levels.length < 3) {
      errors.push("Debe añadir al menos tres niveles")
    }

    if (levels.length > 6) {
      errors.push("No se pueden crear más de 6 niveles")
    }

    // ✅ NUEVA: Validación de temas duplicados en toda la programación
    const usedTopicIds = new Set()
    const duplicatedTopics = []

    levels.forEach((level, levelIndex) => {
      level.themes?.forEach((theme, themeIndex) => {
        if (theme.selectedTheme) {
          let topicId = null
          let topicName = "Tema"

          if (typeof theme.selectedTheme === "object" && theme.selectedTheme.value) {
            topicId = theme.selectedTheme.value
            topicName = theme.selectedTheme.label || topicName
          } else if (typeof theme.selectedTheme === "string") {
            topicId = theme.selectedTheme
            const topic = topics?.find((t) => t._id === topicId)
            topicName = topic?.name || topicName
          }

          if (topicId) {
            if (usedTopicIds.has(topicId)) {
              duplicatedTopics.push(`"${topicName}" está duplicado`)
            } else {
              usedTopicIds.add(topicId)
            }
          }
        }
      })
    })

    if (duplicatedTopics.length > 0) {
      errors.push(
        `Temas duplicados encontrados: ${duplicatedTopics.join(", ")}. Cada tema solo puede ser utilizado una vez en la programación.`,
      )
    }

    if (levels.length > 0) {
      const firstLevel = levels[0]
      const firstLevelName = firstLevel.name || "Nivel 1"

      if (!firstLevel.themes || firstLevel.themes.length === 0) {
        errors.push(`${firstLevelName} debe tener al menos un tema`)
      } else {
        const themeSum = firstLevel.themes.reduce((sum, theme) => sum + (theme.progress || 0), 0)
        if (themeSum !== 100) {
          errors.push(`La suma de valores de los temas en ${firstLevelName} debe ser 100% (actual: ${themeSum}%)`)
        }

        firstLevel.themes.forEach((theme, themeIndex) => {
          const activities = (theme.activities || []).filter((a) => a.type === "Actividades")
          const exams = (theme.activities || []).filter((a) => a.type === "Exámenes")
          const materials = (theme.activities || []).filter((a) => a.type === "Material")

          if (activities.length === 0) {
            errors.push(`El tema ${themeIndex + 1} del ${firstLevelName} necesita al menos una actividad`)
          } else {
            const actSum = activities.reduce((sum, a) => {
              const value = Number.parseInt(a.value?.replace("%", "") || 0)
              return sum + value
            }, 0)
            if (actSum !== 100) {
              errors.push(
                `Las actividades del tema ${themeIndex + 1} (${firstLevelName}) suman ${actSum}% (deben sumar 100%)`,
              )
            }
          }

          if (exams.length === 0) {
            errors.push(`El tema ${themeIndex + 1} del ${firstLevelName} necesita al menos un examen`)
          } else {
            const examSum = exams.reduce((sum, e) => {
              const value = Number.parseInt(e.value?.replace("%", "") || 0)
              return sum + value
            }, 0)
            if (examSum !== 100) {
              errors.push(
                `Los exámenes del tema ${themeIndex + 1} (${firstLevelName}) suman ${examSum}% (deben sumar 100%)`,
              )
            }
          }

          if (materials.length === 0) {
            errors.push(`El tema ${themeIndex + 1} del ${firstLevelName} necesita al menos un material de apoyo`)
          }
        })
      }
    }

    return errors
  }

  const handleSaveProgramming = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidationModal(true)
      return
    }

    const programmingData = transformDataForBackend()

    try {
      let result
      if (isEditMode) {
        result = await putCourseProgramming(id, programmingData)
        setSuccessMessage("Programación actualizada exitosamente")
      } else {
        console.log("🟢 Payload enviado al backend:", JSON.stringify(programmingData, null, 2))
        result = await postCourseProgramming(programmingData)
        setSuccessMessage("Programación creada exitosamente")
      }

      setShowSuccessModal(true)
      setTimeout(() => {
        navigate("/programacion/programacionCursos")
      }, 1500)
    } catch (error) {
      setSuccessMessage(error.message || "Ocurrió un error al guardar")
      setShowSuccessModal(true)
    }
  }

  const addLevel = () => {
    if (levels.length >= 6) {
      return // No permitir más de 6 niveles
    }

    const newLevel = {
      id: `level-${Date.now()}`,
      name: "",
      expanded: true,
      themes: [],
    }
    setLevels([...levels, newLevel])
  }

  const handleCancel = () => {
    if (isFormDirty) {
      setShowCancelConfirm(true)
    } else {
      navigate("/programacion/programacionCursos")
    }
  }

  const confirmCancel = () => {
    navigate("/programacion/programacionCursos")
  }

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false)
    navigate("/programacion/programacionCursos")
  }

  const handleProgramChange = (option) => {
    setSelectedProgram(option)
    setIsFormDirty(true)
  }

  return (
    <div className="max-w-10xl mx-auto p-7 bg-white rounded-lg shadow">
      <header className="mb-6">
        <h1 className="text-xl font-bold text-[#1f384c] mb-4">
          {isEditMode ? "EDITAR PROGRAMACIÓN" : "Añadir Programación"}
        </h1>
      </header>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Programa <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            placeholder="Selecciona un Programa"
            options={getAvailableProgramsForSelect()}
            value={selectedProgram}
            onChange={handleProgramChange}
          />
          {getAvailableProgramsForSelect().length === 0 && !isEditMode && (
            <p className="text-xs text-amber-600 mt-1">
              ⚠️ Todos los programas disponibles ya tienen una programación activa
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              className="w-full px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={startDate}
              onChange={(e) => {
                console.log("📅 Fecha seleccionada:", e.target.value)
                setStartDate(e.target.value)
                setIsFormDirty(true)
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Fin</label>
            <input
              type="date"
              className="w-full px-2 py-1 text-sm text-gray-700 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={endDate}
              onChange={(e) => {
                console.log("📅 Fecha fin seleccionada:", e.target.value)
                setEndDate(e.target.value)
                setIsFormDirty(true)
              }}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div className="flex items-center pt-2">
              <ToggleSwitch
                checked={activeStatus}
                onChange={(checked) => {
                  setActiveStatus(checked)
                  setIsFormDirty(true)
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={addLevel}
            className="flex items-center px-4 py-2 text-sm bg-green-500 hover:bg-green-600 text-white rounded-md"
            disabled={postLoading || putLoading || levels.length >= 6}
          >
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Añadir Nivel
          </button>
          <div className="text-sm text-gray-500">
            {levels.length} de 6 niveles máximos (
            {levels.length < 3 ? `faltan ${3 - levels.length} mínimos` : "mínimo cumplido"})
          </div>
        </div>

        <LevelsList
          levels={levels}
          setLevels={(newLevels) => {
            setLevels(newLevels)
            setIsFormDirty(true)
          }}
          activeTabs={activeTabs}
          setActiveTabs={setActiveTabs}
        />

        <div className="bg-white py-4 mt-8 flex justify-between">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
            disabled={postLoading || putLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveProgramming}
            className="px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
            disabled={postLoading || putLoading}
          >
            {postLoading || putLoading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {isEditMode ? "Guardando..." : "Creando..."}
              </span>
            ) : isEditMode ? (
              "Guardar Cambios"
            ) : (
              "Añadir Programación"
            )}
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={confirmCancel}
        title="Cancelar Cambios"
        message="¿Está seguro que desea cancelar? Se perderán los cambios no guardados."
        confirmText="Cancelar Cambios"
        confirmColor="bg-[#f44144] hover:bg-red-600"
      />

      <ConfirmationModal
        isOpen={showSuccessModal}
        onConfirm={handleSuccessConfirm}
        title="Operación Exitosa"
        message={successMessage}
        confirmText="Aceptar"
        confirmColor="bg-green-500 hover:bg-green-600"
        showButtonCancel={false}
      />

      <ConfirmationModal
        isOpen={showValidationModal}
        onConfirm={() => setShowValidationModal(false)}
        title="Error de Validación"
        message={
          <div className="max-h-96 overflow-y-auto">
            <p className="mb-2">Por favor corrija los siguientes errores antes de continuar:</p>
            <ul className="list-disc list-inside space-y-1 pl-0">
              {validationErrors.map((error, index) => (
                <li key={index} className="text-sm text-red-600">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        }
        confirmText="Entendido"
        confirmColor="bg-green-500 hover:bg-green-600"
        showButtonCancel={false}
      />
    </div>
  )
}
