
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Search, ArrowLeft } from 'lucide-react';
import { useCreateOrder } from '@/hooks/useOrders';
import { Order, OrderItem } from '@/models/order.model';
import { toast } from 'sonner';

// Mock product data with categories
const mockProducts = [
  { id: '1', name: 'Hamburguesa Clásica', price: 12000, category: 'Hamburguesas' },
  { id: '2', name: 'Pizza Margherita', price: 18000, category: 'Pizzas' },
  { id: '3', name: 'Ensalada César', price: 8000, category: 'Ensaladas' },
  { id: '4', name: 'Coca Cola', price: 3000, category: 'Bebidas' },
  { id: '5', name: 'Hamburguesa BBQ', price: 14000, category: 'Hamburguesas' },
  { id: '6', name: 'Pizza Pepperoni', price: 20000, category: 'Pizzas' },
  { id: '7', name: 'Ensalada Griega', price: 9000, category: 'Ensaladas' },
  { id: '8', name: 'Agua', price: 2000, category: 'Bebidas' },
];

const categories = ['Todas', ...Array.from(new Set(mockProducts.map(p => p.category)))];

const CreateOrder = () => {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  
  const [orderType, setOrderType] = useState<'takeout' | 'dine-in'>('takeout');
  const [clientName, setClientName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToOrder = (productId: string, name: string, price: number) => {
    const existingItem = orderItems.find(item => item.productId === productId);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
          : item
      ));
    } else {
      const newItem: OrderItem = {
        productId,
        name,
        quantity: 1,
        price,
        total: price
      };
      setOrderItems([...orderItems, newItem]);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setOrderItems(orderItems.filter(item => item.productId !== productId));
    } else {
      setOrderItems(orderItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      ));
    }
  };

  const total = orderItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientName.trim()) {
      toast.error('El nombre del cliente es requerido');
      return;
    }
    
    if (orderType === 'dine-in' && !tableNumber.trim()) {
      toast.error('El número de mesa es requerido para pedidos en mesa');
      return;
    }
    
    if (orderItems.length === 0) {
      toast.error('Debe agregar al menos un producto al pedido');
      return;
    }

    const newOrder: Omit<Order, 'id'> = {
      clientId: '0',
      clientName: clientName.trim(),
      date: new Date().toISOString(),
      status: 'pending',
      items: orderItems,
      total,
      ...(orderType === 'dine-in' ? { tableNumber: parseInt(tableNumber) } : {})
    };

    try {
      await createOrder.mutateAsync(newOrder);
      toast.success('Pedido creado exitosamente');
      navigate('/orders');
    } catch (error) {
      toast.error('Error al crear el pedido');
      console.error('Error creating order:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/orders')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Pedido</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Productos</CardTitle>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Buscar productos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                <TabsList className="grid w-full grid-cols-5">
                  {categories.map((category) => (
                    <TabsTrigger key={category} value={category} className="text-xs">
                      {category}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {categories.map((category) => (
                  <TabsContent key={category} value={category} className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {filteredProducts.map((product) => (
                        <Card key={product.id} className="cursor-pointer hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">{product.name}</h3>
                                <Badge variant="secondary" className="text-xs">
                                  {product.category}
                                </Badge>
                              </div>
                              <span className="font-bold text-primary">
                                ${product.price.toLocaleString()}
                              </span>
                            </div>
                            <Button
                              onClick={() => addToOrder(product.id, product.name, product.price)}
                              className="w-full"
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Agregar
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="orderType">Tipo de Pedido</Label>
                  <Select value={orderType} onValueChange={(value: 'takeout' | 'dine-in') => setOrderType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="takeout">Para Llevar</SelectItem>
                      <SelectItem value="dine-in">En Mesa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="clientName">Nombre del Cliente</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ingrese el nombre del cliente"
                    required
                  />
                </div>

                {orderType === 'dine-in' && (
                  <div>
                    <Label htmlFor="tableNumber">Número de Mesa</Label>
                    <Input
                      id="tableNumber"
                      type="number"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      placeholder="Ej: 5"
                      required
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Productos</Label>
                  {orderItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No hay productos seleccionados</p>
                  ) : (
                    orderItems.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${item.price.toLocaleString()} c/u
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createOrder.isPending || orderItems.length === 0}
                >
                  {createOrder.isPending ? 'Creando...' : 'Crear Pedido'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;
