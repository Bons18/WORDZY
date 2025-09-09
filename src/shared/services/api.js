// // // import axios from "axios"

// // // // Configuración base de axios
// // // const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// // // const api = axios.create({
// // //   baseURL: API_BASE_URL,
// // //   headers: {
// // //     "Content-Type": "application/json",
// // //   },
// // // })

// // // // Interceptor para agregar el token de autenticación
// // // api.interceptors.request.use(
// // //   (config) => {
// // //     const token = localStorage.getItem("token")
// // //     if (token) {
// // //       config.headers.Authorization = `Bearer ${token}`
// // //     }
// // //     return config
// // //   },
// // //   (error) => {
// // //     return Promise.reject(error)
// // //   },
// // // )

// // // // Interceptor para manejar respuestas y errores
// // // api.interceptors.response.use(
// // //   (response) => {
// // //     return response.data
// // //   },
// // //   (error) => {
// // //     if (error.response?.status === 401) {
// // //       // Token expirado o inválido
// // //       localStorage.removeItem("token")
// // //       localStorage.removeItem("user")
// // //       window.location.href = "/login"
// // //     }
// // //     return Promise.reject(error.response?.data || error.message)
// // //   },
// // // )

// // // export default api
// // import axios from "axios"

// // const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

// // // Crear instancia de axios
// // const api = axios.create({
// //   baseURL: API_BASE_URL,
// //   timeout: 10000,
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // })

// // // Interceptor para requests
// // api.interceptors.request.use(
// //   (config) => {
// //     // Aquí puedes añadir tokens de autenticación si los necesitas
// //     const token = localStorage.getItem("authToken")
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`
// //     }
// //     return config
// //   },
// //   (error) => {
// //     return Promise.reject(error)
// //   },
// // )

// // // Interceptor para responses
// // api.interceptors.response.use(
// //   (response) => {
// //     return response
// //   },
// //   (error) => {
// //     // Manejo global de errores
// //     if (error.response?.status === 401) {
// //       // Token expirado o no válido
// //       localStorage.removeItem("authToken")
// //       window.location.href = "/login"
// //     }
// //     return Promise.reject(error)
// //   },
// // )

// // export default api

// import axios from "axios"

// // Configuración base de la API
// const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// // Crear instancia de axios
// const api = axios.create({
//   baseURL: API_BASE_URL,
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// })

// // Interceptor para requests - agregar token de autenticación
// api.interceptors.request.use(
//   (config) => {
//     // Obtener token del localStorage
//     const user = localStorage.getItem("user")
//     if (user) {
//       try {
//         const userData = JSON.parse(user)
//         if (userData.token) {
//           config.headers.Authorization = `Bearer ${userData.token}`
//         }
//       } catch (error) {
//         console.error("Error parsing user data:", error)
//         // Si hay error parseando, limpiar localStorage
//         localStorage.removeItem("user")
//       }
//     }

//     console.log("API Request:", config.method?.toUpperCase(), config.url)
//     return config
//   },
//   (error) => {
//     console.error("Request interceptor error:", error)
//     return Promise.reject(error)
//   },
// )

// // Interceptor para responses - manejar errores de autenticación
// api.interceptors.response.use(
//   (response) => {
//     console.log("API Response:", response.status, response.config.url)
//     return response
//   },
//   (error) => {
//     console.error("API Error:", error.response?.status, error.response?.data)

//     // Si es error 401 (no autorizado), limpiar sesión y redirigir
//     if (error.response?.status === 401) {
//       console.log("Token inválido o expirado, limpiando sesión...")
//       localStorage.removeItem("user")

//       // Solo redirigir si no estamos ya en login
//       if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
//         window.location.href = "/login"
//       }
//     }

//     return Promise.reject(error)
//   },
// )

// export default api
import axios from "axios"

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

// API Key que usa tu servidor
const API_KEY = "sara_d32775a2ea8a39a3.a14bb968e21a6be6821d19f2764945338ba182b972aff43732b0c7c8314d343a"

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY, // Agregar la API key por defecto
  },
})

// Interceptor para requests
api.interceptors.request.use(
  (config) => {
    // Asegurar que siempre se envíe la API key
    config.headers["x-api-key"] = API_KEY

    // Obtener token del localStorage (usando wordzy_token)
    const token = localStorage.getItem("wordzy_token")

    console.log("🔍 Checking localStorage token:", token ? "Found" : "Not found")

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log("🔑 Token added to request:", `Bearer ${token.substring(0, 20)}...`)
    } else {
      console.warn("⚠️ No token found in localStorage")
    }

    console.log("📤 API Request:", config.method?.toUpperCase(), config.url)
    console.log("🔑 API Key:", API_KEY.substring(0, 20) + "...")
    console.log("📋 Request headers:", config.headers)

    return config
  },
  (error) => {
    console.error("❌ Request interceptor error:", error)
    return Promise.reject(error)
  },
)

// Interceptor para responses
api.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url)
    return response
  },
  (error) => {
    console.error("❌ API Error:", error.response?.status, error.response?.data)

    // Manejo de errores específicos
    if (error.response?.status === 401) {
      console.log("🚫 Token inválido o expirado, limpiando sesión...")
      localStorage.removeItem("user")
      localStorage.removeItem("wordzy_token")
      localStorage.removeItem("wordzy_user")

      // Solo redirigir si no estamos ya en login
      if (window.location.pathname !== "/login" && window.location.pathname !== "/") {
        // Redirigir sin mostrar alert
        window.location.href = "/login"
      }
    }

    if (error.response?.status === 403) {
      console.log("🚫 Acceso prohibido - Rol desactivado o sin permisos")
      
      // Verificar si el error es por rol desactivado
      const errorMessage = error.response?.data?.message || ""
      if (errorMessage.includes("rol") && errorMessage.includes("desactivado")) {
        localStorage.removeItem("user")
        localStorage.removeItem("wordzy_token")
        localStorage.removeItem("wordzy_user")
        
        // Redirigir sin mostrar alert
        window.location.href = "/login"
      } else {
        // Otros errores 403 (sin permisos específicos)
        console.warn("⚠️ Sin permisos para realizar esta acción")
      }
    }

    return Promise.reject(error)
  },
)

export default api
