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
  async getUserById(id: string): Promise<User> {
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
  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    return apiClient.put<User>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`, userData);
  },

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.USERS}/${id}`);
  }
};
