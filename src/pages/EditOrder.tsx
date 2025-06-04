
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOrder, useUpdateOrder } from '@/hooks/useOrders';
import { OrderItem } from '@/models/order.model';
import { toast } from "sonner";
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Loader2 } from 'lucide-react';
import QuickProductSelector from '@/components/QuickProductSelector';
import OrderItemRow from '@/components/OrderItemRow';

const EditOrder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useOrder(id!, {
    enabled: Boolean(id),
  });

  const updateOrder = useUpdateOrder(id!);
  
  const [orderItems, setOrderItems] = useState<(OrderItem & { discount?: number; discountType?: string })[]>([]);

  useEffect(() => {
    if (order?.items) {
      setOrderItems(order.items);
    }
  }, [order]);

  const handleAddProduct = (product: OrderItem) => {
    // Check if product already exists in order
    const existingProductIndex = orderItems.findIndex(
      item => item.productId === product.productId && 
      JSON.stringify(item.additions || []) === JSON.stringify(product.additions || [])
    );
    
    if (existingProductIndex >= 0) {
      // Update existing product quantity
      const updatedItems = [...orderItems];
      updatedItems[existingProductIndex].quantity += product.quantity;
      updatedItems[existingProductIndex].total += product.total;
      setOrderItems(updatedItems);
    } else {
      // Add new product
      setOrderItems([...orderItems, { 
        ...product, 
        discount: 0, 
        discountType: 'none' 
      }]);
    }
    
    toast.success(`${product.name} Agregar a la orden`);
  };

  const handleUpdateOrderItem = (index: number, updatedItem: OrderItem & { discount?: number; discountType?: string }) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = updatedItem;
    setOrderItems(updatedItems);
    toast.success('Producto actualizado');
  };

  const handleRemoveProduct = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
    toast.success('Producto removido');
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveOrder = async () => {
    if (orderItems.length === 0) {
      toast.error('Error: No hay productos');
      return;
    }

    try {
      await updateOrder.mutateAsync({
        items: orderItems,
        total: calculateTotal()
      });
      
      toast.success('Orden actualizada');
      navigate(`/orders/${id}`);
    } catch (error) {
      toast.error('Error al actualizar la orden');
      console.error("Error updating order:", error);
    }
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
          Error cargando orden
        </h2>
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/orders/${id}`)}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Editar orden #{order.id_pedido}
        </h1>
      </div>

      <Card className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <h4 className="font-medium">Cliente</h4>
              <p className="text-muted-foreground">{order.clientName}</p>
            </div>
            <div>
              <h4 className="font-medium">Fecha</h4>
              <p className="text-muted-foreground">{order.date}</p>
            </div>
            {order.tableNumber && (
              <div>
                <h4 className="font-medium">Mesa</h4>
                <p className="text-muted-foreground">Mesa #{order.tableNumber}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Quick Product Selector */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Agrear producto</h3>
            <QuickProductSelector onAddProduct={handleAddProduct} />
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-4">
            
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left p-3 font-medium text-muted-foreground">Producto</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Cantidad</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Precio</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Total</th>
                      <th className="p-3 w-[100px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
                          Sin productos
                        </td>
                      </tr>
                    ) : (
                      orderItems.map((item, index) => (
                        <OrderItemRow
                          key={`${item.productId}-${index}`}
                          item={item}
                          onUpdate={(updatedItem) => handleUpdateOrderItem(index, updatedItem)}
                          onRemove={() => handleRemoveProduct(index)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <div className="w-full sm:w-72 md:w-80">
                <div className="flex justify-between py-2 text-lg font-bold border-t">
                  <span>Total:</span>
                  <span>${calculateTotal()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/orders/${id}`)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveOrder}
              disabled={orderItems.length === 0 || updateOrder.isPending}
              className="w-full sm:w-auto"
            >
              {updateOrder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Guardar cambios
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditOrder;
