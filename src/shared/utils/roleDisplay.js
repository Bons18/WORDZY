// Utility functions for displaying user roles
export const ROLE_DISPLAY_NAMES = {
  administrador: "Administrador",
  instructor: "Instructor",
  aprendiz: "Aprendiz",
}

// Function to get user-friendly role display name
export const getRoleDisplayName = (role) => {
  if (!role) return "Usuario"
  return ROLE_DISPLAY_NAMES[role.toLowerCase()] || role
}

// Function to get role from user object (handles both role and userType properties)
export const getUserRole = (user) => {
  if (!user) return null
  return user.userType || user.role || null
}
