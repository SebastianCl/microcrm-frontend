import { API_CONFIG } from '@/config/api';
import { apiClient } from './apiClient';
import {
    ApiProductAddition,
    CreateProductAdditionDto,
    UpdateProductAdditionDto,
    ProductAddition,
    CreateProductAdditionData,
    UpdateProductAdditionData,
    CreateAdditionResponse,
    ToggleStatusResponse,
    UpdateAdditionResponse
} from '@/models/product-addition.model';

/**
 * Convierte un ApiProductAddition a ProductAddition para uso interno
 */
const mapApiToInternal = (apiAddition: ApiProductAddition): ProductAddition => ({
    id: apiAddition.id_adicion.toString(),
    name: apiAddition.nombre,
    price: parseFloat(apiAddition.precio_extra),
    productId: apiAddition.id_producto.toString(),
    isActive: apiAddition.estado
});

/**
 * Convierte datos internos a formato de API para crear
 */
const mapCreateToApi = (data: CreateProductAdditionData): CreateProductAdditionDto => ({
    id_producto: parseInt(data.productId),
    nombre: data.name,
    precio_extra: data.price
});

/**
 * Convierte datos internos a formato de API para actualizar
 */
const mapUpdateToApi = (data: UpdateProductAdditionData): UpdateProductAdditionDto => ({
    id_producto: parseInt(data.productId!),
    nombre: data.name!,
    precio_extra: data.price!
});

/**
 * Service for managing product additions
 */
export const additionsService = {
    /**
     * Obtener todas las adiciones
     * GET /api/additions
     */
    async getAdditions(): Promise<ProductAddition[]> {
        try {
            const apiAdditions = await apiClient.get<ApiProductAddition[]>(API_CONFIG.ENDPOINTS.ADDITIONS);
            return apiAdditions.map(mapApiToInternal);
        } catch (error) {
            console.error('Error al obtener adiciones:', error);
            throw new Error('No se pudieron cargar las adiciones. Por favor, inténtalo de nuevo.');
        }
    },

    /**
     * Crear una nueva adición
     * POST /api/additions
     */
    async createAddition(additionData: CreateProductAdditionData): Promise<{ success: boolean; message: string; id?: string }> {
        try {
            const apiData = mapCreateToApi(additionData);
            const response = await apiClient.post<CreateAdditionResponse>(
                API_CONFIG.ENDPOINTS.ADDITIONS,
                apiData
            );

            return {
                success: true,
                message: response.message || 'Adición creada exitosamente',
                id: response.ProductAdditionId?.toString()
            };
        } catch (error) {
            console.error('Error al crear adición:', error);
            throw new Error('No se pudo crear la adición. Por favor, verifica los datos e inténtalo de nuevo.');
        }
    },

    /**
     * Cambiar estado de una adición (toggle activo/inactivo)
     * PATCH /api/additions/{id_adicion}
     */
    async toggleAdditionStatus(additionId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await apiClient.patch<ToggleStatusResponse>(
                `${API_CONFIG.ENDPOINTS.ADDITIONS}/${additionId}`
                // Sin body según la especificación
            );

            return {
                success: true,
                message: response.message || 'Estado actualizado correctamente'
            };
        } catch (error) {
            console.error('Error al cambiar estado de adición:', error);
            throw new Error('No se pudo cambiar el estado de la adición. Por favor, inténtalo de nuevo.');
        }
    },

    /**
     * Actualizar datos de una adición
     * PUT /api/additions/{id_adicion}
     */
    async updateAddition(additionId: string, additionData: UpdateProductAdditionData): Promise<{ success: boolean; message: string }> {
        try {
            const apiData = mapUpdateToApi(additionData);
            const response = await apiClient.put<UpdateAdditionResponse>(
                `${API_CONFIG.ENDPOINTS.ADDITIONS}/${additionId}`,
                apiData
            );

            return {
                success: true,
                message: response.message || 'Adición actualizada exitosamente'
            };
        } catch (error) {
            console.error('Error al actualizar adición:', error);
            throw new Error('No se pudo actualizar la adición. Por favor, verifica los datos e inténtalo de nuevo.');
        }
    }
};
