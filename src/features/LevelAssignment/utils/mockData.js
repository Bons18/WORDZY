import { localStorageService } from "../services/localStorageService"

export const MOCK_FICHAS = [
  {
    id: 1,
    codigo: "ADSO-2024-01",
    numero: "2691851",
    programa: "Análisis y Desarrollo de Software",
    instructor: "María González",
    aprendices: 25,
    get nivelesActivos() {
      const levels = localStorageService.loadFichaLevels(this.id)
      return Object.values(levels).filter(Boolean).length
    },
    totalNiveles: 6,
  },
  {
    id: 2,
    codigo: "ADSI-2024-02",
    numero: "2691852",
    programa: "Análisis y Desarrollo de Sistemas de Información",
    instructor: "Carlos Rodríguez",
    aprendices: 30,
    get nivelesActivos() {
      const levels = localStorageService.loadFichaLevels(this.id)
      return Object.values(levels).filter(Boolean).length
    },
    totalNiveles: 6,
  },
  {
    id: 3,
    codigo: "TGO-2024-01",
    numero: "2691853",
    programa: "Tecnología en Gestión de Organizaciones",
    instructor: "Ana Martínez",
    aprendices: 22,
    get nivelesActivos() {
      const levels = localStorageService.loadFichaLevels(this.id)
      return Object.values(levels).filter(Boolean).length
    },
    totalNiveles: 6,
  },
  {
    id: 4,
    codigo: "CONT-2024-01",
    numero: "2691854",
    programa: "Contabilidad y Finanzas",
    instructor: "Luis Hernández",
    aprendices: 28,
    get nivelesActivos() {
      const levels = localStorageService.loadFichaLevels(this.id)
      return Object.values(levels).filter(Boolean).length
    },
    totalNiveles: 6,
  },
  {
    id: 5,
    codigo: "MARK-2024-01",
    numero: "2691855",
    programa: "Marketing Digital",
    instructor: "Laura Pérez",
    aprendices: 26,
    get nivelesActivos() {
      const levels = localStorageService.loadFichaLevels(this.id)
      return Object.values(levels).filter(Boolean).length
    },
    totalNiveles: 6,
  },
]
