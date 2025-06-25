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

// Interface para el detalle de la orden según el endpoint detalle
interface OrderDetailItem {
  id_detalle_pedido: number;
  producto: string;
  cantidad: number;
  precio_unitario: string;
  descuento: string;
  observaciones_producto?: string;
  adiciones: {
    nombre: string;
    cantidad: number;
    id_adicion: number;
    precio_extra: number;
  }[];
  mesa: string;
  estado_pedido: string;
  nombre_cliente: string;
  nombre_usuario: string;
  correo_cliente: string;
  total_pedido: string;
  id_venta: number;
  observacion_pedido?: string;
  medio_pago?: string;
}

interface ApiOrderDetailResponse {
  success: boolean;
  data: OrderDetailItem[];
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
    const response = await apiClient.get<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/detalle`);
    return response.data;
  },

  /**
   * Obtiene el detalle completo de una orden por su ID
   */
  async getOrderDetail(id: string): Promise<{
    order: Order;
    items: Array<{
      id_detalle_pedido: number;
      productId: string;
      name: string;
      quantity: number;
      price: number;
      discount: number;
      total: number;
      observaciones?: string;
      additions: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
      }>;
    }>;
  }> {
    const response = await apiClient.get<ApiOrderDetailResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/detalle`);
    
    if (!response.data || response.data.length === 0) {
      throw new Error('No se encontraron detalles de la orden');
    }
    
    const firstItem = response.data[0];
    // Crear el objeto Order a partir del primer item
    const order: Order = {
      id_pedido: id,
      id_venta: firstItem.id_venta,
      fecha: '', // No viene en la respuesta, se puede obtener de otro endpoint si es necesario
      tipo_pedido: firstItem.mesa === 'Para llevar' ? 'para_llevar' : 'en_mesa',
      estado: firstItem.estado_pedido as Order['estado'],
      nombre_mesa: firstItem.mesa,
      nombre_cliente: firstItem.nombre_cliente,
      observacion_pedido: firstItem.observacion_pedido,
      medio_pago: firstItem.medio_pago,
    };

    // Transformar los items al formato esperado
    const items = response.data.map(item => ({
      id_detalle_pedido: item.id_detalle_pedido,
      productId: item.id_detalle_pedido.toString(), // Usar el ID del detalle como productId
      name: item.producto,
      quantity: item.cantidad,
      price: parseFloat(item.precio_unitario),
      discount: parseFloat(item.descuento),
      total: parseFloat(item.precio_unitario) * item.cantidad - parseFloat(item.descuento),
      observaciones: item.observaciones_producto,
      additions: item.adiciones.map(adicion => ({
        id: adicion.id_adicion.toString(),
        name: adicion.nombre,
        price: adicion.precio_extra,
        quantity: adicion.cantidad,
      })),
    }));

    return { order, items };
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
   * Actualiza una orden con sus items
   */
  async updateOrderWithItems(id: string, data: {
    items: Array<{
      id_detalle_pedido?: number;
      productId: string;
      name: string;
      quantity: number;
      price: number;
      total: number;
      discount?: number;
      additions?: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
      }>;
    }>;
    total: number;
  }): Promise<Order> {
    // Transformar los datos al formato que espera la API
    const updateData = {
      detalles: data.items.map(item => ({
        id_detalle_pedido: item.id_detalle_pedido,
        producto: item.name,
        cantidad: item.quantity,
        precio_unitario: item.price.toString(),
        descuento: (item.discount || 0).toString(),
        adiciones: item.additions?.map(add => ({
          id_adicion: parseInt(add.id),
          nombre: add.name,
          cantidad: add.quantity,
          precio_extra: add.price,
        })) || [],
      })),
      total_pedido: data.total.toString(),
    };

    const response = await apiClient.put<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}`, updateData);
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
  },

  /**
   * Ajusta una orden con productos agregados, modificados y eliminados
   */
  async adjustOrder(id: string, data: {
    agregados: Array<{
      id_producto: number;
      cantidad: number;
      precio_unitario: number;
      adiciones?: Array<{
        id_adicion: number;
        cantidad: number;
      }>;
    }>;
    modificados: Array<{
      id_detalle_pedido: number;
      cantidad: number;
      descuento?: number;
    }>;
    eliminados: Array<number>;
  }): Promise<Order> {
    const response = await apiClient.put<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/ajustar`, data);
    return response.data;
  },

  /**
   * Obtiene el detalle de una orden
   */
  async getDetail(orderId: string): Promise<OrderDetailItem[]> {
    const response = await apiClient.get<ApiOrderDetailResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/detalle`);
    return response.data;
  }
};
