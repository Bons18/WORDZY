import { createContext } from "react"
import { useGetRoles } from "../../../features/Role/hooks/useGetRoles"
import { usePostRole } from "../../../features/Role/hooks/usePostRole"
import { usePutRole } from "../../../features/Role/hooks/usePutRole"

export const RoleContext = createContext()

export const RoleProvider = ({ children }) => {
  const { roles, refetch, loading, error} = useGetRoles()
  const { postRole } = usePostRole()
  const { putRole } = usePutRole()

  const addRole = async (newRole) => {
    try {
      const result = await postRole(newRole)
      await refetch() // Actualizar la lista después de crear
      return result
    } catch (error) {
      throw error
    }
  }

  const updateRole = async (roleData) => {
    try {
      // Extraer el ID del rol
      const roleId = roleData._id || roleData.id
      if (!roleId) {
        throw new Error("ID del rol no encontrado")
      }

      // Preparar los datos sin el ID para el body
      const { _id, id, creationDate, __v, ...dataToUpdate } = roleData

      const result = await putRole(roleId, dataToUpdate)
      await refetch() // Actualizar la lista después de editar
      return result
    } catch (error) {
      throw error
    }
  }

  return (
    <RoleContext.Provider
      value={{
        roles,
        refetch,
        addRole,
        updateRole,
        loading,
        error
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}
