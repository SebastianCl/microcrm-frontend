import { useState, useEffect } from 'react';

/**
 * Hook para monitorear el estado de la conexión a Internet
 * @returns {Object} Estado de la conexión y funciones para verificar conectividad
 */
export const useNetwork = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    // Manejadores para eventos de conexión
    const handleOnline = () => {
      setIsOnline(true);
      setHasNetworkError(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasNetworkError(true);
    };

    // Registrar los manejadores de eventos
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Limpieza cuando el componente se desmonte
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Verifica activamente la conexión haciendo un ping a la API
   */
  const checkConnectivity = async (url?: string) => {
    const testUrl = url || '/api/health';
    setIsChecking(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos de timeout

      const response = await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      
      const isConnected = response.ok;
      setIsOnline(isConnected);
      setHasNetworkError(!isConnected);
      setLastCheck(new Date());
      return isConnected;
    } catch (error) {
      setIsOnline(false);
      setHasNetworkError(true);
      setLastCheck(new Date());
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  return {
    isOnline,
    hasNetworkError,
    lastCheck,
    isChecking,
    checkConnectivity,
  };
};
