import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { getRoleDisplayName, getUserRole } from '../../../shared/utils/roleDisplay'
import ConfirmationModal from '../../../shared/components/ConfirmationModal'

const StudentDetails = () => {
  // Existing state and variables remain the same
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams()
  const dropdownRef = useRef(null)
  
  // Sample student data
  const studentData = {
    id: id,
    nombre: 'TO-DO',
    estado: 'Aprobado',
    calificacion: '90%'
  }
  
  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogoutClick = () => {
    setIsDropdownOpen(false)
    setShowLogoutConfirm(true)
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }
  
  const handleGoBack = () => {
    navigate(-1) // Go back to previous page
  }
  
  return (
    <div className="min-h-screen">
      <header className="bg-white py-4 px-6 border-b border-[#d6dade] mb-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleGoBack}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5 text-[#1f384c]" />
            </button>
            <h1 className="text-xl font-bold text-[#1f384c]">Detalle del Aprendiz</h1>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 text-[#1f384c] hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
            >
              <div className="text-right">
                <div className="text-sm font-medium">{user?.name}</div>
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
      
      <div className="container mx-auto px-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-medium">{studentData.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Estado</p>
              <p className="font-medium">
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                  studentData.estado === 'Aprobado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {studentData.estado}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Calificación</p>
              <p className="font-medium">{studentData.calificacion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para cerrar sesión */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Cerrar Sesión"
        message="¿Está seguro de que desea cerrar la sesión actual?"
        confirmButtonText="Cerrar Sesión"
        confirmButtonClass="bg-[#f44144] hover:bg-red-600"
      />
    </div>
  )
}

export default StudentDetails