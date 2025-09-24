/**
 * Servicio para conectar con la API de SARA
 * API URL: https://sara-api-ingdanielbs-projects.vercel.app/
 */

const API_BASE_URL = "https://sara-api-ingdanielbs-projects.vercel.app/api/v1";
const API_KEY = "sara_d32775a2ea8a39a3.a14bb968e21a6be6821d19f2764945338ba182b972aff43732b0c7c8314d343a";

/**
 * Configuración por defecto para las peticiones a la API
 */
const defaultConfig = {
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
  }
};

/**
 * Verifica el estado del servicio de IA
 * @returns {Promise<Object>} Estado del servicio
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/health`, {
      method: "GET",
      ...defaultConfig
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al verificar el estado del servicio de IA:", error);
    throw error;
  }
};

/**
 * Obtiene información del modelo de IA
 * @returns {Promise<Object>} Información del modelo
 */
export const getModelInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/model-info`, {
      method: "GET",
      ...defaultConfig
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener información del modelo de IA:", error);
    throw error;
  }
};

/**
 * Evalúa respuestas de opción múltiple
 * @param {Object} data - Datos de la evaluación
 * @returns {Promise<Object>} Resultado de la evaluación
 */
export const evaluateMultipleChoice = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/evaluate-answer`, {
      method: "POST",
      ...defaultConfig,
      body: JSON.stringify({
        question: data.question,
        options: data.options,
        studentAnswer: data.studentAnswer,
        correctAnswer: data.correctAnswer,
        context: data.context || "",
        studentId: data.studentId,
        evaluationId: data.evaluationId
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al evaluar respuesta de opción múltiple:", error);
    throw error;
  }
};

/**
 * Evalúa respuestas de texto abierto
 * @param {Object} data - Datos de la evaluación
 * @returns {Promise<Object>} Resultado de la evaluación
 */
export const evaluateTextAnswer = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/evaluate-text`, {
      method: "POST",
      ...defaultConfig,
      body: JSON.stringify({
        question: data.question,
        studentAnswer: data.studentAnswer,
        expectedAnswer: data.expectedAnswer || "",
        criteria: data.criteria || [],
        context: data.context || "",
        studentId: data.studentId,
        evaluationId: data.evaluationId,
        maxScore: data.maxScore || 100
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al evaluar respuesta de texto abierto:", error);
    throw error;
  }
};

/**
 * Obtiene recomendaciones para estudiantes
 * @param {Object} data - Datos del estudiante
 * @returns {Promise<Object>} Recomendaciones para el estudiante
 */
export const getStudentRecommendations = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/student-recommendations`, {
      method: "POST",
      ...defaultConfig,
      body: JSON.stringify({
        studentId: data.studentId,
        level: data.level || 1,
        strengths: data.strengths || [],
        weaknesses: data.weaknesses || [],
        performance: data.performance || {},
        learningPreferences: data.learningPreferences || []
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al obtener recomendaciones para el estudiante:", error);
    throw error;
  }
};

/**
 * Realiza consultas especializadas sobre SARA/SENA
 * @param {Object} data - Datos de la consulta
 * @returns {Promise<Object>} Respuesta de la consulta
 */
export const askSara = async (data) => {
  try {
    // Formato correcto según la documentación de la API
    const payload = {
      question: data.message || data.query || data.question,
      context: data.context || "",
      user_type: "instructor"
    };

    console.log("📤 Enviando a SARA:", payload);

    const response = await fetch(`${API_BASE_URL}/ai/ask-sara`, {
      method: "POST",
      ...defaultConfig,
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error de SARA API:", response.status, errorText);
      throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Respuesta de SARA:", result);
    return result;
  } catch (error) {
    console.error("Error al realizar consulta a SARA:", error);
    throw error;
  }
};

/**
 * Analiza datos con IA
 * @param {Object} data - Datos para analizar
 * @returns {Promise<Object>} Resultado del análisis
 */
export const analyzeData = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/analyze-data`, {
      method: "POST",
      ...defaultConfig,
      body: JSON.stringify({
        data: data.data,
        query: data.query,
        context: data.context || ""
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al analizar datos con IA:", error);
    throw error;
  }
};

/**
 * Realiza chat general con IA
 * @param {Object} data - Datos del chat
 * @returns {Promise<Object>} Respuesta del chat
 */
export const chat = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat`, {
      method: "POST",
      ...defaultConfig,
      body: JSON.stringify({
        message: data.message,
        history: data.history || []
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al chatear con IA:", error);
    throw error;
  }
};

/**
 * Realiza chat con streaming
 * @param {Object} data - Datos del chat
 * @param {Function} onChunk - Función para manejar cada fragmento de la respuesta
 * @returns {Promise<void>}
 */
export const chatStream = async (data, onChunk) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/chat-stream`, {
      method: "POST",
      ...defaultConfig,
      body: JSON.stringify({
        message: data.message,
        history: data.history || []
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (onChunk && typeof onChunk === "function") {
        onChunk(chunk);
      }
    }
  } catch (error) {
    console.error("Error al chatear con streaming:", error);
    throw error;
  }
};

/**
 * Obtiene ayuda del mentor experto en React 19
 * @param {Object} data - Datos de la consulta
 * @returns {Promise<Object>} Respuesta del mentor
 */
export const reactMentor = async (data) => {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/react-mentor`, {
      method: "POST",
      ...defaultConfig,
      body: JSON.stringify({
        query: data.query,
        code: data.code || "",
        context: data.context || ""
      })
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error al consultar al mentor de React:", error);
    throw error;
  }
};

export default {
  checkHealth,
  getModelInfo,
  evaluateMultipleChoice,
  evaluateTextAnswer,
  getStudentRecommendations,
  askSara,
  analyzeData,
  chat,
  chatStream,
  reactMentor
};