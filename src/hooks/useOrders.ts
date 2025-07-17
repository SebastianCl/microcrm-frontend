import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { Order } from '@/models/order.model';

// Interfaz para la respuesta de creación de orden
interface CreateOrderResponse {
  success: boolean;
  id_pedido: number;
}

// Keys para las queries
export const ORDER_QUERY_KEYS = {
  ORDERS: 'orders',
  ORDER: (id: string) => ['orders', id],
};

/**
 * Hook para obtener todas las ordenes
 */
export const useOrders = (options = {}) => {
  return useQuery({
    queryKey: [ORDER_QUERY_KEYS.ORDERS],
    queryFn: () => orderService.getAll(),
    ...options,
  });
};

/**
 * Hook para obtener una orden por su ID
 */
export const useOrder = (id: string, options = {}) => {
  return useQuery({
    queryKey: ORDER_QUERY_KEYS.ORDER(id),
    queryFn: () => orderService.getById(id),
    enabled: Boolean(id), // Solo realizar la consulta si hay un ID
    ...options,
  });
};

/**
 * Hook para obtener el detalle completo de una orden por su ID
 */
export const useOrderDetail = (id: string, options = {}) => {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEYS.ORDER(id), 'detail'],
    queryFn: () => orderService.getOrderDetail(id),
    enabled: Boolean(id), // Solo realizar la consulta si hay un ID
    ...options,
  });
};

/**
 * Hook para crear una nueva orden
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: Omit<Order, 'id_pedido'>) => orderService.create(order),
    onSuccess: () => {
      // Invalidar la caché para recargar los datos
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
    },
  });
};

/**
 * Hook para crear una nueva orden con productos
 */
export const useCreateOrderWithProducts = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateOrderResponse, Error, {
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
  }>({
    mutationFn: (orderData) => orderService.createOrderWithProducts(orderData),
    onSuccess: () => {
      // Invalidar la caché para recargar los datos
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
    },
  });
};

/**
 * Hook para actualizar una orden
 */
export const useUpdateOrder = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (order: Partial<Order>) => orderService.update(id, order),
    onSuccess: (updatedOrder) => {
      // Actualizar la orden en la caché
      queryClient.setQueryData(ORDER_QUERY_KEYS.ORDER(id), updatedOrder);
      // Invalidar la lista de ordenes
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
    },
  });
};

/**
 * Hook para actualizar una orden con sus items
 */
export const useUpdateOrderWithItems = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
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
    }) => orderService.updateOrderWithItems(id, data),
    onSuccess: (updatedOrder) => {
      // Actualizar la orden en la caché
      queryClient.setQueryData(ORDER_QUERY_KEYS.ORDER(id), updatedOrder);
      // Invalidar las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [...ORDER_QUERY_KEYS.ORDER(id), 'detail'] });
    },
  });
};

/**
 * Hook para cambiar el estado de una orden
 */
export const useUpdateOrderStatus = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (estadoId: number) =>
      orderService.updateStatus(id, estadoId),
    onSuccess: (updatedOrder) => {
      // Actualizar la orden en la caché
      queryClient.setQueryData(ORDER_QUERY_KEYS.ORDER(id), updatedOrder);
      // Invalidar la lista de ordenes
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
    },
  });
};

/**
 * Hook para actualizar el método de pago de una orden
 */
export const useUpdateOrderPaymentMethod = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethod: string) =>
      orderService.updatePaymentMethod(id, paymentMethod),
    onSuccess: (updatedOrder) => {
      // Actualizar la orden en la caché
      queryClient.setQueryData(ORDER_QUERY_KEYS.ORDER(id), updatedOrder);
      // Invalidar las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [...ORDER_QUERY_KEYS.ORDER(id), 'detail'] });
    },
  });
};

/**
 * Hook para finalizar una orden con método de pago
 */
export const useFinalizeOrderWithPayment = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentMethod: string) =>
      orderService.finalizeOrderWithPayment(id, paymentMethod),
    onSuccess: (updatedOrder) => {
      // Actualizar la orden en la caché
      queryClient.setQueryData(ORDER_QUERY_KEYS.ORDER(id), updatedOrder);
      // Invalidar las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [...ORDER_QUERY_KEYS.ORDER(id), 'detail'] });
    },
  });
};

/**
 * Hook para ajustar una orden (agregar, modificar, eliminar items)
 */
export const useAdjustOrder = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      valor_domi?: number | null;
      valor_descu?: number | null;
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
        adiciones?: Array<{
          id_adicion: number;
          cantidad: number;
        }>;
      }>;
      eliminados: Array<number>;
    }) => orderService.adjustOrder(id, data),
    onSuccess: (updatedOrder) => {
      // Actualizar la orden en la caché
      queryClient.setQueryData(ORDER_QUERY_KEYS.ORDER(id), updatedOrder);
      // Invalidar las consultas relacionadas
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
      queryClient.invalidateQueries({ queryKey: [...ORDER_QUERY_KEYS.ORDER(id), 'detail'] });
    },
  });
};

/**
 * Hook para eliminar una orden
 */
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => orderService.delete(id),
    onSuccess: (_, id) => {
      // Eliminar la orden de la caché
      queryClient.removeQueries({ queryKey: ORDER_QUERY_KEYS.ORDER(id) });
      // Invalidar la lista de ordenes
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
    },
  });
};
