
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, ShoppingCart } from 'lucide-react';
import { SAMPLE_INVENTORY } from '@/components/InventoryList';
import { OrderItem, Addition } from '@/models/order.model';
import { productHasAdditions, getProductAdditions } from '@/lib/sample-additions';
import { useLanguage } from '@/contexts/LanguageProvider';

interface QuickProductSelectorProps {
  onAddProduct: (product: OrderItem) => void;
}

const QuickProductSelector: React.FC<QuickProductSelectorProps> = ({ onAddProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedAdditions, setSelectedAdditions] = useState<Addition[]>([]);
  const [quantity, setQuantity] = useState(1);
  const { t } = useLanguage();

  // Filter products based on search
  const filteredProducts = SAMPLE_INVENTORY.filter(product =>
    product.stockQuantity > 0 &&
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProduct = SAMPLE_INVENTORY.find(p => p.id === selectedProductId);
  const hasAdditions = selectedProductId ? productHasAdditions(selectedProductId) : false;
  const availableAdditions = selectedProductId ? getProductAdditions(selectedProductId) : [];

  const toggleAddition = (addition: Addition) => {
    const isSelected = selectedAdditions.some(item => item.id === addition.id);
    if (isSelected) {
      setSelectedAdditions(selectedAdditions.filter(item => item.id !== addition.id));
    } else {
      setSelectedAdditions([...selectedAdditions, addition]);
    }
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    const productTotal = selectedProduct.price * quantity;
    const additionsTotal = selectedAdditions.reduce((sum, addition) => sum + addition.price, 0) * quantity;
    return productTotal + additionsTotal;
  };

  const handleQuickAdd = (productId: string) => {
    const product = SAMPLE_INVENTORY.find(p => p.id === productId);
    if (!product) return;

    const orderItem: OrderItem = {
      productId: product.id,
      name: product.name,
      quantity: 1,
      price: product.price,
      total: product.price
    };

    onAddProduct(orderItem);
  };

  const handleAddWithOptions = () => {
    if (!selectedProduct) return;

    const additionsTotal = selectedAdditions.reduce((sum, addition) => sum + addition.price, 0) * quantity;
    const productTotal = selectedProduct.price * quantity;

    const orderItem: OrderItem = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      quantity: quantity,
      price: selectedProduct.price,
      total: productTotal + additionsTotal
    };

    if (selectedAdditions.length > 0) {
      orderItem.additions = selectedAdditions;
    }

    onAddProduct(orderItem);
    
    // Reset selection
    setSelectedProductId('');
    setSelectedAdditions([]);
    setQuantity(1);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar productos"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Quick Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
        {filteredProducts.map((product) => (
          <Card 
            key={product.id} 
            className={`p-3 cursor-pointer transition-all hover:shadow-md ${
              selectedProductId === product.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedProductId(product.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-medium text-sm">{product.name}</h4>
                <p className="text-xs text-muted-foreground">${product.price}</p>
                <Badge variant="outline" className="text-xs mt-1">
                  {product.stockQuantity} {t('available')}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(product.id);
                }}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            {productHasAdditions(product.id) && (
              <Badge variant="secondary" className="text-xs">
                {t('has_additions')}
              </Badge>
            )}
          </Card>
        ))}
      </div>

      {/* Selected Product Configuration */}
      {selectedProduct && (
        <Card className="p-4 border-primary">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">{selectedProduct.name}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProductId('')}
              >
                ×
              </Button>
            </div>

            {/* Quantity */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">{t('quantity')}:</label>
              <div className="flex items-center space-x-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="h-8 w-8 p-0"
                >
                  -
                </Button>
                <span className="w-8 text-center text-sm">{quantity}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setQuantity(Math.min(selectedProduct.stockQuantity, quantity + 1))}
                  className="h-8 w-8 p-0"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Additions */}
            {hasAdditions && (
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('additions')}:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableAdditions.map(addition => (
                    <div key={addition.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`quick-addition-${addition.id}`}
                        checked={selectedAdditions.some(item => item.id === addition.id)}
                        onCheckedChange={() => toggleAddition(addition)}
                      />
                      <label 
                        htmlFor={`quick-addition-${addition.id}`} 
                        className="text-sm flex-1 cursor-pointer"
                      >
                        {addition.name} (+${addition.price})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total and Add Button */}
            <div className="flex justify-between items-center pt-2 border-t">
              <div className="text-sm">
                <span className="font-medium">{t('total')}: ${calculateTotal()}</span>
              </div>
              <Button onClick={handleAddWithOptions} className="flex items-center space-x-1">
                <ShoppingCart className="h-4 w-4" />
                <span>{t('add_to_order')}</span>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuickProductSelector;
