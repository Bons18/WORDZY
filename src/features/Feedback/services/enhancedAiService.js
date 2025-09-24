// Servicio mejorado para integrar todos los endpoints de IA disponibles
import saraApiService from './saraApiService.js';

const LOCAL_API_BASE_URL = "http://localhost:3000/api/v1/ai";

/**
 * Servicio mejorado que utiliza todos los endpoints de IA disponibles
 */
class EnhancedAiService {
  
  /**
   * Evaluar automáticamente todas las respuestas de un examen
   * @param {Object} examData - Datos del examen con preguntas y respuestas
   * @returns {Promise<Object>} - Evaluación completa del examen
   */
  async evaluateExamAutomatically(examData) {
    try {
      console.log("🤖 Evaluando examen automáticamente:", examData.examName);
      
      const evaluatedQuestions = [];
      
      for (const question of examData.questions) {
        let evaluation;
        
        // Determinar el tipo de pregunta y usar el endpoint apropiado
        if (question.type === 'multiple_choice' || question.options) {
          evaluation = await this.evaluateMultipleChoiceQuestion(question, examData.studentId);
        } else {
          evaluation = await this.evaluateTextQuestion(question, examData.studentId);
        }
        
        evaluatedQuestions.push({
          ...question,
          evaluation: evaluation,
          aiGenerated: true
        });
      }
      
      // Calcular estadísticas del examen
      const stats = this.calculateExamStats(evaluatedQuestions);
      
      // Generar recomendaciones basadas en el rendimiento
      const recommendations = await this.generateExamRecommendations({
        studentId: examData.studentId,
        examStats: stats,
        questions: evaluatedQuestions
      });
      
      return {
        success: true,
        data: {
          examId: examData.examId,
          evaluatedQuestions,
          stats,
          recommendations,
          evaluatedAt: new Date()
        }
      };
      
    } catch (error) {
      console.error("❌ Error evaluando examen automáticamente:", error);
      return {
        success: false,
        error: error.message,
        fallbackData: this.generateFallbackExamEvaluation(examData)
      };
    }
  }
  
