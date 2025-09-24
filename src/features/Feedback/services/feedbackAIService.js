// Servicio especializado para retroalimentación con IA
import saraApiService from './saraApiService.js'

// Función principal para generar retroalimentación completa de un estudiante
export const generateStudentFeedback = async (studentData) => {
  console.log("🤖 Generando retroalimentación para estudiante:", studentData.nombre)
  
  try {
    const feedback = {
      studentId: studentData._id,
      studentName: `${studentData.nombre} ${studentData.apellido}`,
      programa: studentData.programa,
      overallPerformance: calculateOverallPerformance(studentData),
      examsFeedback: [],
      activitiesFeedback: [],
      recommendations: [],
      strengths: [],
      weaknesses: [],
      generatedAt: new Date()
    }

    // Analizar exámenes
    if (studentData.examenes && studentData.examenes.length > 0) {
      console.log("📝 Analizando", studentData.examenes.length, "exámenes")
      for (const exam of studentData.examenes) {
        const examFeedback = await analyzeExam(exam)
        feedback.examsFeedback.push(examFeedback)
      }
    }

    // Analizar actividades
    if (studentData.actividades && studentData.actividades.length > 0) {
      console.log("📚 Analizando", studentData.actividades.length, "actividades")
      for (const activity of studentData.actividades) {
        const activityFeedback = await analyzeActivity(activity)
        feedback.activitiesFeedback.push(activityFeedback)
      }
    }

    // Generar recomendaciones generales usando IA
    feedback.recommendations = await generateRecommendations(feedback)
    feedback.strengths = identifyStrengths(feedback)
    feedback.weaknesses = identifyWeaknesses(feedback)

    console.log("✅ Retroalimentación generada exitosamente")
    return feedback

  } catch (error) {
    console.error("🚨 Error generando retroalimentación:", error)
    return generateFallbackFeedback(studentData)
  }
}

// Función para analizar un examen específico
const analyzeExam = async (exam) => {
  console.log("🔍 Analizando examen:", exam.nombre)
  
  const examFeedback = {
    examId: exam._id,
    examName: exam.nombre,
    score: exam.calificacion,
    date: exam.fecha,
    status: exam.estado,
    failedQuestions: [],
    passedQuestions: [],
    aiAnalysis: null,
    recommendations: []
  }

  // Analizar preguntas si están disponibles
  if (exam.preguntas && exam.preguntas.length > 0) {
    for (const pregunta of exam.preguntas) {
      if (pregunta.esCorrecta) {
        examFeedback.passedQuestions.push({
          question: pregunta.pregunta,
          studentAnswer: pregunta.respuestaEstudiante,
          correctAnswer: pregunta.respuestaCorrecta,
          explanation: await generateExplanationForQuestion(pregunta, true)
        })
      } else {
        examFeedback.failedQuestions.push({
          question: pregunta.pregunta,
          studentAnswer: pregunta.respuestaEstudiante,
          correctAnswer: pregunta.respuestaCorrecta,
          explanation: await generateExplanationForQuestion(pregunta, false)
        })
      }
    }

    // Si hay preguntas fallidas, usar IA para análisis más profundo
    if (examFeedback.failedQuestions.length > 0) {
      try {
        examFeedback.aiAnalysis = await getAIAnalysisForFailedQuestions(examFeedback.failedQuestions, exam.nombre)
        examFeedback.recommendations = await getAIRecommendationsForExam(exam)
      } catch (error) {
        console.warn("⚠️ No se pudo obtener análisis de IA para examen:", error.message)
        examFeedback.aiAnalysis = generateFallbackAnalysis(examFeedback.failedQuestions)
      }
    }
  }

  return examFeedback
}

// Función para analizar una actividad específica
const analyzeActivity = async (activity) => {
  console.log("🔍 Analizando actividad:", activity.nombre)
  
  const activityFeedback = {
    activityId: activity._id,
    activityName: activity.nombre,
    score: activity.calificacion,
    date: activity.fecha,
    status: activity.estado,
    existingFeedback: activity.retroalimentacion,
    aiEnhancedFeedback: null,
    recommendations: []
  }

  // Usar IA para mejorar la retroalimentación existente
  try {
    if (activity.retroalimentacion) {
      activityFeedback.aiEnhancedFeedback = await enhanceFeedbackWithAI(activity)
      activityFeedback.recommendations = await getAIRecommendationsForActivity(activity)
    }
  } catch (error) {
    console.warn("⚠️ No se pudo mejorar retroalimentación con IA:", error.message)
    activityFeedback.aiEnhancedFeedback = activity.retroalimentacion
  }

  return activityFeedback
}

