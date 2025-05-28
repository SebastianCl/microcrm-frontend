
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, ShoppingCart, Filter } from 'lucide-react';
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
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const { t } = useLanguage();

  // Get unique categories from inventory
  const categories = Array.from(new Set(SAMPLE_INVENTORY.map(product => product.category)));

  // Filter products based on search and category
  const filteredProducts = SAMPLE_INVENTORY.filter(product => {
    const matchesSearch = product.stockQuantity > 0 &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

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

  const getProductsByCategory = (category: string) => {
    if (category === 'all') return filteredProducts;
    return filteredProducts.filter(product => product.category === category);
  };

  const ProductGrid = ({ products }: { products: typeof SAMPLE_INVENTORY }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
      {products.map((product) => (
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
              <div className="flex gap-1 mt-1">
                <Badge variant="outline" className="text-xs">
                  {product.stockQuantity} Disponible
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {product.category}
                </Badge>
              </div>
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
              Tiene adiciones
            </Badge>
          )}
        </Card>
      ))}
      {products.length === 0 && (
        <div className="col-span-full text-center py-8 text-muted-foreground">
          No se encontraron productos
        </div>
      )}
    </div>
  );

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

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <TabsTrigger value="all" className="text-xs">
              Todos ({filteredProducts.length})
            </TabsTrigger>
            {categories.map(category => {
              const categoryProducts = getProductsByCategory(category);
              return (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category} ({categoryProducts.length})
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* All Products Tab */}
        <TabsContent value="all" className="mt-0">
          <ProductGrid products={filteredProducts} />
        </TabsContent>

        {/* Category-specific Tabs */}
        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            <ProductGrid products={getProductsByCategory(category)} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Selected Product Configuration */}
      {selectedProduct && (
        <Card className="p-4 border-primary">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{selectedProduct.name}</h3>
                <Badge variant="outline" className="text-xs mt-1">
                  {selectedProduct.category}
                </Badge>
              </div>
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
              <label className="text-sm font-medium">Cantidad:</label>
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
                <label className="text-sm font-medium">Adiciones:</label>
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
                <span className="font-medium">Total: ${calculateTotal()}</span>
              </div>
              <Button onClick={handleAddWithOptions} className="flex items-center space-x-1">
                <ShoppingCart className="h-4 w-4" />
                <span>Agregar</span>
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuickProductSelector;
