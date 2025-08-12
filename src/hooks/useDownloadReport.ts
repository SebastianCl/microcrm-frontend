import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/apiClient';
import { useToast } from './use-toast';

const downloadReport = async (date: string) => {
    const response = await apiClient.get<{ success: boolean, data: { base64: string }, message?: string }>(`/finance/report?fecha_inicio=${date}`);
    return response;
};

const base64ToBlob = (base64: string, type: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type });
}

export const useDownloadReport = () => {
    const { toast } = useToast();

    return useMutation({
        mutationFn: downloadReport,
        onSuccess: (data, date) => {
            if (data.success && data.data.base64) {
                const blob = base64ToBlob(data.data.base64, 'application/pdf');
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `reporte_${date}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(url);

                toast({
                    title: 'Reporte descargado',
                    description: 'El reporte se ha descargado exitosamente.',
                });
            } else {
                throw new Error(data.message || 'Respuesta de API inválida o reporte no disponible.');
            }
        },
        onError: (error: Error) => {
            toast({
                title: 'Error al descargar',
                description: error.message || 'No se pudo descargar el reporte.',
                variant: 'destructive',
            });
        },
    });
};