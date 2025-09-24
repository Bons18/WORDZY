// Servicio especializado para generar retroalimentación automática de preguntas
import saraApiService from './saraApiService.js';

/**
 * Genera retroalimentación automática para una pregunta específica
 * @param {Object} questionData - Datos de la pregunta
 * @param {string} questionData.pregunta - La pregunta
 * @param {string} questionData.respuestaEstudiante - Respuesta del estudiante
 * @param {string} questionData.respuestaCorrecta - Respuesta correcta
 * @param {boolean} questionData.esCorrecta - Si la respuesta es correcta
 * @param {string} questionData.tipo - Tipo de pregunta (multiple_choice, text, etc.)
 * @param {string} studentName - Nombre del estudiante
 * @param {string} activityName - Nombre de la actividad
 * @returns {Promise<string>} Retroalimentación generada por IA
 */
export const generateQuestionFeedback = async (questionData, studentName = "", activityName = "") => {
  try {
    console.log("🤖 Generando retroalimentación automática para pregunta:", questionData.pregunta);

    // Construir el prompt contextualizado
    const prompt = buildFeedbackPrompt(questionData, studentName, activityName);

    // Llamar a la API de SARA
    const response = await saraApiService.askSara({
      query: prompt,
      context: "question_feedback",
      history: []
    });

    if (response && response.response) {
      const feedback = response.response.trim();
      console.log("✅ Retroalimentación generada:", feedback);
      return feedback;
    } else {
      console.warn("⚠️ Respuesta vacía de SARA, usando retroalimentación por defecto");
      return generateDefaultFeedback(questionData);
    }

  } catch (error) {
    console.error("❌ Error generando retroalimentación con SARA:", error);
    console.log("🔄 Usando retroalimentación por defecto como fallback");
    return generateDefaultFeedback(questionData);
  }
};

/**
 * Construye el prompt contextualizado para la IA
 */
const buildFeedbackPrompt = (questionData, studentName, activityName) => {
  const { pregunta, respuestaEstudiante, respuestaCorrecta, esCorrecta, tipo } = questionData;
  
  let prompt = `Como tutor de inglés del SENA, proporciona retroalimentación específica y constructiva para esta pregunta:

CONTEXTO:
- Estudiante: ${studentName || "Estudiante"}
- Actividad: ${activityName || "Actividad de inglés"}
- Tipo de pregunta: ${tipo || "general"}

PREGUNTA: ${pregunta}

RESPUESTA DEL ESTUDIANTE: ${respuestaEstudiante}
RESPUESTA CORRECTA: ${respuestaCorrecta}
RESULTADO: ${esCorrecta ? "CORRECTA" : "INCORRECTA"}

INSTRUCCIONES:
1. Proporciona retroalimentación en español, máximo 2-3 oraciones
2. Si es correcta: felicita y refuerza el concepto aprendido
3. Si es incorrecta: explica el error de manera constructiva y da una pista para mejorar
4. Mantén un tono motivador y educativo
5. Enfócate en el aprendizaje del inglés y conceptos gramaticales relevantes

RETROALIMENTACIÓN:`;

  return prompt;
};

/**
 * Genera retroalimentación por defecto cuando la IA no está disponible
 */
const generateDefaultFeedback = (questionData) => {
  const { esCorrecta, tipo } = questionData;
  
  if (esCorrecta) {
    const correctFeedbacks = [
      "¡Excelente! Has demostrado una buena comprensión del concepto. Continúa practicando.",
      "¡Muy bien! Tu respuesta es correcta. Sigue así para fortalecer tu aprendizaje.",
      "¡Correcto! Has aplicado bien los conocimientos. Continúa con esta dedicación.",
      "¡Perfecto! Demuestras dominio del tema. Sigue practicando para mantener este nivel."
    ];
    return correctFeedbacks[Math.floor(Math.random() * correctFeedbacks.length)];
  } else {
    const incorrectFeedbacks = [
      "No te preocupes, los errores son parte del aprendizaje. Revisa el concepto y vuelve a intentarlo.",
      "Casi lo tienes. Revisa la explicación y practica un poco más este tema.",
      "Buen intento. Te recomiendo repasar este concepto para mejorar tu comprensión.",
      "No es la respuesta correcta, pero estás en el camino correcto. Sigue practicando."
    ];
    return incorrectFeedbacks[Math.floor(Math.random() * incorrectFeedbacks.length)];
  }
};

/**
 * Genera retroalimentación para múltiples preguntas de una actividad
 * @param {Array} questions - Array de preguntas
 * @param {string} studentName - Nombre del estudiante
 * @param {string} activityName - Nombre de la actividad
 * @returns {Promise<Array>} Array de preguntas con retroalimentación generada
 */
export const generateActivityFeedback = async (questions, studentName = "", activityName = "") => {
  console.log(`🔄 Generando retroalimentación para ${questions.length} preguntas de la actividad: ${activityName}`);
  
  const questionsWithFeedback = [];
  
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    console.log(`📝 Procesando pregunta ${i + 1}/${questions.length}`);
    
    try {
      // Generar retroalimentación para cada pregunta
      const feedback = await generateQuestionFeedback(question, studentName, activityName);
      
      questionsWithFeedback.push({
        ...question,
        retroalimentacion: feedback
      });
      
      // Pequeña pausa para no sobrecargar la API
      if (i < questions.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`❌ Error procesando pregunta ${i + 1}:`, error);
      // Usar retroalimentación por defecto en caso de error
      questionsWithFeedback.push({
        ...question,
        retroalimentacion: generateDefaultFeedback(question)
      });
    }
  }
  
  console.log("✅ Retroalimentación generada para todas las preguntas");
  return questionsWithFeedback;
};

/**
 * Verifica si una pregunta necesita generar retroalimentación
 * @param {Object} question - Datos de la pregunta
 * @returns {boolean} True si necesita generar retroalimentación
 */
export const needsFeedbackGeneration = (question) => {
  return !question.retroalimentacion || 
         question.retroalimentacion.trim() === "" ||
         question.retroalimentacion === "Retroalimentación pendiente";
};

export default {
  generateQuestionFeedback,
  generateActivityFeedback,
  needsFeedbackGeneration
};