"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { getDefaultRouteByRole } from "../../../shared/utils/rolePermissions"
import LoginForm from "../components/LoginForm"
import logo from "../../../assets/logo.png"

const LoginPage = () => {
  const [isSuccess, setIsSuccess] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLoginSuccess = (userData) => {
    setIsSuccess(true)

    // Obtener la ruta por defecto según el rol
    const defaultRoute = getDefaultRouteByRole(userData.role)

    // Show success alert with improved styling and animation
    const alert = document.createElement("div")
    alert.className =
      "fixed top-4 right-4 left-4 md:left-auto md:w-96 bg-white border border-green-200 rounded-xl shadow-lg z-50 transform transition-all duration-300 ease-out translate-y-[-100%] opacity-0"
    alert.innerHTML = `
      <div class="flex items-center p-4">
        <div class="flex-shrink-0 bg-green-100 rounded-full p-2">
          <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <div class="ml-4">
          <p class="font-medium text-gray-800">¡Inicio de sesión exitoso!</p>
          <p class="text-sm text-gray-500">Bienvenido ${userData.role}...</p>
        </div>
      </div>
    `
    document.body.appendChild(alert)

    // Trigger animation
    setTimeout(() => {
      alert.style.transform = "translateY(0)"
      alert.style.opacity = "1"
    }, 100)

    // Remove alert and navigate to role-specific route
    setTimeout(() => {
      alert.style.transform = "translateY(-100%)"
      alert.style.opacity = "0"
      setTimeout(() => {
        alert.remove()
        navigate(defaultRoute)
      }, 300)
    }, 2000)
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-16 lg:py-0 items-center lg:items-start bg-white">
        <div className="mb-6 lg:mb-10">
          <img src={logo || "/placeholder.svg"} alt="Wordzy Logo" className="h-40 lg:h-48 w-auto" />
        </div>
        <h1 className="text-2xl lg:text-4xl font-bold mb-4 text-center lg:text-left">
          Bienvenido a<br />
          <span className="text-[#1F384C]">plataforma Wordzy</span>
        </h1>
        <p className="text-[#64748B] text-base lg:text-lg max-w-md text-center lg:text-left">
          Mejora tu inglés con contenido personalizado, seguimiento de avances y retroalimentación para reforzar tus
          habilidades.
        </p>
      </div>

      {/* Right Section - With animation */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-0 bg-gradient-to-br from-gray-30 to-white">
        {!isSuccess ? (
          <div className="w-full max-w-md bg-transparent p-8 rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-gray-100 hover:shadow-[0_25px_60px_rgb(0,0,0,0.12)] transition-all duration-500 backdrop-blur-sm
            animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center mb-8">
               <h2 className="text-xl lg:text-2xl font-bold text-[#1F384C] mb-4">
                 Inicio de Sesión
               </h2>
               <p className="text-gray-600 text-sm mb-2">
                 Ingresa tus credenciales para acceder a la plataforma
               </p>
             </div>
            <LoginForm onLoginSuccess={handleLoginSuccess} login={login} />
          </div>
        ) : (
          <div className="text-center p-4 animate-[fadeIn_0.5s_ease-out] bg-white">
            <img src={logo || "/placeholder.svg"} alt="Wordzy Logo" className="h-16 w-auto mx-auto" />
            <h2 className="mt-6 text-xl lg:text-2xl font-semibold text-green-600">¡Inicio de sesión exitoso!</h2>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginPage
