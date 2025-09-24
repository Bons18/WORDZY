"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Navbar from "./shared/components/Navbar"
import routes from "./routes"
import { useAuth } from "./features/auth/hooks/useAuth"
import { Navigate } from "react-router-dom"
import { getDefaultRouteByRole } from "./shared/utils/rolePermissions"

function App() {
  const { isAuthenticated, user } = useAuth()

  return (
    <Router>
      <div className="flex h-screen overflow-hidden">
        {isAuthenticated && <Navbar />}
        <div className={`flex-1 overflow-auto ${!isAuthenticated ? "w-full" : "lg:ml-0"}`}>
          <div className="container mx-auto p-4 lg:p-6">
            <Routes>
              {routes.map((route, index) => (
                <Route
                  key={index}
                  path={route.path}
                  element={
                    route.path === "/" || route.path === "/login" ? (
                      isAuthenticated ? (
                        <Navigate to={getDefaultRouteByRole(user?.role)} />
                      ) : (
                        route.element
                      )
                    ) : route.path === "/recover-password" ? (
                      route.element
                    ) : isAuthenticated ? (
                      route.element
                    ) : (
                      <Navigate to="/login" />
                    )
                  }
                />
              ))}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
