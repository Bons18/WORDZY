"use client"

import { useEffect, useRef } from "react"

const FichaDetailModal = ({ ficha, isOpen, onClose }) => {
  const modalRef = useRef(null)

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[18px] font-bold text-center text-[#1f384c]">DETALLE DE FICHA</h2>
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

        {ficha ? (
          <div className="space-y-6">
            {/* Información de la Ficha */}
            <div>
              <h3 className="text-lg font-semibold text-[#1f384c] mb-4">Información General</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-1/3 font-bold text-[14px]">Código:</div>
                  <div className="w-2/3 text-[14px] text-gray-500">{ficha.code}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/3 font-bold text-[14px]">Estado:</div>
                  <div className="w-2/3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        ficha.course_status === "EN EJECUCION"
                          ? "bg-green-100 text-green-800"
                          : ficha.course_status === "TERMINADO"
                            ? "bg-blue-100 text-blue-800"
                            : ficha.course_status === "SUSPENDIDO"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                      }`}
                    >
                      {ficha.course_status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/3 font-bold text-[14px]">Programa:</div>
                  <div className="w-2/3 text-[14px] text-gray-500">{ficha.fk_programs}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/3 font-bold text-[14px]">Área:</div>
                  <div className="w-2/3 text-[14px] text-gray-500">{ficha.area}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/3 font-bold text-[14px]">Tipo Oferta:</div>
                  <div className="w-2/3 text-[14px] text-gray-500">{ficha.offer_type}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/3 font-bold text-[14px]">Trimestre:</div>
                  <div className="w-2/3 text-[14px] text-gray-500">{ficha.quarter || "N/A"}</div>
                </div>
                {ficha.start_date && (
                  <div className="flex items-center">
                    <div className="w-1/3 font-bold text-[14px]">Fecha Inicio:</div>
                    <div className="w-2/3 text-[14px] text-gray-500">
                      {new Date(ficha.start_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {ficha.end_date && (
                  <div className="flex items-center">
                    <div className="w-1/3 font-bold text-[14px]">Fecha Fin:</div>
                    <div className="w-2/3 text-[14px] text-gray-500">
                      {new Date(ficha.end_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Información Técnica */}
            <div>
              <h3 className="text-lg font-semibold text-[#1f384c] mb-4">Información Técnica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <div className="w-1/3 font-bold text-[14px]">Coordinación:</div>
                  <div className="w-2/3 text-[14px] text-gray-500">{ficha.fk_coordination || "N/A"}</div>
                </div>
                <div className="flex items-center">
                  <div className="w-1/3 font-bold text-[14px]">Itinerario:</div>
                  <div className="w-2/3 text-[14px] text-gray-500">{ficha.fk_itinerary || "N/A"}</div>
                </div>
                {ficha.internship_start_date && (
                  <div className="flex items-center">
                    <div className="w-1/3 font-bold text-[14px]">Inicio Práctica:</div>
                    <div className="w-2/3 text-[14px] text-gray-500">
                      {new Date(ficha.internship_start_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
                {ficha.terms_expiry_date && (
                  <div className="flex items-center">
                    <div className="w-1/3 font-bold text-[14px]">Vencimiento:</div>
                    <div className="w-2/3 text-[14px] text-gray-500">
                      {new Date(ficha.terms_expiry_date).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Error al cargar la información de la ficha</p>
          </div>
        )}

        <div className="flex justify-center mt-8">
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

export default FichaDetailModal
