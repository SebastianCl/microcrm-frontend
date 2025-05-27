import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService } from '@/services/clientService';
import { Client } from '@/models/client.model';

// Keys para las queries
export const CLIENT_QUERY_KEYS = {
  CLIENTS: 'clients',
  CLIENT: (id: string) => ['clients', id],
  CLIENT_INVOICES: (id: string) => ['clients', id, 'invoices'],
};

/**
 * Hook para obtener todos los clientes
 */
export const useClients = (options = {}) => {
  return useQuery({
    queryKey: [CLIENT_QUERY_KEYS.CLIENTS],
    queryFn: () => clientService.getAll(),
    ...options,
  });
};

/**
 * Hook para obtener un cliente por su ID
 */
export const useClient = (id: string, options = {}) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.CLIENT(id),
    queryFn: () => clientService.getById(id),
    enabled: Boolean(id), // Solo realizar la consulta si hay un ID
    ...options,
  });
};

/**
 * Hook para obtener las facturas de un cliente
 */
export const useClientInvoices = (clientId: string, options = {}) => {
  return useQuery({
    queryKey: CLIENT_QUERY_KEYS.CLIENT_INVOICES(clientId),
    queryFn: () => clientService.getInvoices(clientId),
    enabled: Boolean(clientId), // Solo realizar la consulta si hay un ID de cliente
    ...options,
  });
};

/**
 * Hook para crear un nuevo cliente
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (client: Omit<Client, 'id'>) => clientService.create(client),
    onSuccess: () => {
      // Invalidar la caché para recargar los datos
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEYS.CLIENTS] });
    },
  });
};

/**
 * Hook para actualizar un cliente
 */
export const useUpdateClient = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (client: Partial<Client>) => clientService.update(id, client),
    onSuccess: (updatedClient) => {
      // Actualizar el cliente en la caché
      queryClient.setQueryData(CLIENT_QUERY_KEYS.CLIENT(id), updatedClient);
      // Invalidar la lista de clientes
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEYS.CLIENTS] });
    },
  });
};

/**
 * Hook para eliminar un cliente
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => clientService.delete(id),
    onSuccess: (_, id) => {
      // Eliminar el cliente de la caché
      queryClient.removeQueries({ queryKey: CLIENT_QUERY_KEYS.CLIENT(id) });
      // Invalidar la lista de clientes
      queryClient.invalidateQueries({ queryKey: [CLIENT_QUERY_KEYS.CLIENTS] });
    },
  });
};
