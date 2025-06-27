import { apiClient } from './apiClient';

export interface CreateProductRequest {
    nombre: string;
    descripcion: string;
    precio: string;
    stock: string;
    maneja_inventario: boolean;
    id_categoria: string;
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
};
