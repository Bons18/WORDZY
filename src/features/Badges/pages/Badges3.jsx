import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { X } from "lucide-react"
import BadgeHeader from "../components/BadgeHeader"
import BadgeCard from "../components/BadgeCard"
import { useBadges, useUserBadges } from "../hooks/useBadges"

const Ranking = () => {
  const navigate = useNavigate()
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [selectedUserId, setSelectedUserId] = useState(null)
  
  const { badges, loading } = useBadges()
  const { userBadges, assignBadgeToUser } = useUserBadges(selectedUserId)

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message)
    setShowSuccessAlert(true)
    setTimeout(() => setShowSuccessAlert(false), 3000)
  }

  // Handle badge assignment
  const handleAssignBadge = async (badgeId) => {
    if (!selectedUserId) {
      showSuccess("Por favor seleccione un usuario primero")
      return
    }
    
    try {
      await assignBadgeToUser(badgeId)
      showSuccess("Insignia asignada exitosamente")
    } catch (error) {
      console.error("Error assigning badge:", error)
    }
  }



  return (
    <div className="min-h-screen bg-white">
      <BadgeHeader title="Ranking de Insignias" />

      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">


        {/* User Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar Usuario (opcional)
          </label>
          <select
            value={selectedUserId || ""}
            onChange={(e) => setSelectedUserId(e.target.value || null)}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los usuarios</option>
            <option value="user1">Usuario 1</option>
            <option value="user2">Usuario 2</option>
            <option value="user3">Usuario 3</option>
          </select>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => (
            <div key={badge.id} className="relative">
              <BadgeCard
                badge={badge}
                showActions={false}
              />
              <div className="absolute bottom-4 right-4">
                <button
                  onClick={() => handleAssignBadge(badge.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Asignar
                </button>
              </div>
            </div>
          ))}
        </div>

        {badges.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-[#627b87] text-lg">No hay insignias disponibles</p>
            <button
              onClick={() => navigate("/programacion/insigneas")}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear primera insignia
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <p className="text-[#627b87] text-lg">Cargando insignias...</p>
          </div>
        )}
      </div>

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between">
            <span>{successMessage}</span>
            <button
              onClick={() => setShowSuccessAlert(false)}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Ranking

