
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderItem, Addition } from '@/models/order.model';
import { Checkbox } from '@/components/ui/checkbox';
import { useProducts, productHasAdditions, getProductAdditions } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';

interface AddProductToOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProduct: (product: OrderItem) => void;
}

const AddProductToOrderDialog: React.FC<AddProductToOrderDialogProps> = ({
  open,
  onOpenChange,
  onAddProduct,
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedAdditions, setSelectedAdditions] = useState<Addition[]>([]);

  // Obtener productos de la API
  const { data: products = [], isLoading, isError } = useProducts();

  // Effect to reset additions when product changes
  useEffect(() => {
    setSelectedAdditions([]);
  }, [selectedProductId]);
    const handleAddProduct = () => {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) return;
    
    // Calculate total including additions
    const additionsTotal = selectedAdditions.reduce((sum, addition) => sum + (addition.price * addition.quantity), 0) * quantity;
    const productTotal = product.price * quantity;
    
    const orderItem: OrderItem = {
      productId: product.id,
      name: product.name,
      quantity: quantity,
      price: product.price,
      total: productTotal + additionsTotal
    };
    
    // Add selected additions if any
    if (selectedAdditions.length > 0) {
      orderItem.additions = selectedAdditions;
    }
    
    onAddProduct(orderItem);
    // Reset form
    setSelectedProductId('');
    setQuantity(1);
    setSelectedAdditions([]);
    onOpenChange(false);
  };
    // Find selected product
  const selectedProduct = products.find(p => p.id === selectedProductId);
  
  // Check if product has additions
  const hasAdditions = selectedProductId && !isLoading && !isError ? productHasAdditions(selectedProductId, products) : false;
  
  // Get additions for selected product
  const availableAdditions = selectedProductId && !isLoading && !isError ? getProductAdditions(selectedProductId, products) : [];
  // Convertir AppAddition a Addition cuando sea necesario
  const convertToAddition = (appAddition: typeof availableAdditions[0]): Addition => {
    // Verificar si ya existe en selectedAdditions para preservar la cantidad
    const existingAddition = selectedAdditions.find(a => a.id === appAddition.id);
    return {
      id: appAddition.id,
      name: appAddition.name,
      price: appAddition.price,
      quantity: existingAddition?.quantity || 1
    };
  };
  
  // Toggle addition selection
  const toggleAddition = (appAddition: typeof availableAdditions[0]) => {
    const isSelected = selectedAdditions.some(item => item.id === appAddition.id);
    
    if (isSelected) {
      setSelectedAdditions(selectedAdditions.filter(item => item.id !== appAddition.id));
    } else {
      const addition = convertToAddition(appAddition);
      setSelectedAdditions([...selectedAdditions, addition]);
    }
  };

  const updateAdditionQuantity = (additionId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSelectedAdditions(selectedAdditions.filter(a => a.id !== additionId));
    } else {
      setSelectedAdditions(selectedAdditions.map(a => 
        a.id === additionId ? { ...a, quantity: newQuantity } : a
      ));
    }
  };
    // Calculate subtotal with additions
  const calculateSubtotal = () => {
    if (!selectedProduct) return 0;
    
    const productTotal = selectedProduct.price * quantity;
    const additionsTotal = selectedAdditions.reduce((sum, addition) => sum + (addition.price * addition.quantity), 0) * quantity;
    
    return productTotal + additionsTotal;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agregar producto</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div>
            <Label htmlFor="product">Producto</Label>
            <select
              id="product"
              className="flex w-full h-10 px-3 py-2 text-sm rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}            >
              <option value="">Seleccionar producto</option>
              {isLoading ? (
                <option disabled>Cargando productos...</option>
              ) : isError ? (
                <option disabled>Error al cargar productos</option>
              ) : (
                products.filter(p => p.isActive).map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.price)}
                  </option>
                ))
              )}
            </select>
          </div>
          
          {selectedProductId && selectedProduct && (
            <>
              <div>
                <Label htmlFor="quantity">Cantidad</Label>                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
                {/* Display additions if available */}
              {hasAdditions && availableAdditions.length > 0 && (
                <div className="space-y-2">
                  <Label>Adiciones</Label>
                  <div className="space-y-2 border rounded-md p-3 max-h-40 overflow-y-auto">
                    {availableAdditions.map(appAddition => {
                      const selectedAddition = selectedAdditions.find(a => a.id === appAddition.id);
                      const isSelected = !!selectedAddition;
                      
                      return (
                        <div key={appAddition.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`addition-${appAddition.id}`} 
                            checked={isSelected}
                            onCheckedChange={() => toggleAddition(appAddition)}
                          />
                          <Label htmlFor={`addition-${appAddition.id}`} className="flex-1 text-sm">
                            {appAddition.name} (+{formatCurrency(appAddition.price)})
                          </Label>
                          
                          {/* Controles de cantidad para adición seleccionada */}
                          {isSelected && (
                            <div className="flex items-center space-x-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => updateAdditionQuantity(appAddition.id, selectedAddition.quantity - 1)}
                                className="h-6 w-6 p-0 text-xs"
                              >
                                -
                              </Button>
                              <span className="text-xs w-6 text-center">{selectedAddition.quantity}</span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => updateAdditionQuantity(appAddition.id, selectedAddition.quantity + 1)}
                                className="h-6 w-6 p-0 text-xs"
                              >
                                +
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
                <div>
                <Label>Subtotal</Label>
                <div className="text-xl font-semibold mt-1">
                  {formatCurrency(calculateSubtotal())}
                  {selectedAdditions.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({formatCurrency(selectedProduct.price)} + Adiciones)
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleAddProduct}
            disabled={!selectedProductId || quantity < 1}
          >
            Agregar producto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductToOrderDialog;
