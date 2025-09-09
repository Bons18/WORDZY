
"use client"

import { useEffect, useRef, useState } from "react"
import { Eye } from "lucide-react"
import GenericTable from "../../../shared/components/Table"

const ProgramDetailModal = ({ program, isOpen, onClose }) => {
  const modalRef = useRef(null)
  const aprendicesModalRef = useRef(null)
  const [fichasAsociadas, setFichasAsociadas] = useState([])
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState(null)
  const [selectedFicha, setSelectedFicha] = useState(null)
  const [showAprendicesModal, setShowAprendicesModal] = useState(false)
  const [aprendicesFicha, setAprendicesFicha] = useState([])
  const [loadingAprendices, setLoadingAprendices] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Solo cerrar el modal principal si no está abierto el modal de aprendices
      if (!showAprendicesModal && modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
      // Cerrar modal de aprendices si se hace clic fuera de él
      if (showAprendicesModal && aprendicesModalRef.current && !aprendicesModalRef.current.contains(event.target)) {
        closeAprendicesModal()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose, showAprendicesModal])

  // Función para contar aprendices por ficha
  const contarAprendicesPorFicha = async (fichas) => {
    try {
      console.log("=== CONTANDO APRENDICES POR FICHA ===")
      console.log("Fichas a procesar:", fichas.length)

      const response = await fetch("http://localhost:3000/api/apprentice")

      if (!response.ok) {
        console.error("Error al obtener aprendices:", response.status)
        return fichas
      }

      const data = await response.json()
      console.log("Respuesta de API apprentice:", data)

      let aprendices = []

      if (Array.isArray(data)) {
        aprendices = data
      } else if (data.apprentices && Array.isArray(data.apprentices)) {
        aprendices = data.apprentices
      } else if (data.data && Array.isArray(data.data)) {
        aprendices = data.data
      } else if (data.users && Array.isArray(data.users)) {
        aprendices = data.users
      }

      console.log("Total aprendices obtenidos:", aprendices.length)
      console.log("Primeros 3 aprendices:", aprendices.slice(0, 3))

      // Contar aprendices por cada ficha
      const fichasConConteo = fichas.map((ficha) => {
        const codigoFicha = ficha.code || ficha.id
        console.log(`--- Procesando ficha: ${codigoFicha} ---`)

        const aprendicesEnFicha = aprendices.filter((aprendiz) => {
          console.log(`Aprendiz: ${aprendiz.nombre} ${aprendiz.apellido}`)
          console.log(`  - Fichas del aprendiz:`, aprendiz.ficha)

          if (!aprendiz.ficha || !Array.isArray(aprendiz.ficha)) {
            console.log(`  - No tiene fichas o no es array`)
            return false
          }

          const tieneAsociacion = aprendiz.ficha.some((fichaAprendiz) => {
            const coincide =
              fichaAprendiz === codigoFicha ||
              fichaAprendiz === Number.parseInt(codigoFicha) ||
              fichaAprendiz.toString() === codigoFicha.toString() ||
              Number.parseInt(fichaAprendiz) === Number.parseInt(codigoFicha)

            if (coincide) {
              console.log(`  - ✅ COINCIDENCIA: ${fichaAprendiz} === ${codigoFicha}`)
            }

            return coincide
          })

          console.log(`  - Resultado: ${tieneAsociacion ? "SÍ" : "NO"} está en la ficha`)
          return tieneAsociacion
        })

        console.log(`Ficha ${codigoFicha}: ${aprendicesEnFicha.length} aprendices encontrados`)
        console.log(
          `Aprendices en esta ficha:`,
          aprendicesEnFicha.map((a) => `${a.nombre} ${a.apellido}`),
        )

        return {
          ...ficha,
          apprentices_count: aprendicesEnFicha.length,
        }
      })

      console.log("=== RESULTADO FINAL DEL CONTEO ===")
      fichasConConteo.forEach((ficha) => {
        console.log(`Ficha ${ficha.code}: ${ficha.apprentices_count} aprendices`)
      })

      return fichasConConteo
    } catch (error) {
      console.error("Error al contar aprendices:", error)
      return fichas
    }
  }

  // Función para obtener aprendices de una ficha específica
  const obtenerAprendicesDeFicha = async (codigoFicha) => {
    setLoadingAprendices(true)
    try {
      console.log("=== OBTENIENDO APRENDICES DE FICHA ===")
      console.log("Código de ficha:", codigoFicha)

      const response = await fetch("http://localhost:3000/api/apprentice")

      if (!response.ok) {
        throw new Error(`Error al obtener aprendices: ${response.status}`)
      }

      const data = await response.json()
      let aprendices = []

      if (Array.isArray(data)) {
        aprendices = data
      } else if (data.apprentices && Array.isArray(data.apprentices)) {
        aprendices = data.apprentices
      } else if (data.data && Array.isArray(data.data)) {
        aprendices = data.data
      } else if (data.users && Array.isArray(data.users)) {
        aprendices = data.users
      }

      console.log("Total aprendices para filtrar:", aprendices.length)

      // Filtrar aprendices de esta ficha específica
      const aprendicesEnFicha = aprendices.filter((aprendiz) => {
        if (!aprendiz.ficha || !Array.isArray(aprendiz.ficha)) return false

        return aprendiz.ficha.some(
          (fichaAprendiz) =>
            fichaAprendiz === codigoFicha ||
            fichaAprendiz === Number.parseInt(codigoFicha) ||
            fichaAprendiz.toString() === codigoFicha.toString() ||
            Number.parseInt(fichaAprendiz) === Number.parseInt(codigoFicha),
        )
      })

      console.log("Aprendices encontrados para la ficha:", aprendicesEnFicha.length)

      // Formatear datos para mostrar
      const aprendicesFormateados = aprendicesEnFicha.map((aprendiz) => ({
        id: aprendiz._id || aprendiz.id,
        documento: aprendiz.documento || "Sin documento",
        nombre: `${aprendiz.nombre || "Sin nombre"} ${aprendiz.apellido || ""}`.trim(),
        nivel: aprendiz.nivel || 1,
        estado: mapearEstado(aprendiz.estado),
        correo: aprendiz.correo || "Sin correo",
        telefono: aprendiz.telefono || "Sin teléfono",
      }))

      setAprendicesFicha(aprendicesFormateados)
    } catch (error) {
      console.error("Error al obtener aprendices de la ficha:", error)
      setAprendicesFicha([])
    } finally {
      setLoadingAprendices(false)
    }
  }

  const mapearEstado = (estado) => {
    if (!estado) return "Activo"
    const estadosActivos = ["En formación", "Condicionado", "Graduado", "Activo"]
    return estadosActivos.includes(estado) ? "Activo" : "Inactivo"
  }

  // Función para obtener fichas asociadas al programa
  const fetchFichasAsociadas = async (programCode) => {
    setLoading(true)
    try {
      console.log("=== INICIO DEBUG FICHAS ===")
      console.log("Programa seleccionado completo:", program)
      console.log("Código del programa a buscar:", programCode)

      const response = await fetch("http://localhost:3000/api/course")

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`)
      }

      const data = await response.json()
      console.log("=== RESPUESTA COMPLETA DE LA API COURSE ===")
      console.log("Tipo de respuesta:", typeof data)
      console.log("Es array:", Array.isArray(data))

      // Manejar diferentes estructuras de respuesta
      let fichas = []
      if (Array.isArray(data)) {
        fichas = data
        console.log("Usando data directamente (es array)")
      } else if (data.data && Array.isArray(data.data)) {
        fichas = data.data
        console.log("Usando data.data")
      } else if (data.courses && Array.isArray(data.courses)) {
        fichas = data.courses
        console.log("Usando data.courses")
      } else if (data.fichas && Array.isArray(data.fichas)) {
        fichas = data.fichas
        console.log("Usando data.fichas")
      }

      console.log("=== FICHAS OBTENIDAS ===")
      console.log("Total de fichas:", fichas.length)

      console.log("=== PROCESO DE FILTRADO ===")
      console.log("Buscando fichas con programa:", programCode)

      // Filtrar fichas que pertenecen al programa actual
      const fichasFiltradas = fichas.filter((ficha) => {
        const fichaProgram =
          ficha.fk_programs || ficha.fk_program || ficha.program || ficha.programCode || ficha.program_code

        const matches =
          fichaProgram === programCode ||
          fichaProgram === String(programCode) ||
          fichaProgram === Number(programCode) ||
          (ficha.program && ficha.program.code === programCode) ||
          (ficha.program && ficha.program.id === programCode) ||
          fichaProgram === program.name ||
          (ficha.program && ficha.program.name === program.name)

        return matches
      })

      console.log("=== RESULTADO INICIAL ===")
      console.log("Fichas filtradas:", fichasFiltradas.length)

      // Contar aprendices para cada ficha
      const fichasConAprendices = await contarAprendicesPorFicha(fichasFiltradas)

      console.log("=== RESULTADO FINAL CON CONTEO ===")
      console.log("Fichas con conteo de aprendices:", fichasConAprendices)

      setDebugInfo({
        totalFichas: fichas.length,
        programCode: programCode,
        programName: program.name,
        fichasFiltradas: fichasConAprendices.length,
      })

      setFichasAsociadas(fichasConAprendices)
    } catch (error) {
      console.error("=== ERROR AL OBTENER FICHAS ===")
      console.error("Error completo:", error)
      setFichasAsociadas([])
      setDebugInfo({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Obtener fichas cuando se abre el modal
  useEffect(() => {
    if (isOpen && program) {
      const programCode = program.code || program.id
      fetchFichasAsociadas(programCode)
    }
  }, [isOpen, program])

  // Función para manejar ver aprendices de una ficha
  const handleViewFicha = async (ficha) => {
    console.log("Ver aprendices de la ficha:", ficha)
    setSelectedFicha(ficha)
    setShowAprendicesModal(true)
    await obtenerAprendicesDeFicha(ficha.code || ficha.id)
  }

  // Cerrar modal de aprendices
  const closeAprendicesModal = () => {
    setShowAprendicesModal(false)
    setSelectedFicha(null)
    setAprendicesFicha([])
  }

  if (!isOpen || !program) return null

  const formatLevel = (level) => {
    const levelMap = {
      TECNICO: "Técnico",
      TECNÓLOGO: "Tecnólogo",
      ESPECIALIZACION: "Especialización",
      AUXILIAR: "Auxiliar",
      OPERARIO: "Operario",
    }
    return levelMap[level] || level
  }

  const formatModality = (modality) => {
    const modalityMap = {
      PRESENCIAL: "Presencial",
      "A DISTANCIA": "A Distancia",
      VIRTUAL: "Virtual",
      COMBINADO: "Combinado",
    }
    return modalityMap[modality] || modality
  }

  // Configuración de columnas para la tabla de fichas
  const fichasColumns = [
    {
      key: "code",
      label: "Fichas",
      width: "40%",
      render: (item) => item.code || item.number || item.id || "N/A",
    },
    {
      key: "apprentices_count",
      label: "N. Aprendices",
      width: "30%",
      render: (item) => <span className="font-semibold">{item.apprentices_count || 0}</span>,
    },
    // {
    //   key: "actions",
    //   label: "ACCIONES",
    //   width: "30%",
    //   render: (item) => (
    //     <button
    //       onClick={() => handleViewFicha(item)}
    //       className="bg-[#1f384c] text-white p-2 rounded-full hover:bg-[#2d4a5c] transition-colors"
    //       title="Ver aprendices de la ficha"
    //     >
    //       <Eye className="w-4 h-4" />
    //     </button>
    //   ),
    // },
  ]

  // Configuración de columnas para la tabla de aprendices
  const aprendicesColumns = [
    {
      key: "documento",
      label: "Documento",
      width: "15%",
    },
    {
      key: "nombre",
      label: "Nombre Completo",
      width: "25%",
    },
    {
      key: "nivel",
      label: "Nivel",
      width: "10%",
      render: (item) => `Nivel ${item.nivel}`,
    },
    {
      key: "estado",
      label: "Estado",
      width: "15%",
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            item.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {item.estado}
        </span>
      ),
    },
    {
      key: "correo",
      label: "Correo",
      width: "35%",
    },
  ]

  return (
    <>
      {/* Modal principal de programa */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${showAprendicesModal ? "z-40" : "z-50"}`}
      >
        <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-[18px] font-bold text-center text-[#1f384c] mb-6">DETALLE DEL PROGRAMA</h2>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center">
              <div className="w-1/3 font-bold text-[14px]">Programa:</div>
              <div className="w-2/3 text-[14px] text-gray-500">{program.name}</div>
            </div>

            <div className="flex items-center">
              <div className="w-1/2 font-bold text-[14px]">Código:</div>
              <div className="w-1/2 text-[14px] text-gray-500">{program.code}</div>
            </div>

            <div className="flex items-center">
              <div className="w-1/3 font-bold text-[14px]">Nivel:</div>
              <div className="w-2/3 text-[14px] text-gray-500">{formatLevel(program.fk_level)}</div>
            </div>

            <div className="flex items-center">
              <div className="w-1/2 font-bold text-[14px]">Modalidad:</div>
              <div className="w-1/2 text-[14px] text-gray-500">{formatModality(program.fk_modality)}</div>
            </div>

            <div className="flex items-center">
              <div className="w-1/3 font-bold text-[14px]">Estado:</div>
              <div className="w-2/3 text-[14px] text-gray-500">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    program.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {program.status ? "Activo" : "Inactivo"}
                </span>
              </div>
            </div>
          </div>

          

          <h3 className="text-[14px] font-bold mb-4">
            Fichas Asociadas al Programa {loading ? "(Cargando...)" : `(${fichasAsociadas.length})`}
          </h3>

          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f384c]"></div>
            </div>
          ) : fichasAsociadas.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-[14px]">No hay fichas asociadas a este programa</p>
              {debugInfo && (
                <p className="text-xs text-gray-400 mt-2">Se revisaron {debugInfo.totalFichas} fichas en total</p>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <GenericTable
                data={fichasAsociadas}
                columns={fichasColumns}
                defaultItemsPerPage={3}
                showActions={{ show: false, edit: false, delete: false, add: false }}
                showSearch={false}
                showPagination={true}
              />
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-[#f44144] text-white py-2 px-8 rounded-lg text-[14px] font-medium hover:bg-red-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Modal de aprendices de la ficha */}
      {showAprendicesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={aprendicesModalRef}
            className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-[18px] font-bold text-center text-[#1f384c] mb-6">
              APRENDICES DE LA FICHA {selectedFicha?.code || selectedFicha?.id}
            </h2>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[14px] font-bold">Lista de Aprendices</h3>
              <span className="text-[12px] text-gray-500">Total: {aprendicesFicha.length} aprendices</span>
            </div>

            {loadingAprendices ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f384c]"></div>
              </div>
            ) : (
              <div className="mb-4">
                <GenericTable
                  data={aprendicesFicha}
                  columns={aprendicesColumns}
                  defaultItemsPerPage={5}
                  showActions={{ show: false, edit: false, delete: false, add: false }}
                  showSearch={false}
                  showPagination={true}
                />
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={closeAprendicesModal}
                className="bg-[#f44144] text-white py-2 px-8 rounded-lg text-[14px] font-medium hover:bg-red-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProgramDetailModal
