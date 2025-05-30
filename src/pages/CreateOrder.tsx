import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Order, OrderItem } from '@/lib/sample-data';
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
import CancelOrderConfirmation from '@/components/CancelOrderConfirmation';
import QuickProductSelector from '@/components/QuickProductSelector';
import OrderItemRow from '@/components/OrderItemRow';
import ClientSelectorModal from '@/components/ClientSelectorModal';
import OrderSummaryCard from '@/components/OrderSummaryCard';
import { Addition } from '@/models/order.model';
import { User, MapPin, ShoppingCart, X, Plus } from 'lucide-react';
import { useTables } from '@/hooks/useTables';

type FormValues = {
  tableNumber: string;
};

// Extended OrderItem type to include additions for local state
type ExtendedOrderItem = OrderItem & { 
  discount?: number; 
  discountType?: string; 
  additions?: Addition[];
};

const DiscountTypes = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  NONE: 'none'
};

// Comentado ya que ahora se obtendrá de la API
// const availableTables = [
//   { id: 1, name: 'Mesa 1' },
//   { id: 2, name: 'Mesa 2' },
//   { id: 3, name: 'Mesa 3' },
//   { id: 4, name: 'Mesa 4' },
//   { id: 5, name: 'Mesa 5' },
//   { id: 6, name: 'Mesa 6' },
//   { id: 7, name: 'Mesa 7' },
//   { id: 8, name: 'Mesa 8' },
// ];