// Función para generar explicación individual para una pregunta usando IA
const generateExplanationForQuestion = async (pregunta, esCorrecta) => {
  try {
    const prompt = esCorrecta 
      ? `Explica brevemente por qué la respuesta "${pregunta.respuestaCorrecta}" es correcta para la pregunta: "${pregunta.pregunta}". Proporciona una explicación educativa y motivadora en máximo 2 oraciones.`
      : `El estudiante respondió "${pregunta.respuestaEstudiante}" a la pregunta: "${pregunta.pregunta}". La respuesta correcta es "${pregunta.respuestaCorrecta}". Explica por qué la respuesta del estudiante es incorrecta y por qué la respuesta correcta es la adecuada. Sé constructivo y educativo en máximo 3 oraciones.`

    const response = await saraApiService.askSara({
      message: prompt,
      context: "question_explanation"
    })

    if (response && response.response) {
      return response.response.trim()
    }

    // Fallback si no hay respuesta de IA
    return esCorrecta 
      ? `¡Correcto! La respuesta "${pregunta.respuestaCorrecta}" es la adecuada.`
      : `La respuesta correcta es "${pregunta.respuestaCorrecta}". Te recomendamos revisar este concepto.`

  } catch (error) {
    console.error("Error generando explicación para pregunta:", error)
    // Fallback en caso de error
    return esCorrecta 
      ? `¡Correcto! La respuesta "${pregunta.respuestaCorrecta}" es la adecuada.`
      : `La respuesta correcta es "${pregunta.respuestaCorrecta}". Te recomendamos revisar este concepto.`
  }
}

// Función para obtener análisis de IA para preguntas fallidas
const getAIAnalysisForFailedQuestions = async (failedQuestions, examName) => {
  try {
    const questionsText = failedQuestions.map(q => 
      `Pregunta: ${q.question}\nRespuesta del estudiante: ${q.studentAnswer}\nRespuesta correcta: ${q.correctAnswer}`
    ).join('\n\n')

    const prompt = `Como experto en educación, analiza las siguientes preguntas fallidas del examen "${examName}":

${questionsText}

Proporciona un análisis detallado que incluya:
1. Patrones de error identificados
2. Conceptos que el estudiante no comprende bien
3. Sugerencias específicas para mejorar
4. Recursos de estudio recomendados

Responde en formato JSON con las siguientes claves: patterns, misunderstoodConcepts, suggestions, resources`

    const response = await saraApiService.askSara({
      message: prompt,
      context: "educational_analysis"
    })

    if (response && response.response) {
      try {
        // Intentar parsear como JSON
        return JSON.parse(response.response)
      } catch {
        // Si no es JSON válido, devolver como texto estructurado
        return {
          analysis: response.response,
          patterns: ["Análisis detallado disponible en el campo 'analysis'"],
          misunderstoodConcepts: [],
          suggestions: [],
          resources: []
        }
      }
    }

    return generateFallbackAnalysis(failedQuestions)
  } catch (error) {
    console.error("Error obteniendo análisis de IA:", error)
    return generateFallbackAnalysis(failedQuestions)
  }
}

// Función para obtener recomendaciones de IA para un examen
const getAIRecommendationsForExam = async (exam) => {
  try {
    const prompt = `Basándote en el examen "${exam.nombre}" con calificación ${exam.calificacion}/5.0, genera 3-5 recomendaciones específicas para que el estudiante mejore su rendimiento. Las recomendaciones deben ser prácticas y accionables.`

    const response = await saraApiService.askSara({
      message: prompt,
      context: "educational_recommendations"
    })

    if (response && response.response) {
      // Dividir la respuesta en recomendaciones individuales
      const recommendations = response.response
        .split(/\d+\.|\n-|\n\*/)
        .filter(rec => rec.trim().length > 10)
        .map(rec => rec.trim())
        .slice(0, 5)

      return recommendations.length > 0 ? recommendations : getDefaultRecommendations(exam.calificacion)
    }

    return getDefaultRecommendations(exam.calificacion)
  } catch (error) {
    console.error("Error obteniendo recomendaciones de IA:", error)
    return getDefaultRecommendations(exam.calificacion)
  }
}

