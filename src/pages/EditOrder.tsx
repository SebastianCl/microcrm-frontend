
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useOrder, useUpdateOrder } from '@/hooks/useOrders';
import { OrderItem } from '@/models/order.model';
import { toast } from "sonner";
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageProvider';
import QuickProductSelector from '@/components/QuickProductSelector';
import OrderItemRow from '@/components/OrderItemRow';

const EditOrder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
    
    toast.success(`${product.name} ${t('added_to_order')}`);
  };

  const handleUpdateOrderItem = (index: number, updatedItem: OrderItem & { discount?: number; discountType?: string }) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = updatedItem;
    setOrderItems(updatedItems);
    toast.success(t('product_updated'));
  };

  const handleRemoveProduct = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
    toast.success(t('product_removed'));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  const handleSaveOrder = async () => {
    if (orderItems.length === 0) {
      toast.error(t('error_no_products'));
      return;
    }

    try {
      await updateOrder.mutateAsync({
        items: orderItems,
        total: calculateTotal()
      });
      
      toast.success(t('order_updated'));
      navigate(`/orders/${id}`);
    } catch (error) {
      toast.error(t('error_updating_order'));
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
          {t('error_loading_order')}
        </h2>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/orders')}
        >
          {t('back_to_orders')}
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
          {t('back')}
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {t('edit_order')} #{order.id}
        </h1>
      </div>

      <Card className="p-4 md:p-6">
        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <h4 className="font-medium">{t('customer')}</h4>
              <p className="text-muted-foreground">{order.clientName}</p>
            </div>
            <div>
              <h4 className="font-medium">{t('date')}</h4>
              <p className="text-muted-foreground">{order.date}</p>
            </div>
            {order.tableNumber && (
              <div>
                <h4 className="font-medium">{t('table')}</h4>
                <p className="text-muted-foreground">{t('table')} #{order.tableNumber}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Quick Product Selector */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('add_more_products')}</h3>
            <QuickProductSelector onAddProduct={handleAddProduct} />
          </div>

          <Separator />

          {/* Order Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('order_items')}</h3>
            
            <div className="border rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      <th className="text-left p-3 font-medium text-muted-foreground">{t('product')}</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">{t('quantity')}</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">{t('price')}</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">{t('total')}</th>
                      <th className="p-3 w-[100px]">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-muted-foreground">
                          {t('no_products_yet')}
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
                  <span>{t('total')}:</span>
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
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleSaveOrder}
              disabled={orderItems.length === 0 || updateOrder.isPending}
              className="w-full sm:w-auto"
            >
              {updateOrder.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {t('save_changes')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditOrder;
