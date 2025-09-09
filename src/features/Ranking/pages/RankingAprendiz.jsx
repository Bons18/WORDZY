"use client"
import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Award,
  Flame,
  Rocket,
  Zap,
  BookOpen,
  GraduationCap,
  Building2,
  BadgeCheck,
  Sparkles,
  Gem,
  Diamond,
  Hexagon,
  Shield,
  Flag,
  Target,
  TrendingUp,
  Trophy,
  Medal,
  Crown,
  Search,
  X,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react"

const Ranking = () => {
  // Estado para controlar la pestaña activa
  const [activeTab, setActiveTab] = useState("aprendices")
  // Estado para la paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [displayedItems, setDisplayedItems] = useState([])

  // Estados para los filtros
  const [selectedFicha, setSelectedFicha] = useState("")
  const [selectedPrograma, setSelectedPrograma] = useState("")
  const [showFichaDropdown, setShowFichaDropdown] = useState(false)
  const [showProgramaDropdown, setShowProgramaDropdown] = useState(false)

  // Lista de fichas disponibles (simuladas)
  const fichas = [
    "2889927-801",
    "2889927-802",
    "2889927-803",
    "2889927-804",
    "2889927-805",
    "2889927-806",
    "2889927-807",
    "2889927-808",
  ]

  // Lista de programas disponibles
  const programas = ["Análisis y desarrollo de software", "Técnico en programación"]

  // Datos para cada categoría (ampliados para demostrar la paginación)
  const categoryData = {
    ficha: {
      podium: [
        { position: 2, name: "Carlos M.", points: 685 },
        { position: 1, name: "Laura S.", points: 890 },
        { position: 3, name: "Miguel A.", points: 542 },
      ],
      currentUser: {
        position: 5,
        name: "Laura S.",
        points: 890,
        ficha: "2889927-801",
      },
      ranking: [
        { id: 1, name: "Laura S.", points: 890, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        { id: 2, name: "Carlos M.", points: 685, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        { id: 3, name: "Miguel A.", points: 542, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        { id: 4, name: "Ana Gómez", points: 520, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        { id: 5, name: "Pedro Ruiz", points: 480, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 6,
          name: "Sofía Vargas",
          points: 450,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 7,
          name: "Daniel López",
          points: 420,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 8,
          name: "Valentina Torres",
          points: 410,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 9,
          name: "Javier Mendoza",
          points: 390,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 10,
          name: "Camila Rojas",
          points: 370,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 11,
          name: "Andrés Morales",
          points: 350,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 12,
          name: "Gabriela Sánchez",
          points: 340,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 13,
          name: "Roberto Jiménez",
          points: 335,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 14,
          name: "Lucía Fernández",
          points: 330,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 15,
          name: "Martín Gutiérrez",
          points: 325,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 16,
          name: "Carolina Díaz",
          points: 320,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 17,
          name: "Fernando Ruiz",
          points: 315,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 18,
          name: "Valeria Moreno",
          points: 310,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 19,
          name: "Alejandro Torres",
          points: 305,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 20,
          name: "Natalia Vargas",
          points: 300,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 21,
          name: "Eduardo Mendoza",
          points: 295,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 22,
          name: "Daniela Rojas",
          points: 290,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 23,
          name: "Ricardo Morales",
          points: 285,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 24,
          name: "Isabel Sánchez",
          points: 280,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 25,
          name: "Jorge Jiménez",
          points: 275,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        // Ficha 2889927-802
        { id: 26, name: "María López", points: 780, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 27, name: "Juan Pérez", points: 750, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 28, name: "Luisa Martínez", points: 720, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 29, name: "Carlos Rodríguez", points: 690, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 30, name: "Ana García", points: 660, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 31, name: "Pedro Sánchez", points: 630, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 32, name: "Sofía Fernández", points: 600, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 33, name: "Daniel González", points: 570, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 34, name: "Valentina Díaz", points: 540, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 35, name: "Javier Torres", points: 510, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 36, name: "Camila Ruiz", points: 480, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 37, name: "Andrés Vargas", points: 450, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 38, name: "Gabriela López", points: 420, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 39, name: "Roberto Pérez", points: 390, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 40, name: "Lucía Martínez", points: 360, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 41, name: "Martín Rodríguez", points: 330, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 42, name: "Carolina García", points: 300, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 43, name: "Fernando Sánchez", points: 270, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 44, name: "Valeria Fernández", points: 240, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 45, name: "Alejandro González", points: 210, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 46, name: "Natalia Díaz", points: 180, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 47, name: "Eduardo Torres", points: 150, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 48, name: "Daniela Ruiz", points: 120, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 49, name: "Ricardo Vargas", points: 90, ficha: "2889927-802", programa: "Técnico en programación" },
        { id: 50, name: "Isabel López", points: 60, ficha: "2889927-802", programa: "Técnico en programación" },
      ],
    },
    aprendices: {
      podium: [
        { position: 2, name: "Brayan R.", points: 724 },
        { position: 1, name: "Rafael P.", points: 967 },
        { position: 3, name: "Zurangely P.", points: 601 },
      ],
      currentUser: {
        position: 8,
        name: "Rafael P.",
        points: 967,
        ficha: "2889927-801",
      },
      ranking: [
        { id: 1, name: "Rafael P.", points: 967, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 2,
          name: "Dickson Mosquera",
          points: 508,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 3,
          name: "Zurangely Mota",
          points: 490,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        { id: 4, name: "Juan Pérez", points: 475, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 5,
          name: "Diego Alejandro",
          points: 450,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 6,
          name: "María González",
          points: 430,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 7,
          name: "Juan Martínez",
          points: 410,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 8,
          name: "Brayan Cortez",
          points: 400,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 9,
          name: "Ana Martínez",
          points: 395,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 10,
          name: "Carlos Rodríguez",
          points: 390,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 11,
          name: "Zurangely Portillo",
          points: 382,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 12,
          name: "Luisa Ramírez",
          points: 375,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 13,
          name: "Andrés Gómez",
          points: 370,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 14,
          name: "Valentina López",
          points: 365,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 15,
          name: "Santiago Torres",
          points: 360,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 16,
          name: "Camila Herrera",
          points: 355,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 17,
          name: "Javier Díaz",
          points: 350,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 18,
          name: "Isabella Vargas",
          points: 345,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 19,
          name: "Mateo Sánchez",
          points: 340,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 20,
          name: "Sofía Mendoza",
          points: 335,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 21,
          name: "Daniel Rojas",
          points: 330,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 22,
          name: "Mariana Castro",
          points: 325,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 23,
          name: "Sebastián Morales",
          points: 320,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 24,
          name: "Gabriela Jiménez",
          points: 315,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 25,
          name: "Alejandro Ruiz",
          points: 310,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 26,
          name: "Valeria Ortiz",
          points: 305,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 27,
          name: "Nicolás Fernández",
          points: 300,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 28,
          name: "Luciana Gutiérrez",
          points: 295,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 29,
          name: "Emilio Ramírez",
          points: 290,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 30,
          name: "Antonella Díaz",
          points: 285,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        // Ficha 2889927-803
        { id: 31, name: "Brayan R.", points: 724, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 32, name: "Camilo Vargas", points: 710, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 33, name: "Daniela Pérez", points: 695, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 34, name: "Eduardo Martínez", points: 680, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 35, name: "Fernanda Rodríguez", points: 665, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 36, name: "Gabriel García", points: 650, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 37, name: "Helena Sánchez", points: 635, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 38, name: "Ignacio Fernández", points: 620, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 39, name: "Julia González", points: 605, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 40, name: "Kevin Díaz", points: 590, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 41, name: "Laura Torres", points: 575, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 42, name: "Manuel Ruiz", points: 560, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 43, name: "Natalia Vargas", points: 545, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 44, name: "Oscar López", points: 530, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 45, name: "Patricia Pérez", points: 515, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 46, name: "Quirino Martínez", points: 500, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 47, name: "Rosa Rodríguez", points: 485, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 48, name: "Samuel García", points: 470, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 49, name: "Teresa Sánchez", points: 455, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 50, name: "Ulises Fernández", points: 440, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 51, name: "Verónica González", points: 425, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 52, name: "Walter Díaz", points: 410, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 53, name: "Ximena Torres", points: 395, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 54, name: "Yolanda Ruiz", points: 380, ficha: "2889927-803", programa: "Técnico en programación" },
        { id: 55, name: "Zacarías Vargas", points: 365, ficha: "2889927-803", programa: "Técnico en programación" },
      ],
    },
    programa: {
      podium: [
        { position: 2, name: "Alejandro G.", points: 845 },
        { position: 1, name: "Carolina M.", points: 1024 },
        { position: 3, name: "Santiago R.", points: 780 },
      ],
      currentUser: {
        position: 4,
        name: "Carolina M.",
        points: 1024,
        ficha: "2889927-801",
      },
      ranking: [
        {
          id: 1,
          name: "Carolina M.",
          points: 1024,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 2,
          name: "Alejandro G.",
          points: 845,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 3,
          name: "Santiago R.",
          points: 780,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 4,
          name: "Valentina T.",
          points: 720,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        { id: 5, name: "Mateo L.", points: 650, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 6,
          name: "Isabella S.",
          points: 580,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 7,
          name: "Sebastián V.",
          points: 520,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        { id: 8, name: "Camila F.", points: 490, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        { id: 9, name: "Nicolás H.", points: 450, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 10,
          name: "Mariana L.",
          points: 420,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        { id: 11, name: "Daniel C.", points: 380, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 12,
          name: "Luciana I.",
          points: 375,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        { id: 13, name: "Emilio P.", points: 370, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 14,
          name: "Antonella O.",
          points: 365,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 15,
          name: "Joaquín E.",
          points: 360,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        { id: 16, name: "Renata A.", points: 355, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 17,
          name: "Benjamín C.",
          points: 350,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        {
          id: 18,
          name: "Martina D.",
          points: 345,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        { id: 19, name: "Felipe S.", points: 340, ficha: "2889927-801", programa: "Análisis y desarrollo de software" },
        {
          id: 20,
          name: "Victoria I.",
          points: 335,
          ficha: "2889927-801",
          programa: "Análisis y desarrollo de software",
        },
        // Ficha 2889927-804 y programa Técnico en programación
        { id: 21, name: "Alejandro G.", points: 845, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 22, name: "Beatriz H.", points: 830, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 23, name: "Carlos I.", points: 815, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 24, name: "Diana J.", points: 800, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 25, name: "Ernesto K.", points: 785, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 26, name: "Fabiola L.", points: 770, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 27, name: "Gustavo M.", points: 755, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 28, name: "Hilda N.", points: 740, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 29, name: "Ignacio O.", points: 725, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 30, name: "Julieta P.", points: 710, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 31, name: "Karina Q.", points: 695, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 32, name: "Leonardo R.", points: 680, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 33, name: "Mónica S.", points: 665, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 34, name: "Norberto T.", points: 650, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 35, name: "Olivia U.", points: 635, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 36, name: "Pablo V.", points: 620, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 37, name: "Quetzal W.", points: 605, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 38, name: "Raquel X.", points: 590, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 39, name: "Salvador Y.", points: 575, ficha: "2889927-804", programa: "Técnico en programación" },
        { id: 40, name: "Tamara Z.", points: 560, ficha: "2889927-804", programa: "Técnico en programación" },
      ],
    },
  }

  // Modificar la función getFilteredData() para asegurar que siempre ordene por puntos cuando se filtra por programa
  const getFilteredData = () => {
    const currentData = categoryData[activeTab]
    let filteredData = [...currentData.ranking]

    // Aplicar filtro según la pestaña activa
    if (activeTab === "ficha" && selectedFicha) {
      filteredData = filteredData.filter((item) => item.ficha === selectedFicha)
    } else if (activeTab === "programa" && selectedPrograma) {
      filteredData = filteredData.filter((item) => item.programa === selectedPrograma)
    }

    // Siempre ordenar por puntos de mayor a menor cuando estamos en la pestaña programa
    // o cuando se ha seleccionado un programa específico
    if (activeTab === "programa" || selectedPrograma) {
      filteredData.sort((a, b) => b.points - a.points)
    }

    return filteredData
  }

  // Función para obtener el icono según la categoría y posición
  const getPodiumIcon = (category, position) => {
    // Iconos para la categoría "ficha"
    if (category === "ficha") {
      if (position === 1) return <Diamond className="w-8 h-8 text-yellow-500" />
      if (position === 2) return <Gem className="w-7 h-7 text-gray-400" />
      if (position === 3) return <Hexagon className="w-7 h-7 text-amber-700" />
    }
    // Iconos para la categoría "aprendices"
    else if (category === "aprendices") {
      if (position === 1) return <Flame className="w-8 h-8 text-yellow-500" />
      if (position === 2) return <Zap className="w-7 h-7 text-gray-400" />
      if (position === 3) return <Rocket className="w-7 h-7 text-amber-700" />
    }
    // Iconos para la categoría "programa"
    else if (category === "programa") {
      if (position === 1) return <Target className="w-8 h-8 text-yellow-500" />
      if (position === 2) return <Shield className="w-7 h-7 text-gray-400" />
      if (position === 3) return <Flag className="w-7 h-7 text-amber-700" />
    }

    return <BadgeCheck className="w-6 h-6 text-gray-500" />
  }

  // Función para obtener el color de fondo según la posición
  const getPodiumBgColor = (position) => {
    if (position === 1) return "bg-gradient-to-b from-yellow-400 to-yellow-500"
    if (position === 2) return "bg-gradient-to-b from-gray-300 to-gray-400"
    if (position === 3) return "bg-gradient-to-b from-amber-600 to-amber-700"
    return "bg-gray-200"
  }

  // Actualizar los elementos mostrados cuando cambia la página, la pestaña o los filtros
  useEffect(() => {
    // Limpiar filtros al cambiar de pestaña
    if (activeTab === "ficha") {
      setSelectedPrograma("")
    } else if (activeTab === "programa") {
      setSelectedFicha("")
      // Si estamos en la pestaña programa y hay un programa seleccionado, asegurar que los datos estén ordenados
      if (selectedPrograma) {
        const filteredData = getFilteredData().sort((a, b) => b.points - a.points)
        const total = Math.ceil(filteredData.length / itemsPerPage)
        setTotalPages(total)

        const validPage = Math.min(currentPage, total || 1)
        if (validPage !== currentPage) {
          setCurrentPage(validPage)
        }

        const startIndex = (validPage - 1) * itemsPerPage
        const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length)
        setDisplayedItems(filteredData.slice(startIndex, endIndex))
        return
      }
    } else {
      // En la pestaña "aprendices" limpiar ambos filtros
      setSelectedFicha("")
      setSelectedPrograma("")
    }

    const filteredData = getFilteredData()
    const total = Math.ceil(filteredData.length / itemsPerPage)
    setTotalPages(total)

    // Asegurarse de que la página actual es válida
    const validPage = Math.min(currentPage, total || 1)
    if (validPage !== currentPage) {
      setCurrentPage(validPage)
    }

    // Calcular los elementos a mostrar
    const startIndex = (validPage - 1) * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length)
    setDisplayedItems(filteredData.slice(startIndex, endIndex))
  }, [activeTab, currentPage, itemsPerPage, selectedFicha, selectedPrograma])

  // Cambiar de página
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Obtener los datos actuales según la pestaña seleccionada
  const currentData = categoryData[activeTab]

  // Generar los números de página para la paginación
  const getPageNumbers = () => {
    const pages = []
    const maxVisiblePages = 5 // Número máximo de páginas visibles en la paginación

    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Mostrar un subconjunto de páginas con elipsis
      if (currentPage <= 3) {
        // Estamos cerca del inicio
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Estamos cerca del final
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Estamos en el medio
        pages.push(1)
        pages.push("...")
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  // Función para obtener el icono de la categoría
  const getCategoryIcon = (category) => {
    switch (category) {
      case "ficha":
        return <BookOpen className="w-5 h-5 mr-1" />
      case "aprendices":
        return <GraduationCap className="w-5 h-5 mr-1" />
      case "programa":
        return <Building2 className="w-5 h-5 mr-1" />
      default:
        return null
    }
  }

  // Función para obtener el icono de posición en la lista
  const getPositionIcon = (position) => {
    if (position === 1) return <Diamond className="w-5 h-5 text-yellow-500" />
    if (position === 2) return <Gem className="w-5 h-5 text-gray-400" />
    if (position === 3) return <Hexagon className="w-5 h-5 text-amber-700" />
    return null
  }

  // Limpiar los filtros
  const clearFilters = () => {
    setSelectedFicha("")
    setSelectedPrograma("")
    setCurrentPage(1)
  }

  // Renderizar el filtro contextual según la pestaña activa
  const renderContextualFilter = () => {
    if (activeTab === "ficha") {
      return (
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded-md shadow-sm text-sm hover:bg-gray-50"
            onClick={() => setShowFichaDropdown(!showFichaDropdown)}
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            {selectedFicha ? (
              <span className="font-medium text-[#1f384c]">{selectedFicha}</span>
            ) : (
              <span className="text-gray-500">Seleccionar ficha</span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showFichaDropdown && (
            <div className="absolute right-0 z-10 mt-1 w-48 bg-white shadow-lg max-h-60 rounded-md py-1 text-sm overflow-auto">
              {fichas.map((ficha) => (
                <div
                  key={ficha}
                  className={`cursor-pointer select-none relative py-2 px-3 hover:bg-gray-100 ${
                    selectedFicha === ficha ? "bg-blue-50 text-[#1f384c] font-medium" : ""
                  }`}
                  onClick={() => {
                    setSelectedFicha(ficha)
                    setShowFichaDropdown(false)
                    setCurrentPage(1)
                  }}
                >
                  {ficha}
                </div>
              ))}
              {selectedFicha && (
                <div
                  className="cursor-pointer select-none relative py-2 px-3 text-red-600 hover:bg-red-50 border-t"
                  onClick={() => {
                    setSelectedFicha("")
                    setShowFichaDropdown(false)
                    setCurrentPage(1)
                  }}
                >
                  <X className="w-3.5 h-3.5 inline mr-1" />
                  Limpiar filtro
                </div>
              )}
            </div>
          )}
        </div>
      )
    } else if (activeTab === "programa") {
      return (
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-1.5 bg-white border rounded-md shadow-sm text-sm hover:bg-gray-50"
            onClick={() => setShowProgramaDropdown(!showProgramaDropdown)}
          >
            <SlidersHorizontal className="w-4 h-4 text-gray-500" />
            {selectedPrograma ? (
              <span className="font-medium text-[#1f384c] truncate max-w-[150px]">{selectedPrograma}</span>
            ) : (
              <span className="text-gray-500">Seleccionar programa</span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {showProgramaDropdown && (
            <div className="absolute right-0 z-10 mt-1 w-64 bg-white shadow-lg max-h-60 rounded-md py-1 text-sm overflow-auto">
              {programas.map((programa) => (
                <div
                  key={programa}
                  className={`cursor-pointer select-none relative py-2 px-3 hover:bg-gray-100 ${
                    selectedPrograma === programa ? "bg-blue-50 text-[#1f384c] font-medium" : ""
                  }`}
                  onClick={() => {
                    setSelectedPrograma(programa)
                    setShowProgramaDropdown(false)
                    setCurrentPage(1)
                  }}
                >
                  {programa}
                </div>
              ))}
              {selectedPrograma && (
                <div
                  className="cursor-pointer select-none relative py-2 px-3 text-red-600 hover:bg-red-50 border-t"
                  onClick={() => {
                    setSelectedPrograma("")
                    setShowProgramaDropdown(false)
                    setCurrentPage(1)
                  }}
                >
                  <X className="w-3.5 h-3.5 inline mr-1" />
                  Limpiar filtro
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Header con tabs */}
      <div className="border-b">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-center gap-2 py-3">
            <button
              className={`px-4 py-2 text-sm flex items-center ${
                activeTab === "ficha" ? "text-white bg-[#1f384c] rounded-md" : "text-gray-600"
              }`}
              onClick={() => {
                setActiveTab("ficha")
                setCurrentPage(1) // Resetear a la primera página al cambiar de pestaña
              }}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Total de Fichas
            </button>
            <button
              className={`px-4 py-2 text-sm flex items-center ${
                activeTab === "aprendices" ? "text-white bg-[#1f384c] rounded-md" : "text-gray-600"
              }`}
              onClick={() => {
                setActiveTab("aprendices")
                setCurrentPage(1)
              }}
            >
              <GraduationCap className="w-4 h-4 mr-1" />
              Top Ranking de Aprendices
            </button>
            <button
              className={`px-4 py-2 text-sm flex items-center ${
                activeTab === "programa" ? "text-white bg-[#1f384c] rounded-md" : "text-gray-600"
              }`}
              onClick={() => {
                setActiveTab("programa")
                setCurrentPage(1)
              }}
            >
              <Building2 className="w-4 h-4 mr-1" />
              Total de Programas
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Encabezado con título y filtro contextual */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-medium text-[#1f384c] flex items-center">
            {getCategoryIcon(activeTab)}
            Tabla de clasificación
          </h1>

          {/* Filtro contextual según la pestaña activa */}
          {renderContextualFilter()}
        </div>

        {/* Nuevo diseño del podio */}
        <div className="mb-12 relative">
          <div className="flex justify-center items-end">
            {/* Tarjetas de podio con diseño moderno */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
              {/* Segundo lugar */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                      <span className="text-gray-700 text-xs font-bold">2</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg p-4 pt-5 shadow-md">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mb-3 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        <GraduationCap className="w-8 h-8 text-gray-500" />
                      </div>
                      <h3 className="font-medium text-gray-800 text-center">{currentData.podium[0].name}</h3>
                      <div className="flex items-center mt-1">
                        <Medal className="w-4 h-4 text-gray-500 mr-1" />
                        <span className="text-gray-700 font-semibold">{currentData.podium[0].points} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primer lugar */}
              <div className="flex flex-col items-center -mt-6">
                <div className="relative mb-2">
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <Crown className="w-8 h-8 text-yellow-500 drop-shadow-md" />
                  </div>
                  <div className="bg-gradient-to-br from-blue-600 to-[#1f384c] rounded-lg p-4 pt-6 shadow-lg">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-blue-500 rounded-full mb-3 flex items-center justify-center border-4 border-white shadow-md overflow-hidden">
                        <Trophy className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="font-bold text-white text-center">{currentData.podium[1].name}</h3>
                      <div className="flex items-center mt-1">
                        <Sparkles className="w-4 h-4 text-yellow-300 mr-1" />
                        <span className="text-white font-semibold">{currentData.podium[1].points} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tercer lugar */}
              <div className="flex flex-col items-center">
                <div className="relative mb-2">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-amber-600 rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                      <span className="text-white text-xs font-bold">3</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg p-4 pt-5 shadow-md">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-amber-50 rounded-full mb-3 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        <GraduationCap className="w-8 h-8 text-amber-600" />
                      </div>
                      <h3 className="font-medium text-gray-800 text-center">{currentData.podium[2].name}</h3>
                      <div className="flex items-center mt-1">
                        <Medal className="w-4 h-4 text-amber-600 mr-1" />
                        <span className="text-gray-700 font-semibold">{currentData.podium[2].points} pts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tu posición */}
        <div className="border rounded-lg p-4 mb-6 flex items-center shadow-sm hover:shadow-md transition-shadow bg-gradient-to-r from-blue-50 to-white">
          <div className="w-10 h-10 bg-[#1f384c] rounded-full flex items-center justify-center mr-4 shadow-sm">
            <span className="text-white font-medium">{currentData.currentUser.position}</span>
          </div>
          <div className="flex-1">
            <p className="font-medium text-[#1f384c]">{currentData.currentUser.name}</p>
            <p className="text-sm text-gray-600">Ficha: {currentData.currentUser.ficha}</p>
          </div>
          <div className="font-semibold text-[#1f384c] flex items-center bg-blue-100 px-3 py-1 rounded-full">
            <Sparkles className="w-5 h-5 text-yellow-500 mr-1" />
            {currentData.currentUser.points} Puntos
          </div>
        </div>

        {/* Selector de elementos por página */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-600 flex items-center">
            <Award className="w-4 h-4 mr-1 text-[#1f384c]" />
            Mostrando {displayedItems.length} de {getFilteredData().length} participantes
          </div>
          <div className="flex items-center">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-600 mr-2 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              Mostrar:
            </label>
            <select
              id="itemsPerPage"
              className="border rounded px-2 py-1 text-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1) // Resetear a la primera página al cambiar elementos por página
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* Lista de ranking */}
        <div className="space-y-3 mb-6">
          {displayedItems.length > 0 ? (
            displayedItems.map((user) => (
              <div
                key={user.id}
                className={`rounded-lg p-4 flex items-center ${
                  user.id === 1
                    ? "bg-gradient-to-r from-blue-600 to-[#1f384c] text-white shadow-md"
                    : user.id === 2
                      ? "bg-gradient-to-r from-gray-200 to-gray-300 shadow-sm"
                      : user.id === 3
                        ? "bg-gradient-to-r from-amber-100 to-amber-200 shadow-sm"
                        : "bg-white border shadow-sm"
                } hover:shadow-md transition-shadow`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                    user.id === 1
                      ? "bg-blue-500 text-white"
                      : user.id === 2
                        ? "bg-gray-100 text-gray-700"
                        : user.id === 3
                          ? "bg-amber-50 text-amber-700"
                          : "bg-gray-100 text-gray-700"
                  } border-2 border-white`}
                >
                  <span className="text-sm font-medium">{user.id}</span>
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${user.id === 1 ? "text-white" : "text-[#1f384c]"}`}>{user.name}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center">
                    <p className={`text-sm ${user.id === 1 ? "text-blue-200" : "text-gray-600"}`}>
                      Ficha: {user.ficha}
                    </p>
                    <span className={`hidden sm:inline mx-1 ${user.id === 1 ? "text-blue-200" : "text-gray-400"}`}>
                      •
                    </span>
                    <p className={`text-sm ${user.id === 1 ? "text-blue-200" : "text-gray-600"}`}>{user.programa}</p>
                  </div>
                </div>
                <div className={`font-semibold flex items-center ${user.id === 1 ? "text-white" : "text-[#1f384c]"}`}>
                  {user.id <= 3 && (
                    <span className="mr-2">
                      {user.id === 1 && <Crown className="w-5 h-5 text-yellow-300" />}
                      {user.id === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                      {user.id === 3 && <Medal className="w-5 h-5 text-amber-600" />}
                    </span>
                  )}
                  {user.points} Puntos
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 border rounded-lg bg-gray-50">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No se encontraron resultados con los filtros seleccionados</p>
              <button onClick={clearFilters} className="mt-2 text-[#1f384c] hover:underline">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-6">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-md ${currentPage === 1 ? "text-gray-400" : "text-[#1f384c] hover:bg-gray-100"}`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex mx-2">
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => (typeof page === "number" ? goToPage(page) : null)}
                  className={`w-8 h-8 mx-1 rounded-md ${
                    page === currentPage
                      ? "bg-[#1f384c] text-white"
                      : page === "..."
                        ? "text-gray-600 cursor-default"
                        : "text-[#1f384c] hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-md ${
                currentPage === totalPages ? "text-gray-400" : "text-[#1f384c] hover:bg-gray-100"
              }`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Ranking
