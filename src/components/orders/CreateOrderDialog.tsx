
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Mock data
const mockProducts = [
  { 
    id_producto: 1, 
    nombre: 'Hamburguesa Clásica', 
    precio: 12.50,
    adiciones: [
      { id_adicion: 1, nombre: 'Queso Extra', precio_extra: 1.50 },
      { id_adicion: 2, nombre: 'Tocino', precio_extra: 2.00 },
      { id_adicion: 3, nombre: 'Papas Fritas', precio_extra: 3.00 }
    ]
  },
  { 
    id_producto: 2, 
    nombre: 'Pizza Margherita', 
    precio: 15.00,
    adiciones: [
      { id_adicion: 4, nombre: 'Queso Extra', precio_extra: 2.00 },
      { id_adicion: 5, nombre: 'Pepperoni', precio_extra: 3.50 }
    ]
  },
  { 
    id_producto: 3, 
    nombre: 'Ensalada César', 
    precio: 8.75,
    adiciones: [
      { id_adicion: 6, nombre: 'Pollo Grillado', precio_extra: 4.00 },
      { id_adicion: 7, nombre: 'Pan Tostado', precio_extra: 1.00 }
    ]
  }
];

const mockTables = [
  { id_mesa: 1, nombre_mesa: 'Mesa 1' },
  { id_mesa: 2, nombre_mesa: 'Mesa 2' },
  { id_mesa: 3, nombre_mesa: 'Mesa 3' },
  { id_mesa: 4, nombre_mesa: 'Mesa 4' },
  { id_mesa: 5, nombre_mesa: 'Mesa 5' }
];

interface OrderItem {
  producto: typeof mockProducts[0];
  cantidad: number;
  adiciones: Array<{ adicion: typeof mockProducts[0]['adiciones'][0], cantidad: number }>;
  descuento: number;
  descuentoTipo: 'porcentaje' | 'fijo';
}

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: (order: any) => void;
}

