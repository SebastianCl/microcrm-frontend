
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Loader, ArrowRight, Ban } from 'lucide-react';
import { Order } from '@/models/order.model';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { toast } from 'sonner';
import CancelOrderConfirmation from './CancelOrderConfirmation';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const updateStatus = useUpdateOrderStatus(order.id);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  const getStatusBadge = (status: 'pending' | 'processed' | 'canceled' | 'completed') => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>Completada</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pendiente</span>
          </Badge>
        );
      case 'processed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
            <Loader className="h-3 w-3" />
            <span>Procesando</span>
          </Badge>
        );
      case 'canceled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <X className="h-3 w-3" />
            <span>Cancelada</span>
          </Badge>
        );
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'processed';
      case 'processed': return 'completed';
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending': return 'Procesar';
      case 'processed': return 'Completar';
      default: return null;
    }
  };

  const handleNextStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = getNextStatus(order.status);
    if (!nextStatus) return;

    try {
      await updateStatus.mutateAsync(nextStatus as 'pending' | 'processed' | 'canceled' | 'completed');
      toast.success(`Estado de orden ${order.id} actualizado`);
    } catch (error) {
      toast.error('Error al actualizar el estado');
      console.error('Error updating status:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await updateStatus.mutateAsync('canceled');
      toast.success(`Orden ${order.id} cancelada`);
      setShowCancelDialog(false);
    } catch (error) {
      toast.error('Error al cancelar la orden');
      console.error('Error canceling order:', error);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };

  const nextStatus = getNextStatus(order.status);
  const nextStatusLabel = getNextStatusLabel(order.status);

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow duration-200 p-4"
        onClick={() => navigate(`/orders/${order.id}`)}
      >
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Order Info */}
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="font-semibold text-lg">#{order.id}</h3>
                {getStatusBadge(order.status)}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Cliente:</span> {order.clientName}
                </div>
                {order.tableNumber && (
                  <div>
                    <span className="font-medium">Mesa:</span> {order.tableNumber}
                  </div>
                )}
                <div>
                  <span className="font-medium">Fecha:</span> {formatDate(order.date)}
                </div>
              </div>
              
              <div className="text-lg font-bold text-primary">
                ${order.total.toFixed(2)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 min-w-0 sm:min-w-[200px]">
              {nextStatus && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleNextStatus}
                  disabled={updateStatus.isPending}
                  className="flex items-center gap-1 whitespace-nowrap"
                >
                  <ArrowRight className="h-3 w-3" />
                  {nextStatusLabel}
                </Button>
              )}
              
              {order.status !== 'canceled' && order.status !== 'completed' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCancelDialog(true);
                  }}
                  className="flex items-center gap-1 text-red-600 hover:text-red-700 whitespace-nowrap"
                >
                  <Ban className="h-3 w-3" />
                  Cancelar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CancelOrderConfirmation
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancel}
      />
    </>
  );
};

export default OrderCard;
