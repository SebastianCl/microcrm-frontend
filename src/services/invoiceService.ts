import { apiClient } from './apiClient';
import { API_CONFIG } from '@/config/api';
import { Invoice } from '@/models/invoice.model';

// Servicio específico para las operaciones de facturas
export const invoiceService = {
  /**
   * Obtiene todas las facturas
   */
  async getAll(): Promise<Invoice[]> {
    return apiClient.get<Invoice[]>(API_CONFIG.ENDPOINTS.INVOICES);
  },
  
  /**
   * Obtiene una factura por su ID
   */
  async getById(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`${API_CONFIG.ENDPOINTS.INVOICES}/${id}`);
  },
  
  /**
   * Crea una nueva factura
   */
  async create(invoice: Omit<Invoice, 'id'>): Promise<Invoice> {
    return apiClient.post<Invoice>(API_CONFIG.ENDPOINTS.INVOICES, invoice);
  },
  
  /**
   * Actualiza una factura existente
   */
  async update(id: string, invoice: Partial<Invoice>): Promise<Invoice> {
    return apiClient.put<Invoice>(`${API_CONFIG.ENDPOINTS.INVOICES}/${id}`, invoice);
  },
  
  /**
   * Elimina una factura por su ID
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.INVOICES}/${id}`);
  },

  /**
   * Genera la factura para un pedido específico
   */
  async generateInvoice(orderId: number): Promise<{ success: boolean; data: { base64: string } }> {
    return apiClient.post<{ success: boolean; data: { base64: string } }>(`${API_CONFIG.ENDPOINTS.INVOICES}/${orderId}/generar`, {});
  },
};
