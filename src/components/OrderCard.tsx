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
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1 px-3 py-1">
            <Clock className="h-3 w-3" />
            <span className="font-medium">Pendiente</span>
          </Badge>
        );
      case 'Preparando':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1 px-3 py-1">
            <Loader className="h-3 w-3 animate-spin" />
            <span className="font-medium">Preparando</span>
          </Badge>
        );
      case 'Cancelado':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1 px-3 py-1">
            <X className="h-3 w-3" />
            <span className="font-medium">Cancelado</span>
          </Badge>
        );
      case 'Entregado':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1 px-3 py-1">
            <Check className="h-3 w-3" />
            <span className="font-medium">Entregado</span>
          </Badge>
        );
      case 'Finalizado':
        return (
          <Badge className="bg-teal-100 text-teal-800 hover:bg-teal-200 flex items-center gap-1 px-3 py-1">
            <Check className="h-3 w-3" />
            <span className="font-medium">Finalizado</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
            <span className="font-medium">{status}</span>
          </Badge>
        );
    }
  };

  const getNextStatus = (currentStatus: string) => {
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

    // Si está tratando de finalizar, redireccionar al detalle del orden
    if (nextStatus === 'Finalizado') {
      navigate(`/orders/${order.id_pedido}`);
      toast.info('Redirigiendo a detalle para finalizar orden y seleccionar método de pago');
      return;
    }

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
        toast.error('ID de orden inválido');
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
        className="cursor-pointer hover:shadow-xl transition-all duration-300 border hover:border-primary/30 group bg-card/80 backdrop-blur-sm"
        onClick={() => navigate(`/orders/${order.id_pedido}`)}
      >
        <CardContent className="p-4">
          {/* Header compacto */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                {order.tipo_pedido === 'para_llevar' || order.nombre_mesa === 'Para llevar' ? (
                  <ShoppingBag className="h-4 w-4 text-primary" />
                ) : (
                  <UtensilsCrossed className="h-4 w-4 text-primary" />
                )}
              </div>
              <h3 className="font-bold text-lg">#{order.id_pedido}</h3>
            </div>
            {getStatusBadge(order.estado)}
          </div>

          {/* Información compacta */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Cliente:</span>
              <span className="font-semibold truncate ml-2 max-w-[120px]" title={order.nombre_cliente}>
                {order.nombre_cliente}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-medium">Tipo:</span>
              <Badge variant="outline" className="text-xs px-2 py-0.5 flex items-center gap-1">
                {order.tipo_pedido === 'para_llevar' || order.nombre_mesa === 'Para llevar' ? (
                  <>
                    <ShoppingBag className="h-3 w-3" />
                    <span>Para llevar</span>
                  </>
                ) : (
                  <>
                    <UtensilsCrossed className="h-3 w-3" />
                    <span>{order.nombre_mesa}</span>
                  </>
                )}
              </Badge>
            </div>

          </div>

          {/* Botones de acción con espaciado para touch */}
          <div className="space-y-3">
            {nextStatus && (
              <Button
                variant="default"
                size="sm"
                onClick={handleNextStatus}
                disabled={updateStatus.isPending}
                className="w-full h-11 flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
              >
                {updateStatus.isPending ? (
                  <Loader className="h-3 w-3 animate-spin" />
                ) : (
                  <ArrowRight className="h-3 w-3" />
                )}
                {nextStatusLabel}
              </Button>
            )}

            {order.estado === 'Finalizado' && (
              <Button
                variant="default"
                size="sm"
                onClick={handleDownloadInvoice}
                className="w-full h-11 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-sm font-medium"
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
                className="w-full h-10 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 text-xs"
              >
                <Ban className="h-3 w-3" />
                Cancelar
              </Button>
            )}
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
