"use client"

import React from "react"
import { useState, useEffect, useRef } from "react"
import { ArrowLeft, CheckCircle, ChevronLeft, ChevronRight, X } from "lucide-react"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"
import { useNavigate } from "react-router-dom"

const ExamModal = ({ isOpen, onClose, exam }) => {
  const navigate = useNavigate()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [showExitConfirmation, setShowExitConfirmation] = useState(false)
  const [completionAnswers, setCompletionAnswers] = useState([])
  const [nextBlankIndex, setNextBlankIndex] = useState(0)
  const audioRef = useRef(null)
  const [audioProgress, setAudioProgress] = useState(0)

  // Inicializar respuestas del usuario
  useEffect(() => {
    if (exam && exam.questions) {
      setUserAnswers(new Array(exam.questions.length).fill(null))
      setCurrentQuestionIndex(0)
      setShowResults(false)
    }
  }, [exam])

  // Inicializar respuestas de completar cuando cambia la pregunta
  useEffect(() => {
    if (exam && exam.questions && exam.questions[currentQuestionIndex]?.type === "completion") {
      const question = exam.questions[currentQuestionIndex]
      setCompletionAnswers(new Array(question.wordsToComplete.length).fill(""))
      setNextBlankIndex(0)
    }
  }, [currentQuestionIndex, exam])

  // Actualizar progreso del audio
  useEffect(() => {
    if (audioRef.current) {
      const updateProgress = () => {
        if (audioRef.current && audioRef.current.duration) {
          setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100)
        }
      }

      const audioElement = audioRef.current
      audioElement.addEventListener("timeupdate", updateProgress)

      return () => {
        audioElement.removeEventListener("timeupdate", updateProgress)
      }
    }
  }, [currentQuestionIndex])

  if (!isOpen || !exam) return null

  const currentQuestion = exam.questions[currentQuestionIndex]

  const handleAnswerSelection = (answerIndex) => {
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = answerIndex
    setUserAnswers(newAnswers)
  }

  const handleCompletionWordClick = (word) => {
    if (nextBlankIndex >= currentQuestion.wordsToComplete.length) return

    const newCompletionAnswers = [...completionAnswers]
    newCompletionAnswers[nextBlankIndex] = word
    setCompletionAnswers(newCompletionAnswers)
    setNextBlankIndex(nextBlankIndex + 1)

    // Actualizar las respuestas del usuario
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = newCompletionAnswers
    setUserAnswers(newAnswers)
  }

  const handleRemoveCompletionWord = (index) => {
    const newCompletionAnswers = [...completionAnswers]

    // Eliminar la palabra en el índice especificado
    newCompletionAnswers[index] = ""

    // Ajustar el nextBlankIndex si es necesario
    if (index < nextBlankIndex) {
      setNextBlankIndex(index)
    }

    setCompletionAnswers(newCompletionAnswers)

    // Actualizar las respuestas del usuario
    const newAnswers = [...userAnswers]
    newAnswers[currentQuestionIndex] = newCompletionAnswers
    setUserAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      finishExam()
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const finishExam = () => {
    setShowResults(true)
  }

  const calculateScore = () => {
    let totalScore = 0
    let maxScore = 0

    exam.questions.forEach((question, index) => {
      maxScore += question.points

      if (userAnswers[index] === null) return

      if (question.type === "completion") {
        const userCompletionAnswers = userAnswers[index] || []
        let allCorrect = true

        question.wordsToComplete.forEach((word, wordIndex) => {
          if (userCompletionAnswers[wordIndex]?.toLowerCase() !== word.toLowerCase()) {
            allCorrect = false
          }
        })

        if (allCorrect) totalScore += question.points
      } else {
        if (userAnswers[index] === question.correctAnswer) {
          totalScore += question.points
        }
      }
    })

    return { totalScore, maxScore }
  }

  const handleCloseExam = () => {
    setShowExitConfirmation(true)
  }

  const confirmExit = () => {
    setShowExitConfirmation(false)
    onClose()
  }

  const handleFinishReview = () => {
    onClose()
  }

  const handleGoToFeedback = () => {
    onClose()
    // Create an activity object with exam data to pass to the Feedback page
    const { totalScore, maxScore } = calculateScore()
    const scorePercentage = Math.round((totalScore / maxScore) * 100)
    const passed = scorePercentage >= 70

    const activity = {
      id: exam.id.toString(),
      name: exam.title,
      type: exam.type === "exam" ? "Examen" : "Actividad",
      score: scorePercentage,
      completed: true,
      feedback: passed
        ? "¡Excelente trabajo! Has completado esta evaluación satisfactoriamente."
        : "Necesitas mejorar en algunos aspectos. Revisa las preguntas incorrectas.",
      questions: exam.questions.map((question, index) => ({
        id: question.id.toString(),
        text: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer,
        userAnswer: userAnswers[index],
        score: userAnswers[index] === question.correctAnswer ? question.points : 0,
        maxScore: question.points,
        feedback:
          userAnswers[index] === question.correctAnswer
            ? "¡Correcto! Bien hecho."
            : "Incorrecto. La respuesta correcta es: " + question.options[question.correctAnswer],
      })),
    }

    // Navegar a la página de retroalimentación con los datos del examen
    navigate("/apprentice/feedback", { state: { openActivity: activity } })
  }

  const handleAudioProgressClick = (e) => {
    if (!audioRef.current) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width

    audioRef.current.currentTime = percentage * audioRef.current.duration
  }

  const toggleAudioPlay = () => {
    if (!audioRef.current) return

    if (audioRef.current.paused) {
      audioRef.current.play().catch((e) => console.error("Error playing audio:", e))
    } else {
      audioRef.current.pause()
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return

    audioRef.current.muted = !audioRef.current.muted
    // Forzar actualización
    setUserAnswers([...userAnswers])
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    return (
      <div className="border rounded-lg p-6 relative">
        <div className="absolute top-6 right-6 font-bold text-xl text-[#1f384c]">{currentQuestion.points} Puntos</div>

        <div className="mt-2">
          {(() => {
            switch (currentQuestion.type) {
              case "multiple-choice":
                return (
                  <div className="space-y-4">
                    <h3 className="font-medium text-[#1f384c] pr-24">{currentQuestion.text}</h3>
                    <div className="space-y-2">
                      <h4 className="text-gray-500 font-medium mb-2">Opciones</h4>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 cursor-pointer ${
                              userAnswers[currentQuestionIndex] === index
                                ? "border-[#1f384c] bg-[#1f384c]"
                                : "border-gray-300"
                            }`}
                            onClick={() => handleAnswerSelection(index)}
                          >
                            {userAnswers[currentQuestionIndex] === index && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <label
                            htmlFor={`option-${index}`}
                            className="text-gray-700 cursor-pointer"
                            onClick={() => handleAnswerSelection(index)}
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )

              case "true-false":
                return (
                  <div className="space-y-4">
                    <h3 className="font-medium text-[#1f384c] pr-24">{currentQuestion.text}</h3>
                    <div className="space-y-2">
                      <h4 className="text-gray-500 font-medium mb-2">Opciones</h4>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 cursor-pointer ${
                              userAnswers[currentQuestionIndex] === index
                                ? "border-[#1f384c] bg-[#1f384c]"
                                : "border-gray-300"
                            }`}
                            onClick={() => handleAnswerSelection(index)}
                          >
                            {userAnswers[currentQuestionIndex] === index && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <label
                            htmlFor={`option-${index}`}
                            className="text-gray-700 cursor-pointer"
                            onClick={() => handleAnswerSelection(index)}
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )

              case "image":
                return (
                  <div className="space-y-4">
                    <h3 className="font-medium text-[#1f384c] pr-24">{currentQuestion.text}</h3>
                    <div className="flex justify-center mb-4">
                      <img
                        src={currentQuestion.imageUrl || "/placeholder.svg?height=200&width=200"}
                        alt="Question"
                        className="max-w-full h-auto border rounded-md"
                        style={{ maxHeight: "200px" }}
                      />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-gray-500 font-medium mb-2">Opciones</h4>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 cursor-pointer ${
                              userAnswers[currentQuestionIndex] === index
                                ? "border-[#1f384c] bg-[#1f384c]"
                                : "border-gray-300"
                            }`}
                            onClick={() => handleAnswerSelection(index)}
                          >
                            {userAnswers[currentQuestionIndex] === index && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <label
                            htmlFor={`option-${index}`}
                            className="text-gray-700 cursor-pointer"
                            onClick={() => handleAnswerSelection(index)}
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )

              case "audio":
                return (
                  <div className="space-y-4">
                    <h3 className="font-medium text-[#1f384c] pr-24">{currentQuestion.text}</h3>
                    <div className="flex justify-center mb-6">
                      <div className="w-full">
                        <div className="flex items-center space-x-2 mb-4">
                          <button
                            onClick={toggleAudioPlay}
                            className="flex items-center justify-center w-12 h-12 text-[#1f384c]"
                          >
                            {audioRef.current && !audioRef.current.paused ? (
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M10 9H6V15H10V9Z" fill="currentColor" />
                                <path d="M18 9H14V15H18V9Z" fill="currentColor" />
                              </svg>
                            ) : (
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M8 5.14V19.14L19 12.14L8 5.14Z" fill="currentColor" />
                              </svg>
                            )}
                          </button>

                          <div
                            className="relative flex-1 h-2 bg-[#e8def8] rounded-full overflow-hidden cursor-pointer"
                            onClick={handleAudioProgressClick}
                          >
                            <div
                              className="absolute top-0 left-0 h-full bg-[#65558f] transition-all duration-100"
                              style={{ width: `${audioProgress}%` }}
                            ></div>
                            <div
                              className="absolute top-0 right-0 h-4 w-4 bg-[#65558f] rounded-full -mt-1 transform translate-x-1/2"
                              style={{
                                left: `${audioProgress}%`,
                                transform: "translateX(-50%)",
                                marginTop: "-3px",
                              }}
                            ></div>
                          </div>

                          <button
                            onClick={toggleMute}
                            className="flex items-center justify-center w-10 h-10 text-[#1f384c]"
                          >
                            {audioRef.current && audioRef.current.muted ? (
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M16 9.50001C16.5 10.2 16.5 11 16.5 12C16.5 13 16.5 13.8 16 14.5M19 7C20.5 8.5 20.5 11 20.5 12C20.5 13 20.5 15.5 19 17M4.34375 11H2.5C2.22386 11 2 11.2239 2 11.5V12.5C2 12.7761 2.22386 13 2.5 13H4.34378L8.59584 16.5689C9.16382 17.0644 10 16.6566 10 15.9082V8.09179C10 7.34336 9.16382 6.93558 8.59584 7.43105L4.34375 11Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M22 2L2 22"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M16 9.50001C16.5 10.2 16.5 11 16.5 12C16.5 13 16.5 13.8 16 14.5M19 7C20.5 8.5 20.5 11 20.5 12C20.5 13 20.5 15.5 19 17M4.34375 11H2.5C2.22386 11 2 11.2239 2 11.5V12.5C2 12.7761 2.22386 13 2.5 13H4.34378L8.59584 16.5689C9.16382 17.0644 10 16.6566 10 15.9082V8.09179C10 7.34336 9.16382 6.93558 8.59584 7.43105L4.34375 11Z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                        </div>
                        <audio ref={audioRef} src={currentQuestion.audioUrl} className="hidden" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-gray-500 font-medium mb-2">Opciones</h4>
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 cursor-pointer ${
                              userAnswers[currentQuestionIndex] === index
                                ? "border-[#1f384c] bg-[#1f384c]"
                                : "border-gray-300"
                            }`}
                            onClick={() => handleAnswerSelection(index)}
                          >
                            {userAnswers[currentQuestionIndex] === index && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                          <label
                            htmlFor={`option-${index}`}
                            className="text-gray-700 cursor-pointer"
                            onClick={() => handleAnswerSelection(index)}
                          >
                            {option}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )

              case "completion":
                const textParts = currentQuestion.text.split("[]")
                return (
                  <div className="space-y-4">
                    <h3 className="font-medium text-[#1f384c] pr-24">{currentQuestion.title || "Completa la frase"}</h3>

                    {/* Frase con espacios para completar */}
                    <div className="flex flex-wrap items-center text-lg mb-6">
                      {textParts.map((part, index) => (
                        <React.Fragment key={index}>
                          <span>{part}</span>
                          {index < textParts.length - 1 && (
                            <div
                              className={`mx-1 min-w-[100px] h-10 border-2 rounded-md flex items-center justify-center ${
                                completionAnswers[index] ? "border-[#1f384c] bg-gray-100" : "border-gray-300"
                              }`}
                              onClick={() => completionAnswers[index] && handleRemoveCompletionWord(index)}
                            >
                              {completionAnswers[index] ? (
                                <span className="font-medium">{completionAnswers[index]}</span>
                              ) : null}
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Opciones de palabras */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Opciones</h4>
                      <div className="flex flex-wrap gap-2">
                        {currentQuestion.options.map((word, index) => (
                          <button
                            key={index}
                            className={`px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors ${
                              completionAnswers.includes(word) ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            onClick={() => handleCompletionWordClick(word)}
                            disabled={
                              completionAnswers.includes(word) ||
                              nextBlankIndex >= currentQuestion.wordsToComplete.length
                            }
                          >
                            {word}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )

              default:
                return <p>Tipo de pregunta no soportado</p>
            }
          })()}
        </div>
      </div>
    )
  }

  const renderResults = () => {
    const { totalScore, maxScore } = calculateScore()
    const passed = totalScore >= maxScore * 0.7 // 70% para aprobar

    return (
      <div className="p-6 max-w-md mx-auto">
        <h2 className="text-xl font-bold text-center mb-6">Resultados</h2>

        {exam.questions.map((question, index) => {
          let isCorrect = false

          if (question.type === "completion") {
            const userCompletionAnswers = userAnswers[index] || []
            isCorrect = question.wordsToComplete.every(
              (word, i) => userCompletionAnswers[i]?.toLowerCase() === word.toLowerCase(),
            )
          } else {
            isCorrect = userAnswers[index] === question.correctAnswer
          }

          return (
            <div key={index} className="mb-2 flex items-center">
              <span className="mr-2">
                Pregunta {index + 1}: {question.points} puntos
              </span>
              {isCorrect ? (
                <CheckCircle size={18} className="text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-600" />
              )}
            </div>
          )
        })}

        <div className="mt-4 pt-4 border-t">
          <div className="text-center font-bold">
            Total: {totalScore}/{maxScore}
          </div>

          <div className="mt-2 text-center">
            {passed ? (
              <div className="text-green-600 font-medium">¡Has aprobado!</div>
            ) : (
              <div className="text-red-600 font-medium">Has perdido</div>
            )}
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <span className="cursor-pointer hover:underline" onClick={handleGoToFeedback}>
              Aquí puedes ver con detalle tus respuestas
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleFinishReview}
            className="px-4 py-2 bg-[#1f384c] text-white rounded-md hover:bg-[#162a3a] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-4">
          <button
            onClick={handleCloseExam}
            className="flex items-center text-[#1f384c] font-medium hover:text-gray-700 transition-colors w-fit"
          >
            <ArrowLeft className="mr-2" size={20} />
            Abandonar
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {showResults ? (
            renderResults()
          ) : (
            <>
              <h2 className="text-xl font-bold text-[#1f384c] mb-4">
                Pregunta {currentQuestionIndex + 1} de {exam.questions.length}
              </h2>

              <div className="mb-6">{renderQuestion()}</div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className={`flex items-center px-6 py-2 rounded-md text-sm ${
                    currentQuestionIndex === 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "border border-gray-300 text-[#1f384c] hover:bg-gray-100"
                  }`}
                >
                  <ChevronLeft size={16} className="mr-1" />
                  Anterior
                </button>

                <button
                  onClick={handleNext}
                  className="flex items-center px-6 py-2 bg-[#1f384c] text-white rounded-md hover:bg-[#162a3a] transition-colors text-sm"
                >
                  {currentQuestionIndex < exam.questions.length - 1 ? (
                    <>
                      Siguiente
                      <ChevronRight size={16} className="ml-1" />
                    </>
                  ) : (
                    "Terminar"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Modal for Exit */}
      <ConfirmationModal
        isOpen={showExitConfirmation}
        onClose={() => setShowExitConfirmation(false)}
        onConfirm={confirmExit}
        title="¿Estás seguro de que deseas abandonar?"
        message="Si abandonas ahora, perderás tu progreso en esta evaluación."
        confirmText="Confirmar"
        confirmColor="bg-[#46ae69] hover:bg-green-600"
      />
    </div>
  )
}

export default ExamModal