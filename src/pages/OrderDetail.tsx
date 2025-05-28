
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronLeft, 
  Ban, 
  CheckCircle2, 
  Clock, 
  RefreshCw,
  Loader2 
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageProvider';
import { Addition } from '@/models/order.model';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const { data: order, isLoading, error } = useOrder(id!, {
    enabled: Boolean(id),
  });
  
  const updateOrderStatus = useUpdateOrderStatus(id!);
  
  const handleStatusChange = (newStatus: 'pending' | 'processed' | 'canceled' | 'completed') => {
    updateOrderStatus.mutate(newStatus, {
      onSuccess: () => {
        toast.success(t('order_status_updated'));
      },
      onError: () => {
        toast.error(t('error_updating_order'));
      }
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-destructive">
          Error cargando la orden
        </h2>
        <p className="text-muted-foreground mt-2">
          Inténtalo de nuevo más tarde
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/orders')}
        >
          Volver
        </Button>
      </div>
    );
  }

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processed':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'canceled':
        return <Ban className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('default', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/orders')}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold">Pedido #{order.id}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Detalle de la orden</h2>
              <p className="text-muted-foreground">{formatDate(order.date)}</p>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(order.status)}
              <span className="capitalize font-medium">
                {t(`status_${order.status}`)}
              </span>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Cliente</h3>
              <p>{order.clientName}</p>
            </div>
            
            {order.tableNumber && (
              <div>
                <h3 className="font-medium">Mesa</h3>
                <p>Mesa #{order.tableNumber}</p>
              </div>
            )}
            
            <div>
              <h3 className="font-medium mb-2">Artículos</h3>
              <div className="border rounded-md">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left p-2 px-4">Producto</th>
                        <th className="text-center p-2">Cantidad</th>
                        <th className="text-right p-2 px-4">Precio</th>
                        <th className="text-right p-2 px-4">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <React.Fragment key={`${item.productId}-${index}`}>
                          <tr className="border-t">
                            <td className="p-2 px-4">{item.name}</td>
                            <td className="text-center p-2">{item.quantity}</td>
                            <td className="text-right p-2 px-4">${item.price}</td>
                            <td className="text-right p-2 px-4">${item.total}</td>
                          </tr>
                          {item.additions && item.additions.length > 0 && (
                            <tr className="bg-muted/30">
                              <td colSpan={4} className="p-2 px-6">
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Adiciones:</span>{' '}
                                  {item.additions.map((addition: Addition, i: number) => (
                                    <React.Fragment key={`addition-${addition.id}`}>
                                      {addition.name} (+${addition.price})
                                      {i < item.additions.length - 1 ? ', ' : ''}
                                    </React.Fragment>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="mt-4 text-right">
                <p className="text-xl font-bold">Total: ${order.total}</p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Gestionar pedidos</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Cambiar estado:</label>
              <Select 
                value={order.status} 
                onValueChange={(value: 'pending' | 'processed' | 'canceled' | 'completed') => handleStatusChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="processed">Preparando</SelectItem>
                  <SelectItem value="completed">Entregado</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                  <SelectItem value="finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4 space-y-4">
              <Button className="w-full" variant="outline">
                Imprimir
              </Button>
              <Button className="w-full" variant="outline">
                Enviar a email
              </Button>
              <Link to={`/orders/${order.id}/edit`}>
                <Button className="w-full">
                  Editar orden
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default OrderDetail;