const CreateOrderDialog = ({ open, onOpenChange, onOrderCreated }: CreateOrderDialogProps) => {
  const [orderType, setOrderType] = useState<'en_mesa' | 'para_llevar'>('en_mesa');
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const { toast } = useToast();

  const addProduct = () => {
    const product = mockProducts.find(p => p.id_producto === parseInt(selectedProduct));
    if (product) {
      setOrderItems([...orderItems, {
        producto: product,
        cantidad: 1,
        adiciones: [],
        descuento: 0,
        descuentoTipo: 'porcentaje'
      }]);
      setSelectedProduct('');
    }
  };

  const removeItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItemQuantity = (index: number, cantidad: number) => {
    if (cantidad > 0) {
      const updated = [...orderItems];
      updated[index].cantidad = cantidad;
      setOrderItems(updated);
    }
  };

  const updateItemDiscount = (index: number, descuento: number, tipo: 'porcentaje' | 'fijo') => {
    const updated = [...orderItems];
    updated[index].descuento = descuento;
    updated[index].descuentoTipo = tipo;
    setOrderItems(updated);
  };

  const addAddition = (itemIndex: number, adicionId: number) => {
    const updated = [...orderItems];
    const adicion = updated[itemIndex].producto.adiciones.find(a => a.id_adicion === adicionId);
    if (adicion) {
      const existingAddition = updated[itemIndex].adiciones.find(a => a.adicion.id_adicion === adicionId);
      if (existingAddition) {
        existingAddition.cantidad += 1;
      } else {
        updated[itemIndex].adiciones.push({ adicion, cantidad: 1 });
      }
      setOrderItems(updated);
    }
  };

  const removeAddition = (itemIndex: number, adicionId: number) => {
    const updated = [...orderItems];
    updated[itemIndex].adiciones = updated[itemIndex].adiciones.filter(
      a => a.adicion.id_adicion !== adicionId
    );
    setOrderItems(updated);
  };

  const calculateItemTotal = (item: OrderItem) => {
    const basePrice = item.producto.precio * item.cantidad;
    const additionsPrice = item.adiciones.reduce(
      (sum, a) => sum + (a.adicion.precio_extra * a.cantidad), 
      0
    );
    const subtotal = basePrice + additionsPrice;
    
    if (item.descuento > 0) {
      if (item.descuentoTipo === 'porcentaje') {
        return subtotal * (1 - item.descuento / 100);
      } else {
        return Math.max(0, subtotal - item.descuento);
      }
    }
    return subtotal;
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const handleSubmit = () => {
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Agrega al menos un producto al pedido",
        variant: "destructive",
      });
      return;
    }

    if (orderType === 'en_mesa' && !selectedTable) {
      toast({
        title: "Error",
        description: "Selecciona una mesa para pedidos en mesa",
        variant: "destructive",
      });
      return;
    }

    const newOrder = {
      id_pedido: Date.now(), // Mock ID
      fecha: new Date().toISOString(),
      estado: 'pendiente' as const,
      tipo_pedido: orderType,
      mesa: orderType === 'en_mesa' ? mockTables.find(t => t.id_mesa === parseInt(selectedTable))?.nombre_mesa : null,
      total: calculateTotal(),
      items: orderItems.length
    };

    onOrderCreated(newOrder);
    onOpenChange(false);
    
    // Reset form
    setOrderItems([]);
    setSelectedProduct('');
    setSelectedTable('');
    setOrderType('en_mesa');

    toast({
      title: "Pedido creado",
      description: `Pedido #${newOrder.id_pedido} creado exitosamente`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Type and Table Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tipo de Pedido</Label>
              <Select value={orderType} onValueChange={(value: 'en_mesa' | 'para_llevar') => setOrderType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en_mesa">En Mesa</SelectItem>
                  <SelectItem value="para_llevar">Para Llevar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {orderType === 'en_mesa' && (
              <div>
                <Label>Mesa</Label>
                <Select value={selectedTable} onValueChange={setSelectedTable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockTables.map((table) => (
                      <SelectItem key={table.id_mesa} value={table.id_mesa.toString()}>
                        {table.nombre_mesa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Add Product */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar producto" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map((product) => (
                    <SelectItem key={product.id_producto} value={product.id_producto.toString()}>
                      {product.nombre} - ${product.precio.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addProduct} disabled={!selectedProduct}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Order Items */}
          <div className="space-y-4">
            {orderItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{item.producto.nombre}</h4>
                      <p className="text-sm text-gray-600">${item.producto.precio.toFixed(2)} c/u</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 mb-3">
                    <Label className="text-sm">Cantidad:</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateItemQuantity(index, item.cantidad - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="px-3 py-1 bg-gray-100 rounded text-sm">{item.cantidad}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateItemQuantity(index, item.cantidad + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Additions */}
                  {item.producto.adiciones.length > 0 && (
                    <div className="mb-3">
                      <Label className="text-sm">Adiciones disponibles:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.producto.adiciones.map((adicion) => (
                          <Button
                            key={adicion.id_adicion}
                            variant="outline"
                            size="sm"
                            onClick={() => addAddition(index, adicion.id_adicion)}
                            className="text-xs"
                          >
                            {adicion.nombre} (+${adicion.precio_extra.toFixed(2)})
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected Additions */}
                  {item.adiciones.length > 0 && (
                    <div className="mb-3">
                      <Label className="text-sm">Adiciones seleccionadas:</Label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {item.adiciones.map((adicion) => (
                          <Badge
                            key={adicion.adicion.id_adicion}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeAddition(index, adicion.adicion.id_adicion)}
                          >
                            {adicion.adicion.nombre} x{adicion.cantidad} (+${(adicion.adicion.precio_extra * adicion.cantidad).toFixed(2)})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Discount */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div>
                      <Label className="text-xs">Descuento</Label>
                      <Input
                        type="number"
                        value={item.descuento}
                        onChange={(e) => updateItemDiscount(index, parseFloat(e.target.value) || 0, item.descuentoTipo)}
                        placeholder="0"
                        className="h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Tipo</Label>
                      <Select 
                        value={item.descuentoTipo} 
                        onValueChange={(value: 'porcentaje' | 'fijo') => updateItemDiscount(index, item.descuento, value)}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="porcentaje">%</SelectItem>
                          <SelectItem value="fijo">$</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Total Item</Label>
                      <div className="h-8 px-3 py-1 bg-gray-100 rounded text-sm font-medium flex items-center">
                        ${calculateItemTotal(item).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Total */}
          {orderItems.length > 0 && (
            <div className="flex justify-between items-center text-lg font-bold border-t pt-4">
              <span>Total del Pedido:</span>
              <span className="text-green-600">${calculateTotal().toFixed(2)}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              Crear Pedido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;