const CreateOrder = () => {
  const navigate = useNavigate();
  const [orderItems, setOrderItems] = useState<ExtendedOrderItem[]>([]);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState(false);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [orderDiscountType, setOrderDiscountType] = useState<string>(DiscountTypes.NONE);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const { data: tablesFromAPI, isLoading: isLoadingTables, error: tablesError } = useTables(); // Usar el hook useTables y renombrar la variable
  
  const form = useForm<FormValues>({
    defaultValues: {
      tableNumber: '',
    },
  });
  
  const handleCancelClick = () => {
    if (orderItems.length > 0 || form.formState.isDirty || selectedClientId) {
      setIsCancelConfirmationOpen(true);
    } else {
      navigate('/orders');
    }
  };

  const handleConfirmCancel = () => {
    navigate('/orders');
  };

  const handleClientSelect = (clientId: string, clientName: string) => {
    setSelectedClientId(clientId);
    setSelectedClientName(clientName);
  };

  const clearClient = () => {
    setSelectedClientId('');
    setSelectedClientName('');
  };

  const handleAddProduct = (product: OrderItem) => {
    // Check if product already exists in order
    const existingProductIndex = orderItems.findIndex(
      item => item.productId === product.productId && 
      JSON.stringify((item as ExtendedOrderItem).additions || []) === JSON.stringify((product as ExtendedOrderItem).additions || [])
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
        discountType: DiscountTypes.NONE 
      }]);
    }
    
    toast.success(`${product.name} agregado a la orden`);
  };
  
  const handleUpdateOrderItem = (index: number, updatedItem: ExtendedOrderItem) => {
    const updatedItems = [...orderItems];
    updatedItems[index] = updatedItem;
    setOrderItems(updatedItems);
    toast.success("Producto actualizado");
  };

  const handleRemoveProduct = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
    toast.success("Producto removido");
  };
  
  const calculateProductFinalPrice = (product: ExtendedOrderItem) => {
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
  
  const handleDiscountChange = (discount: number, type: string) => {
    setOrderDiscount(discount);
    setOrderDiscountType(type);
  };
  
  const onSubmit = async (values: FormValues) => {
    if (orderItems.length === 0) {
      toast.error('Error: No hay productos');
      return;
    }
    
    let clientName = 'Cliente no especificado';
    if (selectedClientId) {
      clientName = selectedClientName;
    }
    
    // Create new order with the front-end structure
    const newOrder: Order = {
      clientId: selectedClientId || 'no-client',
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
      id_cliente: Number(selectedClientId.replace('client-', '')) || null,
      id_usuario: 1, // Default value for current user
      id_mesa: values.tableNumber ? parseInt(values.tableNumber) : null,
      tipo_pedido: values.tableNumber ? "en_mesa" : "para_llevar",
      productos: orderItems.map(item => ({
        id_producto: Number(item.productId),
        cantidad: item.quantity,
        precio_unitario: item.price,
        adiciones: item.additions ? item.additions.map(addition => ({
          id_adicion: Number(addition.id),
          cantidad: 1,
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

      toast.success('Orden creada');
      setTimeout(() => navigate('/orders'), 1000);
    } catch (error) {
      toast.error('Error al crear la orden');
      console.error("Error creating order:", error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Nueva Orden</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleCancelClick}
              className="flex items-center gap-2 hover:bg-gray-50"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Cancelar</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Order Details Card */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-primary" />
                      Detalles del Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Client Selection */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Cliente</label>
                        {selectedClientId ? (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 p-3 border rounded-lg bg-green-50 border-green-200 flex items-center gap-2">
                              <User className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">{selectedClientName}</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={clearClient}
                              className="text-red-600 hover:bg-red-50 border-red-200"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <ClientSelectorModal 
                            selectedClientId={selectedClientId}
                            onClientSelect={handleClientSelect}
                          >
                            <Button type="button" variant="outline" className="w-full justify-start h-11">
                              <Plus className="h-4 w-4 mr-2" />
                              Agregar Cliente (Opcional)
                            </Button>
                          </ClientSelectorModal>
                        )}
                      </div>

                      {/* Table Selection */}
                      <FormField
                        control={form.control}
                        name="tableNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              <MapPin className="h-4 w-4 text-primary" />
                              Mesa
                            </FormLabel>
                            <FormControl>
                              <select
                                className="flex h-11 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 hover:border-gray-300"
                                onChange={field.onChange}
                                value={field.value}
                              >
                                <option value="">Para llevar</option>
                                {isLoadingTables && <option value="" disabled>Cargando mesas...</option>}
                                {tablesError && <option value="" disabled>Error al cargar mesas</option>}
                                {tablesFromAPI && tablesFromAPI.map(table => (
                                  <option key={table.id_mesa} value={table.id_mesa.toString()}>
                                    {table.nombre_mesa}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Product Selection */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      Seleccionar Productos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuickProductSelector onAddProduct={handleAddProduct} />
                  </CardContent>
                </Card>

                {/* Order Items */}
                {orderItems.length > 0 && (
                  <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">Productos en el Pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="border rounded-lg overflow-hidden bg-white">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="text-left p-4 font-medium text-gray-700">Producto</th>
                                <th className="text-center p-4 font-medium text-gray-700">Cantidad</th>
                                <th className="text-right p-4 font-medium text-gray-700">Precio</th>
                                <th className="text-right p-4 font-medium text-gray-700">Total</th>
                                <th className="p-4 w-[100px]">Acciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orderItems.map((item, index) => (
                                <OrderItemRow
                                  key={`${item.productId}-${index}`}
                                  item={item}
                                  onUpdate={(updatedItem) => handleUpdateOrderItem(index, updatedItem)}
                                  onRemove={() => handleRemoveProduct(index)}
                                />
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar - Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <OrderSummaryCard
                    itemCount={orderItems.length}
                    subtotal={getProductsSubtotal()}
                    discount={orderDiscount}
                    discountType={orderDiscountType}
                    total={getOrderTotal()}
                    onDiscountChange={handleDiscountChange}
                  />
                  
                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button 
                      type="submit" 
                      disabled={orderItems.length === 0}
                      className="w-full h-12 text-base font-medium shadow-sm hover:shadow-md transition-shadow"
                      size="lg"
                    >
                      Crear Orden
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelClick}
                      className="w-full h-10 hover:bg-gray-50"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
      
      <CancelOrderConfirmation
        open={isCancelConfirmationOpen}
        onOpenChange={setIsCancelConfirmationOpen}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

export default CreateOrder;
