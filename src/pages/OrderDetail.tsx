
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useOrderDetail, useUpdateOrderStatus } from '@/hooks/useOrders';
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
import { Addition } from '@/models/order.model';

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: orderData, isLoading, error } = useOrderDetail(id!, {
    enabled: Boolean(id),
  });
  
  const updateOrderStatus = useUpdateOrderStatus(id!);
    const handleStatusChange = (newStatus: 'Pendiente' | 'Preparando' | 'Cancelado' | 'Entregado' | 'Finalizado') => {
    // Mapear los estados del frontend a los valores que espera la API
    const statusMap = {
      'Pendiente': 1,
      'Preparando': 2, 
      'Entregado': 3,
      'Cancelado': 4,
      'Finalizado': 5
    };
    
    updateOrderStatus.mutate(statusMap[newStatus], {
      onSuccess: () => {
        toast.success('Estado del pedido actualizado');
      },
      onError: () => {
        toast.error('Error actualizando el estado del pedido');
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
    if (error || !orderData) {
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

  const order = orderData.order;
  const orderItems = orderData.items;
  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pendiente':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Preparando':
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      case 'Entregado':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'Cancelado':
        return <Ban className="h-5 w-5 text-red-500" />;
      case 'Finalizado':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
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
        <h1 className="text-3xl font-bold">Pedido #{order.id_pedido}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 p-6">          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold">Detalle de la orden</h2>
              <p className="text-muted-foreground">
                {order.fecha ? formatDate(order.fecha) : 'Fecha no disponible'}
              </p>
            </div><div className="flex items-center space-x-2">
              {getStatusIcon(order.estado)}
              <span className="capitalize font-medium">
                {order.estado}
              </span>
            </div>
          </div>
          
          <Separator className="my-4" />
            <div className="space-y-4">
            <div>
              <h3 className="font-medium">Cliente</h3>
              <p>{order.nombre_cliente}</p>
            </div>
            
            {order.nombre_mesa && order.nombre_mesa !== 'Para llevar' && (
              <div>
                <h3 className="font-medium">Mesa</h3>
                <p>{order.nombre_mesa}</p>
              </div>
            )}

            {order.nombre_mesa === 'Para llevar' && (
              <div>
                <h3 className="font-medium">Tipo</h3>
                <p>Para llevar</p>
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
                      {orderItems.map((item, index) => (
                        <React.Fragment key={`${item.productId}-${index}`}>
                          <tr className="border-t">
                            <td className="p-2 px-4">{item.name}</td>
                            <td className="text-center p-2">{item.quantity}</td>
                            <td className="text-right p-2 px-4">${item.price.toLocaleString()}</td>
                            <td className="text-right p-2 px-4">${item.total.toLocaleString()}</td>
                          </tr>
                          {item.additions && item.additions.length > 0 && (
                            <tr className="bg-muted/30">
                              <td colSpan={4} className="p-2 px-6">
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Adiciones:</span>{' '}
                                  {item.additions.map((addition: Addition, i: number) => (
                                    <React.Fragment key={`addition-${addition.id}`}>
                                      {addition.name} (x{addition.quantity}) (+${addition.price.toLocaleString()})
                                      {i < item.additions!.length - 1 ? ', ' : ''}
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
                </div>              </div>
              
              <div className="mt-4 text-right">
                <p className="text-xl font-bold">
                  Total: ${orderItems.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Gestionar pedidos</h2>
            <div className="space-y-4">
            <div>
              <label className="block font-medium mb-2">Cambiar estado:</label>              <Select 
                value={order.estado} 
                onValueChange={(value: 'Pendiente' | 'Preparando' | 'Cancelado' | 'Entregado' | 'Finalizado') => handleStatusChange(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Preparando">Preparando</SelectItem>
                  <SelectItem value="Entregado">Entregado</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
                  <SelectItem value="Finalizado">Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4 space-y-4">              
              <Link to={`/orders/${order.id_pedido}/edit`}>
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
