
"use client"

import { useState, useEffect, useRef } from "react"
import GenericTable from "../../../shared/components/Table"

const CourseDetailModal = ({ course, isOpen, onClose }) => {
  const modalRef = useRef(null)
  const [aprendicesAsociados, setAprendicesAsociados] = useState([])
  const [loading, setLoading] = useState(false)

  // Obtener aprendices asociados cuando se abre el modal
  useEffect(() => {
    if (isOpen && course) {
      fetchAprendicesAsociados()
    }
  }, [isOpen, course])

  const fetchAprendicesAsociados = async () => {
    setLoading(true)
    try {
      console.log("🔍 Obteniendo aprendices desde: http://localhost:3000/api/apprentice")
      console.log("📋 Ficha actual:", course)

      // Obtener todos los aprendices desde la API
      const response = await fetch("http://localhost:3000/api/apprentice")

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log("📊 Respuesta completa de la API:", data)

      // Extraer el array de aprendices de la respuesta
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

      console.log("👥 Total aprendices obtenidos:", aprendices.length)
      console.log("🎓 Lista de aprendices:", aprendices)

      // Filtrar aprendices asociados a esta ficha
      const codigoFicha = course.code
      console.log("🔍 Buscando aprendices para la ficha con código:", codigoFicha)

      const aprendicesAsociadosAFicha = aprendices.filter((aprendiz) => {
        console.log(`👤 Verificando aprendiz: ${aprendiz.nombre} ${aprendiz.apellido}`)
        console.log(`📋 Fichas del aprendiz:`, aprendiz.ficha)

        // Verificar si el aprendiz tiene fichas asociadas
        if (!aprendiz.ficha || !Array.isArray(aprendiz.ficha)) {
          console.log(`❌ ${aprendiz.nombre} no tiene fichas o no es un array`)
          return false
        }

        // Buscar coincidencias con el código de la ficha
        const tieneAsociacion = aprendiz.ficha.some((fichaAprendiz) => {
          // Comparar de diferentes formas para asegurar coincidencia
          const coincide =
            fichaAprendiz === codigoFicha ||
            fichaAprendiz === Number.parseInt(codigoFicha) ||
            fichaAprendiz.toString() === codigoFicha.toString() ||
            Number.parseInt(fichaAprendiz) === Number.parseInt(codigoFicha)

          if (coincide) {
            console.log(`✅ Coincidencia encontrada: ${fichaAprendiz} === ${codigoFicha}`)
          }

          return coincide
        })

        console.log(
          `${tieneAsociacion ? "✅" : "❌"} ${aprendiz.nombre} ${tieneAsociacion ? "SÍ" : "NO"} está asociado a la ficha`,
        )
        return tieneAsociacion
      })

      console.log("✅ Aprendices asociados encontrados:", aprendicesAsociadosAFicha.length)
      console.log("📝 Lista final de aprendices asociados:", aprendicesAsociadosAFicha)

      // Mapear los datos al formato esperado para la tabla
      const aprendicesFormateados = aprendicesAsociadosAFicha.map((aprendiz) => ({
        id: aprendiz._id || aprendiz.id,
        documento: aprendiz.documento || "Sin documento",
        nombre: `${aprendiz.nombre || "Sin nombre"} ${aprendiz.apellido || ""}`.trim(),
        nivel: aprendiz.nivel || 1,
        estado: mapearEstado(aprendiz.estado),
        correo: aprendiz.correo || "Sin correo",
        telefono: aprendiz.telefono || "Sin teléfono",
      }))

      setAprendicesAsociados(aprendicesFormateados)
    } catch (error) {
      console.error("❌ Error al obtener aprendices asociados:", error)
      setAprendicesAsociados([])
    } finally {
      setLoading(false)
    }
  }

  const mapearEstado = (estado) => {
    if (!estado) return "En formacion"

    // Mapear estados de la base de datos a estados simples para la UI
    const estadosActivos = ["En formación", "Condicionado", "Graduado",]
    const estadosInactivos = ["Retirado", "Inactivo", "Suspendido"]

    if (estadosActivos.includes(estado)) return "En formación"
    if (estadosInactivos.includes(estado)) return "Retirado"

    return "En formación" // Por defecto
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen || !course) return null

  const formatDate = (dateString) => {
    if (!dateString) return "No especificada"
    return new Date(dateString).toLocaleDateString("es-ES")
  }

  const formatOfferType = (type) => {
    const typeMap = {
      ABIERTA: "Abierta",
      CERRADA: "Cerrada",
      ESPECIAL: "Especial",
    }
    return typeMap[type] || type
  }

  const formatCourseStatus = (status) => {
    const statusMap = {
      "EN EJECUCION": "En Ejecución",
      TERMINADO: "Terminado",
      SUSPENDIDO: "Suspendido",
    }
    return statusMap[status] || status
  }

  // Configuración de columnas para GenericTable
  const columns = [
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
            item.estado === "En formación" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {item.estado}
        </span>
      ),
    },
    {
      key: "correo",
      label: "Correo",
      width: "25%",
    },
    {
      key: "telefono",
      label: "Teléfono",
      width: "15%",
    },
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-[18px] font-bold text-center text-[#1f384c] mb-6">DETALLE DE LA FICHA</h2>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="flex items-center">
            <div className="w-1/3 font-bold text-[14px]">Código:</div>
            <div className="w-2/3 text-[14px] text-gray-500">{course.code}</div>
          </div>

          <div className="flex items-center">
            <div className="w-1/2 font-bold text-[14px]">Programa:</div>
            <div className="w-1/2 text-[14px] text-gray-500">{course.fk_programs}</div>
          </div>

          <div className="flex items-center">
            <div className="w-1/3 font-bold text-[14px]">Área:</div>
            <div className="w-2/3 text-[14px] text-gray-500">{course.area}</div>
          </div>

          <div className="flex items-center">
            <div className="w-1/2 font-bold text-[14px]">Coordinación:</div>
            <div className="w-1/2 text-[14px] text-gray-500">{course.fk_coordination}</div>
          </div>

          <div className="flex items-center">
            <div className="w-1/3 font-bold text-[14px]">Tipo de Oferta:</div>
            <div className="w-2/3 text-[14px] text-gray-500">{formatOfferType(course.offer_type)}</div>
          </div>

          <div className="flex items-center">
            <div className="w-1/2 font-bold text-[14px]">Estado del Curso:</div>
            <div className="w-1/2 text-[14px] text-gray-500">{formatCourseStatus(course.course_status)}</div>
          </div>

          <div className="flex items-center">
            <div className="w-1/3 font-bold text-[14px]">Fecha Inicio:</div>
            <div className="w-2/3 text-[14px] text-gray-500">{formatDate(course.start_date)}</div>
          </div>

          <div className="flex items-center">
            <div className="w-1/2 font-bold text-[14px]">Fecha Fin:</div>
            <div className="w-1/2 text-[14px] text-gray-500">{formatDate(course.end_date)}</div>
          </div>

          <div className="flex items-center">
            <div className="w-1/3 font-bold text-[14px]">Inicio Prácticas:</div>
            <div className="w-2/3 text-[14px] text-gray-500">{formatDate(course.internship_start_date)}</div>
          </div>

          <div className="flex items-center">
            <div className="w-1/2 font-bold text-[14px]">Estado:</div>
            <div className="w-1/2 text-[14px] text-gray-500">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  course.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {course.status ? "Activo" : "Inactivo"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[14px] font-bold">Aprendices Asociados a la Ficha</h3>
          {aprendicesAsociados.length > 0 && (
            <span className="text-[12px] text-gray-500">Total: {aprendicesAsociados.length} aprendices</span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f384c]"></div>
          </div>
        ) : (
          <div className="mb-4">
            <GenericTable
              data={aprendicesAsociados}
              columns={columns}
              defaultItemsPerPage={4}
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
  )
}

export default CourseDetailModal
