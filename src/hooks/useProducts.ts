import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
// Asegúrate de que ApiProduct incluya id_categoria y nombre_categoria si vienen de la API
interface ApiProductWithCategory extends ApiProduct {
  id_categoria: number;
  nombre_categoria: string;
}

import { AppProduct, AppAddition, ApiProduct } from '@/models/product.model';

// Función para transformar la respuesta de la API al formato de la aplicación
const transformProductData = (apiProducts: ApiProductWithCategory[]): AppProduct[] => {
    return apiProducts.map(p => ({
        id: p.id_producto.toString(),
        name: p.nombre,
        description: p.descripcion,
        price: parseFloat(p.precio),
        stockQuantity: p.maneja_inventario && p.stock !== null ? p.stock : Infinity, // Si no maneja inventario o stock es null, se asume infinito
        managesInventory: p.maneja_inventario,
        isActive: p.estado,
        additions: p.adiciones.map(a => ({
            id: a.id_adicion.toString(),
            name: a.nombre,
            price: a.precio_extra,
            isActive: a.estado,
            // quantity: 1 // Cantidad por defecto para AppAddition si fuera necesario aquí
        })),
        categoryId: p.id_categoria, // Añadido
        categoryName: p.nombre_categoria, // Añadido
    }));
};

export const useProducts = () => {
    return useQuery<AppProduct[], Error>({
        queryKey: ['products'],
        queryFn: async () => {
            // Asegúrate de que el endpoint /products devuelve id_categoria y nombre_categoria
            const data = await apiClient.get<ApiProductWithCategory[]>('/products');
            return transformProductData(data);
        },
    });
};

// Funciones de utilidad que estaban en sample-additions.ts, adaptadas para AppProduct
export const productHasAdditions = (productId: string, products: AppProduct[]): boolean => {
    const product = products.find(p => p.id === productId);
    return !!product && product.additions.length > 0;
};

export const getProductAdditions = (productId: string, products: AppProduct[]): AppAddition[] => {
    const product = products.find(p => p.id === productId);
    // Asegurarse de que las adiciones devueltas incluyan la cantidad si se define en AppAddition
    return product ? product.additions.filter(a => a.isActive).map(a => ({ ...a /*, quantity: a.quantity || 1 */ })) : [];
};
