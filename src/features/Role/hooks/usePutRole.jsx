"use client"

import { useState } from "react"

export function usePutRole() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const putRole = async (id, updatedRole) => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("wordzy_token")
      const response = await fetch(`http://localhost:3000/api/role/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedRole),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.message) {
          throw new Error(data.message)
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
      console.log("Rol actualizado exitosamente:", data)
      return data
    } catch (err) {
      console.error("Error en putRole:", err)
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { putRole, loading, error }
}
