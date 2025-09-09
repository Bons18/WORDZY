import { programService } from "./programService"

// Verificar conectividad con las APIs
export const checkApiConnectivity = async () => {
  try {
    const result = await programService.checkConnectivity()
    return result
  } catch (error) {
    console.error("Error verificando conectividad:", error)
    return {
      external: false,
      local: false,
      errors: [error.message],
    }
  }
}

// Procesar actualización masiva de programas
export const processMassiveUpdate = async (onProgress) => {
  try {
    // Fase 1: Verificar conectividad
    onProgress({
      phase: "starting",
      message: "Verificando conectividad...",
      percentage: 5,
      details: "Comprobando conexión con APIs",
    })

    const connectivity = await checkApiConnectivity()
    if (!connectivity.external || !connectivity.local) {
      throw new Error("Error de conectividad con las APIs")
    }

    // Fase 2: Descargar datos
    onProgress({
      phase: "download",
      message: "Descargando programas desde API externa...",
      percentage: 20,
      details: "Obteniendo datos de programas",
    })

    // Obtener información inicial para mostrar progreso
    const initialResponse = await programService.getExternal(1, 1)
    const totalPrograms = initialResponse.pagination?.totalItems || 0

    onProgress({
      phase: "download",
      message: "Descargando programas desde API externa...",
      percentage: 30,
      details: `Encontrados ${totalPrograms} programas para sincronizar`,
    })

    // Simular progreso de descarga
    for (let i = 35; i <= 50; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 200))
      onProgress({
        phase: "download",
        message: "Descargando programas desde API externa...",
        percentage: i,
        details: `Procesando datos... ${i}%`,
      })
    }

    // Fase 3: Sincronizar
    onProgress({
      phase: "sync",
      message: "Sincronizando con base de datos local...",
      percentage: 60,
      details: "Iniciando sincronización",
    })

    // Realizar la sincronización
    const syncResult = await programService.syncMassive()

    // Simular progreso de sincronización
    for (let i = 70; i <= 95; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      onProgress({
        phase: "sync",
        message: "Sincronizando con base de datos local...",
        percentage: i,
        details: "Procesando programas...",
      })
    }

    // Fase 4: Completado
    onProgress({
      phase: "completed",
      message: "Sincronización completada exitosamente",
      percentage: 100,
      details: `Total: ${syncResult.summary.total}, Creados: ${syncResult.summary.created}, Actualizados: ${syncResult.summary.updated}, Sin cambios: ${syncResult.summary.skipped}, Errores: ${syncResult.summary.errors}`,
    })

    return syncResult
  } catch (error) {
    console.error("Error en procesamiento masivo:", error)
    onProgress({
      phase: "error",
      message: `Error: ${error.message}`,
      percentage: 0,
      details: "La sincronización ha fallado",
    })
    throw error
  }
}
