
import { apiClient } from './apiClient';
import { API_CONFIG } from '@/config/api';
import { Order } from '@/models/order.model';

// Interfaces que representan el formato de la respuesta de la API
interface ApiOrderResponse {
  success: boolean;
  data: ApiOrder[];
}

interface ApiOrderSingleResponse {
  success: boolean;
  data: ApiOrder;
}

interface ApiOrder {
  id_pedido: number;
  fecha: string;
  tipo_pedido: 'en_mesa' | 'para_llevar';
  estado: 'pendiente' | 'procesado' | 'cancelado' | 'completado';
  nombre_mesa: string;
  nombre_usuario: string;
  nombre_cliente: string;
}

// Servicio específico para las operaciones de pedidos
export const orderService = {
  /**
   * Obtiene todas las pedidosy las mapea al formato usado en la aplicación
   */
  async getAll(): Promise<Order[]> {
    const response = await apiClient.get<ApiOrderResponse>(API_CONFIG.ENDPOINTS.ORDERS);
    return response.data.map(this.mapApiOrderToAppOrder);
  },
    /**
   * Mapea una orden de la API al formato de la aplicación
   */
  mapApiOrderToAppOrder(apiOrder: ApiOrder): Order {
    // Traducir estados de la API a los estados usados en la aplicación
    const statusMap: Record<string, 'pending' | 'processed' | 'canceled' | 'completed'> = {
      'pendiente': 'pending',
      'procesado': 'processed',
      'cancelado': 'canceled',
      'completado': 'completed'
    };

    return {
      id: apiOrder.id_pedido.toString(),
      clientId: '0', // No tenemos ID del cliente en la nueva respuesta
      clientName: apiOrder.nombre_cliente,
      date: apiOrder.fecha,
      status: statusMap[apiOrder.estado] || 'pending',
      items: [], // No tenemos información de items en la respuesta de la API
      total: 0, // No tenemos información de total en la respuesta de la API
      tableNumber: apiOrder.tipo_pedido === 'en_mesa' ? 1 : undefined // Asumimos mesa 1 si es tipo en_mesa
    };
  },
  /**
   * Obtiene una orden por su ID y la mapea al formato usado en la aplicación
   */
  async getById(id: string): Promise<Order> {
    const response = await apiClient.get<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`);
    return this.mapApiOrderToAppOrder(response.data);
  },
  /**
   * Mapea una orden de la aplicación al formato de la API
   */
  mapAppOrderToApiOrder(order: Omit<Order, 'id'>, id?: string): Partial<ApiOrder> {
    // Traducir estados de la aplicación a los estados de la API
    const estadoMap: Record<string, 'pendiente' | 'procesado' | 'cancelado' | 'completado'> = {
      'pending': 'pendiente',
      'processed': 'procesado',
      'canceled': 'cancelado',
      'completed': 'completado'
    };

    return {
      ...(id ? { id_pedido: parseInt(id) } : {}),
      tipo_pedido: order.tableNumber ? 'en_mesa' : 'para_llevar',
      fecha: order.date,
      estado: estadoMap[order.status] || 'pendiente',
      nombre_mesa: order.tableNumber ? `Mesa ${order.tableNumber}` : 'Para llevar',
      nombre_usuario: 'admin', // Valor predeterminado si no tenemos esta información
      nombre_cliente: order.clientName
    };
  },
  /**
   * Crea una nueva orden
   */
  async create(order: Omit<Order, 'id'>): Promise<Order> {
    const apiOrderData = this.mapAppOrderToApiOrder(order);
    const response = await apiClient.post<ApiOrderSingleResponse>(API_CONFIG.ENDPOINTS.ORDERS, apiOrderData);
    return this.mapApiOrderToAppOrder(response.data);
  },
    /**
   * Actualiza una orden existente
   */
  async update(id: string, order: Partial<Order>): Promise<Order> {
    const apiOrderData = this.mapAppOrderToApiOrder(order as Omit<Order, 'id'>, id);
    const response = await apiClient.put<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`, apiOrderData);
    return this.mapApiOrderToAppOrder(response.data);
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
  async updateStatus(id: string, status: 'pending' | 'processed' | 'canceled' | 'completed'): Promise<Order> {
    const estadoMap: Record<string, 'pendiente' | 'procesado' | 'cancelado' | 'completado'> = {
      'pending': 'pendiente',
      'processed': 'procesado',
      'canceled': 'cancelado',
      'completed': 'completado'
    };
    
    const response = await apiClient.patch<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/status`, { 
      estado: estadoMap[status] 
    });
    return this.mapApiOrderToAppOrder(response.data);
  },  /**
   * Asigna una mesa a una orden
   */
  async assignTable(id: string, tableNumber: number): Promise<Order> {
    const response = await apiClient.patch<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/table`, { 
      nombre_mesa: `Mesa ${tableNumber}`,
      tipo_pedido: 'en_mesa'
    });
    return this.mapApiOrderToAppOrder(response.data);
  }
};
