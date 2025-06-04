
import { apiClient } from './apiClient';
import { API_CONFIG } from '@/config/api';
import { Order } from '@/models/order.model';

// Interfaces que representan el formato de la respuesta de la API
interface ApiOrderResponse {
  success: boolean;
  data: Order[];
}

interface ApiOrderSingleResponse {
  success: boolean;
  data: Order;
}

// Servicio específico para las operaciones de pedidos
export const orderService = {
  /**
   * Obtiene todas las pedidos
   */
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<ApiOrderResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/dia`);
    return response.data;
  },

  /**
   * Obtiene una orden por su ID
   */
  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`);
    return response.data;
  },

  /**
   * Crea una nueva orden
   */
  async create(order: Omit<Order, 'id_pedido'>): Promise<Order> {
    const response = await apiClient.post<ApiOrderSingleResponse>(API_CONFIG.ENDPOINTS.ORDERS, order);
    return response.data;
  },

  /**
   * Actualiza una orden existente
   */
  async update(id: string, order: Partial<Order>): Promise<Order> {
    const response = await apiClient.put<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`, order);
    return response.data;
  },
  
  /**
   * Elimina una orden por su ID
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`);
  },

  /**
   * Cambia el estado de una orden
   */
  async updateStatus(id: string, estadoId: number): Promise<Order> {
    const response = await apiClient.patch<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/estado`, { 
      id_estado: estadoId 
    });
    return response.data;
  },

  /**
   * Asigna una mesa a una orden
   */
  async assignTable(id: string, tableNumber: number): Promise<Order> {
    const response = await apiClient.patch<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/table`, { 
      nombre_mesa: `Mesa ${tableNumber}`,
      tipo_pedido: 'en_mesa'
    });
    return response.data;
  }
};
