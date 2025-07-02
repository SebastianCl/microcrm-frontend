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
import CancelOrderConfirmation from '@/components/CancelOrderConfirmation';
import QuickProductSelector from '@/components/QuickProductSelector';
import OrderSummaryCard from '@/components/OrderSummaryCard';
import { Addition, OrderItem } from '@/models/order.model';
import { User, MapPin, ShoppingCart, X, Plus, Minus, Coffee, UtensilsCrossed } from 'lucide-react';
import { useTables } from '@/hooks/useTables';
import { useClients } from '@/hooks/useClients';
import { useCreateOrderWithProducts } from '@/hooks/useOrders';

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
  const createOrderMutation = useCreateOrderWithProducts();
  const [orderItems, setOrderItems] = useState<ExtendedOrderItem[]>([]);
  const [isCancelConfirmationOpen, setIsCancelConfirmationOpen] = useState(false);
  const [orderDiscount, setOrderDiscount] = useState<number>(0);
  const [orderDiscountType, setOrderDiscountType] = useState<string>(DiscountTypes.NONE);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedClientName, setSelectedClientName] = useState<string>('');
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [selectedTableName, setSelectedTableName] = useState<string>('Para llevar');
  const [currentStep, setCurrentStep] = useState<'table' | 'client' | 'products' | 'review'>('table');
  const { data: tablesFromAPI, isLoading: isLoadingTables, error: tablesError } = useTables();
  const { data: clientsFromAPI, isLoading: isLoadingClients, error: clientsError } = useClients();

  const form = useForm<FormValues>({
    defaultValues: {
      tableNumber: '',
      observations: '',
    },
  });

  const handleCancelClick = () => {
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
    setCurrentStep('products');
  };

  const clearClient = () => {
    setSelectedClientId('');
    setSelectedClientName('');
  };

  const skipClientSelection = () => {
    setCurrentStep('products');
  };

  const handleTableSelect = (tableId: string, tableName: string) => {
    setSelectedTableId(tableId);
    setSelectedTableName(tableName);
    form.setValue('tableNumber', tableId);

    if (tableName !== 'Para llevar') {
      form.setValue('observations', '');
    }

    form.clearErrors('observations');
    setCurrentStep('client');
  };

  const clearTable = () => {
    setSelectedTableId('');
    setSelectedTableName('Para llevar');
    form.setValue('tableNumber', '');
    form.clearErrors('observations');
    setCurrentStep('table');
  };

  const handleAddProduct = (product: OrderItem) => {
    const existingProductIndex = orderItems.findIndex(
      item => item.productId === product.productId &&
        JSON.stringify((item as ExtendedOrderItem).additions || []) === JSON.stringify((product as ExtendedOrderItem).additions || [])
    );

    if (existingProductIndex >= 0) {
      const updatedItems = [...orderItems];
      updatedItems[existingProductIndex].quantity += product.quantity;
      updatedItems[existingProductIndex].total += product.total;
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, {
        ...product,
        discount: 0,
        discountType: DiscountTypes.NONE
      }]);
    }

    toast.success(`${product.name} agregado a la orden`);
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

    if (selectedTableName === 'Para llevar' && (!values.observations || values.observations.trim() === '')) {
      toast.error('Las observaciones son obligatorias para pedidos para llevar');
      return;
    }

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

    try {
      await createOrderMutation.mutateAsync(backendOrderPayload);
      toast.success('Orden creada');
      setTimeout(() => navigate('/orders'), 1000);
    } catch (error) {
      toast.error('Error al crear la orden');
      console.error("Error creating order:", error);
    }
  };

  const canNavigateToStep = (stepKey: string) => {
    const steps = ['table', 'client', 'products', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    const targetIndex = steps.indexOf(stepKey);

    // Siempre puede ir a pasos anteriores
    if (targetIndex < currentIndex) return true;

    // Para ir a pasos futuros, verificar si se puede avanzar
    switch (stepKey) {
      case 'client':
        return selectedTableId !== '' || selectedTableName === 'Para llevar';
      case 'products':
        return (selectedTableId !== '' || selectedTableName === 'Para llevar');
      case 'review':
        return (selectedTableId !== '' || selectedTableName === 'Para llevar') && orderItems.length > 0;
      default:
        return true;
    }
  };

  const handleStepClick = (stepKey: 'table' | 'client' | 'products' | 'review') => {
    if (canNavigateToStep(stepKey)) {
      setCurrentStep(stepKey);
    } else {
      // Mostrar mensaje de que no puede navegar a ese paso aún
      if (stepKey === 'client' && !selectedTableId && selectedTableName !== 'Para llevar') {
        toast.error('Primero selecciona una mesa');
      } else if (stepKey === 'products' && !selectedTableId && selectedTableName !== 'Para llevar') {
        toast.error('Primero selecciona una mesa');
      } else if (stepKey === 'review' && orderItems.length === 0) {
        toast.error('Primero agrega productos a la orden');
      }
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'table', label: 'Mesa', icon: MapPin },
      { key: 'client', label: 'Cliente', icon: User },
      { key: 'products', label: 'Productos', icon: Coffee },
      { key: 'review', label: 'Revisar', icon: ShoppingCart }
    ];

    return (
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2 bg-muted/30 rounded-full p-3 shadow-sm">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.key === currentStep;
            const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
            const canNavigate = canNavigateToStep(step.key as 'table' | 'client' | 'products' | 'review');

            return (
              <div key={step.key} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300
                    ${canNavigate ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
                    ${isActive ? 'bg-primary text-primary-foreground shadow-lg scale-110' :
                      isCompleted ? 'bg-green-500 text-white hover:bg-green-600' :
                        canNavigate ? 'bg-background text-muted-foreground border border-muted hover:border-primary/50 hover:bg-muted/50' :
                          'bg-background text-muted-foreground border border-muted'}
                  `}
                  onClick={() => handleStepClick(step.key as 'table' | 'client' | 'products' | 'review')}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium transition-colors duration-200 hidden sm:block ${canNavigate ? 'cursor-pointer' : 'cursor-not-allowed'
                    } ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : canNavigate ? 'text-muted-foreground hover:text-foreground' : 'text-muted-foreground opacity-50'}`}
                  onClick={() => handleStepClick(step.key as 'table' | 'client' | 'products' | 'review')}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-6 h-0.5 mx-3 transition-colors duration-200 ${isCompleted ? 'bg-green-500' : 'bg-muted'
                    }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTableSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">Selecciona la mesa</h2>
        <p className="text-muted-foreground text-lg">¿Dónde se servirá esta orden?</p>
      </div>

      <Card
        className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${selectedTableName === 'Para llevar' ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
          }`}
        onClick={() => handleTableSelect('', 'Para llevar')}
      >
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-6">
            <div className={`p-4 rounded-full transition-colors duration-200 ${selectedTableName === 'Para llevar' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
              <UtensilsCrossed className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-1">Para llevar</h3>
              <p className="text-muted-foreground">Orden para llevar del cliente</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {tablesFromAPI && tablesFromAPI.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-6 text-center">Mesas Disponibles</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {tablesFromAPI.map((table) => (
              <Card
                key={table.id_mesa}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${selectedTableId === table.id_mesa.toString() ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                  }`}
                onClick={() => handleTableSelect(table.id_mesa.toString(), table.nombre_mesa)}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center transition-colors duration-200 ${selectedTableId === table.id_mesa.toString() ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-lg">{table.nombre_mesa}</h4>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderClientSelection = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">Selecciona cliente</h2>
        <p className="text-muted-foreground text-lg">¿Quién realizará esta orden?</p>
      </div>

      <Card
        className="cursor-pointer transition-all duration-200 hover:shadow-lg border-2 border-dashed hover:border-primary/50"
        onClick={skipClientSelection}
      >
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-6">
            <div className="p-4 rounded-full bg-muted">
              <Plus className="w-8 h-8" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-1">Continuar sin cliente</h3>
              <p className="text-muted-foreground">Cliente no especificado</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {clientsFromAPI && clientsFromAPI.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-6 text-center">Clientes registrados</h3>
          <div className="grid gap-4 max-h-96 overflow-y-auto">
            {clientsFromAPI.map((client) => (
              <Card
                key={client.id_cliente}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${selectedClientId === `client-${client.id_cliente}` ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/50'
                  }`}
                onClick={() => handleClientSelect(`client-${client.id_cliente}`, client.nombre)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-200 ${selectedClientId === `client-${client.id_cliente}` ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">{client.nombre}</h4>
                      <p className="text-muted-foreground">{client.correo || 'Sin email'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('table')}
          className="flex-1 h-14 text-lg"
        >
          Atrás
        </Button>
      </div>
    </div>
  );

  const renderProductSelection = () => (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-3">Selecciona productos</h2>
          <p className="text-muted-foreground text-lg">Agrega productos a tu orden</p>
        </div>
        {orderItems.length > 0 && (
          <Button
            onClick={() => setCurrentStep('review')}
            className="h-14 px-8 text-lg shadow-lg"
            size="lg"
          >
            Ver resumen ({orderItems.length})
          </Button>
        )}
      </div>

      <QuickProductSelector onAddProduct={handleAddProduct} />

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('client')}
          className="flex-1 h-14 text-lg"
        >
          Atrás
        </Button>
        {orderItems.length > 0 && (
          <Button
            onClick={() => setCurrentStep('review')}
            className="flex-1 h-14 text-lg"
          >
            Revisar orden
          </Button>
        )}
      </div>
    </div>
  );

  const renderOrderReview = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-3">Revisar orden</h2>
        <p className="text-muted-foreground text-lg">Verifica tu orden antes de confirmar</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Detalles de la Orden</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-primary/10">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Mesa</p>
                <p className="font-semibold text-lg">{selectedTableName}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearTable} className="text-red-500 hover:text-red-700">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-primary/10">
                <User className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-semibold text-lg">{selectedClientName || 'No especificado'}</p>
              </div>
              {selectedClientId && (
                <Button variant="ghost" size="sm" onClick={clearClient} className="text-red-500 hover:text-red-700">
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedTableName === 'Para llevar' && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Observaciones</CardTitle>
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
                      className="min-h-[100px] resize-none text-base"
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

      {orderItems.length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Productos Seleccionados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    <p className="text-muted-foreground">
                      ${item.price.toFixed(2)} c/u
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedItems = [...orderItems];
                        if (updatedItems[index].quantity > 1) {
                          updatedItems[index].quantity--;
                          updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price;
                          setOrderItems(updatedItems);
                        }
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-semibold text-lg">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const updatedItems = [...orderItems];
                        updatedItems[index].quantity++;
                        updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].price;
                        setOrderItems(updatedItems);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveProduct(index)}
                      className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
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

      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep('products')}
          className="flex-1 h-14 text-lg"
        >
          Agregar más productos
        </Button>
        <Button
          type="submit"
          disabled={orderItems.length === 0 || createOrderMutation.isPending}
          className="flex-1 h-14 text-lg font-semibold shadow-lg"
          onClick={form.handleSubmit(onSubmit)}
        >
          {createOrderMutation.isPending ? 'Creando orden...' : 'Confirmar orden'}
        </Button>
      </div>
    </div>
  );

  return (
    <Form {...form}>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card shadow-sm border-b sticky top-0 z-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">Nueva orden</h1>
              </div>
              <Button
                variant="outline"
                onClick={handleCancelClick}
                className="flex items-center gap-2 hover:bg-muted h-10"
              >
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Cancelar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderStepIndicator()}

          <div className="mt-8">
            {currentStep === 'table' && renderTableSelection()}
            {currentStep === 'client' && renderClientSelection()}
            {currentStep === 'products' && renderProductSelection()}
            {currentStep === 'review' && renderOrderReview()}
          </div>
        </div>

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
