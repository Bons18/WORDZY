import { useState } from "react"

export function usePostRole() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const postRole = async (newRole) => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("wordzy_token")
      const response = await fetch("http://localhost:3000/api/role", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRole),
      })

      const data = await response.json()

      // CAMBIO: Verificar si el rol se creó exitosamente
      // Incluso si el status no es exactamente 200/201
      if (!response.ok) {
        // Si hay un mensaje de error específico, usarlo
        if (data.message) {
          throw new Error(data.message)
        }
        // Si no hay mensaje específico pero hay error
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      return data // devuelve el rol creado
    } catch (err) {
      console.error("Error en postRole:", err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { postRole, loading, error }
}
