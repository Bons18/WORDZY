export const localStorageService = {
  // Fichas recientes
  loadRecentFichas() {
    try {
      const saved = localStorage.getItem("recentFichas")
      return saved ? JSON.parse(saved) : []
    } catch (error) {
      console.error("Error loading recent fichas:", error)
      return []
    }
  },

  saveRecentFichas(fichas) {
    try {
      localStorage.setItem("recentFichas", JSON.stringify(fichas))
    } catch (error) {
      console.error("Error saving recent fichas:", error)
    }
  },

  clearRecentFichas() {
    try {
      localStorage.removeItem("recentFichas")
    } catch (error) {
      console.error("Error clearing recent fichas:", error)
    }
  },

  // Niveles de fichas
  loadFichaLevels(fichaId) {
    try {
      const saved = localStorage.getItem(`fichaLevels_${fichaId}`)
      if (saved) {
        return JSON.parse(saved)
      }
      // Niveles por defecto
      return {
        A1: true,
        A2: true,
        B1: false,
        B2: false,
        C1: false,
        C2: false,
      }
    } catch (error) {
      console.error("Error loading ficha levels:", error)
      return {
        A1: true,
        A2: true,
        B1: false,
        B2: false,
        C1: false,
        C2: false,
      }
    }
  },

  saveFichaLevels(fichaId, levels) {
    try {
      localStorage.setItem(`fichaLevels_${fichaId}`, JSON.stringify(levels))
    } catch (error) {
      console.error("Error saving ficha levels:", error)
    }
  },
}
