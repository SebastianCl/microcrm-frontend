import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { ApiProduct, AppProduct, AppAddition } from '@/models/product.model';

// Función para transformar la respuesta de la API al formato de la aplicación
const transformProductData = (apiProducts: ApiProduct[]): AppProduct[] => {
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
        })),
        // category: 'default' // Se puede asignar una categoría por defecto o manejarla de otra forma si es necesario
    }));
};

export const useProducts = () => {
    return useQuery<AppProduct[], Error>({
        queryKey: ['products'],
        queryFn: async () => {
            const data  = await apiClient.get<ApiProduct[]>('/products');
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
    return product ? product.additions.filter(a => a.isActive) : [];
};
