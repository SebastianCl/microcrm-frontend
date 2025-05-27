import { apiClient } from './apiClient';
import { API_CONFIG } from '@/config/api';
import { Client } from '@/models/client.model';

// Servicio específico para las operaciones de clientes
export const clientService = {
  /**
   * Obtiene todos los clientes
   */
  async getAll(): Promise<Client[]> {
    return apiClient.get<Client[]>(API_CONFIG.ENDPOINTS.CLIENTS);
  },
  
  /**
   * Obtiene un cliente por su ID
   */
  async getById(id: string): Promise<Client> {
    return apiClient.get<Client>(`${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`);
  },
  
  /**
   * Crea un nuevo cliente
   */
  async create(client: Omit<Client, 'id'>): Promise<Client> {
    return apiClient.post<Client>(API_CONFIG.ENDPOINTS.CLIENTS, client);
  },
  
  /**
   * Actualiza un cliente existente
   */
  async update(id: string, client: Partial<Client>): Promise<Client> {
    return apiClient.put<Client>(`${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`, client);
  },
  
  /**
   * Elimina un cliente por su ID
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.CLIENTS}/${id}`);
  },
  
  /**
   * Obtiene las facturas de un cliente
   */
  async getInvoices(clientId: string): Promise<any[]> {
    return apiClient.get<any[]>(`${API_CONFIG.ENDPOINTS.CLIENTS}/${clientId}/invoices`);
  },
};
