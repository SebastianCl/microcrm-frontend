import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';

// Mock data para simular APIs
export const useConfiguration = () => {
  const { toast } = useToast();

  // Función genérica para mostrar toast de éxito
  const showSuccessToast = useCallback((title: string, description: string) => {
    toast({
      title,
      description,
    });
  }, [toast]);

  // Función genérica para mostrar toast de error
  const showErrorToast = useCallback((title: string, description: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  }, [toast]);

  // Estados para controlar la carga
  const [isLoading, setIsLoading] = useState(false);

  // Simular llamadas API con delay
  const simulateApiCall = useCallback(async (operation: () => void, delay: number = 500) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    operation();
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    showSuccessToast,
    showErrorToast,
    simulateApiCall,
  };
};

// Hook específico para validaciones comunes
export const useConfigurationValidation = () => {
  const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value.trim()) {
      return `${fieldName} es obligatorio`;
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email no válido';
    }
    return null;
  };

  const validatePrice = (price: string): string | null => {
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      return 'El precio debe ser mayor a 0';
    }
    return null;
  };

  const validateUniqueName = (name: string, existingItems: any[], currentId?: string): string | null => {
    const normalizedName = name.toLowerCase().trim();
    const exists = existingItems.some(item => 
      item.name?.toLowerCase() === normalizedName || 
      item.nombre_mesa?.toLowerCase() === normalizedName
    );
    
    if (exists && (!currentId || existingItems.find(item => 
      (item.name?.toLowerCase() === normalizedName || 
       item.nombre_mesa?.toLowerCase() === normalizedName) && 
      item.id !== currentId && item.id_mesa?.toString() !== currentId
    ))) {
      return 'Ya existe un elemento con ese nombre';
    }
    return null;
  };

  return {
    validateRequired,
    validateEmail,
    validatePrice,
    validateUniqueName,
  };
};
