import { apiClient } from './apiClient';
import { API_CONFIG } from '@/config/api';

/**
 * Servicio para gestionar la autenticación y autorización
 */
export const authService = {  /**
   * Inicia sesión con credenciales de usuario
   */
  async login(email: string, password: string): Promise<any> {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/login`, { username: email, password });
  },

  /**
   * Cierra la sesión del usuario actual
   */
  async logout(): Promise<void> {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/logout`, {});
  },

  /**
   * Obtiene el usuario actualmente autenticado
   */
  async getCurrentUser(): Promise<any> {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.AUTH}/me`);
  },

  /**
   * Registra un nuevo usuario
   */
  async register(userData: { email: string; password: string; name: string }): Promise<any> {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/register`, userData);
  },

  /**
   * Restablece la contraseña del usuario
   */
  async resetPassword(email: string): Promise<void> {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/reset-password`, { email });
  },

  /**
   * Verifica si el token actual es válido
   */
  async verifyToken(): Promise<boolean> {
    try {
      await apiClient.get(`${API_CONFIG.ENDPOINTS.AUTH}/verify`);
      return true;
    } catch (error) {
      return false;
    }
  },

  /**
   * Actualiza el token de acceso usando el token de actualización
   */
  async refreshToken(): Promise<any> {
    return apiClient.post(`${API_CONFIG.ENDPOINTS.AUTH}/refresh`, {});
  },

  /**
   * Obtiene los permisos del usuario actual
   */
  async getUserPermissions(): Promise<string[]> {
    return apiClient.get(`${API_CONFIG.ENDPOINTS.AUTH}/permissions`);
  },
};
