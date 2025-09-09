"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const InstructorDetailModal = ({ instructor, isOpen, onClose }) => {
  const [fichasCollapsed, setFichasCollapsed] = useState(false)

  if (!isOpen || !instructor) return null

  const toggleFichasCollapse = () => {
    setFichasCollapsed(!fichasCollapsed)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-[#1f384c]">DETALLE DEL INSTRUCTOR</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Cerrar modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 pb-6">
          {/* Información Personal */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#1f384c] mb-4">Información Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <label className="block text-sm font-medium text-gray-600 mb-1">Nombre Completo</label>
                <p className="text-gray-900 font-medium">
                  {instructor.nombre} {instructor.apellido}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <label className="block text-sm font-medium text-gray-600 mb-1">Documento</label>
                <p className="text-gray-900">
                  {instructor.tipoDocumento}: {instructor.documento}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <label className="block text-sm font-medium text-gray-600 mb-1">Teléfono</label>
                <p className="text-gray-900">{instructor.telefono}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <label className="block text-sm font-medium text-gray-600 mb-1">Correo Electrónico</label>
                <p className="text-gray-900">{instructor.correo}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    instructor.estado === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {instructor.estado}
                </span>
              </div>
            </div>
          </div>

          {/* Fichas Asignadas */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1f384c]">
                Fichas Asignadas
                {instructor.fichas && instructor.fichas.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({instructor.fichas.length} ficha{instructor.fichas.length !== 1 ? "s" : ""})
                  </span>
                )}
              </h3>

              {instructor.fichas && instructor.fichas.length > 0 && (
                <button
                  onClick={toggleFichasCollapse}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-[#1f384c] hover:bg-gray-100 rounded-md transition-colors"
                >
                  {fichasCollapsed ? (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Mostrar
                    </>
                  ) : (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Ocultar
                    </>
                  )}
                </button>
              )}
            </div>

            {instructor.fichas && instructor.fichas.length > 0 ? (
              fichasCollapsed ? (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
                  <p>Fichas ocultas. Haz clic en "Mostrar" para verlas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {instructor.fichas.map((ficha, index) => (
                    <div
                      key={ficha._id || ficha.id || index}
                      className="border border-gray-200 rounded-lg p-4 bg-white"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-[#1f384c]">
                          {typeof ficha === "object" ? ficha.code || ficha.codigo : `Ficha ${index + 1}`}
                        </div>
                        {typeof ficha === "object" && ficha.course_status && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              ficha.course_status === "EN EJECUCION"
                                ? "bg-green-100 text-green-800"
                                : ficha.course_status === "TERMINADO"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {ficha.course_status}
                          </span>
                        )}
                      </div>

                      {typeof ficha === "object" && (
                        <div className="text-sm text-gray-600 space-y-1">
                          {ficha.fk_programs && (
                            <div>
                              <strong>Programa:</strong> {ficha.fk_programs}
                            </div>
                          )}
                          {ficha.area && (
                            <div>
                              <strong>Área:</strong> {ficha.area}
                            </div>
                          )}
                          {ficha.offer_type && (
                            <div>
                              <strong>Tipo:</strong> {ficha.offer_type}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-md">
                <svg
                  className="w-12 h-12 mx-auto mb-2 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>No hay fichas asignadas a este instructor</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorDetailModal
