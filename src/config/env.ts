import { defineConfig, loadEnv } from 'vite'

/**
 * Función para cargar variables de entorno según el modo
 * @param {string} mode - Modo de ejecución (development, production, etc.)
 * @returns {Record<string, string>} Variables de entorno procesadas
 */
function loadEnvironmentVariables(mode) {
  // Cargar variables de entorno desde los archivos .env
  const env = loadEnv(mode, process.cwd(), '')
  
  // Define las variables predeterminadas si no existen
  const defaults = {
    BACKEND_API_URL: 'http://localhost:3000',
  }
  
  // Combinar con las variables de entorno cargadas
  return {
    ...defaults,
    ...env,
  }
}

/**
 * Archivo de configuración para variables de entorno y modos del entorno
 */
export default {
  development: {
    API_URL: 'http://localhost:3000'
  },
  staging: {
    API_URL: 'https://api-staging.billow-flow.com'
  },
  production: {
    API_URL: 'https://api.billow-flow.com'
  }
}
