import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { AppProduct, AppAddition, ApiProduct, ApiProductDetail } from '@/models/product.model';
import { productService, CreateProductRequest, UpdateProductRequest, Category } from '@/services/productService';

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
        categoryId: p.id_categoria,
        categoryName: p.nombre_categoria,
    }));
};

// Función para transformar el detalle de un producto
const transformProductDetail = (apiProduct: ApiProductDetail): AppProduct => {
    return {
        id: apiProduct.id_producto.toString(),
        name: apiProduct.nombre,
        description: apiProduct.descripcion,
        price: parseFloat(apiProduct.precio),
        stockQuantity: apiProduct.maneja_inventario && apiProduct.stock !== null ? apiProduct.stock : Infinity,
        managesInventory: apiProduct.maneja_inventario,
        isActive: apiProduct.estado,
        additions: apiProduct.adiciones.map(a => ({
            id: a.id_adicion.toString(),
            name: a.nombre,
            price: a.precio_extra,
            isActive: a.estado,
        })),
        categoryId: apiProduct.id_categoria,
        categoryName: apiProduct.nombre_categoria,
    };
};

export const useProducts = () => {
    return useQuery<AppProduct[], Error>({
        queryKey: ['products'],
        queryFn: async () => {
            const data = await apiClient.get<ApiProduct[]>('/products');
            return transformProductData(data);
        },
    });
};

export const useProduct = (productId: string | undefined) => {
    return useQuery<AppProduct, Error>({
        queryKey: ['products', productId],
        queryFn: async () => {
            if (!productId) throw new Error('Product ID is required');
            const data = await apiClient.get<ApiProductDetail>(`/products/${productId}`);
            return transformProductDetail(data);
        },
        enabled: !!productId, // Solo ejecutar la query si productId existe
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productData: CreateProductRequest) =>
            productService.createProduct(productData),
        onSuccess: () => {
            // Invalidar y refrescar la lista de productos
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ productId, productData }: { productId: string; productData: UpdateProductRequest }) =>
            productService.updateProduct(productId, productData),
        onSuccess: () => {
            // Invalidar y refrescar la lista de productos
            queryClient.invalidateQueries({ queryKey: ['products'] });
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

export const useCategories = () => {
    return useQuery<Category[], Error>({
        queryKey: ['categories'],
        queryFn: async () => {
            return await productService.getCategories();
        },
    });
};
