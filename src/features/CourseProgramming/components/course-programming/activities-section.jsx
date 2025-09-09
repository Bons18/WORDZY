"use client"

import { useState, useMemo } from "react"
import { Check, CircleAlert, Eye, Trash } from "lucide-react"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import Tooltip from "../../../../shared/components/Tooltip"
import CustomSelect from "./ui/custom-select"
import CreateSupportMaterialModal from "../../../SupportMaterials/componentes/CreateSupportMaterialModal"
import useSupportMaterials from "../../../SupportMaterials/hooks/useSupportMaterials"
import SupportMaterialDetailModal from "../../../SupportMaterials/componentes/SupportMaterialDetailModal"

import useGetEvaluations from "../../../Evaluations/hooks/useGetEvaluations"
import usePostEvaluation from "../../../Evaluations/hooks/usePostEvaluation"
import EvaluationModal from "./evaluation-modal"
import EvaluationDetailModal from "../../../Evaluations/components/EvaluationDetailModal"
import ConfirmationModal from "../../../../shared/components/ConfirmationModal"

export default function ActivitiesSection({ levelId, themeId, localActiveTab, setLocalActiveTab, levels, setLevels }) {
  const { createMaterial, materials, refetch: refetchMaterials } = useSupportMaterials()

  const [selectedActivities, setSelectedActivities] = useState({
    Actividades: "",
    Exámenes: "",
    Material: "",
  })

  const [activityValues, setActivityValues] = useState({
    Actividades: "",
    Exámenes: "",
    Material: "",
  })

  const [validationErrors, setValidationErrors] = useState({
    Actividades: "",
    Exámenes: "",
    Material: "",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [evaluationType, setEvaluationType] = useState("")
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [showSupportMaterialModal, setShowSupportMaterialModal] = useState(false)
  const [showMaterialDetailModal, setShowMaterialDetailModal] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState(null)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const { evaluations, refetch: refetchEvaluations } = useGetEvaluations()
  const { createEvaluation } = usePostEvaluation()

  const currentLevel = levels.find((level) => level.id === levelId)
  const currentTheme = currentLevel?.themes.find((theme) => theme.id === themeId)

  const getCurrentSelectedActivity = () => {
    const selected = selectedActivities[localActiveTab] || ""
    // ✅ Si es un objeto, devolver el valor, si no, devolver tal como está
    if (typeof selected === "object" && selected.value) {
      return selected.value
    }
    return selected
  }
  const getCurrentActivityValue = () => activityValues[localActiveTab] || ""
  const getCurrentValidationError = () => validationErrors[localActiveTab] || ""

  const setCurrentSelectedActivity = (value) => {
    setSelectedActivities((prev) => ({
      ...prev,
      [localActiveTab]: value,
    }))
  }

  const setCurrentActivityValue = (value) => {
    setActivityValues((prev) => ({
      ...prev,
      [localActiveTab]: value,
    }))
  }

  const setCurrentValidationError = (error) => {
    setValidationErrors((prev) => ({
      ...prev,
      [localActiveTab]: error,
    }))
  }

  const getUsedEvaluationIds = (type) => {
    const usedIds = new Set()

    levels.forEach((level) => {
      level.themes?.forEach((theme) => {
        theme.activities?.forEach((activity) => {
          if (activity.type === type && activity.evaluationId) {
            usedIds.add(activity.evaluationId)
          }
        })
      })
    })

    return usedIds
  }

  const getUsedMaterialIds = () => {
    const usedIds = new Set()

    levels.forEach((level) => {
      level.themes?.forEach((theme) => {
        theme.activities?.forEach((activity) => {
          if (activity.type === "Material" && activity.evaluationData?._id) {
            usedIds.add(activity.evaluationData._id)
          }
        })
      })
    })

    return usedIds
  }

  const getAvailableOptions = (type, currentActivityId = null) => {
    let baseOptions = []
    let usedIds = new Set()

    switch (type) {
      case "Actividades":
        baseOptions =
          evaluations
            ?.filter((e) => e.tipoEvaluacion === "Actividad" && e.estado === "Activo")
            .map((e) => ({
              value: e._id,
              label: e.nombre,
              customData: e,
            })) || []
        usedIds = getUsedEvaluationIds("Actividades")
        break

      case "Exámenes":
        baseOptions =
          evaluations
            ?.filter((e) => e.tipoEvaluacion === "Examen" && e.estado === "Activo")
            .map((e) => ({
              value: e._id,
              label: e.nombre,
              customData: e,
            })) || []
        usedIds = getUsedEvaluationIds("Exámenes")
        break

      case "Material":
        baseOptions =
          materials
            ?.filter((m) => m.estado === "activo")
            .map((m) => ({
              value: m._id,
              label: m.titulo,
              customData: m,
            })) || []
        usedIds = getUsedMaterialIds()
        break

      default:
        return []
    }

    return baseOptions.filter((option) => {
      const isCurrentSelection = currentActivityId === option.value
      return isCurrentSelection || !usedIds.has(option.value)
    })
  }

  const activityOptions = getAvailableOptions("Actividades")
  const examOptions = getAvailableOptions("Exámenes")
  const materialOptions = getAvailableOptions("Material")

  const addNewActivity = () => {
    const currentValue = getCurrentActivityValue()
    const currentSelected = getCurrentSelectedActivity()

    setCurrentValidationError("")

    if (localActiveTab !== "Material" && wouldExceed100) {
      setCurrentValidationError(`El valor ingresado haría que el total sea ${totalValue}%, superando el límite de 100%`)
      return
    }

    if (localActiveTab !== "Material" && (!currentValue || currentValue.trim() === "")) {
      setCurrentValidationError("Este campo es requerido")
      return
    }

    if (localActiveTab !== "Material" && Number(currentValue) > 100) {
      setCurrentValidationError("El valor no puede ser mayor a 100%")
      return
    }

    if (localActiveTab !== "Material" && Number(currentValue) <= 0) {
      setCurrentValidationError("El valor debe ser mayor a 0")
      return
    }

    if (localActiveTab !== "Material" && (!currentSelected || !currentValue || Number(currentValue) <= 0)) return
    if (localActiveTab === "Material" && !currentSelected) return

    const options = getOptionsForActiveTab()

    // ✅ Manejar tanto objetos {value, label} como strings
    let selectedOptionValue = currentSelected
    if (typeof currentSelected === "object" && currentSelected.value) {
      selectedOptionValue = currentSelected.value
    }

    const selectedOption = options.find((opt) => opt.value === selectedOptionValue)

    const newActivity = {
      id: `activity-${Date.now()}`,
      evaluationId: selectedOptionValue, // ✅ Usar selectedOptionValue en lugar de selectedOption.value
      name: selectedOption ? selectedOption.label : "Sin nombre",
      value: localActiveTab === "Material" ? "N/A" : `${currentValue}%`,
      type: localActiveTab,
      evaluationData: selectedOption ? selectedOption.customData : null,
    }

    setLevels(
      levels.map((level) => {
        if (level.id === levelId) {
          const updatedThemes = level.themes.map((theme) => {
            if (theme.id === themeId) {
              return {
                ...theme,
                activities: [...(theme.activities || []), newActivity],
              }
            }
            return theme
          })
          return { ...level, themes: updatedThemes }
        }
        return level
      }),
    )

    setCurrentSelectedActivity("")
    if (localActiveTab !== "Material") {
      setCurrentActivityValue("")
    }
  }

  const deleteActivity = (activityId) => {
    setLevels(
      levels.map((level) => {
        if (level.id === levelId) {
          const updatedThemes = level.themes.map((theme) => {
            if (theme.id === themeId) {
              return {
                ...theme,
                activities: (theme.activities || []).filter((a) => a.id !== activityId),
              }
            }
            return theme
          })
          return { ...level, themes: updatedThemes }
        }
        return level
      }),
    )
  }

  const getOptionsForActiveTab = () => {
    switch (localActiveTab) {
      case "Actividades":
        return activityOptions
      case "Exámenes":
        return examOptions
      case "Material":
        return materialOptions
      default:
        return activityOptions
    }
  }

  const getFilteredActivities = () => {
    return (currentTheme?.activities || []).filter((activity) => activity.type === localActiveTab)
  }

  const calculateTotalValue = () => {
    const filteredActivities = getFilteredActivities()
    if (localActiveTab === "Material") return 0

    const currentTotal = filteredActivities.reduce((total, activity) => {
      const valueStr = activity.value.replace("%", "")
      const value = Number.parseInt(valueStr)
      return isNaN(value) ? total : total + value
    }, 0)

    const inputValue = Number(getCurrentActivityValue()) || 0
    return currentTotal + inputValue
  }

  const checkThemeExceeds100 = () => {
    const activities = (currentTheme?.activities || []).filter((a) => a.type === "Actividades")
    const actSum = activities.reduce((sum, a) => {
      const value = Number.parseInt(a.value?.replace("%", "") || 0)
      return sum + value
    }, 0)

    const exams = (currentTheme?.activities || []).filter((a) => a.type === "Exámenes")
    const examSum = exams.reduce((sum, e) => {
      const value = Number.parseInt(e.value?.replace("%", "") || 0)
      return sum + value
    }, 0)

    return actSum > 100 || examSum > 100
  }

  const themeExceeds100 = checkThemeExceeds100()

  const totalValue = useMemo(() => {
    return calculateTotalValue()
  }, [levels, levelId, themeId, localActiveTab, getCurrentActivityValue()])

  const isValueValid = localActiveTab === "Material" || totalValue === 100
  const wouldExceed100 = localActiveTab !== "Material" && totalValue > 100

  const filteredData = getFilteredActivities()
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  // ✅ MEJORA: Función para crear evaluaciones con tipo específico
  const handleCreateEvaluation = (type) => {
    if (type === "Material") {
      setShowSupportMaterialModal(true)
      return
    }

    // ✅ Establecer el tipo específico (Actividad o Examen)
    setEvaluationType(type === "Actividades" ? "Actividad" : "Examen")
    setShowEvaluationModal(true)
  }

  const handleEvaluationSubmit = async (formData) => {
    try {
      await createEvaluation(formData)
      await refetchEvaluations()
      setShowEvaluationModal(false)

      // ✅ Mensaje de éxito más específico
      const typeName = evaluationType === "Actividad" ? "Actividad" : "Examen"
      const evaluationName = formData.get("nombre") || typeName
      setSuccessMessage(`${typeName} "${evaluationName}" creada exitosamente`)
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error al crear la evaluación:", error)
      setSuccessMessage(error.message || "Ocurrió un error al crear la evaluación")
      setShowSuccessModal(true)
    }
  }

  const handleSaveNewMaterial = async (materialData) => {
    try {
      await createMaterial(materialData)
      await refetchMaterials()
      setShowSupportMaterialModal(false)
      setSuccessMessage("Material de Apoyo creado exitosamente")
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Error al añadir el material:", error)
      setSuccessMessage(error.message || "Ocurrió un error al crear el material de apoyo")
      setShowSuccessModal(true)
    }
  }

  const handleViewDetail = (activity) => {
    if (activity.type === "Material") {
      setSelectedMaterial(activity.evaluationData)
      setShowMaterialDetailModal(true)
    } else {
      setSelectedDetail(activity.evaluationData)
      setShowDetailModal(true)
    }
  }

  if (!currentTheme) return null

  const availableOptions = getOptionsForActiveTab()
  const currentValue = getCurrentActivityValue()
  const currentSelected = getCurrentSelectedActivity()
  const currentError = getCurrentValidationError()

  const handleValueChange = (e) => {
    const value = e.target.value
    setCurrentActivityValue(value)

    if (value && Number(value) > 100) {
      setCurrentValidationError("El valor no puede ser mayor a 100%")
    } else if (value && Number(value) <= 0) {
      setCurrentValidationError("El valor debe ser mayor a 0")
    } else {
      setCurrentValidationError("")
    }
  }

  return (
    <div className="mt-4 p-3">
      <div className="border rounded-md">
        <div className="flex border-b">
          <button
            className={`px-6 py-2 block text-sm font-medium text-gray-700 ${
              localActiveTab === "Actividades" ? "bg-blue-50 border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setLocalActiveTab("Actividades")}
          >
            Actividades
          </button>
          <button
            className={`px-4 py-2 block text-sm font-medium text-gray-700 ${
              localActiveTab === "Exámenes" ? "bg-blue-50 border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setLocalActiveTab("Exámenes")}
          >
            Exámenes
          </button>
          <button
            className={`px-4 py-2 block text-sm font-medium text-gray-700 ${
              localActiveTab === "Material" ? "bg-blue-50 border-b-2 border-blue-500" : ""
            }`}
            onClick={() => setLocalActiveTab("Material")}
          >
            Material de Apoyo
          </button>
        </div>

        <div className="p-6">
          <div>
            {localActiveTab !== "Material" && filteredData.length > 0 && (
              <div className="flex justify-between items-center px-2 py-1 mb-3 bg-gray-50 rounded-[10px]">
                <span className="text-sm font-medium">Valor total:</span>
                <span className={`text-sm font-medium ${totalValue === 100 ? "text-green-600" : "text-red-600"}`}>
                  <span className="inline-flex items-center gap-1">
                    {totalValue}%{" "}
                    {totalValue === 100 ? <Check className="h-5 w-7" /> : <CircleAlert className="h-5 w-7" />}
                  </span>
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className={localActiveTab === "Material" ? "col-span-3" : "col-span-2"}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {localActiveTab === "Material" ? "Material" : localActiveTab === "Exámenes" ? "Examen" : "Actividad"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  placeholder={`Seleccionar ${
                    localActiveTab === "Material" ? "material" : localActiveTab === "Exámenes" ? "examen" : "actividad"
                  }`}
                  options={availableOptions}
                  value={currentSelected}
                  onChange={setCurrentSelectedActivity}
                />
                {availableOptions.length === 0 && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Todos los {localActiveTab.toLowerCase()} activos disponibles ya han sido utilizados en esta
                    programación
                  </p>
                )}
              </div>
              {localActiveTab !== "Material" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center w-full">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      className={`w-full rounded-l-md border px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                        currentError ? "border-red-300" : "border-gray-300"
                      }`}
                      value={currentValue}
                      onChange={handleValueChange}
                    />
                    <span className="bg-gray-100 border border-l-0 border-gray-300 px-2 py-1.5 rounded-r-md">%</span>
                  </div>
                  {currentError && <p className="text-xs text-red-600 mt-1">{currentError}</p>}
                </div>
              )}
            </div>

            <div className="flex space-x-2 mb-4">
              <button
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-sm text-white rounded-md flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={() => handleCreateEvaluation(localActiveTab)}
                disabled={localActiveTab === "Material" && themeExceeds100}
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Crear{" "}
                {localActiveTab === "Material" ? "Material" : localActiveTab === "Exámenes" ? "Examen" : "Actividad"}
              </button>
              <button
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-sm text-white rounded-md flex items-center disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={addNewActivity}
                disabled={
                  availableOptions.length === 0 ||
                  !currentSelected ||
                  (localActiveTab === "Material" && themeExceeds100) ||
                  (localActiveTab !== "Material" && (wouldExceed100 || !currentValue || Number(currentValue) <= 0))
                }
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir{" "}
                {localActiveTab === "Material" ? "Material" : localActiveTab === "Exámenes" ? "Examen" : "Actividad"}
              </button>
            </div>

            <div className="border rounded-md">
              <table className="w-full table-fixed">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="bg-gray-100 px-2 py-2 text-left text-sm font-medium text-gray-600 truncate">
                      Nombre
                    </th>
                    <th className="bg-gray-100 px-2 py-2 text-left text-sm font-medium text-gray-600 truncate">
                      Valor
                    </th>
                    <th className="bg-gray-100 px-2 py-2 text-left text-sm font-medium text-gray-600 w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-2 py-2 text-sm text-left border-b border-gray-200 text-gray-700 truncate">
                        {activity.name}
                      </td>
                      <td className="px-2 py-2 text-sm text-left border-b border-gray-200 text-gray-700 truncate">
                        {activity.value}
                      </td>
                      <td className="px-2 py-2 border-b border-gray-200">
                        <div className="flex space-x-2">
                          <Tooltip text="Detalle" position="top">
                            <button
                              className="p-1 hover:bg-gray-100 rounded-full"
                              onClick={() => handleViewDetail(activity)}
                            >
                              <Eye className="h-5 w-6 text-blue-500" />
                            </button>
                          </Tooltip>
                          <Tooltip text="Eliminar" position="top">
                            <button
                              className="p-1 hover:bg-gray-100 rounded-full"
                              onClick={() => deleteActivity(activity.id)}
                            >
                              <Trash className="h-4 w-6 text-red-500" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {currentData.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-2 py-4 text-sm text-center text-gray-500">
                        No hay{" "}
                        {localActiveTab === "Material"
                          ? "materiales"
                          : localActiveTab === "Exámenes"
                            ? "exámenes"
                            : "actividades"}{" "}
                        agregados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <div className="flex justify-between items-center text-xs font-medium text-gray-600 ml-2 p-1">
                <div>{filteredData.length} elementos</div>

                {filteredData.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span>
                      Página {currentPage} de {totalPages > 0 ? totalPages : 1}
                    </span>

                    <div className="flex gap-1">
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        aria-label="Página anterior"
                      >
                        <FiChevronLeft size={14} />
                      </button>
                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        aria-label="Página siguiente"
                      >
                        <FiChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ MEJORA: Pasar el tipo de evaluación al modal */}
      <EvaluationModal
        isOpen={showEvaluationModal}
        onClose={() => setShowEvaluationModal(false)}
        onSubmit={handleEvaluationSubmit}
        evaluation={null}
        evaluationType={evaluationType} // ✅ Pasar el tipo específico
      />

      <EvaluationDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        evaluation={selectedDetail}
      />

      <CreateSupportMaterialModal
        isOpen={showSupportMaterialModal}
        onClose={() => setShowSupportMaterialModal(false)}
        onSubmit={handleSaveNewMaterial}
      />

      <SupportMaterialDetailModal
        isOpen={showMaterialDetailModal}
        onClose={() => setShowMaterialDetailModal(false)}
        material={selectedMaterial}
      />

      <ConfirmationModal
        isOpen={showSuccessModal}
        onConfirm={() => setShowSuccessModal(false)}
        title="Operación Exitosa"
        message={successMessage}
        confirmText="Aceptar"
        confirmColor="bg-green-500 hover:bg-green-600"
        showButtonCancel={false}
      />
    </div>
  )
}