// Función para mejorar retroalimentación de actividades con IA
const enhanceFeedbackWithAI = async (activity) => {
  try {
    const prompt = `Mejora la siguiente retroalimentación para la actividad "${activity.nombre}" (calificación: ${activity.calificacion}/5.0):

Retroalimentación original: "${activity.retroalimentacion}"

Proporciona una versión mejorada que sea más específica, constructiva y motivadora para el estudiante.`

    const response = await saraApiService.askSara({
      question: prompt,
      context: "feedback_enhancement",
      user_type: "instructor"
    })

    return response && response.response ? response.response : activity.retroalimentacion
  } catch (error) {
    console.error("Error mejorando retroalimentación:", error)
    return activity.retroalimentacion
  }
}

// Función para obtener recomendaciones de IA para actividades
const getAIRecommendationsForActivity = async (activity) => {
  try {
    const prompt = `Para la actividad "${activity.nombre}" con calificación ${activity.calificacion}/5.0, genera 2-3 recomendaciones específicas para mejorar el aprendizaje del estudiante.`

    const response = await saraApiService.askSara({
      question: prompt,
      context: "activity_recommendations",
      user_type: "instructor"
    })

    if (response && response.response) {
      const recommendations = response.response
        .split(/\d+\.|\n-|\n\*/)
        .filter(rec => rec.trim().length > 10)
        .map(rec => rec.trim())
        .slice(0, 3)

      return recommendations.length > 0 ? recommendations : getDefaultActivityRecommendations(activity.calificacion)
    }

    return getDefaultActivityRecommendations(activity.calificacion)
  } catch (error) {
    console.error("Error obteniendo recomendaciones de actividad:", error)
    return getDefaultActivityRecommendations(activity.calificacion)
  }
}

// Función para generar recomendaciones generales usando IA
const generateRecommendations = async (feedback) => {
  try {
    const overallScore = feedback.overallPerformance.averageScore
    const totalExams = feedback.examsFeedback.length
    const totalActivities = feedback.activitiesFeedback.length
    
    const prompt = `Basándote en el rendimiento general de un estudiante de ${feedback.programa}:
- Promedio general: ${overallScore}/5.0
- Exámenes completados: ${totalExams}
- Actividades completadas: ${totalActivities}
- Nombre: ${feedback.studentName}

Genera 4-6 recomendaciones personalizadas para mejorar su aprendizaje y rendimiento académico.`

    const response = await saraApiService.askSara({
      message: prompt,
      context: "general_recommendations"
    })

    if (response && response.response) {
      const recommendations = response.response
        .split(/\d+\.|\n-|\n\*/)
        .filter(rec => rec.trim().length > 15)
        .map(rec => rec.trim())
        .slice(0, 6)

      return recommendations.length > 0 ? recommendations : getDefaultGeneralRecommendations(overallScore)
    }

    return getDefaultGeneralRecommendations(overallScore)
  } catch (error) {
    console.error("Error generando recomendaciones generales:", error)
    return getDefaultGeneralRecommendations(feedback.overallPerformance.averageScore)
  }
}

// Funciones auxiliares
const calculateOverallPerformance = (studentData) => {
  const scores = []
  
  if (studentData.examenes) {
    scores.push(...studentData.examenes.map(e => e.calificacion))
  }
  
  if (studentData.actividades) {
    scores.push(...studentData.actividades.map(a => a.calificacion))
  }

  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
  const totalAssessments = scores.length
  
  let performanceLevel = 'Bajo'
  if (averageScore >= 4.0) performanceLevel = 'Excelente'
  else if (averageScore >= 3.5) performanceLevel = 'Bueno'
  else if (averageScore >= 3.0) performanceLevel = 'Regular'

  return {
    averageScore: Math.round(averageScore * 100) / 100,
    totalAssessments,
    performanceLevel,
    scores
  }
}

