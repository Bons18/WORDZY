"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { useAuth } from "../../auth/hooks/useAuth"
import { getRoleDisplayName, getUserRole } from "../../../shared/utils/roleDisplay"
import { useNavigate } from "react-router-dom"
import ConfirmationModal from "../../../shared/components/ConfirmationModal"

// Hooks actualizados con API
import { useFichaSearchAPI } from "../hooks/useFichaSearchAPI"
import { useRecentFichas } from "../hooks/useRecentFichas"
import { useLevelManagementAPI } from "../hooks/useLevelManagementAPI"

// Componentes
import SearchView from "../components/SearchView"
import LevelsView from "../components/LevelsView"

const LevelAssignmentPage = () => {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const dropdownRef = useRef(null)

  // Estados locales
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [currentView, setCurrentView] = useState("search")
  const [selectedFicha, setSelectedFicha] = useState(null)

  // Estados para modales
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const [showChangeConfirm, setShowChangeConfirm] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [pendingFichaChange, setPendingFichaChange] = useState(null)

  // Hooks personalizados actualizados
  const {
    searchTerm,
    searchResults,
    showSearchResults,
    isLoading: isSearchLoading,
    error: searchError,
    handleSearchInputChange,
    clearSearch,
    setShowSearchResults,
  } = useFichaSearchAPI()

  const { recentFichas, addRecentFicha, clearRecentFichas } = useRecentFichas()

  const {
    currentLevelStates,
    tempLevelStates,
    hasChanges,
    isSaving,
    isLoading: isLevelsLoading,
    error: levelsError,
    fichaInfo,
    handleLevelToggle,
    handleQuickAction,
    saveLevels,
    resetChanges,
  } = useLevelManagementAPI(selectedFicha)

  // Effect para cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Handlers
  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const handleSelectFicha = (ficha) => {
    // Si hay cambios sin guardar, mostrar confirmación
    if (hasChanges) {
      setPendingFichaChange(ficha)
      setShowChangeConfirm(true)
      return
    }

    proceedWithFichaChange(ficha)
  }

  const proceedWithFichaChange = (ficha) => {
    setSelectedFicha(ficha)
    setCurrentView("levels")
    clearSearch()
    addRecentFicha(ficha)
  }

  const handleSaveChanges = () => {
    setShowSaveConfirm(true)
  }

  const confirmSaveChanges = async () => {
    const result = await saveLevels()
    setShowSaveConfirm(false)
    setSuccessMessage(result.message)
    setShowSuccessModal(true)
  }

  const handleChangeFicha = () => {
    if (hasChanges) {
      setShowChangeConfirm(true)
      return
    }
    proceedWithViewChange()
  }

  const proceedWithViewChange = () => {
    setCurrentView("search")
    setSelectedFicha(null)
    clearSearch()
    resetChanges()
  }

  const confirmChangeWithoutSaving = () => {
    if (pendingFichaChange) {
      proceedWithFichaChange(pendingFichaChange)
      setPendingFichaChange(null)
    } else {
      proceedWithViewChange()
    }
    setShowChangeConfirm(false)
  }

  // Render del header
  const renderHeader = () => (
    <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1f384c]">Asignación de Niveles</h1>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            <div className="text-right">
              <div className="text-sm font-medium">{user?.nombre} {user?.apellido}</div>
              <div className="text-xs text-gray-600">{getRoleDisplayName(getUserRole(user))}</div>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
              <button
                onClick={handleLogoutClick}
                className="w-full text-left px-4 py-2 text-[#f44144] hover:bg-gray-50 rounded-lg"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )

  // Render principal
  return (
    <>
      {renderHeader()}

      {/* Mostrar errores de búsqueda */}
      {searchError && (
        <div className="max-w-6xl mx-auto mb-4 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">Error en búsqueda: {searchError}</p>
          </div>
        </div>
      )}

      {currentView === "search" && (
        <SearchView
          searchTerm={searchTerm}
          searchResults={searchResults}
          showSearchResults={showSearchResults}
          isSearchLoading={isSearchLoading}
          recentFichas={recentFichas}
          onSearchChange={handleSearchInputChange}
          onSelectFicha={handleSelectFicha}
          onClearRecentFichas={clearRecentFichas}
          setShowSearchResults={setShowSearchResults}
        />
      )}

      {currentView === "levels" && selectedFicha && (
        <>
          {/* Mostrar errores de niveles */}
          {levelsError && (
            <div className="max-w-6xl mx-auto mb-4 px-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm">Error en niveles: {levelsError}</p>
              </div>
            </div>
          )}

          {isLevelsLoading ? (
            <div className="max-w-6xl mx-auto px-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-3"></div>
                  <p className="text-gray-600">Cargando niveles...</p>
                </div>
              </div>
            </div>
          ) : (
            <LevelsView
              selectedFicha={selectedFicha}
              currentLevelStates={currentLevelStates}
              tempLevelStates={tempLevelStates}
              hasChanges={hasChanges}
              onLevelToggle={handleLevelToggle}
              onQuickAction={handleQuickAction}
              onSaveChanges={handleSaveChanges}
              onChangeFicha={handleChangeFicha}
              isSaving={isSaving}
              fichaInfo={fichaInfo}
            />
          )}
        </>
      )}

      {/* Modales */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Cerrar Sesión"
        message="¿Está seguro de que desea cerrar la sesión actual?"
        confirmText="Cerrar Sesión"
        confirmColor="bg-[#f44144] hover:bg-red-600"
      />

      <ConfirmationModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={confirmSaveChanges}
        title="Confirmar Cambios"
        message={`¿Estás seguro que deseas guardar los cambios de niveles para la ficha ${selectedFicha?.codigo}?`}
        confirmText={isSaving ? "Guardando..." : "Guardar"}
        confirmColor="bg-green-500 hover:bg-green-600"
        isLoading={isSaving}
      />

      <ConfirmationModal
        isOpen={showChangeConfirm}
        onClose={() => {
          setShowChangeConfirm(false)
          setPendingFichaChange(null)
        }}
        onConfirm={confirmChangeWithoutSaving}
        title="Cambios sin Guardar"
        message="Tienes cambios sin guardar. ¿Deseas continuar sin guardar los cambios?"
        confirmText="Continuar sin Guardar"
        confirmColor="bg-red-500 hover:bg-red-600"
      />

      <ConfirmationModal
        isOpen={showSuccessModal}
        onConfirm={() => setShowSuccessModal(false)}
        title={successMessage.includes("Error") ? "Error" : "Operación Exitosa"}
        message={successMessage}
        confirmText="Aceptar"
        confirmColor={
          successMessage.includes("Error") ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
        }
        showButtonCancel={false}
      />
    </>
  )
}

export default LevelAssignmentPage
