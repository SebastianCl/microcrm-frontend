import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
import { InventoryMovement } from '@/types/inventory';

export const useInventoryMovements = (productId: string) => {
    return useQuery<InventoryMovement[], Error>({
        queryKey: ['inventoryMovements', productId],
        queryFn: () => productService.getInventoryMovements(productId),
        enabled: !!productId,
    });
};

export const useCreateInventoryMovement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (movementData: {
            id_producto: number;
            cantidad: number;
            tipo_movimiento: 'entrada' | 'salida';
            comentario: string;
            fecha: string;
        }) => productService.createInventoryMovement(movementData),
        onSuccess: (_, variables) => {
            // Invalidar las queries relacionadas para refrescar los datos
            queryClient.invalidateQueries({ queryKey: ['inventoryMovements', variables.id_producto.toString()] });
            queryClient.invalidateQueries({ queryKey: ['product', variables.id_producto.toString()] });
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};
