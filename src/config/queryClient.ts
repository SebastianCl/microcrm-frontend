import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/types/api";

/**
 * Configuración de opciones por defecto para React Query
 */
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // No recargar datos cuando la ventana recupera el foco
      retry: (failureCount: number, error: unknown) => {
        // No reintentar en caso de errores de autenticación (401) o autorización (403)
        if (error instanceof ApiError && [401, 403].includes(error.status)) {
          return false;
        }
        // Reintentar máximo 3 veces para otros errores
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // Datos considerados "frescos" por 5 minutos
    },
    mutations: {
      retry: false, // No reintentar mutaciones por defecto
      onError: (error: unknown) => {
        // Manejar errores específicos de mutación globalmente si es necesario
        console.error("Error en mutación:", error);
      },
    },
  },
};

/**
 * Función para crear una instancia de QueryClient con configuración personalizada
 */
export const createQueryClient = (config = {}) => {
  return new QueryClient({
    ...queryClientConfig,
    ...config,
  });
};
