import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';

interface FinancialSummary {
    total_venta: string;
    total_gastos: string;
    total_pen: string;
}

const fetchFinancialSummary = async (): Promise<FinancialSummary> => {
    const response = await apiClient.get<FinancialSummary[]>('/ventas/subtotal');
    return response[0]; // Devuelve el primer elemento del array
};

export const useFinancialSummary = () => {
    return useQuery({
        queryKey: ['financial-summary'],
        queryFn: fetchFinancialSummary,
        staleTime: 0, // Los datos siempre se consideran obsoletos
        refetchOnWindowFocus: true, // Refrescar cuando la ventana obtiene el foco
        refetchOnMount: true, // Refrescar cada vez que el componente se monta
        refetchInterval: 2 * 60 * 1000, // Refrescar cada 2 minutos automáticamente
    });
};