  /**
   * Evaluar pregunta de opción múltiple usando el endpoint específico
   */
  async evaluateMultipleChoiceQuestion(question, studentId) {
    try {
      const response = await fetch(`${LOCAL_API_BASE_URL}/evaluate-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question,
          options: question.options,
          studentAnswer: question.studentAnswer,
          correctAnswer: question.correctAnswer,
          context: question.context || '',
          studentId: studentId,
          evaluationId: question.id
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data.evaluation;
      
    } catch (error) {
      console.error("❌ Error evaluando pregunta de opción múltiple:", error);
      return this.generateFallbackMultipleChoiceEvaluation(question);
    }
  }
  
  /**
   * Evaluar pregunta de texto abierto usando el endpoint específico
   */
  async evaluateTextQuestion(question, studentId) {
    try {
      const response = await fetch(`${LOCAL_API_BASE_URL}/evaluate-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.question,
          studentAnswer: question.studentAnswer,
          expectedAnswer: question.expectedAnswer || question.correctAnswer,
          criteria: question.criteria || [],
          context: question.context || '',
          studentId: studentId,
          evaluationId: question.id,
          maxScore: question.maxScore || 100
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data.evaluation;
      
    } catch (error) {
      console.error("❌ Error evaluando pregunta de texto:", error);
      return this.generateFallbackTextEvaluation(question);
    }
  }
  
  /**
   * Generar recomendaciones personalizadas para el estudiante
   */
  async generateStudentRecommendations(studentData) {
    try {
      const response = await fetch(`${LOCAL_API_BASE_URL}/student-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: studentData.studentId,
          level: studentData.level || 1,
          strengths: studentData.strengths || [],
          weaknesses: studentData.weaknesses || [],
          performance: studentData.performance || {},
          learningPreferences: studentData.learningPreferences || []
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data.recommendations;
      
    } catch (error) {
      console.error("❌ Error generando recomendaciones:", error);
      return this.generateFallbackRecommendations(studentData);
    }
  }
  
  /**
   * Analizar datos de rendimiento del estudiante
   */
  async analyzeStudentPerformance(performanceData) {
    try {
      const response = await fetch(`${LOCAL_API_BASE_URL}/analyze-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: performanceData.data,
          analysisType: 'performance',
          parameters: {
            studentId: performanceData.studentId,
            timeframe: performanceData.timeframe || 'month',
            includeComparisons: true
          }
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data.analysis;
      
    } catch (error) {
      console.error("❌ Error analizando rendimiento:", error);
      return this.generateFallbackPerformanceAnalysis(performanceData);
    }
  }
  
  /**
   * Consultar a SARA sobre temas específicos
   */
  async askSaraQuestion(question, context = '') {
    try {
      const response = await fetch(`${LOCAL_API_BASE_URL}/ask-sara`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          context: context
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.data.answer;
      
    } catch (error) {
      console.error("❌ Error consultando a SARA:", error);
      return {
        answer: "Lo siento, no puedo procesar tu consulta en este momento. Por favor, intenta más tarde.",
        confidence: 0
      };
    }
  }
  
  /**
   * Calcular estadísticas del examen
   */
  calculateExamStats(evaluatedQuestions) {
    const totalQuestions = evaluatedQuestions.length;
    const correctAnswers = evaluatedQuestions.filter(q => 
      q.evaluation && q.evaluation.isCorrect
    ).length;
    const averageScore = evaluatedQuestions.reduce((sum, q) => 
      sum + (q.evaluation?.score || 0), 0
    ) / totalQuestions;
    
    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      accuracy: (correctAnswers / totalQuestions) * 100,
      averageScore: Math.round(averageScore * 100) / 100,
      performanceLevel: this.getPerformanceLevel(averageScore)
    };
  }
  
  /**
   * Generar recomendaciones basadas en el examen
   */
  async generateExamRecommendations(examData) {
    const weakAreas = examData.questions
      .filter(q => !q.evaluation?.isCorrect)
      .map(q => q.topic || 'Concepto general');
    
    const strongAreas = examData.questions
      .filter(q => q.evaluation?.isCorrect)
      .map(q => q.topic || 'Concepto general');
    
    return await this.generateStudentRecommendations({
      studentId: examData.studentId,
      level: this.getLevelFromScore(examData.examStats.averageScore),
      strengths: [...new Set(strongAreas)],
      weaknesses: [...new Set(weakAreas)],
      performance: {
        score: examData.examStats.averageScore,
        accuracy: examData.examStats.accuracy,
        totalQuestions: examData.examStats.totalQuestions
      }
    });
  }
  
  // Métodos auxiliares
  getPerformanceLevel(score) {
    if (score >= 4.5) return 'Excelente';
    if (score >= 4.0) return 'Muy Bueno';
    if (score >= 3.5) return 'Bueno';
    if (score >= 3.0) return 'Regular';
    return 'Necesita Mejora';
  }
  
  getLevelFromScore(score) {
    if (score >= 4.5) return 6;
    if (score >= 4.0) return 5;
    if (score >= 3.5) return 4;
    if (score >= 3.0) return 3;
    if (score >= 2.5) return 2;
    return 1;
  }
  
  // Métodos de fallback
  generateFallbackExamEvaluation(examData) {
    return {
      examId: examData.examId,
      message: "Evaluación básica generada sin IA",
      stats: {
        totalQuestions: examData.questions?.length || 0,
        evaluationMethod: 'fallback'
      }
    };
  }
  
  generateFallbackMultipleChoiceEvaluation(question) {
    const isCorrect = question.studentAnswer === question.correctAnswer;
    return {
      isCorrect,
      score: isCorrect ? 100 : 0,
      feedback: isCorrect 
        ? "¡Respuesta correcta! Buen trabajo." 
        : "Respuesta incorrecta. Revisa el concepto y vuelve a intentarlo.",
      confidence: 0.5
    };
  }
  
  generateFallbackTextEvaluation(question) {
    return {
      score: 75, // Puntaje neutral
      maxScore: 100,
      feedback: "Esta respuesta requiere revisión manual por parte del instructor.",
      suggestions: ["Consulta con tu instructor para obtener retroalimentación detallada"],
      confidence: 0.3
    };
  }
  
  generateFallbackRecommendations(studentData) {
    return {
      recommendations: [
        "Continúa practicando regularmente",
        "Revisa los conceptos fundamentales",
        "Participa activamente en clase"
      ],
      nextSteps: [
        "Completar actividades pendientes",
        "Repasar material del curso"
      ],
      resources: [
        "Material de estudio disponible",
        "Ejercicios de práctica"
      ]
    };
  }
  
  generateFallbackPerformanceAnalysis(performanceData) {
    return {
      summary: "Análisis básico de rendimiento",
      trends: ["Se requiere más información para generar tendencias"],
      insights: ["Consulta con tu instructor para un análisis detallado"],
      recommendations: ["Mantén un registro de tu progreso"]
    };
  }
}

export default new EnhancedAiService();