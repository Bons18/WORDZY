// hooks/useGetCourseProgrammingById.js
import { useEffect, useState, useCallback } from "react"

export function useGetCourseProgrammingById(id) {
  const [programming, setProgramming] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProgramming = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3000/api/course-programming/${id}`)
      const data = await response.json()

      if (!response.ok) throw new Error(data.message || "Error al obtener la programación")
      setProgramming(data)
    } catch (err) {
      setError(err.message || "Error desconocido al obtener la programación")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProgramming()
  }, [fetchProgramming])

  return { programming, loading, error, refetch: fetchProgramming }
}
