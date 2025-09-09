"use client"

import { useState, useEffect } from "react"
import { useGetCourseProgrammings } from "../../CourseProgramming/hooks/useGetCoursePrograming"

export function useGetProgrammingByProgramName(programName) {
  const { programmings, loading: programmingsLoading, error: programmingsError } = useGetCourseProgrammings()
  const [programming, setProgramming] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!programmingsLoading && programmings.length > 0 && programName) {
      try {
        // Buscar la programación que corresponde al programa por nombre
        const foundProgramming = programmings.find((prog) => {
          const progName = prog.programId?.name || prog.programId?.abbreviation
          return progName === programName
        })

        setProgramming(foundProgramming || null)
        setError(foundProgramming ? null : `No se encontró programación para el programa: ${programName}`)
      } catch (err) {
        console.error("❌ Error al buscar programación del programa:", err)
        setError("Error al buscar programación del programa")
      }
    }

    setLoading(programmingsLoading)
  }, [programmings, programmingsLoading, programName])

  useEffect(() => {
    if (programmingsError) {
      setError(programmingsError)
    }
  }, [programmingsError])

  return {
    programming,
    loading,
    error,
  }
}
