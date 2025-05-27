import { API_CONFIG } from '@/config/api';

/**
 * Clase para ayudar a construir URLs de API de manera programática
 */
export class ApiUrlBuilder {
  private basePath: string;
  private pathParams: Record<string, string | number> = {};
  private queryParams: Record<string, string | number | boolean | Array<string | number>> = {};
  
  /**
   * Constructor para el ApiUrlBuilder
   * @param basePath - La ruta base de la API, sin los parámetros
   */
  constructor(basePath: string) {
    this.basePath = basePath;
  }
  
  /**
   * Crea una instancia de ApiUrlBuilder a partir de un endpoint predefinido en API_CONFIG
   * @param endpointKey - La clave del endpoint en API_CONFIG.ENDPOINTS
   */
  static fromEndpoint(endpointKey: keyof typeof API_CONFIG.ENDPOINTS) {
    const endpoint = API_CONFIG.ENDPOINTS[endpointKey];
    if (!endpoint) {
      throw new Error(`Endpoint "${endpointKey}" no definido en API_CONFIG.ENDPOINTS`);
    }
    return new ApiUrlBuilder(endpoint);
  }
  
  /**
   * Añade un parámetro de ruta (reemplaza :paramName en la ruta)
   * @param name - El nombre del parámetro sin los dos puntos
   * @param value - El valor del parámetro
   */
  withPathParam(name: string, value: string | number) {
    this.pathParams[name] = value;
    return this;
  }
  
  /**
   * Añade un parámetro de consulta (?param=value)
   * @param name - El nombre del parámetro
   * @param value - El valor del parámetro
   */
  withQueryParam(name: string, value: string | number | boolean | Array<string | number>) {
    this.queryParams[name] = value;
    return this;
  }
  
  /**
   * Añade múltiples parámetros de consulta
   * @param params - Objeto con los parámetros de consulta
   */
  withQueryParams(params: Record<string, string | number | boolean | Array<string | number>>) {
    this.queryParams = { ...this.queryParams, ...params };
    return this;
  }
  
  /**
   * Construye la URL final
   */
  build(): string {
    // Reemplazar parámetros en la ruta
    let url = this.basePath;
    
    // Sustituir los parámetros de ruta
    Object.entries(this.pathParams).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
    
    // Añadir parámetros de consulta
    const queryParamsEntries = Object.entries(this.queryParams);
    if (queryParamsEntries.length > 0) {
      const queryString = queryParamsEntries
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return value.map(v => `${encodeURIComponent(key)}=${encodeURIComponent(v)}`).join('&');
          }
          return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
        })
        .join('&');
      
      url += `?${queryString}`;
    }
    
    return url;
  }
}
