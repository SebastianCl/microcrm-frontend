import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import { Order } from '@/models/order.model';

// Keys para las queries
export const ORDER_QUERY_KEYS = {
  ORDERS: 'orders',
  ORDER: (id: string) => ['orders', id],
};

/**
 * Hook para obtener todas las pedidos
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
 * Hook para crear una nueva orden
 */
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (order: Omit<Order, 'id'>) => orderService.create(order),
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
      // Invalidar la lista de pedidos
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
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
      // Invalidar la lista de pedidos
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
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
      // Invalidar la lista de pedidos
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });
    },
  });
};
