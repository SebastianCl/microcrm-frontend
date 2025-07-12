import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gastosService, tiposGastoService } from '@/services/gastosService';
import { Gasto, CreateGastoDto, UpdateGastoDto, TipoGasto, CreateTipoGastoDto, UpdateTipoGastoDto } from '@/models/gastos.model';

// Keys para las queries
export const GASTOS_QUERY_KEYS = {
    GASTOS: 'gastos',
    GASTO: (id: string) => ['gastos', id],
    GASTOS_BY_DATE_RANGE: (fechaInicio: string, fechaFin?: string) => ['gastos', 'fecha', fechaInicio, fechaFin],
    TIPOS_GASTO: 'tipos-gasto',
    TIPO_GASTO: (id: string) => ['tipos-gasto', id],
};

/**
 * Hook para obtener todos los gastos
 */
export const useGastos = (fechaInicio?: string, options = {}) => {
    return useQuery({
        queryKey: fechaInicio ? GASTOS_QUERY_KEYS.GASTOS_BY_DATE_RANGE(fechaInicio) : [GASTOS_QUERY_KEYS.GASTOS],
        queryFn: async () => {
            try {
                return await gastosService.getAll(fechaInicio);
            } catch (error) {
                // Si es un error 404, retornar array vacío (no hay gastos registrados)
                if (error?.status === 404) {
                    return [];
                }
                // Relanzar otros errores
                throw error;
            }
        },
        ...options,
    });
};

/**
 * Hook para obtener un gasto por su ID
 */
export const useGasto = (id: string, options = {}) => {
    return useQuery({
        queryKey: GASTOS_QUERY_KEYS.GASTO(id),
        queryFn: () => gastosService.getById(id),
        enabled: Boolean(id), // Solo realizar la consulta si hay un ID
        ...options,
    });
};

/**
 * Hook para obtener gastos por rango de fechas
 */
export const useGastosByDateRange = (fechaInicio: string, fechaFin?: string, options = {}) => {
    return useQuery({
        queryKey: GASTOS_QUERY_KEYS.GASTOS_BY_DATE_RANGE(fechaInicio, fechaFin),
        queryFn: async () => {
            try {
                return await gastosService.getByDateRange(fechaInicio, fechaFin);
            } catch (error) {
                // Si es un error 404, retornar array vacío (no hay gastos en el rango de fechas)
                if (error?.status === 404) {
                    return [];
                }
                // Relanzar otros errores
                throw error;
            }
        },
        enabled: Boolean(fechaInicio), // Solo realizar la consulta si hay fecha de inicio
        ...options,
    });
};

/**
 * Hook para crear un nuevo gasto
 */
export const useCreateGasto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (gasto: CreateGastoDto) => gastosService.create(gasto),
        onSuccess: (data) => {
            // Invalidar la caché para recargar los datos
            queryClient.invalidateQueries({ queryKey: [GASTOS_QUERY_KEYS.GASTOS] });
            console.log('Gasto creado exitosamente:', data);
        },
        onError: (error) => {
            console.error('Error al crear gasto:', error);
        },
    });
};

/**
 * Hook para actualizar un gasto
 */
export const useUpdateGasto = (id: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (gasto: UpdateGastoDto) => gastosService.update(id, gasto),
        onSuccess: (updatedGasto) => {
            // Actualizar el gasto en la caché
            queryClient.setQueryData(GASTOS_QUERY_KEYS.GASTO(id), updatedGasto);
            // Invalidar la lista de gastos
            queryClient.invalidateQueries({ queryKey: [GASTOS_QUERY_KEYS.GASTOS] });
        },
    });
};

/**
 * Hook para eliminar un gasto
 */
export const useDeleteGasto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => gastosService.delete(id),
        onSuccess: (_, id) => {
            // Eliminar el gasto de la caché
            queryClient.removeQueries({ queryKey: GASTOS_QUERY_KEYS.GASTO(id) });
            // Invalidar la lista de gastos
            queryClient.invalidateQueries({ queryKey: [GASTOS_QUERY_KEYS.GASTOS] });
        },
    });
};

// Hooks para tipos de gasto

/**
 * Hook para obtener todos los tipos de gasto
 */
export const useTiposGasto = (options = {}) => {
    return useQuery({
        queryKey: [GASTOS_QUERY_KEYS.TIPOS_GASTO],
        queryFn: () => tiposGastoService.getAll(),
        ...options,
    });
};

/**
 * Hook para obtener un tipo de gasto por su ID
 */
export const useTipoGasto = (id: string, options = {}) => {
    return useQuery({
        queryKey: GASTOS_QUERY_KEYS.TIPO_GASTO(id),
        queryFn: () => tiposGastoService.getById(id),
        enabled: Boolean(id), // Solo realizar la consulta si hay un ID
        ...options,
    });
};

/**
 * Hook para crear un nuevo tipo de gasto
 */
export const useCreateTipoGasto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tipoGasto: CreateTipoGastoDto) => tiposGastoService.create(tipoGasto),
        onSuccess: (data) => {
            // Invalidar la caché para recargar los tipos de gasto
            queryClient.invalidateQueries({ queryKey: [GASTOS_QUERY_KEYS.TIPOS_GASTO] });
            console.log('Tipo de gasto creado exitosamente:', data);
        },
        onError: (error) => {
            console.error('Error al crear tipo de gasto:', error);
        },
    });
};

/**
 * Hook para actualizar un tipo de gasto
 */
export const useUpdateTipoGasto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, tipoGasto }: { id: number; tipoGasto: UpdateTipoGastoDto }) =>
            tiposGastoService.update(id, tipoGasto),
        onSuccess: (data) => {
            // Invalidar la caché para recargar los tipos de gasto
            queryClient.invalidateQueries({ queryKey: [GASTOS_QUERY_KEYS.TIPOS_GASTO] });
            console.log('Tipo de gasto actualizado exitosamente:', data);
        },
        onError: (error) => {
            console.error('Error al actualizar tipo de gasto:', error);
        },
    });
};
