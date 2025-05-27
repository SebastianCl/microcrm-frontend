
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, X, Search, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { clients, Order, OrderItem } from '@/lib/sample-data';
import { useForm } from 'react-hook-form';
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import AddProductToOrderDialog from '@/components/AddProductToOrderDialog';
import CancelOrderConfirmation from '@/components/CancelOrderConfirmation';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageProvider';

type FormValues = {
  clientId: string;
  discount: string;
  tableNumber: string;
};

const DiscountTypes = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  NONE: 'none'
};

// Sample tables data - in a real app this would come from an API
const availableTables = [
  { id: 1, name: 'Mesa 1' },
  { id: 2, name: 'Mesa 2' },
  { id: 3, name: 'Mesa 3' },
  { id: 4, name: 'Mesa 4' },
  { id: 5, name: 'Mesa 5' },
  { id: 6, name: 'Mesa 6' },
  { id: 7, name: 'Mesa 7' },
  { id: 8, name: 'Mesa 8' },
];

const CreateOrder = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [orderItems, setOrderItems] = useState<(OrderItem & { discount?: number; discountType?: string; additions?: { id: number; name: string; price: number }[] })[]>([]);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [orderDiscountType, setOrderDiscountType] = useState<string>(DiscountTypes.NONE);
  
  const form = useForm<FormValues>({
    defaultValues: {
      clientId: '',
      discount: '0',
      tableNumber: '',
    },
  });
  
  const handleCancelClick = () => {
    if (orderItems.length > 0 || form.formState.isDirty) {
      setIsCancelConfirmationOpen(true);
    } else {
      navigate('/orders');
    }
  };

  const handleConfirmCancel = () => {
    navigate('/orders');
  };
  
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(clientSearchQuery.toLowerCase())
  );

  const handleAddProduct = (product: OrderItem) => {
    // Valida si el producto ya está en la orden
    const existingProductIndex = orderItems.findIndex(
      item => item.productId === product.productId
    );
    
    if (existingProductIndex >= 0) {
      // Actualiza la cantidad y el total del producto existente
      const updatedItems = [...orderItems];
      updatedItems[existingProductIndex].quantity += product.quantity;
      updatedItems[existingProductIndex].total += product.total;
      setOrderItems(updatedItems);
    } else {
      // Agrega el nuevo producto a la orden con propiedad de descuento
      setOrderItems([...orderItems, { 
        ...product, 
        discount: 0, 
        discountType: DiscountTypes.NONE 
      }]);
    }
    
    toast.success(`${product.name} ${t('added_to_order')}`);
  };
  
  const handleRemoveProduct = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
    toast.success(t('product_removed'));
  };

  const handleProductDiscountChange = (productId: string, discount: number, discountType: string) => {
    const updatedItems = orderItems.map(item => {
      if (item.productId === productId) {
        return { ...item, discount, discountType };
      }
      return item;
    });
    setOrderItems(updatedItems);
  };
  
  const calculateProductFinalPrice = (product: OrderItem & { discount?: number; discountType?: string }) => {
    if (!product.discount || product.discount <= 0 || product.discountType === DiscountTypes.NONE) {
      return product.total;
    }
    
    if (product.discountType === DiscountTypes.PERCENTAGE) {
      return product.total * (1 - product.discount / 100);
    }
    
    if (product.discountType === DiscountTypes.FIXED) {
      return Math.max(0, product.total - product.discount);
    }
    
    return product.total;
  };
  
  const getProductsSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + calculateProductFinalPrice(item), 0);
  };
  
  const calculateOrderDiscount = () => {
    const subtotal = getProductsSubtotal();
    
    if (orderDiscountType === DiscountTypes.PERCENTAGE) {
      return subtotal * (orderDiscount / 100);
    }
    
    if (orderDiscountType === DiscountTypes.FIXED) {
      return Math.min(subtotal, orderDiscount);
    }
    
    return 0;
  };
  
  const getOrderTotal = () => {
    const subtotal = getProductsSubtotal();
    const discount = calculateOrderDiscount();
    return Math.max(0, subtotal - discount);
  };
    
  const onSubmit = async (values: FormValues) => {
    if (orderItems.length === 0) {
      toast.error(t('error_no_products'));
      return;
    }
    
    let clientName = t('unspecified_client');
    if (values.clientId) {
      const selectedClient = clients.find(client => client.id === values.clientId);
      if (selectedClient) {
        clientName = selectedClient.name;
      }
    }
    
    // Create new order with the front-end structure
    const newOrder: Order = {
      id: `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      clientId: values.clientId || 'no-client',
      clientName: clientName,
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      items: orderItems,
      total: getOrderTotal(),
      // Add the table number if provided
      tableNumber: values.tableNumber ? parseInt(values.tableNumber) : undefined
    };
    
    // Transform the object to the format required by the backend (POST /api/pedido/)
    const backendOrderPayload = {
      id_cliente: Number(values.clientId.replace('client-', '')) || 1,
      id_usuario: 1, // Default value for current user
      id_mesa: values.tableNumber ? parseInt(values.tableNumber) : null, // Use null if no table is selected
      tipo_pedido: values.tableNumber ? "en_mesa" : "para_llevar", // Set type based on table selection
      productos: orderItems.map(item => ({
        id_producto: Number(item.productId),
        cantidad: item.quantity,
        precio_unitario: item.price,
        adiciones: item.additions ? item.additions.map(addition => ({
          id_adicion: addition.id,
          nombre: addition.name,
          precio: addition.price
        })) : []
      })),
      estado: "pendiente" // Initial order status
    };
    
    const token = localStorage.getItem('authToken');
    
    try {
      // Configure headers with authentication token
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Call the API to create the order in the backend
      console.log("Sending payload to backend:", backendOrderPayload);
      await fetch('http://localhost:3000/api/pedido/', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(backendOrderPayload)
      }).then(response => {
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
      });

      toast.success(t('order_created'));
      setTimeout(() => navigate('/orders'), 1000);
    } catch (error) {
      toast.error(t('error_creating_order'));
      console.error("Error creating order:", error);
    }
  };
  
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center space-x-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t('new_order')}</h1>
      </div>
      
      <Card className="p-4 md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">{t('Cliente')} ({t('opcional')})</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between"
                          >
                            {field.value ? clients.find(client => client.id === field.value)?.name : t('select_client')}
                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="p-2">
                          <Input
                            placeholder={t('search_client')}
                            value={clientSearchQuery}
                            onChange={(e) => setClientSearchQuery(e.target.value)}
                            className="mb-2"
                          />
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredClients.length > 0 ? (
                            filteredClients.map(client => (
                              <div
                                key={client.id}
                                className={`flex items-center px-4 py-2 cursor-pointer hover:bg-muted ${field.value === client.id ? 'bg-muted' : ''}`}
                                onClick={() => {
                                  field.onChange(client.id);
                                  setClientSearchQuery('');
                                }}
                              >
                                <div>
                                  <p className="text-sm font-medium">{client.name}</p>
                                  {client.company && (
                                    <p className="text-xs text-muted-foreground">{client.company}</p>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-muted-foreground">
                              {t('no_clients_found')}
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tableNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-medium">{t('Mesa')} ({t('opcional')})</FormLabel>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onChange={field.onChange}
                      value={field.value}
                    >
                      <option value="">{t('no_table')}</option>
                      {availableTables.map(table => (
                        <option key={table.id} value={table.id}>
                          {table.name}
                        </option>
                      ))}
                    </select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col">
                <FormLabel className="text-base font-medium mb-2">{t('order_discount')}</FormLabel>
                <div className="flex gap-2 items-center">
                  <Input
                    type="number"
                    min="0"
                    value={orderDiscount}
                    onChange={(e) => setOrderDiscount(Number(e.target.value))}
                    className="flex-1"
                    placeholder={t('discount_value')}
                    disabled={orderDiscountType === DiscountTypes.NONE}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex gap-2">
                        {orderDiscountType === DiscountTypes.PERCENTAGE 
                          ? '%' 
                          : orderDiscountType === DiscountTypes.FIXED 
                            ? '$' 
                            : t('type')}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setOrderDiscountType(DiscountTypes.NONE)}>
                        {t('no_discount')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setOrderDiscountType(DiscountTypes.PERCENTAGE)}>
                        {t('percentage')} (%)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setOrderDiscountType(DiscountTypes.FIXED)}>
                        {t('fixed_amount')} ($)
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="text-lg font-semibold">{t('products')}</h3>
                <Button 
                  type="button"
                  onClick={() => setIsAddProductDialogOpen(true)}
                  className="w-full sm:w-auto"
                >
                  {t('add_product')}
                </Button>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/40">
                        <th className="text-left p-3 font-medium text-muted-foreground">{t('product')}</th>
                        <th className="text-center p-3 font-medium text-muted-foreground">{t('quantity')}</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">{t('price')}</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">{t('discount')}</th>
                        <th className="text-right p-3 font-medium text-muted-foreground">{t('total')}</th>
                        <th className="p-3 w-[50px]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderItems.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center p-4 text-muted-foreground">
                            {t('no_products')}
                          </td>
                        </tr>
                      ) : (
                        orderItems.map((item) => (
                          <tr key={item.productId} className="border-b hover:bg-muted/30">
                            <td className="p-3 text-left">{item.name}</td>
                            <td className="p-3 text-center">{item.quantity}</td>
                            <td className="p-3 text-right">${item.price}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <HoverCard>
                                  <HoverCardTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-7 px-2">
                                      {item.discountType === DiscountTypes.PERCENTAGE 
                                        ? `${item.discount}%` 
                                        : item.discountType === DiscountTypes.FIXED 
                                          ? `$${item.discount}`
                                          : '-'}
                                    </Button>
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-60 p-3" align="end">
                                    <div className="space-y-2">
                                      <h4 className="font-medium mb-1">{t('discount_for')} {item.name}</h4>
                                      <div className="flex gap-2">
                                        <Input
                                          type="number"
                                          min="0"
                                          value={item.discount || 0}
                                          onChange={(e) => handleProductDiscountChange(
                                            item.productId, 
                                            Number(e.target.value), 
                                            item.discountType || DiscountTypes.NONE
                                          )}
                                          className="flex-1"
                                          disabled={item.discountType === DiscountTypes.NONE}
                                        />
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button variant="outline" size="sm" className="px-2">
                                              {item.discountType === DiscountTypes.PERCENTAGE 
                                                ? '%' 
                                                : item.discountType === DiscountTypes.FIXED 
                                                  ? '$' 
                                                  : '-'}
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleProductDiscountChange(
                                              item.productId, item.discount || 0, DiscountTypes.NONE
                                            )}>
                                              {t('no_discount')}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleProductDiscountChange(
                                              item.productId, item.discount || 0, DiscountTypes.PERCENTAGE
                                            )}>
                                              {t('percentage')} (%)
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleProductDiscountChange(
                                              item.productId, item.discount || 0, DiscountTypes.FIXED
                                            )}>
                                              {t('fixed_amount')} ($)
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                      {item.discount > 0 && item.discountType !== DiscountTypes.NONE && (
                                        <p className="text-xs text-muted-foreground">
                                          {t('original_price')}: ${item.total}<br />
                                          {t('with_discount')}: ${calculateProductFinalPrice(item)}
                                        </p>
                                      )}
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              ${calculateProductFinalPrice(item)}
                              {(item.discount > 0 && item.discountType !== DiscountTypes.NONE) && (
                                <span className="text-xs text-muted-foreground line-through ml-1">
                                  ${item.total}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveProduct(item.productId)}
                                className="hover:text-red-500"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <div className="w-full sm:w-72 md:w-80">
                  <div className="space-y-1">
                    <div className="flex justify-between py-1 text-muted-foreground">
                      <span>{t('subtotal')}:</span>
                      <span>${getProductsSubtotal()}</span>
                    </div>
                    {orderDiscount > 0 && orderDiscountType !== DiscountTypes.NONE && (
                      <div className="flex justify-between py-1 text-muted-foreground">
                        <span>
                          {t('discount')} ({orderDiscountType === DiscountTypes.PERCENTAGE ? `${orderDiscount}%` : `$${orderDiscount}`}):
                        </span>
                        <span>-${calculateOrderDiscount()}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 text-lg font-bold border-t">
                      <span>{t('total')}:</span>
                      <span>${getOrderTotal()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCancelClick}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                {t('cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={orderItems.length === 0}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {t('create_order')}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
      
      <AddProductToOrderDialog
        open={isAddProductDialogOpen}
        onOpenChange={setIsAddProductDialogOpen}
        onAddProduct={handleAddProduct}
      />
      
      <CancelOrderConfirmation
        open={isCancelConfirmationOpen}
        onOpenChange={setIsCancelConfirmationOpen}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default CreateOrder;
