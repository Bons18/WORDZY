import api from '../shared/services/api';

class DashboardService {
  /**
   * Obtiene las estadísticas generales del dashboard
   * @param {Object} filters - Filtros para las estadísticas
   * @param {string} filters.year - Año para filtrar
   * @param {string} filters.month - Mes para filtrar
   * @param {string} filters.fichaId - ID de la ficha para filtrar
   * @param {string} filters.programId - ID del programa para filtrar
   * @returns {Promise<Object>} Estadísticas del dashboard
   */
  async getDashboardStats(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.year) params.append('year', filters.year);
      if (filters.month) params.append('month', filters.month);
      if (filters.fichaId) params.append('fichaId', filters.fichaId);
      if (filters.programId) params.append('programId', filters.programId);
      
      const response = await api.get(`/dashboard/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas del dashboard:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene el ranking de aprendices para el dashboard
   * @param {Object} options - Opciones para el ranking
   * @param {number} options.limit - Límite de resultados
   * @param {string} options.fichaId - ID de la ficha para filtrar
   * @param {string} options.programId - ID del programa para filtrar
   * @param {string} options.year - Año para filtrar
   * @param {string} options.month - Mes para filtrar
   * @returns {Promise<Object>} Ranking de aprendices
   */
  async getDashboardRanking(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.limit) params.append('limit', options.limit);
      if (options.fichaId) params.append('fichaId', options.fichaId);
      if (options.programId) params.append('programId', options.programId);
      if (options.year) params.append('year', options.year);
      if (options.month) params.append('month', options.month);
      
      const response = await api.get(`/dashboard/ranking?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener ranking del dashboard:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene las competencias lingüísticas por nivel
   * @param {Object} options - Opciones para las competencias
   * @param {number} options.level - Nivel para obtener competencias
   * @param {string} options.fichaId - ID de la ficha para filtrar
   * @param {string} options.programId - ID del programa para filtrar
   * @returns {Promise<Object>} Competencias lingüísticas
   */
  async getLanguageCompetencies(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.level) params.append('level', options.level);
      if (options.fichaId) params.append('fichaId', options.fichaId);
      if (options.programId) params.append('programId', options.programId);
      
      const response = await api.get(`/dashboard/competencies?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener competencias lingüísticas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene las estadísticas de lecciones por nivel
   * @param {Object} options - Opciones para las estadísticas de lecciones
   * @param {number} options.level - Nivel para obtener estadísticas
   * @param {string} options.fichaId - ID de la ficha para filtrar
   * @param {string} options.programId - ID del programa para filtrar
   * @returns {Promise<Object>} Estadísticas de lecciones
   */
  async getLessonStats(options = {}) {
    try {
      const params = new URLSearchParams();
      
      if (options.level) params.append('level', options.level);
      if (options.fichaId) params.append('fichaId', options.fichaId);
      if (options.programId) params.append('programId', options.programId);
      
      const response = await api.get(`/dashboard/lessons?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de lecciones:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene los datos de progreso por nivel
   * @param {Object} filters - Filtros para el progreso por nivel
   * @param {string} filters.year - Año para filtrar
   * @param {string} filters.fichaId - ID de la ficha para filtrar
   * @param {string} filters.programId - ID del programa para filtrar
   * @returns {Promise<Object>} Datos de progreso por nivel
   */
  async getLevelProgressData(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.year) params.append('year', filters.year);
      if (filters.fichaId) params.append('fichaId', filters.fichaId);
      if (filters.programId) params.append('programId', filters.programId);
      
      const response = await api.get(`/dashboard/level-progress?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener datos de progreso por nivel:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene el progreso personal del aprendiz (solo para aprendices)
   * @returns {Promise<Object>} Progreso personal del aprendiz
   */
  async getMyProgress() {
    try {
      const response = await api.get('/dashboard/my-progress');
      return response.data;
    } catch (error) {
      console.error('Error al obtener progreso personal:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Maneja los errores de las peticiones API
   * @param {Error} error - Error de la petición
   * @returns {Object} Error formateado
   */
  handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const { status, data } = error.response;
      return {
        status,
        message: data?.message || 'Error en el servidor',
        details: data?.details || null
      };
    } else if (error.request) {
      // Error de red
      return {
        status: 0,
        message: 'Error de conexión con el servidor',
        details: 'Verifique su conexión a internet'
      };
    } else {
      // Error de configuración
      return {
        status: -1,
        message: 'Error interno de la aplicación',
        details: error.message
      };
    }
  }

  /**
   * Cache simple para almacenar respuestas temporalmente
   */
  static cache = new Map();
  static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene datos del cache si están disponibles y no han expirado
   * @param {string} key - Clave del cache
   * @returns {Object|null} Datos del cache o null si no existen o han expirado
   */
  static getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Almacena datos en el cache
   * @param {string} key - Clave del cache
   * @param {Object} data - Datos a almacenar
   */
  static setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Limpia el cache
   */
  static clearCache() {
    this.cache.clear();
  }
}

export default new DashboardService();