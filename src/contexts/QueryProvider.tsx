import { QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createQueryClient } from '@/config/queryClient';

// Crear cliente de React Query con la configuración personalizada
const queryClient = createQueryClient();

// Proveedor para envolver la aplicación
export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
