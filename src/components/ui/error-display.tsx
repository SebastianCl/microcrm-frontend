import React from 'react';
import { AlertTriangle, XCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiError } from '@/types/api';

interface ErrorDisplayProps {
  error: Error | ApiError | string | null;
  onRetry?: () => void;
  variant?: 'warning' | 'error' | 'info';
  className?: string;
}

/**
 * Componente para mostrar errores de manera consistente en toda la aplicación
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  variant = 'error',
  className = '',
}) => {
  if (!error) return null;

  const message = typeof error === 'string' 
    ? error 
    : error.message || 'Ha ocurrido un error';

  // Determinar el estilo según la variante
  const styles = {
    warning: {
      container: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
      icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    },
    error: {
      container: 'bg-red-50 border border-red-200 text-red-800',
      icon: <XCircle className="h-5 w-5 text-red-600" />,
    },
    info: {
      container: 'bg-blue-50 border border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-600" />,
    },
  };

  // Determinar si es un error de API y extraer el código de estado si está disponible
  const isApiError = error instanceof ApiError;
  const statusCode = isApiError ? error.status : undefined;

  return (
    <div className={`p-4 rounded-md flex items-start mb-4 ${styles[variant].container} ${className}`}>
      <div className="mr-3 flex-shrink-0">{styles[variant].icon}</div>
      <div className="flex-grow">
        <div className="font-medium">
          {isApiError && statusCode ? `Error ${statusCode}: ` : ''}
          {message}
        </div>
        {isApiError && error.data?.details && (
          <div className="text-sm mt-1">{error.data.details}</div>
        )}
      </div>
      {onRetry && (
        <Button 
          variant="link" 
          className={`p-0 h-auto ml-4 ${variant === 'error' ? 'text-red-800' : variant === 'warning' ? 'text-yellow-800' : 'text-blue-800'}`}
          onClick={onRetry}
        >
          Reintentar
        </Button>
      )}
    </div>
  );
};
