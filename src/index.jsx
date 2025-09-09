import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./shared/styles/index.css"
import { AuthProvider } from "@/shared/contexts/AuthContext"
import { RoleProvider } from "./shared/contexts/RoleContext/RoleContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RoleProvider>
        <App />
      </RoleProvider>
    </AuthProvider>
  </React.StrictMode>,
)

