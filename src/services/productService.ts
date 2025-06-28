import { apiClient } from './apiClient';
import { InventoryMovement } from '@/types/inventory';
import { ApiProductDetail } from '@/models/product.model';

export interface Category {
    id_categoria: number;
    nombre_categoria: string;
}

export interface CreateProductRequest {
    nombre: string;
    descripcion: string;
    precio: string;
    stock: string;
    maneja_inventario: boolean;
    id_categoria: string;
}

export interface UpdateProductRequest {
    nombre: string;
    descripcion: string;
    precio: string;
    stock: number;
    estado: boolean;
    maneja_inventario: boolean;
    id_categoria: number;
}

export interface CreateProductResponse {
    id_producto: number;
    nombre: string;
    descripcion: string;
    precio: string;
    stock: number;
    maneja_inventario: boolean;
    estado: boolean;
    id_categoria: number;
}

export const productService = {
    /**
     * Crear un nuevo producto
     */
    async createProduct(productData: CreateProductRequest): Promise<CreateProductResponse> {
        return await apiClient.post<CreateProductResponse>('/products', productData);
    },

    /**
     * Actualizar un producto existente
     */
    async updateProduct(productId: string, productData: UpdateProductRequest): Promise<CreateProductResponse> {
        return await apiClient.put<CreateProductResponse>(`/products/${productId}`, productData);
    },

    /**
     * Obtener un producto por su ID
     */
    async getProductById(productId: string): Promise<ApiProductDetail> {
        return await apiClient.get<ApiProductDetail>(`/products/${productId}`);
    },

    /**
     * Obtener historial de movimientos de inventario de un producto
     */
    async getInventoryMovements(productId: string): Promise<InventoryMovement[]> {
        return await apiClient.get<InventoryMovement[]>(`/inventarios/${productId}`);
    },

    /**
     * Obtener todas las categorías
     */
    async getCategories(): Promise<Category[]> {
        return await apiClient.get<Category[]>('/products/categorias');
    },

    /**
     * Crear un movimiento de inventario
     */
    async createInventoryMovement(movementData: {
        id_producto: number;
        cantidad: number;
        tipo_movimiento: 'entrada' | 'salida';
        comentario: string;
        fecha: string;
    }): Promise<InventoryMovement> {
        return await apiClient.post<InventoryMovement>('/inventarios', movementData);
    },
};
