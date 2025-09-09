"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import BadgeHeader from "../components/BadgeHeader"
import BadgeForm from "../components/BadgeForm"
import { useBadges } from "../hooks/useBadges"

const Badges = () => {
  const navigate = useNavigate()
  const { createNewBadge, loading } = useBadges()
  
  // Estado para las alertas de éxito
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleSubmit = async (formData) => {
    const result = await createNewBadge(formData)
    
    if (result.success) {
      setSuccessMessage(result.message || "Insignia creada exitosamente")
      setShowSuccessAlert(true)
      
      // Navegar después de un breve delay
      setTimeout(() => {
        navigate("/programacion/insigneas2")
      }, 1500)
    } else {
      setSuccessMessage(result.error || "Error al crear la insignia")
      setShowSuccessAlert(true)
    }
  }
  
  const handleCancel = () => {
    navigate("/programacion/insigneas2")
  }

  return (
    <div className="max-h-screen">
      <BadgeHeader title="Crear Insignia" />

      <div className="container mx-auto px-6">
        {/* Alerta de éxito */}
        {showSuccessAlert && (
          <div className="mb-4 p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg flex justify-between items-center">
            <span>{successMessage}</span>
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="text-green-700 hover:text-green-900"
            >
              ×
            </button>
          </div>
        )}

        <BadgeForm 
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={loading}
        />
      </div>
    </div>
  )
}

export default Badges

