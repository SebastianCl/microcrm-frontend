
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { SAMPLE_INVENTORY } from '@/components/InventoryList';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderItem, Addition } from '@/models/order.model';
import { Checkbox } from '@/components/ui/checkbox';
import { productHasAdditions, getProductAdditions } from '@/lib/sample-additions';
import { useLanguage } from '@/contexts/LanguageProvider';

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
  const { t } = useLanguage();

  // Effect to reset additions when product changes
  useEffect(() => {
    setSelectedAdditions([]);
  }, [selectedProductId]);
  
  const handleAddProduct = () => {
    const product = SAMPLE_INVENTORY.find(p => p.id === selectedProductId);
    if (!product) return;
    
    // Calculate total including additions
    const additionsTotal = selectedAdditions.reduce((sum, addition) => sum + addition.price, 0) * quantity;
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
  const selectedProduct = SAMPLE_INVENTORY.find(p => p.id === selectedProductId);
  
  // Check if product has additions
  const hasAdditions = selectedProductId ? productHasAdditions(selectedProductId) : false;
  
  // Get additions for selected product
  const availableAdditions = selectedProductId ? getProductAdditions(selectedProductId) : [];
  
  // Toggle addition selection
  const toggleAddition = (addition: Addition) => {
    const isSelected = selectedAdditions.some(item => item.id === addition.id);
    
    if (isSelected) {
      setSelectedAdditions(selectedAdditions.filter(item => item.id !== addition.id));
    } else {
      setSelectedAdditions([...selectedAdditions, addition]);
    }
  };
  
  // Calculate subtotal with additions
  const calculateSubtotal = () => {
    if (!selectedProduct) return 0;
    
    const productTotal = selectedProduct.price * quantity;
    const additionsTotal = selectedAdditions.reduce((sum, addition) => sum + addition.price, 0) * quantity;
    
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
              onChange={(e) => setSelectedProductId(e.target.value)}
            >
              <option value="">Seleccionar producto</option>
              {SAMPLE_INVENTORY.filter(p => p.stockQuantity > 0).map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - ${product.price} ({product.stockQuantity} Disponible)
                </option>
              ))}
            </select>
          </div>
          
          {selectedProductId && selectedProduct && (
            <>
              <div>
                <Label htmlFor="quantity">Cantidad</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedProduct.stockQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              
              {/* Display additions if available */}
              {hasAdditions && (
                <div className="space-y-2">
                  <Label>Adiciones</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border rounded-md p-3">
                    {availableAdditions.map(addition => (
                      <div key={addition.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`addition-${addition.id}`} 
                          checked={selectedAdditions.some(item => item.id === addition.id)}
                          onCheckedChange={() => toggleAddition(addition)}
                        />
                        <Label htmlFor={`addition-${addition.id}`} className="flex-1">
                          {addition.name} (+${addition.price})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label>Subtotal</Label>
                <div className="text-xl font-semibold mt-1">
                  ${calculateSubtotal()}
                  {selectedAdditions.length > 0 && (
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (${selectedProduct.price} + Adiciones)
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
