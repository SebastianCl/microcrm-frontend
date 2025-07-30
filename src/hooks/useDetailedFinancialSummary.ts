import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { getCurrentDate } from '@/lib/utils';

interface PedidoPorTipo {
    tipo_pedido: string;
    cantidad_pedidos: number;
}

interface VentaPorMedioPago {
    metodo_pago: string;
    total: string;
}

interface TopProducto {
    id_producto: number;
    producto: string;
    total_vendido: string;
}

interface ProductoConMenosStock {
    id_producto: number;
    nombre: string;
    stock: number;
}

export interface DetailedFinancialSummary {
    pedidos_por_tipo: PedidoPorTipo[];
    ventas_por_medio_pago: VentaPorMedioPago[];
    ticket_promedio: number;
    top_productos_mas_vendidos: TopProducto[];
    productos_con_menos_stock: ProductoConMenosStock[];
    total_gastos_fecha: number;
    flujo_neto_caja: number;
}

const fetchDetailedFinancialSummary = async (): Promise<DetailedFinancialSummary> => {
    const todayString = getCurrentDate();
    const response = await apiClient.get<DetailedFinancialSummary>(`/finance/summary?fecha_inicio=${todayString}`);
    return response;
};

export const useDetailedFinancialSummary = () => {
    return useQuery({
        queryKey: ['detailed-financial-summary'],
        queryFn: fetchDetailedFinancialSummary,
        staleTime: 0, // Los datos siempre se consideran obsoletos
        refetchOnWindowFocus: true, // Refrescar cuando la ventana obtiene el foco
        refetchOnMount: true, // Refrescar cada vez que el componente se monta
        refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos automáticamente
    });
};