const identifyStrengths = (feedback) => {
  const strengths = []
  
  // Analizar exámenes exitosos
  feedback.examsFeedback.forEach(exam => {
    if (exam.score >= 4.0) {
      strengths.push(`Excelente desempeño en ${exam.examName}`)
    }
    if (exam.passedQuestions.length > exam.failedQuestions.length) {
      strengths.push(`Buen dominio de conceptos en ${exam.examName}`)
    }
  })

  // Analizar actividades exitosas
  feedback.activitiesFeedback.forEach(activity => {
    if (activity.score >= 4.0) {
      strengths.push(`Destacado en ${activity.activityName}`)
    }
  })

  return strengths.length > 0 ? strengths : ["Muestra dedicación en sus estudios", "Completa las evaluaciones asignadas"]
}

const identifyWeaknesses = (feedback) => {
  const weaknesses = []
  
  // Analizar exámenes con bajo rendimiento
  feedback.examsFeedback.forEach(exam => {
    if (exam.score < 3.0) {
      weaknesses.push(`Necesita reforzar conceptos de ${exam.examName}`)
    }
    if (exam.failedQuestions.length > exam.passedQuestions.length) {
      weaknesses.push(`Dificultades en comprensión de temas de ${exam.examName}`)
    }
  })

  // Analizar actividades con bajo rendimiento
  feedback.activitiesFeedback.forEach(activity => {
    if (activity.score < 3.0) {
      weaknesses.push(`Requiere más práctica en ${activity.activityName}`)
    }
  })

  return weaknesses
}

// Funciones de fallback
const generateFallbackFeedback = (studentData) => {
  return {
    studentId: studentData._id,
    studentName: `${studentData.nombre} ${studentData.apellido}`,
    programa: studentData.programa,
    overallPerformance: calculateOverallPerformance(studentData),
    examsFeedback: [],
    activitiesFeedback: [],
    recommendations: ["Continúa con tu dedicación al estudio", "Practica regularmente los conceptos aprendidos"],
    strengths: ["Compromiso con el aprendizaje"],
    weaknesses: [],
    generatedAt: new Date(),
    isFailsafe: true
  }
}

const generateFallbackAnalysis = (failedQuestions) => {
  return {
    patterns: ["Se identificaron dificultades en conceptos específicos"],
    misunderstoodConcepts: failedQuestions.map(q => q.question.substring(0, 50) + "..."),
    suggestions: ["Revisar los conceptos fundamentales", "Practicar con ejercicios similares"],
    resources: ["Material de estudio del curso", "Consultar con el instructor"]
  }
}

const getDefaultRecommendations = (score) => {
  if (score >= 4.0) {
    return [
      "¡Excelente trabajo! Mantén este nivel de dedicación",
      "Considera ayudar a compañeros que necesiten apoyo",
      "Explora temas avanzados relacionados"
    ]
  } else if (score >= 3.0) {
    return [
      "Buen progreso, continúa practicando",
      "Revisa los conceptos que presentaron dificultad",
      "Participa más activamente en clase"
    ]
  } else {
    return [
      "Dedica más tiempo al estudio de los conceptos básicos",
      "Busca ayuda del instructor o compañeros",
      "Practica con ejercicios adicionales"
    ]
  }
}

const getDefaultActivityRecommendations = (score) => {
  if (score >= 4.0) {
    return ["Excelente trabajo en esta actividad", "Aplica estos conocimientos en proyectos personales"]
  } else if (score >= 3.0) {
    return ["Buen desempeño, continúa practicando", "Revisa los puntos de mejora identificados"]
  } else {
    return ["Necesitas reforzar los conceptos de esta actividad", "Solicita retroalimentación adicional al instructor"]
  }
}

const getDefaultGeneralRecommendations = (averageScore) => {
  if (averageScore >= 4.0) {
    return [
      "Mantén tu excelente rendimiento académico",
      "Considera participar en proyectos extracurriculares",
      "Comparte tu conocimiento con otros estudiantes",
      "Explora oportunidades de liderazgo en el aula"
    ]
  } else if (averageScore >= 3.0) {
    return [
      "Establece un horario de estudio más estructurado",
      "Participa activamente en las discusiones de clase",
      "Busca recursos adicionales para reforzar conceptos",
      "Forma grupos de estudio con compañeros"
    ]
  } else {
    return [
      "Dedica más tiempo diario al estudio",
      "Solicita tutorías o apoyo académico adicional",
      "Revisa y practica los conceptos fundamentales",
      "Establece metas de aprendizaje específicas y alcanzables"
    ]
  }
}