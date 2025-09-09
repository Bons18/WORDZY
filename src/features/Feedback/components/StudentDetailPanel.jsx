"use client"

import { useState, useEffect } from "react"
import { X, User, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useStudentDetails } from "../hooks/useStudentDetails"

const StudentDetailPanel = ({ isOpen, onClose, selectedStudent, feedbackItem }) => {
  const { loadFailedQuestions } = useStudentDetails()
  const [failedQuestions, setFailedQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && selectedStudent && feedbackItem) {
      loadQuestions()
    }
  }, [isOpen, selectedStudent, feedbackItem])

  const loadQuestions = async () => {
    try {
      setLoading(true)
      setError(null)
      const questions = await loadFailedQuestions(selectedStudent.id, feedbackItem.id)
      setFailedQuestions(questions)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const getStatusIcon = (estado) => {
    return estado === "Presente" ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    )
  }

  const getGradeColor = (calificacion) => {
    const grade = Number.parseFloat(calificacion)
    if (grade >= 4.0) return "text-green-600"
    if (grade >= 3.0) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-[#1f384c] to-[#2a4a64]">
          <div className="flex items-center gap-3">
            <User className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-xl font-semibold text-white">Detalle del Aprendiz</h2>
              <p className="text-blue-100 text-sm">{selectedStudent?.aprendiz}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Información del estudiante */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[#1f384c] mb-3">Información Personal</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{selectedStudent?.aprendiz}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ficha:</span>
                  <span className="font-medium">{selectedStudent?.ficha}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estado:</span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedStudent?.estado)}
                    <span className="font-medium">{selectedStudent?.estado}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hora:</span>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{selectedStudent?.hora}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-[#1f384c] mb-3">Rendimiento Académico</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Calificación:</span>
                  <span className={`font-bold text-lg ${getGradeColor(selectedStudent?.calificacion)}`}>
                    {selectedStudent?.calificacion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Preguntas Falladas:</span>
                  <span className="font-medium text-red-600">{selectedStudent?.preguntasFalladas || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Observaciones:</span>
                  <span className="font-medium text-right max-w-[200px]">{selectedStudent?.observaciones}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información de la actividad */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-[#1f384c] mb-3">Información de la Actividad</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-gray-600 text-sm">Tema:</span>
                <p className="font-medium">{feedbackItem?.tema}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Actividad:</span>
                <p className="font-medium">{feedbackItem?.actividad}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Nivel:</span>
                <p className="font-medium">{feedbackItem?.nivel}</p>
              </div>
            </div>
          </div>

          {/* Preguntas falladas */}
          {selectedStudent?.estado === "Presente" && selectedStudent?.preguntasFalladas > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-4 py-3 border-b border-gray-200 bg-red-50">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <h3 className="text-lg font-medium text-red-800">Preguntas Falladas ({failedQuestions.length})</h3>
                </div>
              </div>

              <div className="p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1f384c]"></div>
                    <span className="ml-2 text-gray-600">Cargando preguntas...</span>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <button
                      onClick={loadQuestions}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : failedQuestions.length > 0 ? (
                  <div className="space-y-4">
                    {failedQuestions.map((question) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">
                            Pregunta {question.numero} - {question.tipo}
                          </h4>
                          <span className="text-sm text-red-600 font-medium">-{question.puntos} pts</span>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Pregunta:</span>
                            <p className="text-gray-600 mt-1">{question.pregunta}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <span className="font-medium text-green-700">Respuesta Correcta:</span>
                              <p className="text-green-600 mt-1">{question.respuestaCorrecta}</p>
                            </div>
                            <div>
                              <span className="font-medium text-red-700">Respuesta del Estudiante:</span>
                              <p className="text-red-600 mt-1">{question.respuestaEstudiante}</p>
                            </div>
                          </div>

                          {question.observacion && (
                            <div>
                              <span className="font-medium text-gray-700">Observación:</span>
                              <p className="text-gray-600 mt-1">{question.observacion}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No hay preguntas falladas registradas</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mensaje para estudiantes ausentes */}
          {selectedStudent?.estado === "Ausente" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <p className="text-yellow-800">
                  Este estudiante no asistió a la clase, por lo que no hay información de rendimiento disponible.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentDetailPanel
