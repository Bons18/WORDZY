// Servicio para manejar las interacciones con la API de IA
import saraApiService from './saraApiService';

// Constante para la URL base de la API local (como fallback)
const LOCAL_API_BASE_URL = "http://localhost:3000/api";

/**
 * Evaluar respuesta de opción múltiple
 * @param {Object} evaluationData - Datos de la evaluación
 * @returns {Promise<Object>} - Resultado de la evaluación
 */
export const evaluateMultipleChoice = async (evaluationData) => {
  try {
    console.log("🤖 Enviando evaluación de opción múltiple a la API de SARA:", evaluationData);

    // Usar la API de SARA
    const response = await saraApiService.evaluateMultipleChoice({
      question: evaluationData.question,
      options: evaluationData.options,
      studentAnswer: evaluationData.studentAnswer,
      correctAnswer: evaluationData.correctAnswer,
      context: evaluationData.context || "",
      studentId: evaluationData.studentId,
      evaluationId: evaluationData.evaluationId
    });

    console.log("✅ Respuesta de la API de SARA:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en evaluateMultipleChoice con SARA:", error.message);
    console.log("⚠️ Intentando con API local como fallback...");
    
    // Fallback a la API local
    try {
      const response = await fetch(`${LOCAL_API_BASE_URL}/ai/evaluate-answer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          question: evaluationData.question,
          options: evaluationData.options,
          studentAnswer: evaluationData.studentAnswer,
          correctAnswer: evaluationData.correctAnswer,
          context: evaluationData.context || "",
          studentId: evaluationData.studentId,
          evaluationId: evaluationData.evaluationId
        }),
        signal: AbortSignal.timeout(15000) // 15 segundos timeout
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Respuesta de la API local:", data);
      return data;
    } catch (fallbackError) {
      console.error("❌ Error en fallback local:", fallbackError.message);
      throw fallbackError;
    }
  }
};

/**
 * Evaluar respuesta de texto abierto
 * @param {Object} evaluationData - Datos de la evaluación
 * @returns {Promise<Object>} - Resultado de la evaluación
 */
export const evaluateTextAnswer = async (evaluationData) => {
  try {
    console.log("🤖 Enviando evaluación de texto abierto a la API de SARA:", evaluationData);

    // Usar la API de SARA
    const response = await saraApiService.evaluateTextAnswer({
      question: evaluationData.question,
      studentAnswer: evaluationData.studentAnswer,
      expectedAnswer: evaluationData.expectedAnswer || "",
      criteria: evaluationData.criteria || [],
      context: evaluationData.context || "",
      studentId: evaluationData.studentId,
      evaluationId: evaluationData.evaluationId,
      maxScore: evaluationData.maxScore || 100
    });

    console.log("✅ Respuesta de la API de SARA:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en evaluateTextAnswer con SARA:", error.message);
    console.log("⚠️ Intentando con API local como fallback...");
    
    // Fallback a la API local
    try {
      const response = await fetch(`${LOCAL_API_BASE_URL}/ai/evaluate-text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          question: evaluationData.question,
          studentAnswer: evaluationData.studentAnswer,
          expectedAnswer: evaluationData.expectedAnswer || "",
          criteria: evaluationData.criteria || [],
          context: evaluationData.context || "",
          studentId: evaluationData.studentId,
          evaluationId: evaluationData.evaluationId,
          maxScore: evaluationData.maxScore || 100
        }),
        signal: AbortSignal.timeout(15000) // 15 segundos timeout
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Respuesta de la API local:", data);
      return data;
    } catch (fallbackError) {
      console.error("❌ Error en fallback local:", fallbackError.message);
      throw fallbackError;
    }
  }
};

/**
 * Obtener recomendaciones para estudiante
 * @param {Object} studentData - Datos del estudiante
 * @returns {Promise<Object>} - Recomendaciones para el estudiante
 */
export const getStudentRecommendations = async (studentData) => {
  try {
    console.log("🤖 Solicitando recomendaciones para estudiante a la API de SARA:", studentData);

    // Usar la API de SARA
    const response = await saraApiService.getStudentRecommendations({
      studentId: studentData.studentId,
      level: studentData.level || 1,
      strengths: studentData.strengths || [],
      weaknesses: studentData.weaknesses || [],
      performance: studentData.performance || {},
      learningPreferences: studentData.learningPreferences || []
    });

    console.log("✅ Recomendaciones recibidas de SARA:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en getStudentRecommendations con SARA:", error.message);
    console.log("⚠️ Intentando con API local como fallback...");
    
    // Fallback a la API local
    try {
      const response = await fetch(`${LOCAL_API_BASE_URL}/ai/student-recommendations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          studentId: studentData.studentId,
          level: studentData.level || 1,
          strengths: studentData.strengths || [],
          weaknesses: studentData.weaknesses || [],
          performance: studentData.performance || {},
          learningPreferences: studentData.learningPreferences || []
        }),
        signal: AbortSignal.timeout(15000) // 15 segundos timeout
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log("✅ Recomendaciones recibidas de API local:", data);
      return data;
    } catch (fallbackError) {
      console.error("❌ Error en fallback local:", fallbackError.message);
      throw fallbackError;
    }
  }
};

/**
 * Obtener evaluaciones de un estudiante
 * @param {string} studentId - ID del estudiante
 * @returns {Promise<Array>} - Lista de evaluaciones
 */
export const getStudentEvaluations = async (studentId) => {
  try {
    console.log("📝 Obteniendo evaluaciones del estudiante:", studentId);

    // Usar la API local (no hay endpoint equivalente en SARA)
    const response = await fetch(`${LOCAL_API_BASE_URL}/evaluations/student/${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      signal: AbortSignal.timeout(10000) // 10 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Evaluaciones obtenidas:", data);
    return data.data || [];
  } catch (error) {
    console.error("❌ Error en getStudentEvaluations:", error.message);
    throw error;
  }
};

/**
 * Obtener actividades de un estudiante
 * @param {string} studentId - ID del estudiante
 * @returns {Promise<Array>} - Lista de actividades
 */
export const getStudentActivities = async (studentId) => {
  try {
    console.log("📚 Obteniendo actividades del estudiante:", studentId);

    // Usar la API local (no hay endpoint equivalente en SARA)
    const response = await fetch(`${LOCAL_API_BASE_URL}/activities/student/${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      signal: AbortSignal.timeout(10000) // 10 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Actividades obtenidas:", data);
    return data.data || [];
  } catch (error) {
    console.error("❌ Error en getStudentActivities:", error.message);
    throw error;
  }
};

/**
 * Obtener preguntas incorrectas de un estudiante
 * @param {string} studentId - ID del estudiante
 * @param {string} [evaluationId] - ID de la evaluación (opcional)
 * @returns {Promise<Object>} - Preguntas incorrectas con retroalimentación
 */
export const getStudentFailedQuestions = async (studentId, evaluationId = null) => {
  try {
    console.log("❓ Obteniendo preguntas incorrectas para estudiante:", studentId);

    // Usar la API local (no hay endpoint equivalente en SARA)
    let url = `${LOCAL_API_BASE_URL}/student/${studentId}/failed-questions`;
    if (evaluationId) {
      url += `?evaluationId=${evaluationId}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
      },
      signal: AbortSignal.timeout(15000) // 15 segundos timeout
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    console.log("✅ Preguntas incorrectas obtenidas:", data);
    return data.data || { failedQuestions: [] };
  } catch (error) {
    console.error("❌ Error en getStudentFailedQuestions:", error.message);
    throw error;
  }
};

/**
 * Analizar datos con IA
 * @param {Object} data - Datos para analizar
 * @returns {Promise<Object>} - Resultado del análisis
 */
export const analyzeData = async (data) => {
  try {
    console.log("🔍 Analizando datos con la API de SARA:", data);

    // Usar la API de SARA
    const response = await saraApiService.analyzeData({
      data: data.data,
      query: data.query,
      context: data.context || ""
    });

    console.log("✅ Análisis recibido de SARA:", response);
    return response;
  } catch (error) {
    console.error("❌ Error en analyzeData con SARA:", error.message);
    console.log("⚠️ Intentando con API local como fallback...");
    
    // Fallback a la API local
    try {
      const response = await fetch(`${LOCAL_API_BASE_URL}/ai/analyze-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          data: data.data,
          query: data.query,
          context: data.context || ""
        }),
        signal: AbortSignal.timeout(15000) // 15 segundos timeout
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log("✅ Análisis recibido de API local:", responseData);
      return responseData;
    } catch (fallbackError) {
      console.error("❌ Error en fallback local:", fallbackError.message);
      throw fallbackError;
    }
  }
};

export default {
  evaluateMultipleChoice,
  evaluateTextAnswer,
  getStudentRecommendations,
  getStudentEvaluations,
  getStudentActivities,
  getStudentFailedQuestions,
  analyzeData
};