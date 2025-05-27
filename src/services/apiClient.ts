import { ApiError } from '@/types/api';
import { API_CONFIG } from '@/config/api';

/**
 * Cliente centralizado para realizar peticiones a la API
 */
class ApiClient {
  /**
   * Añade el token de autenticación a las cabeceras si está disponible
   */
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
  
  /**
   * Realiza una petición HTTP usando fetch con manejo consistente de errores
   */
  async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    const headers = {
      ...API_CONFIG.DEFAULT_HEADERS,
      ...this.getAuthHeaders(),
      ...(options?.headers || {})
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      // Manejar respuesta no-OK
      if (!response.ok) {
        let errorData;
        try {
          // Intentar extraer los detalles del error
          errorData = await response.json();
        } catch (e) {
          // Fallar silenciosamente si no es JSON
          errorData = null;
        }
        
        throw new ApiError(
          errorData?.message || `Error ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }
      
      // Para respuestas sin contenido
      if (response.status === 204) {
        return {} as T;
      }
      
      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'AbortError') {
        throw new ApiError('La solicitud excedió el tiempo de espera', 408);
      }
      
      throw new ApiError(
        (error as Error).message || 'Error desconocido al realizar la solicitud',
        0
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // Métodos específicos para cada verbo HTTP
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { 
      ...options, 
      method: 'GET'
    });
  }
  
  async post<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }
  
  async put<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }
  
  async patch<T>(endpoint: string, body: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }
  
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Singleton para usar en toda la aplicación
export const apiClient = new ApiClient();
