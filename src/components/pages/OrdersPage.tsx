
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import CreateOrderDialog from '@/components/orders/CreateOrderDialog';

// Mock data for demonstration
const mockOrders = [
  {
    id_pedido: 1,
    fecha: new Date().toISOString(),
    estado: 'pendiente' as const,
    tipo_pedido: 'en_mesa' as const,
    mesa: 'Mesa 5',
    total: 45.50,
    items: 3
  },
  {
    id_pedido: 2,
    fecha: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    estado: 'procesado' as const,
    tipo_pedido: 'para_llevar' as const,
    mesa: null,
    total: 28.75,
    items: 2
  }
];

const OrdersPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [orders, setOrders] = useState(mockOrders);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'procesado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    return type === 'en_mesa' ? 'En Mesa' : 'Para Llevar';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Pedido
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {orders.map((order) => (
          <Card key={order.id_pedido} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">
                  Pedido #{order.id_pedido}
                </CardTitle>
                <Badge className={getStatusColor(order.estado)}>
                  {order.estado.charAt(0).toUpperCase() + order.estado.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium">{getTypeLabel(order.tipo_pedido)}</span>
              </div>
              
              {order.mesa && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Mesa:</span>
                  <span className="font-medium">{order.mesa}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Items:</span>
                <span className="font-medium">{order.items}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Hora:</span>
                <span className="font-medium">
                  {new Date(order.fecha).toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-lg font-bold text-green-600">
                  ${order.total.toFixed(2)}
                </span>
                <Button size="sm" variant="outline">
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateOrderDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onOrderCreated={(newOrder) => {
          setOrders([newOrder, ...orders]);
        }}
      />
    </div>
  );
};

export default OrdersPage;
