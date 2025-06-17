
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOrderDetail, useAdjustOrder } from '@/hooks/useOrders';
import { OrderItem } from '@/models/order.model';
import { toast } from "sonner";
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Loader2 } from 'lucide-react';
import QuickProductSelector from '@/components/QuickProductSelector';
import OrderItemRow from '@/components/OrderItemRow';

const EditOrder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: orderData, isLoading, error } = useOrderDetail(id!, {
    enabled: Boolean(id),
  });

  const adjustOrder = useAdjustOrder(id!);
  
  // Estados para rastrear cambios
  const [originalItems, setOriginalItems] = useState<(OrderItem & { discount?: number; discountType?: string })[]>([]);
  const [currentItems, setCurrentItems] = useState<(OrderItem & { discount?: number; discountType?: string })[]>([]);
  const [newItems, setNewItems] = useState<(OrderItem & { discount?: number; discountType?: string })[]>([]);
  const [removedItemIds, setRemovedItemIds] = useState<number[]>([]);

  useEffect(() => {
    if (orderData?.items) {
      // Transformar los items del detalle al formato esperado por el componente
      const transformedItems = orderData.items.map(item => ({
        id_detalle_pedido: item.id_detalle_pedido,
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total + (item.additions?.reduce((sum, add) => sum + (add.price * add.quantity), 0) || 0),
        discount: item.discount || 0,
        discountType: 'none',
        additions: item.additions || [],
      }));
      setOriginalItems(transformedItems);
      setCurrentItems(transformedItems);
    }
  }, [orderData]);
  const handleAddProduct = (product: OrderItem) => {
    // Agregar como nuevo item
    const newProductWithId = {
      ...product,
      id_detalle_pedido: undefined, // Sin ID significa que es nuevo
      discount: 0,
      discountType: 'none'
    };
    
    setNewItems([...newItems, newProductWithId]);
    toast.success(`${product.name} agregado a la orden`);
  };

  const handleUpdateCurrentItem = (index: number, updatedItem: OrderItem & { discount?: number; discountType?: string }) => {
    const updatedItems = [...currentItems];
    updatedItems[index] = updatedItem;
    setCurrentItems(updatedItems);
    toast.success('Producto actualizado');
  };

  const handleUpdateNewItem = (index: number, updatedItem: OrderItem & { discount?: number; discountType?: string }) => {
    const updatedItems = [...newItems];
    updatedItems[index] = updatedItem;
    setNewItems(updatedItems);
    toast.success('Producto actualizado');
  };

  const handleRemoveCurrentItem = (index: number) => {
    const item = currentItems[index];
    if (item.id_detalle_pedido) {
      // Es un item original, agregar a eliminados
      setRemovedItemIds([...removedItemIds, item.id_detalle_pedido]);
    }
    setCurrentItems(currentItems.filter((_, i) => i !== index));
    toast.success('Producto removido');
  };

  const handleRemoveNewItem = (index: number) => {
    setNewItems(newItems.filter((_, i) => i !== index));
    toast.success('Producto removido');
  };

  const calculateTotal = () => {
    const currentTotal = currentItems.reduce((sum, item) => sum + item.total, 0);
    const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    return currentTotal + newTotal;
  };

  const getAllItems = () => {
    return [...currentItems, ...newItems];
  };  const handleSaveOrder = async () => {
    const allItems = getAllItems();
    if (allItems.length === 0) {
      toast.error('Error: No hay productos');
      return;
    }

    try {
      // Preparar datos para el endpoint de ajustar
      const adjustData = {
        agregados: newItems.map(item => ({
          id_producto: parseInt(item.productId),
          cantidad: item.quantity,
          precio_unitario: item.price,
          adiciones: item.additions?.map(add => ({
            id_adicion: parseInt(add.id),
            cantidad: add.quantity,
          })) || [],
        })),
        modificados: currentItems
          .filter(item => {
            // Buscar el item original correspondiente
            const originalItem = originalItems.find(orig => orig.id_detalle_pedido === item.id_detalle_pedido);
            if (!originalItem) return false;
            
            // Verificar si hay cambios en cantidad o descuento
            return originalItem.quantity !== item.quantity || 
                   (originalItem.discount || 0) !== (item.discount || 0);
          })
          .map(item => ({
            id_detalle_pedido: item.id_detalle_pedido!,
            cantidad: item.quantity,
            descuento: item.discount || 0,
          })),
        eliminados: removedItemIds,
      };

      await adjustOrder.mutateAsync(adjustData);
      
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
  if (error || !orderData) {
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

  const order = orderData.order;

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
        </Button>        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Editar orden #{order.id_pedido}
        </h1>
      </div>

      <Card className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Order Info */}          <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <h4 className="font-medium">Cliente</h4>
              <p className="text-muted-foreground">{order.nombre_cliente}</p>
            </div>
            <div>
              <h4 className="font-medium">Estado</h4>
              <p className="text-muted-foreground">{order.estado}</p>
            </div>
            {order.nombre_mesa && order.nombre_mesa !== 'Para llevar' && (
              <div>
                <h4 className="font-medium">Mesa</h4>
                <p className="text-muted-foreground">{order.nombre_mesa}</p>
              </div>
            )}
            {order.nombre_mesa === 'Para llevar' && (
              <div>
                <h4 className="font-medium">Tipo</h4>
                <p className="text-muted-foreground">Para llevar</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Quick Product Selector */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Agrear producto</h3>
            <QuickProductSelector onAddProduct={handleAddProduct} />
          </div>

          <Separator />          {/* Order Items */}
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
                    {getAllItems().length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
                          Sin productos
                        </td>
                      </tr>
                    ) : (
                      <>
                        {/* Items actuales (originales y modificados) */}
                        {currentItems.map((item, index) => (
                          <OrderItemRow
                            key={`current-${item.id_detalle_pedido || index}`}
                            item={item}
                            onUpdate={(updatedItem) => handleUpdateCurrentItem(index, updatedItem)}
                            onRemove={() => handleRemoveCurrentItem(index)}
                          />
                        ))}
                        {/* Items nuevos */}
                        {newItems.map((item, index) => (
                          <OrderItemRow
                            key={`new-${index}`}
                            item={item}
                            onUpdate={(updatedItem) => handleUpdateNewItem(index, updatedItem)}
                            onRemove={() => handleRemoveNewItem(index)}
                          />
                        ))}
                      </>
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
          </div>          <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/orders/${id}`)}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveOrder}
              disabled={getAllItems().length === 0 || adjustOrder.isPending}
              className="w-full sm:w-auto"
            >
              {adjustOrder.isPending ? (
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
