import { AppProduct } from '@/models/product.model';
import { InventoryItem } from '@/types/inventory';

/**
 * Convierte un AppProduct a InventoryItem para usar en la lista de inventario
 */
export const productToInventoryItem = (product: AppProduct): InventoryItem => {
    // Determinar el estado basado en el stock
    let status = 'En stock';
    if (!product.managesInventory) {
        status = 'En stock'; // Si no maneja inventario, siempre está en stock
    } else if (product.stockQuantity === 0) {
        status = 'Sin stock';
    } else if (product.stockQuantity <= 5) { // Umbral bajo configurable
        status = 'Bajo stock';
    }

    return {
        id: product.id,
        name: product.name,
        category: product.categoryName,
        price: product.price,
        stockQuantity: product.managesInventory ? product.stockQuantity : Infinity,
        status: product.isActive ? status : 'Inactivo',
        description: product.description,
    };
};

/**
 * Convierte una lista de AppProduct a InventoryItem
 */
export const productsToInventoryItems = (products: AppProduct[]): InventoryItem[] => {
    return products.map(productToInventoryItem);
};
