import {
  checkExternalApiConnectivity,
  checkLocalApiConnectivity,
  fetchAllExternalApprentices,
  validateTransformedApprentice,
} from "./externalApiService"

// Configuración de API
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api"

/**
 * Verifica la conectividad con ambas APIs
 */
export const checkApiConnectivity = async () => {
  try {
    console.log("🔍 Verificando conectividad con APIs...")

    const [externalResult, localResult] = await Promise.all([
      checkExternalApiConnectivity(),
      checkLocalApiConnectivity(),
    ])

    const result = {
      external: externalResult.success,
      local: localResult.success,
      errors: [],
    }

    if (!externalResult.success) {
      result.errors.push(`API externa: ${externalResult.message}`)
    }

    if (!localResult.success) {
      result.errors.push(`API local: ${localResult.message}`)
    }

    console.log("📡 Resultado de conectividad:", result)
    return result
  } catch (error) {
    console.error("❌ Error verificando conectividad:", error)
    return {
      external: false,
      local: false,
      errors: [error.message],
    }
  }
}

/**
 * Obtiene un aprendiz existente por documento
 */
const getExistingApprenticeByDocument = async (documento) => {
  try {
    const response = await fetch(`${API_URL}/user?tipoUsuario=aprendiz`)

    if (!response.ok) {
      return null
    }

    const apprentices = await response.json()
    return apprentices.find((apprentice) => apprentice.documento === documento) || null
  } catch (error) {
    console.error(`❌ Error buscando aprendiz con documento ${documento}:`, error)
    return null
  }
}

/**
 * Crea un nuevo aprendiz en la base de datos local
 */
const createLocalApprentice = async (apprenticeData) => {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apprenticeData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`❌ Error creando aprendiz ${apprenticeData.documento}:`, error)
    throw error
  }
}

/**
 * Actualiza un aprendiz existente en la base de datos local
 */
const updateLocalApprentice = async (apprenticeId, apprenticeData) => {
  try {
    const response = await fetch(`${API_URL}/user/${apprenticeId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apprenticeData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`❌ Error actualizando aprendiz ${apprenticeId}:`, error)
    throw error
  }
}

/**
 * Compara dos aprendices para detectar cambios significativos
 */
const hasSignificantChanges = (existing, incoming) => {
  const fieldsToCompare = [
    "nombre",
    "apellido",
    "telefono",
    "correo",
    "estado",
    "nivel",
    "programa", // IMPORTANTE: Incluir programa en la comparación
    "progresoActual",
  ]

  const changes = []

  for (const field of fieldsToCompare) {
    const existingValue = existing[field]
    const incomingValue = incoming[field]

    if (existingValue !== incomingValue) {
      changes.push({
        field,
        from: existingValue,
        to: incomingValue,
      })
    }
  }

  // Comparar fichas (arrays)
  const existingFichas = Array.isArray(existing.ficha) ? existing.ficha : [existing.ficha]
  const incomingFichas = Array.isArray(incoming.ficha) ? incoming.ficha : [incoming.ficha]

  if (JSON.stringify(existingFichas.sort()) !== JSON.stringify(incomingFichas.sort())) {
    changes.push({
      field: "ficha",
      from: existingFichas,
      to: incomingFichas,
    })
  }

  return {
    hasChanges: changes.length > 0,
    changes,
  }
}

/**
 * Procesa la actualización masiva de aprendices
 */
export const processMassiveUpdate = async (onProgress = null) => {
  try {
    console.log("=== 🚀 INICIANDO ACTUALIZACIÓN MASIVA DE APRENDICES ===")

    const results = {
      total: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
      details: [],
    }

    // 1. Verificar conectividad
    if (onProgress) {
      onProgress({
        phase: "connectivity",
        message: "Verificando conectividad con APIs...",
        percentage: 5,
        details: "",
      })
    }

    const connectivity = await checkApiConnectivity()
    if (!connectivity.external || !connectivity.local) {
      throw new Error(`Error de conectividad: ${connectivity.errors.join(", ")}`)
    }

    // 2. Obtener datos de la API externa
    if (onProgress) {
      onProgress({
        phase: "download",
        message: "Descargando datos de la API externa...",
        percentage: 10,
        details: "",
      })
    }

    const externalApprentices = await fetchAllExternalApprentices((progress) => {
      if (onProgress) {
        onProgress({
          phase: "download",
          message: progress.message,
          percentage: 10 + progress.percentage * 0.4, // 10% a 50%
          details: `${progress.apprenticesCount} aprendices descargados`,
        })
      }
    })

    results.total = externalApprentices.length
    console.log(`📊 Total de aprendices externos obtenidos: ${results.total}`)

    if (results.total === 0) {
      throw new Error("No se obtuvieron aprendices de la API externa")
    }

    // 3. Procesar cada aprendiz
    if (onProgress) {
      onProgress({
        phase: "sync",
        message: "Procesando aprendices...",
        percentage: 50,
        details: "",
      })
    }

    for (let i = 0; i < externalApprentices.length; i++) {
      const externalApprentice = externalApprentices[i]

      try {
        // Validar datos del aprendiz
        const validation = validateTransformedApprentice(externalApprentice)
        if (!validation.isValid) {
          console.warn(`⚠️ Aprendiz ${externalApprentice.documento} tiene errores:`, validation.errors)
          results.errors++
          results.details.push({
            documento: externalApprentice.documento,
            action: "error",
            message: `Datos inválidos: ${validation.errors.join(", ")}`,
          })
          continue
        }

        // Buscar si el aprendiz ya existe
        const existingApprentice = await getExistingApprenticeByDocument(externalApprentice.documento)

        if (existingApprentice) {
          // Verificar si hay cambios significativos
          const changeAnalysis = hasSignificantChanges(existingApprentice, externalApprentice)

          if (changeAnalysis.hasChanges) {
            console.log(`🔄 Actualizando aprendiz ${externalApprentice.documento}:`)
            changeAnalysis.changes.forEach((change) => {
              if (change.field === "programa") {
                console.log(`  📚 Programa: "${change.from}" → "${change.to}"`)
              } else {
                console.log(`  📝 ${change.field}: "${change.from}" → "${change.to}"`)
              }
            })

            await updateLocalApprentice(existingApprentice._id, externalApprentice)
            results.updated++
            results.details.push({
              documento: externalApprentice.documento,
              action: "updated",
              changes: changeAnalysis.changes,
            })
          } else {
            console.log(`✅ Aprendiz ${externalApprentice.documento} sin cambios`)
            results.skipped++
            results.details.push({
              documento: externalApprentice.documento,
              action: "skipped",
              message: "Sin cambios",
            })
          }
        } else {
          // Crear nuevo aprendiz
          console.log(`➕ Creando nuevo aprendiz: ${externalApprentice.documento}`)
          await createLocalApprentice(externalApprentice)
          results.created++
          results.details.push({
            documento: externalApprentice.documento,
            action: "created",
            programa: externalApprentice.programa,
          })
        }
      } catch (error) {
        console.error(`❌ Error procesando aprendiz ${externalApprentice.documento}:`, error)
        results.errors++
        results.details.push({
          documento: externalApprentice.documento,
          action: "error",
          message: error.message,
        })
      }

      // Reportar progreso
      if (onProgress && (i + 1) % 10 === 0) {
        const percentage = 50 + ((i + 1) / externalApprentices.length) * 50
        onProgress({
          phase: "sync",
          message: `Procesando aprendices... ${i + 1}/${externalApprentices.length}`,
          percentage,
          details: `Creados: ${results.created} | Actualizados: ${results.updated} | Errores: ${results.errors}`,
        })
      }
    }

    // 4. Finalizar
    if (onProgress) {
      onProgress({
        phase: "completed",
        message: "Actualización masiva completada",
        percentage: 100,
        details: `Total: ${results.total} | Creados: ${results.created} | Actualizados: ${results.updated} | Sin cambios: ${results.skipped} | Errores: ${results.errors}`,
      })
    }

    console.log("=== ✅ ACTUALIZACIÓN MASIVA COMPLETADA ===")
    console.log(`📊 Resultados finales:`)
    console.log(`  📈 Total procesados: ${results.total}`)
    console.log(`  ➕ Creados: ${results.created}`)
    console.log(`  🔄 Actualizados: ${results.updated}`)
    console.log(`  ⏭️ Sin cambios: ${results.skipped}`)
    console.log(`  ❌ Errores: ${results.errors}`)

    return results
  } catch (error) {
    console.error("❌ Error en actualización masiva:", error)

    if (onProgress) {
      onProgress({
        phase: "error",
        message: `Error: ${error.message}`,
        percentage: 0,
        details: "",
      })
    }

    throw error
  }
}
