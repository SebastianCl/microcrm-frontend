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

interface ApiCreateOrderResponse {
  success: boolean;
  id_pedido: number;
}

// Interface para el detalle individual de un producto en la orden
interface OrderDetailItemProduct {
  cantidad: number;
  producto: string;
  adiciones: {
    nombre: string;
    cantidad: number;
    id_adicion: number;
    precio_extra: number;
  }[];
  descuento: number;
  observacion: string | null;
  precio_unitario: number;
  id_detalle_pedido: number;
}

// Interface para la respuesta completa del detalle de la orden
interface OrderDetailItem {
  detalles: OrderDetailItemProduct[];
  mesa: string;
  estado_pedido: string;
  nombre_cliente: string;
  nombre_usuario: string;
  correo_cliente: string;
  observacion_pedido: string | null;
  medio_pago: string | null;
  valor_domi: string;
  valor_descu: string;
  total_pedido: string;
  id_venta: number | null;
}

interface ApiOrderDetailResponse {
  success: boolean;
  data: OrderDetailItem[];
}

// Servicio específico para las operaciones de ordenes
export const orderService = {
  /**
   * Obtiene todas las ordenes
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

    const orderData = response.data[0];

    // Crear el objeto Order a partir de los datos de la orden
    const order: Order = {
      id_pedido: id,
      id_venta: orderData.id_venta,
      tipo_pedido: orderData.mesa === 'Para llevar' ? 'para_llevar' : 'en_mesa',
      estado: orderData.estado_pedido as Order['estado'],
      nombre_mesa: orderData.mesa,
      nombre_cliente: orderData.nombre_cliente,
      observacion_pedido: orderData.observacion_pedido,
      medio_pago: orderData.medio_pago,
      valor_domi: orderData.valor_domi,
      valor_descu: orderData.valor_descu,
    };

    // Transformar los detalles de productos al formato esperado
    const items = orderData.detalles.map(detalle => ({
      id_detalle_pedido: detalle.id_detalle_pedido,
      productId: detalle.id_detalle_pedido.toString(), // Usar el ID del detalle como productId
      name: detalle.producto,
      quantity: detalle.cantidad,
      price: detalle.precio_unitario,
      discount: detalle.descuento,
      total: detalle.precio_unitario * detalle.cantidad - detalle.descuento,
      observaciones: detalle.observacion,
      additions: detalle.adiciones.map(adicion => ({
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
   * Crea una nueva orden con el formato específico requerido por el backend
   */
  async createOrderWithProducts(orderData: {
    id_cliente: number | null;
    id_usuario: number;
    id_mesa: number | null;
    tipo_pedido: string;
    Observacion: string;
    medio_pago: string | null;
    valor_domi?: number;
    valor_descu?: number;
    productos: Array<{
      id_producto: number;
      cantidad: number;
      precio_unitario: number;
      observacion: string;
      adiciones: Array<{
        id_adicion: number;
        cantidad: number;
      }>;
    }>;
    id_estado: number;
  }): Promise<ApiCreateOrderResponse> {
    const response = await apiClient.post<ApiCreateOrderResponse>(API_CONFIG.ENDPOINTS.ORDERS, orderData);
    return response;
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
   * Actualiza el método de pago de una orden
   */
  async updatePaymentMethod(id: string, paymentMethod: string): Promise<Order> {
    const response = await apiClient.patch<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/payment`, {
      medio_pago: paymentMethod
    });
    return response.data;
  },

  /**
   * Finaliza una orden con método de pago
   */
  async finalizeOrderWithPayment(id: string, paymentMethod: string): Promise<Order> {
    const response = await apiClient.patch<ApiOrderSingleResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${id}/estado`, {
      id_estado: 5, // ID para estado "Finalizado"
      medio_pago: paymentMethod
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
  async getDetail(orderId: string): Promise<OrderDetailItemProduct[]> {
    const response = await apiClient.get<ApiOrderDetailResponse>(`${API_CONFIG.ENDPOINTS.ORDERS}/${orderId}/detalle`);

    if (!response.data || response.data.length === 0) {
      return [];
    }

    // Extraer todos los detalles de todos los elementos en la respuesta
    const allDetails: OrderDetailItemProduct[] = [];
    response.data.forEach(orderItem => {
      allDetails.push(...orderItem.detalles);
    });

    return allDetails;
  }
};
