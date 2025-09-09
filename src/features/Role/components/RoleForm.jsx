import { useState, useEffect, useContext } from "react"
import { RoleContext } from "../../../shared/contexts/RoleContext/RoleContext"
import { normalizeText } from "../../../shared/utils/normalizeText"

const RoleForm = ({ onSubmit, onCancel, initialData }) => {
  const { roles: existingRoles, loading, error: contextError } = useContext(RoleContext)
  const [hasChanges, setHasChanges] = useState(false)
  const [errors, setErrors] = useState({})
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState(true)
  const [allPermissions, setAllPermissions] = useState({})
  const [formError, setFormError] = useState("")
  const [permissionsLoaded, setPermissionsLoaded] = useState(false)
  const [permissionsMap, setPermissionsMap] = useState({}) // Nuevo: mapa de ID -> módulo
  const [selectAll, setSelectAll] = useState({
    ver: false,
    crear: false,
    editar: false,
    eliminar: false,
  })

  // Validar si el nombre ya existe mientras se escribe
  useEffect(() => {
    if (!name) return

    const trimmed = name.trim()
    const normalized = normalizeText(trimmed)

    const exists = existingRoles.some(
      (role) =>
        normalizeText(role.name) === normalized &&
        (!initialData || role._id !== initialData._id)
    )

    if (exists) {
      setErrors(prev => ({ ...prev, name: "El nombre del rol ya existe" }))
    } else if (errors.name === "El nombre del rol ya existe") {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.name
        return newErrors
      })
    }
  }, [name, existingRoles, initialData])

  // Cargar todos los permisos disponibles
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/permission", {
          headers: {
            "Content-Type": "application/json",
          },
        })
        const data = await response.json()

        const permisosObjeto = {}
        const idToModuleMap = {} // Crear mapa de ID -> módulo

        for (const permiso of data) {
          permisosObjeto[permiso.module] = {
            ver: false, // Inicializar en false
            crear: false,
            editar: false,
            eliminar: false,
            _id: permiso._id,
          }
          idToModuleMap[permiso._id] = permiso.module // Mapear ID -> módulo
        }
        setAllPermissions(permisosObjeto)
        setPermissionsMap(idToModuleMap)
        setPermissionsLoaded(true)
      } catch (error) {
        console.error("Error al obtener permisos:", error)
        setFormError("No se pudieron cargar los permisos")
      }
    }

    fetchPermissions()
  }, [])

  // Aplicar datos iniciales cuando todo esté listo
  useEffect(() => {
    if (
      initialData &&
      permissionsLoaded &&
      Object.keys(allPermissions).length > 0 &&
      Object.keys(permissionsMap).length > 0
    ) {

      // Aplicar datos básicos
      setName(initialData.name || "")
      setDescription(initialData.description || "")
      setStatus(initialData.status !== undefined ? initialData.status : true)

      // Aplicar permisos específicos del rol
      if (initialData.permissions && initialData.permissions.length > 0) {

        // Crear una copia de los permisos base
        const permisosActualizados = { ...allPermissions }

        // Aplicar cada permiso del rol
        initialData.permissions.forEach((perm, index) => {

          let moduleName = null

          // Caso 1: El permiso ya tiene el módulo (populate funcionó)
          if (perm.module) {
            moduleName = perm.module
          }
          // Caso 2: Solo tenemos el ID, buscar en el mapa
          else if (perm.permission && permissionsMap[perm.permission]) {
            moduleName = permissionsMap[perm.permission]
          }
          // Caso 3: Buscar por _id si existe
          else if (perm._id && permissionsMap[perm._id]) {
            moduleName = permissionsMap[perm._id]
          }

          if (moduleName && permisosActualizados[moduleName]) {
            console.log(`Aplicando permiso para módulo ${moduleName}:`, {
              ver: perm.canView,
              crear: perm.canCreate,
              editar: perm.canEdit,
              eliminar: perm.canDelete,
            })

            permisosActualizados[moduleName] = {
              ...permisosActualizados[moduleName],
              ver: perm.canView || false,
              crear: perm.canCreate || false,
              editar: perm.canEdit || false,
              eliminar: perm.canDelete || false,
            }
          } else {
            console.warn(`No se pudo encontrar el módulo para el permiso:`, perm)
            console.warn(`moduleName: ${moduleName}, existe en allPermissions: ${!!permisosActualizados[moduleName]}`)
          }
        })
        setAllPermissions(permisosActualizados)
      } else {
        console.log("No hay permisos en initialData o está vacío")
      }

      setHasChanges(false)
    }
  }, [initialData, permissionsLoaded, permissionsMap])

  const toggleStatus = () => {
    setStatus((prevStatus) => !prevStatus)
    setHasChanges(true)
  }

  const handleSelectAllChange = (accion) => {
    const newValue = !selectAll[accion]

    const updatedPermissions = Object.fromEntries(
      Object.entries(allPermissions).map(([modulo, acciones]) => [
        modulo,
        { ...acciones, [accion]: newValue }
      ])
    )

    setAllPermissions(updatedPermissions)
    setSelectAll((prev) => ({ ...prev, [accion]: newValue }))
    setHasChanges(true)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "name") setName(value)
    if (name === "description") setDescription(value)
    setHasChanges(true)
  }

  const handlePermisoChange = (modulo, accion) => {
    setAllPermissions((prev) => {
      const newPermissions = {
        ...prev,
        [modulo]: {
          ...prev[modulo],
          [accion]: !prev[modulo][accion],
        },
      }
      return newPermissions
    })
    setHasChanges(true)
  }

  useEffect(() => {
      const acciones = ["ver", "crear", "editar", "eliminar"]
      const newSelectAll = {}

      for (const accion of acciones) {
        newSelectAll[accion] = Object.values(allPermissions).every((mod) => mod[accion])
      }

      setSelectAll(newSelectAll)
    }, [allPermissions])

  const validarFormulario = () => {
    const errores = {}
    setFormError("")

    if (!name.trim()) {
      errores.name = "El nombre del rol es obligatorio."
    } else if (name.length > 50) {
      errores.name = "El nombre no puede exceder los 50 caracteres."
    } else if (errors.name === "El nombre del rol ya existe") {
      // Asegurarnos de mantener el error de duplicado si existe
      errores.name = errors.name
    }

    // Verificar que al menos un permiso esté seleccionado
    const tienePermisos = Object.values(allPermissions).some(
      (modulo) => modulo.ver || modulo.crear || modulo.editar || modulo.eliminar,
    )

    if (!tienePermisos) {
      errores.allPermissions = "Debe seleccionar al menos un permiso."
    }

    setErrors(errores)
    return Object.keys(errores).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError("")

    if (!validarFormulario()) return

    try {
      // Estructura correcta para el backend
      const permisosParaEnviar = []

      Object.entries(allPermissions).forEach(([modulo, acciones]) => {
        if (acciones.ver || acciones.crear || acciones.editar || acciones.eliminar) {
          permisosParaEnviar.push({
            permissionId: acciones._id,
            canView: acciones.ver || false,
            canCreate: acciones.crear || false,
            canEdit: acciones.editar || false,
            canDelete: acciones.eliminar || false,
          })
        }
      })

      const nuevoRol = {
        name,
        description: description || "",
        status,
        permissions: permisosParaEnviar,
      }
      onSubmit(nuevoRol)
    } catch (error) {
      console.error("Error al preparar el rol:", error)
      setFormError(error.message || "Error al preparar el rol")
    }
  }

  // Mostrar loading mientras se cargan los permisos
  if (!permissionsLoaded) {
    return (
      <div className="p-1">
        <h2 className="text-xl font-bold text-[#1f384c] mb-4">{initialData ? "EDITAR ROL" : "AÑADIR ROL"}</h2>
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Cargando permisos...</div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="p-1">
      <h2 className="text-xl font-bold text-[#1f384c] mb-4">{initialData ? "EDITAR ROL" : "AÑADIR ROL"}</h2>

      {formError && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{formError}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={name}
            onChange={handleChange}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <input
            type="text"
            name="description"
            value={description}
            onChange={handleChange}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {initialData && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={status} onChange={toggleStatus} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A34A]"></div>
                <span className="ml-2 text-sm font-medium text-gray-700">{status ? "Activo" : "Inactivo"}</span>
              </label>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        {errors.allPermissions && <p className="text-red-500 text-xs mb-2">{errors.allPermissions}</p>}
        <div className="overflow-x-auto text-sm">
          <table className="w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-[#1F384C] text-white">
                <th className="px-2 py-2 border border-gray-200 font-medium ">Módulos</th>
                {["ver", "crear", "editar", "eliminar"].map((accion) => (
                  <th key={accion} className="px-2 py-1 border border-gray-200 font-medium">
                    <div className="flex flex-col items-center">
                      <span className="capitalize">{accion}</span>
                      <input
                        type="checkbox"
                        checked={selectAll[accion]}
                        onChange={() => handleSelectAllChange(accion)}
                        className="mt-1 mb-1 cursor-pointer"
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(allPermissions).map(([modulo, acciones]) => (
                <tr key={acciones._id || modulo}>
                  <td className="px-2 py-1 border border-gray-200">
                    {modulo}
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={acciones.ver || false}
                      onChange={() => handlePermisoChange(modulo, "ver")}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={acciones.crear || false}
                      onChange={() => handlePermisoChange(modulo, "crear")}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={acciones.editar || false}
                      onChange={() => handlePermisoChange(modulo, "editar")}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="px-2 py-1 border border-gray-200 text-center">
                    <input
                      type="checkbox"
                      checked={acciones.eliminar || false}
                      onChange={() => handlePermisoChange(modulo, "eliminar")}
                      className="cursor-pointer"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-[10px] hover:bg-red-600 focus:outline-none focus:ring-1 focus:ring-gray-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={!hasChanges || loading || errors.name === "El nombre del rol ya existe"}
          className={`px-3 py-1.5 text-sm text-white rounded-[10px] focus:outline-none focus:ring-1 ${hasChanges && !loading && errors.name !== "El nombre del rol ya existe"
            ? "bg-green-500 hover:bg-green-600 focus:ring-blue-500"
            : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {loading ? "Guardando..." : initialData ? "Guardar Cambios" : "Añadir Rol"}
        </button>
      </div>
    </form>
  )
}

export default RoleForm
