import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { InventoryMovement } from '@/types/inventory';

export const useInventoryMovements = (productId: string) => {
    return useQuery<InventoryMovement[], Error>({
        queryKey: ['inventoryMovements', productId],
        queryFn: () => productService.getInventoryMovements(productId),
        enabled: !!productId,
    });
};
