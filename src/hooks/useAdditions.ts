import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { additionsService } from '@/services/additionsService';
import {
    ProductAddition,
    CreateProductAdditionData,
    UpdateProductAdditionData
} from '@/models/product-addition.model';
import { useToast } from '@/components/ui/use-toast';

export const useAdditions = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    /**
     * Query para obtener todas las adiciones
     */
    const additionsQuery = useQuery<ProductAddition[], Error>({
        queryKey: ['additions'],
        queryFn: additionsService.getAdditions,
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: (failureCount, error) => {
            // Solo reintentar 2 veces para errores de red
            if (failureCount < 2) {
                return true;
            }
            return false;
        }
    });

    // Manejar errores de carga
    React.useEffect(() => {
        if (additionsQuery.error) {
            toast({
                title: "❌ Error al cargar datos",
                description: additionsQuery.error.message,
                variant: "destructive",
            });
        }
    }, [additionsQuery.error, toast]);

    /**
     * Mutation para crear una nueva adición
     */
    const createAdditionMutation = useMutation({
        mutationFn: additionsService.createAddition,
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['additions'] });
            toast({
                title: "Adición creada",
                description: result.message,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    /**
     * Mutation para cambiar el estado de una adición
     */
    const toggleStatusMutation = useMutation({
        mutationFn: additionsService.toggleAdditionStatus,
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['additions'] });
            toast({
                title: "Adición actualizada",
                description: result.message,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    /**
     * Mutation para actualizar una adición
     */
    const updateAdditionMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateProductAdditionData }) =>
            additionsService.updateAddition(id, data),
        onSuccess: (result) => {
            queryClient.invalidateQueries({ queryKey: ['additions'] });
            toast({
                title: "Adición actualizada",
                description: result.message,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Error",
                description: error.message,
                variant: "destructive",
            });
        }
    });

    return {
        // Data
        additions: additionsQuery.data || [],

        // Loading states
        isLoading: additionsQuery.isLoading,
        isCreating: createAdditionMutation.isPending,
        isUpdating: updateAdditionMutation.isPending,
        isTogglingStatus: toggleStatusMutation.isPending,

        // Error states
        error: additionsQuery.error,
        createError: createAdditionMutation.error,
        updateError: updateAdditionMutation.error,

        // Methods
        createAddition: createAdditionMutation.mutate,
        updateAddition: updateAdditionMutation.mutate,
        toggleAdditionStatus: toggleStatusMutation.mutate,

        // Refetch
        refetch: additionsQuery.refetch
    };
};

export default useAdditions;
