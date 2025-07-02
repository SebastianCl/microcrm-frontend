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
        staleTime: 5 * 60 * 1000, // 5 minutos
        refetchInterval: 10 * 60 * 1000, // Refrescar cada 10 minutos
    });
};
