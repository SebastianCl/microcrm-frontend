import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceService } from '@/services/invoiceService';
import { Invoice } from '@/models/invoice.model';

// Keys para las queries
export const QUERY_KEYS = {
  INVOICES: 'invoices',
  INVOICE: (id: string) => ['invoices', id]
};

/**
 * Hook para obtener todas las facturas
 */
export const useInvoices = (options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.INVOICES],
    queryFn: () => invoiceService.getAll(),
    ...options
  });
};

/**
 * Hook para obtener una factura por su ID
 */
export const useInvoice = (id: string, options = {}) => {
  return useQuery({
    queryKey: QUERY_KEYS.INVOICE(id),
    queryFn: () => invoiceService.getById(id),
    enabled: Boolean(id), // Solo realizar la consulta si hay un ID
    ...options
  });
};

/**
 * Hook para crear una nueva factura
 */
export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invoice: Omit<Invoice, 'id'>) => invoiceService.create(invoice),
    onSuccess: () => {
      // Invalidar la cache para recargar los datos
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    }
  });
};

/**
 * Hook para actualizar una factura
 */
export const useUpdateInvoice = (id: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invoice: Partial<Invoice>) => invoiceService.update(id, invoice),
    onSuccess: (updatedInvoice) => {
      // Actualizar la factura en la cache
      queryClient.setQueryData(QUERY_KEYS.INVOICE(id), updatedInvoice);
      // Invalidar la lista de facturas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    }
  });
};

/**
 * Hook para eliminar una factura
 */
export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => invoiceService.delete(id),
    onSuccess: (_, id) => {
      // Eliminar la factura de la cache
      queryClient.removeQueries({ queryKey: QUERY_KEYS.INVOICE(id) });
      // Invalidar la lista de facturas
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.INVOICES] });
    }
  });
};
