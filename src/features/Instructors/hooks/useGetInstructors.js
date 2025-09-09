"use client"

import { useState, useEffect } from "react"

const useGetInstructors = () => {
  const [instructors, setInstructors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Datos de ejemplo como fallback
  const fallbackData = [
    {
      id: 1,
      tipoUsuario: "instructor",
      nombre: "Carlos",
      apellido: "Gómez",
      documento: "12345678",
      tipoDocumento: "CC",
      estado: "Activo",
      telefono: "3102568799",
      correo: "carlos.gomez@example.com",
      fichas: [
        {
          id: 1,
          numero: "2889927",
          nivel: 3,
          programa: "Desarrollo de Software",
          fechaInicio: "23/01/2024",
          fechaFin: "30/01/2025",
          estudiantes: [
            {
              nombre: "Manolo",
              apellido: "Bermudez",
              documento: "704.555.0127",
              tipoDocumento: "CC",
              estado: "En formación",
            },
            {
              nombre: "Maria",
              apellido: "Perez",
              documento: "704.555.0127",
              tipoDocumento: "CC",
              estado: "En formación",
            },
          ],
        },
      ],
    },
    {
      id: 2,
      tipoUsuario: "instructor",
      nombre: "Laura",
      apellido: "Martínez",
      documento: "87654321",
      tipoDocumento: "PPT",
      estado: "Inactivo",
      telefono: "3156789012",
      correo: "laura.martinez@example.com",
      fichas: [
        {
          id: 4,
          numero: "2889927",
          nivel: 4,
          programa: "Contabilidad",
          fechaInicio: "05/01/2024",
          fechaFin: "05/01/2025",
          estudiantes: [
            {
              nombre: "Cameron",
              apellido: "Williamson",
              documento: "704.555.0127",
              tipoDocumento: "CC",
              estado: "Condicionado",
            },
          ],
        },
      ],
    },
  ]

  const fetchInstructors = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔍 Obteniendo instructores desde API...")

      // Usar la ruta específica de instructores en puerto 3000
      const response = await fetch("http://localhost:3000/api/instructor")

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("✅ Datos de instructores recibidos:", data)

      // Normalizar datos (convertir _id a id si es necesario)
      const normalizedData = data.map((instructor) => ({
        ...instructor,
        id: instructor._id || instructor.id,
        // Asegurar que los campos específicos de instructor existan
        fichas: instructor.fichas || [],
      }))

      setInstructors(normalizedData)
      console.log(`✅ ${normalizedData.length} instructores cargados exitosamente`)
    } catch (err) {
      console.error("❌ Error al obtener instructores:", err)
      setError(err.message)

      // Usar datos de fallback en caso de error
      console.log("🔄 Usando datos de ejemplo como fallback")
      setInstructors(fallbackData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInstructors()
  }, [])

  const refetch = () => {
    console.log("🔄 Refrescando datos de instructores...")
    fetchInstructors()
  }

  return {
    instructors,
    loading,
    error,
    refetch,
  }
}

export default useGetInstructors
