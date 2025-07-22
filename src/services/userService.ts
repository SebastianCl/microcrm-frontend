import { API_CONFIG } from '@/config/api';
import { apiClient } from './apiClient';
import { CreateUserDto, UpdateUserDto, User } from '@/types/user';

/**
 * Service for managing users
 */
export const userService = {
  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    return apiClient.get<User[]>(API_CONFIG.ENDPOINTS.USERS);
  },

  /**
   * Get user by ID
   */
  async getUserById(id: number): Promise<User> {
    return apiClient.get<User>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  },

  /**
   * Create a new user
   */
  async createUser(userData: CreateUserDto): Promise<User> {
    return apiClient.post<User>(`${API_CONFIG.ENDPOINTS.USERS}`, userData);
  },

  /**
   * Update a user
   */
  async updateUser(id: number, userData: UpdateUserDto): Promise<User> {
    return apiClient.put<User>(`${API_CONFIG.ENDPOINTS.USERS}/update-user/${id}`, userData);
  },

  /**
   * Delete a user
   */
  async deleteUser(id: number): Promise<void> {
    return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  },

  /**
   * Toggle user status (active/inactive)
   */
  async toggleUserStatus(id: number): Promise<User> {
    return apiClient.patch<User>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  },

  /**
   * Reset user password
   */
  async resetUserPassword(id: number, newPassword: string): Promise<User> {
    return apiClient.patch<User>(`${API_CONFIG.ENDPOINTS.USERS}/reset-password/${id}`, {
      newPassword
    });
  }
};
