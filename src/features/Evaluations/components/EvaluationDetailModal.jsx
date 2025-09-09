"use client"

import { useEffect, useRef, useState } from "react"
import { FiDownload, FiPlay, FiPause, FiVolume2, FiVolumeX, FiEye, FiChevronDown, FiChevronUp } from "react-icons/fi"

// URL base de la API (ajusta según tu configuración)
const API_BASE_URL = "http://localhost:3000"

const EvaluationDetailModal = ({ evaluation, isOpen, onClose }) => {
  const modalRef = useRef(null)
  const imagePreviewRef = useRef(null)
  const [audioPlaying, setAudioPlaying] = useState(null)
  const [audioProgress, setAudioProgress] = useState({})
  const [audioMuted, setAudioMuted] = useState({})
  const [downloadingMaterial, setDownloadingMaterial] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())
  const [allExpanded, setAllExpanded] = useState(false)
  const audioRefs = useRef({})
  const progressIntervals = useRef({})

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Si hay una imagen en preview, no cerrar el modal principal
      if (imagePreview) {
        // Solo cerrar el preview si se hace click fuera del contenedor de la imagen
        if (imagePreviewRef.current && !imagePreviewRef.current.contains(event.target)) {
          setImagePreview(null)
        }
        return
      }

      // Si no hay preview de imagen, comportamiento normal del modal principal
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      // Pause any playing audio when modal closes
      Object.values(audioRefs.current).forEach((audio) => {
        if (audio && !audio.paused) {
          audio.pause()
        }
      })
      // Clear all progress intervals
      Object.values(progressIntervals.current).forEach((interval) => {
        clearInterval(interval)
      })
    }
  }, [isOpen, onClose, imagePreview])

  // Limpiar preview cuando se cierre el modal principal
  useEffect(() => {
    if (!isOpen) {
      setImagePreview(null)
    }
  }, [isOpen])

  // Función para expandir o contraer todas las preguntas
  const toggleAllQuestions = () => {
    if (allExpanded) {
      setExpandedQuestions(new Set())
    } else {
      const allIndexes = new Set(evaluation.preguntas?.map((_, index) => index) || [])
      setExpandedQuestions(allIndexes)
    }
    setAllExpanded(!allExpanded)
  }

  // Función para expandir o contraer una pregunta específica
  const toggleQuestion = (index) => {
    const newExpanded = new Set(expandedQuestions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedQuestions(newExpanded)
  }

  // Función para convertir URLs relativas a absolutas
  const getFullUrl = (url) => {
    if (!url) return null

    // Si ya es una URL completa o un objeto File, devolverla tal cual
    if (url instanceof File || url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
      return url
    }

    // Si es una ruta relativa, convertirla a URL completa
    let fullUrl
    if (url.startsWith("/")) {
      fullUrl = `${API_BASE_URL}${url}`
    } else {
      fullUrl = `${API_BASE_URL}/${url}`
    }

    console.log("URL original:", url)
    console.log("URL completa generada:", fullUrl)

    return fullUrl
  }

  const handlePlayAudio = (id) => {
    const audio = audioRefs.current[id]
    if (!audio) return

    if (audioPlaying === id) {
      // Si ya está reproduciéndose este audio, pausarlo
      audio.pause()
      setAudioPlaying(null)
      clearInterval(progressIntervals.current[id])
    } else {
      // Si está reproduciéndose otro audio, pausarlo primero
      if (audioPlaying && audioRefs.current[audioPlaying]) {
        audioRefs.current[audioPlaying].pause()
        clearInterval(progressIntervals.current[audioPlaying])
      }

      // Reproducir el nuevo audio
      audio.play().catch((e) => console.error("Error reproduciendo audio:", e))
      setAudioPlaying(id)

      // Configurar intervalo para actualizar el progreso
      progressIntervals.current[id] = setInterval(() => {
        if (audio.duration) {
          setAudioProgress((prev) => ({
            ...prev,
            [id]: (audio.currentTime / audio.duration) * 100,
          }))
        }
      }, 100)
    }
  }

  const handleAudioEnded = (id) => {
    setAudioPlaying(null)
    clearInterval(progressIntervals.current[id])
    setAudioProgress((prev) => ({
      ...prev,
      [id]: 0,
    }))
  }

  const handleProgressClick = (e, id) => {
    const audio = audioRefs.current[id]
    if (audio) {
      const progressBar = e.currentTarget
      const rect = progressBar.getBoundingClientRect()
      const x = e.clientX - rect.left
      const width = rect.width

      const percentage = x / width

      audio.currentTime = percentage * audio.duration
      setAudioProgress((prev) => ({
        ...prev,
        [id]: percentage * 100,
      }))
    }
  }

  const toggleMute = (e, id) => {
    e.stopPropagation()
    const audio = audioRefs.current[id]
    if (audio) {
      audio.muted = !audio.muted
      setAudioMuted((prev) => ({
        ...prev,
        [id]: audio.muted,
      }))
    }
  }

  const handleDownload = async (url, filename = "material") => {
    if (!url) return

    try {
      setDownloadingMaterial(true)
      const fullUrl = getFullUrl(url)

      // Obtener el archivo como blob para forzar la descarga
      const response = await fetch(fullUrl)

      if (!response.ok) {
        throw new Error(`Error al descargar: ${response.status}`)
      }

      const blob = await response.blob()

      // Obtener el nombre del archivo desde la URL o usar el filename proporcionado
      let downloadFilename = filename
      if (typeof url === "string") {
        const urlParts = url.split("/")
        const fileNameFromUrl = urlParts[urlParts.length - 1]
        if (fileNameFromUrl && fileNameFromUrl.includes(".")) {
          downloadFilename = fileNameFromUrl
        }
      }

      // Crear URL temporal del blob
      const blobUrl = window.URL.createObjectURL(blob)

      // Crear enlace temporal y forzar descarga
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = downloadFilename
      link.style.display = "none"

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Limpiar la URL del blob después de un momento
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl)
      }, 100)
    } catch (error) {
      console.error("Error al descargar el archivo:", error)
      alert("Error al descargar el archivo. Por favor, inténtalo de nuevo.")
    } finally {
      setDownloadingMaterial(false)
    }
  }

  const handleImagePreview = (imageUrl) => {
    setImagePreview(getFullUrl(imageUrl))
  }

  const closeImagePreview = () => {
    setImagePreview(null)
  }

  const handleImagePreviewBackgroundClick = (e) => {
    // Solo cerrar si se hace click en el fondo, no en la imagen o el botón
    if (e.target === e.currentTarget) {
      closeImagePreview()
    }
  }

  const renderCompletarEspacios = (pregunta) => {
    if (!pregunta.completarTexto) return null

    // Reemplazar los corchetes con spans para las palabras
    const parts = []
    let lastIndex = 0
    let wordIndex = 0
    const regex = /\[\s*\]/g
    let match

    while ((match = regex.exec(pregunta.completarTexto)) !== null) {
      // Texto antes del corchete
      if (match.index > lastIndex) {
        parts.push(pregunta.completarTexto.substring(lastIndex, match.index))
      }

      // Palabra para completar
      const palabra = pregunta.palabrasCompletar[wordIndex] || ""
      parts.push(
        <span key={wordIndex} className="inline-block px-2 py-1 mx-1 bg-gray-100 rounded border border-gray-300">
          {palabra}
        </span>,
      )

      wordIndex++
      lastIndex = match.index + match[0].length
    }

    // Texto restante después del último corchete
    if (lastIndex < pregunta.completarTexto.length) {
      parts.push(pregunta.completarTexto.substring(lastIndex))
    }

    return <div className="mt-2">{parts}</div>
  }

  if (!isOpen || !evaluation) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-8">
        <div ref={modalRef} className="bg-white rounded-lg p-4 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-[18px] font-bold text-center mb-4">{evaluation.nombre}</h2>

            {/* Temática */}
            <div className="text-center mb-4">
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-[14px] font-medium">
                Temática: {evaluation.tematica || "No especificada"}
              </span>
            </div>

            {/* Descripción General */}
            <div className="border border-gray-300 rounded-lg p-3 mb-3">
              <h3 className="text-[16px] font-bold mb-2">Descripción General</h3>
              <p className="text-[14px] text-gray-700">{evaluation.descripcion || "Sin descripción"}</p>
            </div>

            {/* Material */}
            {evaluation.material && (
              <div className="border border-gray-300 rounded-lg p-3 mb-3">
                <h3 className="text-[16px] font-bold mb-2">Material</h3>
                <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded p-2">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="text-[14px]">
                      {typeof evaluation.material === "string"
                        ? evaluation.material.split("/").pop() || "Material adjunto"
                        : evaluation.material.name || "Material adjunto"}
                    </span>
                  </div>
                  <button
                    className={`text-gray-600 hover:text-gray-800 transition-colors ${downloadingMaterial ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => handleDownload(evaluation.material, "material")}
                    disabled={downloadingMaterial}
                    title={downloadingMaterial ? "Descargando..." : "Descargar material"}
                  >
                    {downloadingMaterial ? (
                      <div className="animate-spin w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full"></div>
                    ) : (
                      <FiDownload size={20} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Preguntas */}
            <div className="border border-gray-300 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-[16px] font-bold">Preguntas</h3>
                <button
                  onClick={toggleAllQuestions}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  {allExpanded ? (
                    <>
                      <FiChevronUp size={16} />
                      Contraer todas
                    </>
                  ) : (
                    <>
                      <FiChevronDown size={16} />
                      Expandir todas
                    </>
                  )}
                </button>
              </div>
              <p className="text-[14px] text-gray-500 mb-4">Total preguntas: {evaluation.preguntas.length}</p>

              <div className="space-y-3">
                {evaluation.preguntas.map((pregunta, index) => {
                  const isExpanded = expandedQuestions.has(index)
                  return (
                    <div key={pregunta.id || index} className="border border-gray-300 rounded-lg overflow-hidden">
                      {/* Header de la pregunta - clickeable para expandir/contraer */}
                      <button
                        onClick={() => toggleQuestion(index)}
                        className="w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 flex justify-between items-center text-left transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-[14px] font-bold">
                              {pregunta.tipo === "seleccion" && "Selección múltiple"}
                              {pregunta.tipo === "verdaderoFalso" && "Verdadero o falso"}
                              {pregunta.tipo === "imagen" && "Pregunta con imagen"}
                              {pregunta.tipo === "audio" && "Pregunta con audio"}
                              {pregunta.tipo === "completar" && "Completar espacios"}
                              {" | pregunta "}
                              {index + 1}
                            </h4>
                            <span className="text-[14px] font-medium ml-2">Puntos: {pregunta.puntaje}</span>
                          </div>
                          {pregunta.texto && (
                            <p className="text-[12px] text-gray-600 mt-1 truncate">
                              {pregunta.texto.length > 60 ? `${pregunta.texto.substring(0, 60)}...` : pregunta.texto}
                            </p>
                          )}
                        </div>
                        {isExpanded ? (
                          <FiChevronUp className="w-5 h-5 text-gray-500 ml-2" />
                        ) : (
                          <FiChevronDown className="w-5 h-5 text-gray-500 ml-2" />
                        )}
                      </button>

                      {/* Contenido expandible */}
                      {isExpanded && (
                        <div className="p-3 bg-white border-t border-gray-200">
                          {/* Enunciado */}
                          <div className="mb-2">
                            <p className="text-[14px] text-gray-500">Enunciado</p>
                            <p className="text-[14px]">
                              {pregunta.texto || pregunta.completarTexto || "Sin enunciado"}
                            </p>
                          </div>

                          {/* Imagen (si aplica) */}
                          {pregunta.tipo === "imagen" && pregunta.imagen && (
                            <div className="mb-4">
                              <p className="text-[14px] text-gray-500 mb-1">Imagen</p>
                              <div className="border border-gray-300 rounded-lg p-2">
                                <div className="flex justify-center mb-2">
                                  <img
                                    src={getFullUrl(pregunta.imagen) || "/placeholder.svg"}
                                    alt="Imagen de la pregunta"
                                    className="max-h-48 object-contain"
                                    onError={(e) => {
                                      console.error("Error cargando imagen:", e)
                                      e.target.onerror = null
                                      e.target.src = "/placeholder.svg?height=200&width=200"
                                    }}
                                  />
                                </div>
                                <div className="flex justify-center">
                                  <button
                                    onClick={() => handleImagePreview(pregunta.imagen)}
                                    className="flex items-center px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-[12px]"
                                  >
                                    <FiEye className="mr-1" size={14} />
                                    Ver imagen completa
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Audio (si aplica) */}
                          {pregunta.tipo === "audio" && pregunta.audio && (
                            <div className="mb-4">
                              <p className="text-[14px] text-gray-500 mb-1">Audio</p>
                              <div className="border border-gray-300 rounded-lg p-2 flex items-center">
                                <button
                                  onClick={() => handlePlayAudio(pregunta.id || index)}
                                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 mr-2 flex-shrink-0"
                                >
                                  {audioPlaying === (pregunta.id || index) ? (
                                    <FiPause size={18} />
                                  ) : (
                                    <FiPlay size={18} />
                                  )}
                                </button>

                                <div
                                  className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
                                  onClick={(e) => handleProgressClick(e, pregunta.id || index)}
                                >
                                  <div
                                    className={`h-full bg-gray-400 ${audioPlaying === (pregunta.id || index) ? "transition-all duration-100" : ""}`}
                                    style={{ width: `${audioProgress[pregunta.id || index] || 0}%` }}
                                  ></div>
                                </div>

                                <audio
                                  ref={(el) => {
                                    if (el) audioRefs.current[pregunta.id || index] = el
                                  }}
                                  src={getFullUrl(pregunta.audio)}
                                  onEnded={() => handleAudioEnded(pregunta.id || index)}
                                  className="hidden"
                                >
                                  Tu navegador no soporta el elemento de audio.
                                </audio>

                                <button
                                  className="p-2 ml-2 flex-shrink-0 text-gray-600 hover:text-gray-800"
                                  onClick={(e) => toggleMute(e, pregunta.id || index)}
                                >
                                  {audioMuted[pregunta.id || index] ? <FiVolumeX size={18} /> : <FiVolume2 size={18} />}
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Opciones para preguntas de selección múltiple, verdadero/falso, imagen y audio */}
                          {(pregunta.tipo === "seleccion" ||
                            pregunta.tipo === "imagen" ||
                            pregunta.tipo === "audio") && (
                            <div>
                              <p className="text-[14px] text-gray-500 mb-1">Opciones</p>
                              <div className="space-y-2">
                                {pregunta.opciones &&
                                  pregunta.opciones.map((opcion, idx) => (
                                    <div key={idx} className="flex items-center">
                                      <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${idx === pregunta.respuestaCorrecta ? "bg-black border-black" : "border-gray-400"}`}
                                      >
                                        {idx === pregunta.respuestaCorrecta && (
                                          <div className="w-2 h-2 rounded-full bg-white"></div>
                                        )}
                                      </div>
                                      <span className="text-[14px]">{opcion}</span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Opciones para verdadero/falso */}
                          {pregunta.tipo === "verdaderoFalso" && (
                            <div>
                              <p className="text-[14px] text-gray-500 mb-1">Opciones</p>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${pregunta.respuestaCorrecta === 0 ? "bg-black border-black" : "border-gray-400"}`}
                                  >
                                    {pregunta.respuestaCorrecta === 0 && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                  <span className="text-[14px]">Verdadero</span>
                                </div>
                                <div className="flex items-center">
                                  <div
                                    className={`w-4 h-4 rounded-full border flex items-center justify-center mr-2 ${pregunta.respuestaCorrecta === 1 ? "bg-black border-black" : "border-gray-400"}`}
                                  >
                                    {pregunta.respuestaCorrecta === 1 && (
                                      <div className="w-2 h-2 rounded-full bg-white"></div>
                                    )}
                                  </div>
                                  <span className="text-[14px]">Falso</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Completar espacios */}
                          {pregunta.tipo === "completar" && (
                            <>
                              {renderCompletarEspacios(pregunta)}

                              {pregunta.palabrasCompletar && pregunta.palabrasCompletar.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-[14px] text-gray-500 mb-1">Palabras a completar</p>
                                  <div className="flex flex-wrap gap-2">
                                    {pregunta.palabrasCompletar.map((palabra, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-block px-3 py-1 bg-gray-100 rounded border border-gray-300 text-[14px]"
                                      >
                                        {palabra}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Opciones de relleno */}
                              {pregunta.opcionesRelleno && pregunta.opcionesRelleno.length > 0 && (
                                <div className="mt-3">
                                  <p className="text-[14px] text-gray-500 mb-1">Opciones de relleno</p>
                                  <div className="flex flex-wrap gap-2">
                                    {pregunta.opcionesRelleno.map(
                                      (opcion, idx) =>
                                        opcion && (
                                          <span
                                            key={idx}
                                            className="inline-block px-3 py-1 bg-blue-50 rounded border border-blue-200 text-[14px]"
                                          >
                                            {opcion}
                                          </span>
                                        ),
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-center mt-4">
              <button
                onClick={onClose}
                className="px-8 py-2 bg-[#f44144] text-white rounded-md text-[14px] hover:bg-red-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de previsualización de imagen */}
      {imagePreview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4"
          onClick={handleImagePreviewBackgroundClick}
        >
          <div
            ref={imagePreviewRef}
            className="relative w-full h-full flex items-center justify-center max-w-[90vw] max-h-[90vh]"
          >
            <button
              onClick={closeImagePreview}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold z-10 bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Vista previa de imagen"
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                console.error("Error cargando imagen en preview:", e)
                e.target.onerror = null
                e.target.src = "/placeholder.svg?height=400&width=400"
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default EvaluationDetailModal
