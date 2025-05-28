
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Loader, ArrowRight, Ban, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { Order } from '@/models/order.model';
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

  const getOrderTypeBadge = () => {
    if (order.tableNumber) {
      return (
        <Badge variant="outline" className="flex items-center gap-1 font-medium">
          <UtensilsCrossed className="h-3 w-3" />
          <span>Mesa {order.tableNumber}</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1 font-medium">
          <ShoppingBag className="h-3 w-3" />
          <span>Para Llevar</span>
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
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="font-semibold text-lg">#{order.id}</h3>
                <div className="flex gap-2">
                  {getStatusBadge(order.status)}
                  {getOrderTypeBadge()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Cliente:</span> {order.clientName}
                </div>
                <div>
                  <span className="font-medium">Items:</span> {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
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
