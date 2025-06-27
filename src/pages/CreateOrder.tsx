import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CancelOrderConfirmation from '@/components/CancelOrderConfirmation';
import QuickProductSelector from '@/components/QuickProductSelector';
import OrderItemRow from '@/components/OrderItemRow';
import ClientSelectorModal from '@/components/ClientSelectorModal';
import OrderSummaryCard from '@/components/OrderSummaryCard';
import TableSelectorModal from '@/components/TableSelectorModal';
import { Addition, OrderItem } from '@/models/order.model';
import { User, MapPin, ShoppingCart, X } from 'lucide-react';
import { useTables } from '@/hooks/useTables';
import { useClients } from '@/hooks/useClients';
import { ORDER_QUERY_KEYS } from '@/hooks/useOrders';
import { useQueryClient } from '@tanstack/react-query';

const createOrderFormSchema = z.object({
  tableNumber: z.string(),
  observations: z.string(),
});

type FormValues = z.infer<typeof createOrderFormSchema>;

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

const CreateOrder = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [orderItems, setOrderItems] = useState<ExtendedOrderItem[]>([]);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState(false);
  const [orderDiscount, setOrderDiscount] = useState<number>(0); const [orderDiscountType, setOrderDiscountType] = useState<string>(DiscountTypes.NONE);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedTableName, setSelectedTableName] = useState<string>('Para llevar');
  const { data: tablesFromAPI, isLoading: isLoadingTables, error: tablesError } = useTables();
  const { data: clientsFromAPI, isLoading: isLoadingClients, error: clientsError } = useClients();

  const form = useForm<FormValues>({
    defaultValues: {
      tableNumber: '',
      observations: '',
    },
  }); const handleCancelClick = () => {
    if (orderItems.length > 0 || form.formState.isDirty || selectedClientId || selectedTableId) {
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

  const handleTableSelect = (tableId: string, tableName: string) => {
    setSelectedTableId(tableId);
    setSelectedTableName(tableName);
    // También actualizar el formulario
    form.setValue('tableNumber', tableId);

    if (tableName !== 'Para llevar') {
      form.setValue('observations', '');
    }

    form.clearErrors('observations');
  };

  const clearTable = () => {
    setSelectedTableId('');
    setSelectedTableName('Para llevar');
    form.setValue('tableNumber', '');

    form.clearErrors('observations');
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

    // Validación adicional para pedidos para llevar
    if (selectedTableName === 'Para llevar' && (!values.observations || values.observations.trim() === '')) {
      toast.error('Las observaciones son obligatorias para pedidos para llevar');
      return;
    }

    let clientName = 'Cliente no especificado';
    if (selectedClientId) {
      clientName = selectedClientName;
    }

    // Transformar el objeto al formato requerido por el backend (POST /api/pedido/)
    const backendOrderPayload = {
      id_cliente: Number(selectedClientId.replace('client-', '')) || null,
      id_usuario: 1,
      id_mesa: selectedTableId ? parseInt(selectedTableId) : null,
      tipo_pedido: selectedTableId ? "en_mesa" : "para_llevar",
      Observacion: selectedTableId ? "" : values.observations || "",
      medio_pago: null,
      productos: orderItems.map(item => ({
        id_producto: Number(item.productId),
        cantidad: item.quantity,
        precio_unitario: item.price,
        observacion: item.observacion || '',
        adiciones: item.additions ? item.additions.map(addition => ({
          id_adicion: Number(addition.id),
          cantidad: addition.quantity,
        })) : []
      })),
      id_estado: 1
    };

    const token = localStorage.getItem('authToken');

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

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

      // Invalidar la caché manualmente para que se actualice la lista de órdenes
      queryClient.invalidateQueries({ queryKey: [ORDER_QUERY_KEYS.ORDERS] });

      toast.success('Orden creada');
      setTimeout(() => navigate('/orders'), 1000);
    } catch (error) {
      toast.error('Error al crear la orden');
      console.error("Error creating order:", error);
    }
  };

  return (
    <Form {...form}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card shadow-sm border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Nueva orden</h1>
              </div>
              <div className="flex items-center gap-4"> {/* Contenedor para alinear elementos a la derecha */}
                {/* Client Selection */}
                <div className="hidden sm:block"> {/* Ocultar en pantallas pequeñas, ajustar según sea necesario */}
                  {selectedClientId ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-2 border rounded-lg bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-700 flex items-center gap-2">
                        <User className="h-4 w-4 text-green-700 dark:text-green-300" />
                        <span className="text-sm font-medium text-green-800 dark:text-green-200">{selectedClientName}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={clearClient} className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <ClientSelectorModal
                      selectedClientId={selectedClientId}
                      onClientSelect={handleClientSelect}
                      clients={clientsFromAPI}
                      isLoading={isLoadingClients}
                      error={clientsError}
                    >
                      <Button variant="outline" className="justify-start text-left font-normal hover:bg-muted/50">
                        {isLoadingClients ? 'Cargando...' : clientsError ? 'Error' : 'Seleccionar cliente'}
                      </Button>
                    </ClientSelectorModal>
                  )}
                </div>                {/* Table Selection */}
                <div className="hidden sm:block"> {/* Ocultar en pantallas pequeñas, ajustar según sea necesario */}
                  {selectedTableName !== 'Para llevar' ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-2 border rounded-lg bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-700 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{selectedTableName}</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={clearTable} className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <TableSelectorModal
                      selectedTableId={selectedTableId}
                      onTableSelect={handleTableSelect}
                      tables={tablesFromAPI}
                      isLoading={isLoadingTables}
                      error={tablesError}
                    >
                      <Button variant="outline" className="justify-start text-left font-normal hover:bg-muted/50">
                        {isLoadingTables ? 'Cargando...' : tablesError ? 'Error' : selectedTableName}
                      </Button>
                    </TableSelectorModal>)}
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
        </div>

        {/* HTML form element wraps the main content area including the submit button */}
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Client and Table selection for smaller screens */}
                <Card className="shadow-sm hover:shadow-md transition-shadow sm:hidden"> {/* Mostrar solo en pantallas pequeñas */}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <User className="h-5 w-5 text-primary" />
                      Detalles del Pedido
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Client Selection for small screens */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">Cliente</label>
                        {selectedClientId ? (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 p-3 border rounded-lg bg-green-100 dark:bg-green-800 border-green-300 dark:border-green-700 flex items-center gap-2">
                              <User className="h-4 w-4 text-green-700 dark:text-green-300" />
                              <span className="text-sm font-medium text-green-800 dark:text-green-200">{selectedClientName}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={clearClient} className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <ClientSelectorModal
                            selectedClientId={selectedClientId}
                            onClientSelect={handleClientSelect}
                            clients={clientsFromAPI} // Pass clients data from API response
                            isLoading={isLoadingClients} // Pass loading state
                            error={clientsError} // Pass error state
                          >
                            {/* Trigger button for the modal */}
                            <Button variant="outline" className="w-full justify-start text-left font-normal hover:bg-muted/50">
                              {isLoadingClients ? 'Cargando clientes...' : clientsError ? 'Error al cargar clientes' : 'Seleccionar cliente'}
                            </Button>
                          </ClientSelectorModal>
                        )}
                      </div>                      {/* Table Selection for small screens */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          Mesa
                        </label>
                        {selectedTableName !== 'Para llevar' ? (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 p-3 border rounded-lg bg-blue-100 dark:bg-blue-800 border-blue-300 dark:border-blue-700 flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{selectedTableName}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={clearTable} className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <TableSelectorModal
                            selectedTableId={selectedTableId}
                            onTableSelect={handleTableSelect}
                            tables={tablesFromAPI}
                            isLoading={isLoadingTables}
                            error={tablesError}
                          >
                            <Button variant="outline" className="w-full justify-start text-left font-normal hover:bg-muted/50">
                              {isLoadingTables ? 'Cargando mesas...' : tablesError ? 'Error al cargar mesas' : selectedTableName}
                            </Button>
                          </TableSelectorModal>)}
                      </div>

                      {/* Observations field for takeaway orders - small screens */}
                      {selectedTableName === 'Para llevar' && (
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-foreground">
                            Observaciones *
                          </label>
                          <FormField
                            control={form.control}
                            name="observations"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Textarea
                                    placeholder="Observaciones"
                                    className="min-h-[80px] resize-none"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}

                    </div>
                  </CardContent>
                </Card>

                {/* Product Selection */}
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      Seleccionar productos
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
                      <div className="border rounded-lg overflow-hidden bg-card">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-muted">
                                <th className="text-left p-4 font-medium text-muted-foreground">Producto</th>
                                <th className="text-center p-4 font-medium text-muted-foreground">Cantidad</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">Precio</th>
                                <th className="text-right p-4 font-medium text-muted-foreground">Total</th>
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
                  {/* Observations field for takeaway orders */}
                  {selectedTableName === 'Para llevar' && (
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-lg">Observaciones</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name="observations"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Ingrese observaciones para este pedido para llevar..."
                                  className="min-h-[100px] resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  )}

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
                      className="w-full h-10 hover:bg-muted/50"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form> {/* End of HTML form element */}

        <CancelOrderConfirmation
          open={isCancelConfirmationOpen}
          onOpenChange={setIsCancelConfirmationOpen}
          onConfirm={handleConfirmCancel}
        />
      </div>
    </Form>
  );
};

export default CreateOrder;
