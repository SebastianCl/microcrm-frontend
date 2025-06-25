import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock, Loader, ArrowRight, Ban, UtensilsCrossed, ShoppingBag, Download } from 'lucide-react';
import { Order } from '@/models/order.model';
import { useUpdateOrderStatus } from '@/hooks/useOrders';
import { toast } from 'sonner';
import CancelOrderConfirmation from './CancelOrderConfirmation';
import { invoiceService } from '@/services/invoiceService';

interface OrderCardProps {
  order: Order;
}

const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const navigate = useNavigate();
  const updateStatus = useUpdateOrderStatus(order.id_pedido);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);

  const getStatusBadge = (status: 'Pendiente' | 'Preparando' | 'Cancelado' | 'Entregado' | 'Finalizado') => {
    switch (status) {
      case 'Pendiente':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pendiente</span>
          </Badge>
        );
      case 'Preparando':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
            <Loader className="h-3 w-3" />
            <span>Preparando</span>
          </Badge>
        ); case 'Cancelado':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <X className="h-3 w-3" />
            <span>Cancelado</span>
          </Badge>
        );
      case 'Entregado':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <X className="h-3 w-3" />
            <span>Entregado</span>
          </Badge>
        );
      case 'Finalizado':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <X className="h-3 w-3" />
            <span>Finalizado</span>
          </Badge>
        );
    }
  };

  const getOrderTypeBadge = () => {
    if (order.nombre_mesa === 'Para llevar') {
      return (
        <Badge variant="outline" className="flex items-center gap-1 font-medium">
          <ShoppingBag className="h-3 w-3" />
          <span>Para Llevar</span>
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="flex items-center gap-1 font-medium">
          <UtensilsCrossed className="h-3 w-3" />
          <span>{order.nombre_mesa}</span>
        </Badge>
      );
    }
  }; const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Pendiente': return 'Preparando';    // 1 -> 2
      case 'Preparando': return 'Entregado';    // 2 -> 3  
      case 'Entregado': return 'Finalizado';    // 3 -> 5
      default: return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    switch (currentStatus) {
      case 'Pendiente': return 'Iniciar preparación';
      case 'Preparando': return 'Marcar como entregado';
      case 'Entregado': return 'Finalizar';
      default: return null;
    }
  };
  const handleNextStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = getNextStatus(order.estado);
    if (!nextStatus) return;

    // Mapear estados en español a IDs de estado que espera el backend
    const statusIdMap: Record<string, number> = {
      'Pendiente': 1,     // Pendiente
      'Preparando': 2,    // Preparando  
      'Entregado': 3,     // Entregado
      'Finalizado': 5,    // Finalizado
      'Cancelado': 4      // Cancelado
    };

    const estadoId = statusIdMap[nextStatus];
    if (!estadoId) return;

    try {
      await updateStatus.mutateAsync(estadoId);
      toast.success(`Estado de orden ${order.id_pedido} actualizado`);
    } catch (error) {
      toast.error('Error al actualizar el estado');
      console.error('Error updating status:', error);
    }
  };

  const handleDownloadInvoice = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      // Asegurarse de que id_venta es un número
      const ventdaID = typeof order.id_venta === 'string' ? parseInt(order.id_venta, 10) : order.id_venta;
      if (isNaN(ventdaID)) {
        toast.error('ID de pedido inválido');
        return;
      }
      const response = await invoiceService.generateInvoice(ventdaID);
      if (response.success && response.data && response.data.base64) {
        const pdfBlob = new Blob([Uint8Array.from(atob(response.data.base64), c => c.charCodeAt(0))], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = `factura-${order.id_venta}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Factura descargada');
      } else {
        toast.error('Error al obtener la factura de la respuesta');
        console.error('Invalid response structure for invoice:', response);
      }
    } catch (error) {
      toast.error('Error al descargar la factura');
      console.error('Error downloading invoice:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await updateStatus.mutateAsync(4); // ID 4 = Cancelado
      toast.success(`Orden ${order.id_pedido} cancelada`);
      setShowCancelDialog(false);
    } catch (error) {
      toast.error('Error al cancelar la orden');
      console.error('Error canceling order:', error);
    }
  };

  const nextStatus = getNextStatus(order.estado);
  const nextStatusLabel = getNextStatusLabel(order.estado);

  return (
    <>
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow duration-200 p-4"
        onClick={() => navigate(`/orders/${order.id_pedido}`)}
      >
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Order Info */}
            <div className="flex-1 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h3 className="font-semibold text-lg">#{order.id_pedido}</h3>
                <div className="flex gap-2">
                  {getStatusBadge(order.estado)}
                  {getOrderTypeBadge()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Cliente:</span> {order.nombre_cliente}
                </div>
                {/* <div>
                  <span className="font-medium">Items:</span> {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                </div> */}
              </div>

              {/* <div className="text-lg font-bold text-primary">
                ${order.total.toFixed(2)}
              </div> */}
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

              {order.estado === 'Finalizado' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-1 whitespace-nowrap bg-green-500 hover:bg-green-600"
                >
                  <Download className="h-3 w-3" />
                  Descargar Factura
                </Button>
              )}

              {order.estado !== 'Cancelado' && order.estado !== 'Finalizado' && (
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
