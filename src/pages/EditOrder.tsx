
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useOrderDetail, useAdjustOrder } from '@/hooks/useOrders';
import { OrderItem } from '@/models/order.model';
import { toast } from "sonner";
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Loader2, Percent, DollarSign, Truck } from 'lucide-react';
import QuickProductSelector from '@/components/QuickProductSelector';
import OrderItemRow from '@/components/OrderItemRow';
import { formatCurrency } from '@/lib/utils';

const DiscountTypes = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  NONE: 'none'
};

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

  // Estados para descuento y domicilio
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState(DiscountTypes.NONE);
  const [originalDiscount, setOriginalDiscount] = useState(0);
  const [originalDiscountType, setOriginalDiscountType] = useState(DiscountTypes.NONE);

  const [deliveryValue, setDeliveryValue] = useState(0);
  const [originalDeliveryValue, setOriginalDeliveryValue] = useState(0);

  const calculateItemsSubtotal = () => {
    const currentTotal = currentItems.reduce((sum, item) => sum + item.total, 0);
    const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
    return currentTotal + newTotal;
  };

  const calculateOrderDiscount = () => {
    const subtotal = calculateItemsSubtotal();
    if (discountType === DiscountTypes.PERCENTAGE) {
      return subtotal * (discount / 100);
    }
    if (discountType === DiscountTypes.FIXED) {
      return Math.min(subtotal, discount);
    }
    return 0;
  };

  const handleDiscountChange = (newDiscount: number, newType: string) => {
    setDiscount(newDiscount);
    setDiscountType(newType);
  };

  const handleDeliveryValueChange = (value: number) => {
    setDeliveryValue(value);
  };

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
  }, [orderData?.items]);

  // Efecto separado para configurar descuento y domicilio
  useEffect(() => {
    if (orderData?.order && orderData?.items) {
      // Configurar valores de descuento y domicilio originales
      const order = orderData.order;
      const orderDiscountValue = parseFloat(order.valor_descu || '0');
      const orderDeliveryValue = parseFloat(order.valor_domi || '0');

      setOriginalDeliveryValue(orderDeliveryValue);
      setDeliveryValue(orderDeliveryValue);

      // Para determinar el tipo de descuento, usaremos una lógica simple:
      if (orderDiscountValue > 0) {
        // Calcular subtotal de los items
        const itemsSubtotal = orderData.items.reduce((sum, item) => {
          return sum + item.total + (item.additions?.reduce((addSum, add) => addSum + (add.price * add.quantity), 0) || 0);
        }, 0);

        const calculatedPercentage = itemsSubtotal > 0 ? (orderDiscountValue / itemsSubtotal) * 100 : 0;

        // Si el porcentaje calculado es razonable (entre 1 y 100), lo tratamos como porcentaje
        if (calculatedPercentage >= 1 && calculatedPercentage <= 100 && Math.abs(calculatedPercentage - Math.round(calculatedPercentage)) < 0.1) {
          setDiscountType(DiscountTypes.PERCENTAGE);
          setOriginalDiscountType(DiscountTypes.PERCENTAGE);
          const roundedPercentage = Math.round(calculatedPercentage);
          setDiscount(roundedPercentage);
          setOriginalDiscount(roundedPercentage);
        } else {
          setDiscountType(DiscountTypes.FIXED);
          setOriginalDiscountType(DiscountTypes.FIXED);
          setDiscount(orderDiscountValue);
          setOriginalDiscount(orderDiscountValue);
        }
      } else {
        setDiscountType(DiscountTypes.NONE);
        setOriginalDiscountType(DiscountTypes.NONE);
        setDiscount(0);
        setOriginalDiscount(0);
      }
    }
  }, [orderData?.order, orderData?.items]);
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
    const subtotal = calculateItemsSubtotal();
    const discountAmount = calculateOrderDiscount();
    const isForTakeout = orderData?.order?.nombre_mesa === 'Para llevar';
    const delivery = isForTakeout ? deliveryValue : 0;
    return Math.max(0, subtotal - discountAmount + delivery);
  };

  const getAllItems = () => {
    return [...currentItems, ...newItems];
  }; const handleSaveOrder = async () => {
    const allItems = getAllItems();
    if (allItems.length === 0) {
      toast.error('Error: No hay productos');
      return;
    }

    try {
      // Calcular valores de descuento y domicilio para enviar
      let valor_descu = null;
      let valor_domi = null;

      // Verificar si el descuento cambió
      const currentDiscountValue = discountType === DiscountTypes.PERCENTAGE
        ? calculateOrderDiscount()
        : discountType === DiscountTypes.FIXED
          ? discount
          : 0;

      const originalDiscountValue = originalDiscountType === DiscountTypes.PERCENTAGE
        ? calculateItemsSubtotal() * (originalDiscount / 100)
        : originalDiscountType === DiscountTypes.FIXED
          ? originalDiscount
          : 0;

      if (Math.abs(currentDiscountValue - originalDiscountValue) > 0.01) {
        valor_descu = currentDiscountValue;
      }

      // Verificar si el valor de domicilio cambió
      if (Math.abs(deliveryValue - originalDeliveryValue) > 0.01) {
        valor_domi = deliveryValue;
      }

      // Preparar datos para el endpoint de ajustar
      const adjustData = {
        valor_domi,
        valor_descu,
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

            // Verificar si hay cambios en cantidad, descuento o adiciones
            const quantityChanged = originalItem.quantity !== item.quantity;
            const discountChanged = (originalItem.discount || 0) !== (item.discount || 0);
            const additionsChanged = JSON.stringify(originalItem.additions || []) !== JSON.stringify(item.additions || []);

            return quantityChanged || discountChanged || additionsChanged;
          })
          .map(item => ({
            id_detalle_pedido: item.id_detalle_pedido!,
            cantidad: item.quantity,
            descuento: item.discount || 0,
            // Incluir adiciones si el producto las tiene
            adiciones: item.additions?.map(add => ({
              id_adicion: parseInt(add.id),
              cantidad: add.quantity,
            })) || [],
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
            <h3 className="text-lg font-semibold">Agregar producto</h3>
            <QuickProductSelector onAddProduct={handleAddProduct} />
          </div>

          <Separator />

          {/* Discount and Delivery Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Descuento y domicilio</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Discount Section */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Descuento
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    value={discount || ''}
                    onChange={(e) => handleDiscountChange(Number(e.target.value), discountType)}
                    className="flex-1"
                    placeholder="0"
                    disabled={discountType === DiscountTypes.NONE}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="shrink-0">
                        {discountType === DiscountTypes.PERCENTAGE ? (
                          <Percent className="h-4 w-4" />
                        ) : discountType === DiscountTypes.FIXED ? (
                          <DollarSign className="h-4 w-4" />
                        ) : (
                          '-'
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDiscountChange(0, DiscountTypes.NONE)}>
                        Sin descuento
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDiscountChange(discount, DiscountTypes.PERCENTAGE)}>
                        Porcentaje (%)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDiscountChange(discount, DiscountTypes.FIXED)}>
                        Cantidad fija ($)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {calculateOrderDiscount() > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Descuento aplicado: -{formatCurrency(calculateOrderDiscount())}
                  </p>
                )}
              </div>

              {/* Delivery Section - Solo para pedidos para llevar */}
              {order.nombre_mesa === 'Para llevar' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Valor domicilio
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={deliveryValue || ''}
                    onChange={(e) => handleDeliveryValueChange(Number(e.target.value))}
                    className="flex-1"
                    placeholder="0"
                  />
                  {deliveryValue > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Costo de domicilio: {formatCurrency(deliveryValue)}
                    </p>
                  )}
                </div>
              )}
            </div>
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
                <div className="space-y-2">
                  <div className="flex justify-between py-1 text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{formatCurrency(calculateItemsSubtotal())}</span>
                  </div>

                  {calculateOrderDiscount() > 0 && (
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-muted-foreground">
                        Descuento {discountType === DiscountTypes.PERCENTAGE ? `(${discount}%)` : `(${formatCurrency(discount)})`}:
                      </span>
                      <span className="text-destructive">-{formatCurrency(calculateOrderDiscount())}</span>
                    </div>
                  )}

                  {order.nombre_mesa === 'Para llevar' && deliveryValue > 0 && (
                    <div className="flex justify-between py-1 text-sm">
                      <span className="text-muted-foreground">Valor domicilio:</span>
                      <span>+{formatCurrency(deliveryValue)}</span>
                    </div>
                  )}

                  <div className="flex justify-between py-2 text-lg font-bold border-t">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
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
