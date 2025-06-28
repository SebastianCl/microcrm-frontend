import { apiClient } from './apiClient';
import { API_CONFIG } from '@/config/api';
import { Gasto, CreateGastoDto, UpdateGastoDto, TipoGasto } from '@/models/gastos.model';

// Servicio específico para las operaciones de gastos
export const gastosService = {
    /**
     * Obtiene todos los gastos con filtro opcional de fecha
     */
    async getAll(fechaInicio?: string): Promise<Gasto[]> {
        const url = fechaInicio
            ? `${API_CONFIG.ENDPOINTS.GASTOS}?fecha_inicio=${fechaInicio}`
            : API_CONFIG.ENDPOINTS.GASTOS;
        return apiClient.get<Gasto[]>(url);
    },

    /**
     * Obtiene un gasto por su ID
     */
    async getById(id: string): Promise<Gasto> {
        return apiClient.get<Gasto>(`${API_CONFIG.ENDPOINTS.GASTOS}/${id}`);
    },

    /**
     * Crea un nuevo gasto
     */
    async create(gasto: CreateGastoDto): Promise<Gasto> {
        return apiClient.post<Gasto>(API_CONFIG.ENDPOINTS.GASTOS, gasto);
    },

    /**
     * Actualiza un gasto existente
     */
    async update(id: string, gasto: UpdateGastoDto): Promise<Gasto> {
        return apiClient.put<Gasto>(`${API_CONFIG.ENDPOINTS.GASTOS}/${id}`, gasto);
    },

    /**
     * Elimina un gasto por su ID
     */
    async delete(id: string): Promise<void> {
        return apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.GASTOS}/${id}`);
    },

    /**
     * Obtiene gastos por rango de fechas
     */
    async getByDateRange(fechaInicio: string, fechaFin?: string): Promise<Gasto[]> {
        let url = `${API_CONFIG.ENDPOINTS.GASTOS}?fecha_inicio=${fechaInicio}`;
        if (fechaFin) {
            url += `&fecha_fin=${fechaFin}`;
        }
        return apiClient.get<Gasto[]>(url);
    },
};

// Servicio para tipos de gasto
export const tiposGastoService = {
    /**
     * Obtiene todos los tipos de gasto
     */
    async getAll(): Promise<TipoGasto[]> {
        return apiClient.get<TipoGasto[]>(API_CONFIG.ENDPOINTS.TIPOS_GASTO);
    },

    /**
     * Obtiene un tipo de gasto por su ID
     */
    async getById(id: string): Promise<TipoGasto> {
        return apiClient.get<TipoGasto>(`${API_CONFIG.ENDPOINTS.TIPOS_GASTO}/${id}`);
    },
};
