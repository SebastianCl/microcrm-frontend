
import { useNetwork } from '@/hooks/useNetwork';
import { Wifi, WifiOff } from 'lucide-react';
import { useEffect } from 'react';
import { toast } from '@/components/ui/sonner';

const NetworkStatus = () => {
  const { isOnline, hasNetworkError } = useNetwork();
  
  useEffect(() => {
    if (!isOnline) {
      toast.error('Sin conexión a Internet. Algunas funciones pueden no estar disponibles.', {
        duration: 5000,
        id: 'network-offline',
      });
    } else if (isOnline && hasNetworkError) {
      toast.success('Conexión a Internet restaurada.', {
        duration: 3000,
        id: 'network-online',
      });
    }
  }, [isOnline, hasNetworkError]);

  // Only show the indicator when offline
  if (isOnline) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-red-100 border-red-400 border rounded-md p-2 shadow-md flex items-center gap-2">
      <WifiOff size={16} className="text-red-600" />
      <span className="text-sm font-medium text-red-600">Offline</span>
    </div>
  );
};

export default NetworkStatus;
