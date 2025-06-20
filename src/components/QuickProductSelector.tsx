import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
// Checkbox no se usa, se puede eliminar si no se va a usar más adelante
// import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, ShoppingCart, Filter, Loader2 } from 'lucide-react';
// import { SAMPLE_INVENTORY } from '@/components/InventoryList'; // Eliminado
import { OrderItem, Addition } from '@/models/order.model';
// import { productHasAdditions, getProductAdditions } from '@/lib/sample-additions'; // Eliminado
import { useProducts, productHasAdditions, getProductAdditions } from '@/hooks/useProducts'; // Añadido
import { AppProduct, AppAddition as AppAdditionFromProduct } from '@/models/product.model'; // Renombrar AppAddition para evitar conflicto
import { formatCurrency } from '@/lib/utils';

interface QuickProductSelectorProps {
  onAddProduct: (product: OrderItem) => void;
}

const QuickProductSelector: React.FC<QuickProductSelectorProps> = ({ onAddProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedAdditions, setSelectedAdditions] = useState<Addition[]>([]); // Addition de order.model ahora incluye cantidad
  const [quantity, setQuantity] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useProducts();

  // Get unique categories from inventory
  const categories = React.useMemo(() => {
    if (!productsData) return [];
    const uniqueCategories = new Map<number, string>();
    productsData.forEach(product => {
      if (product.categoryId && product.categoryName) {
        uniqueCategories.set(product.categoryId, product.categoryName);
      }
    });
    return Array.from(uniqueCategories.entries()).map(([id, name]) => ({ id, name }));
  }, [productsData]);

  // Filter products based on search and category
  const filteredProducts = React.useMemo(() => {
    if (!productsData) return [];
    return productsData.filter(product => {
      const matchesSearch = product.isActive &&
        product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = activeCategory === 'all' || product.categoryName === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [productsData, searchQuery, activeCategory]);

  const selectedProduct = productsData?.find(p => p.id === selectedProductId);
  // Adaptar llamadas a productHasAdditions y getProductAdditions
  const hasAdditions = selectedProductId && productsData ? productHasAdditions(selectedProductId, productsData) : false;
  const availableAdditions = selectedProductId && productsData ? getProductAdditions(selectedProductId, productsData) : [];

  const handleAdditionQuantityChange = (additionId: string, newQuantity: number) => {
    const updatedAdditions = selectedAdditions.map(add => {
      if (add.id === additionId) {
        return { ...add, quantity: Math.max(1, newQuantity) }; // Asegurar cantidad positiva
      }
      return add;
    });
    setSelectedAdditions(updatedAdditions);
  };

  const toggleAddition = (productAddition: AppAdditionFromProduct) => {
    const existingAddition = selectedAdditions.find(item => item.id === productAddition.id);
    if (existingAddition) {
      // Si ya existe, la eliminamos (el botón actuará como un toggle)
      setSelectedAdditions(selectedAdditions.filter(item => item.id !== productAddition.id));
    } else {
      // Si no existe, la agregamos con cantidad 1 por defecto
      setSelectedAdditions([...selectedAdditions, { 
        id: productAddition.id, 
        name: productAddition.name, 
        price: productAddition.price, 
        quantity: 1 
      }]);
    }
  };

  const calculateTotal = () => {
    if (!selectedProduct) return 0;
    const productTotal = selectedProduct.price * quantity;
    // Corregido: selectedAdditions es un array de Addition (de order.model), que ya tiene price y quantity
    const additionsSubTotal = selectedAdditions.reduce((sum, addition) => sum + (addition.price * addition.quantity), 0);
    return productTotal + (additionsSubTotal * quantity); // El subtotal de adiciones se multiplica por la cantidad del producto principal
  };

  const handleQuickAdd = (productId: string) => {
    const product = productsData?.find(p => p.id === productId);
    if (!product) return;

    const orderItem: OrderItem = {
      productId: product.id,
      name: product.name,
      quantity: 1, // Cantidad base del producto
      price: product.price,
      total: product.price // El total inicial es solo el precio del producto
    };

    onAddProduct(orderItem);
  };

  const handleAddWithOptions = () => {
    if (!selectedProduct) return;

    // El precio base del producto ya está en selectedProduct.price
    // Las adiciones se manejan por separado y su costo se suma al total del OrderItem
    const baseProductTotal = selectedProduct.price * quantity;
    const additionsTotalForOrderItem = selectedAdditions.reduce((sum, addition) => sum + (addition.price * addition.quantity), 0);

    const orderItem: OrderItem = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      quantity: quantity,
      price: selectedProduct.price, // Precio unitario del producto base
      total: baseProductTotal + additionsTotalForOrderItem, // Total para esta cantidad de producto, incluyendo sus adiciones
      additions: selectedAdditions.length > 0 ? selectedAdditions : undefined
    };

    onAddProduct(orderItem);
    
    // Reset selection
    setSelectedProductId('');
    setSelectedAdditions([]);
    setQuantity(1);
  };

  const getProductsByCategory = (categoryName: string) => {
    if (!productsData) return [];
    if (categoryName === 'all') return filteredProducts;
    // Ahora filtramos por categoryName en lugar de una propiedad 'category' que no existía
    return filteredProducts.filter(product => product.categoryName === categoryName);
  };

  // ProductGrid ahora recibe AppProduct[]
  const ProductGrid = ({ products }: { products: AppProduct[] }) => (
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
              <h4 className="font-medium text-sm">{product.name}</h4> {/* Mostrar nombre del producto */}
              <p className="text-xs text-muted-foreground">Precio: {formatCurrency(product.price)}</p>
            </div>            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation(); // Evitar que el click en el botón seleccione la tarjeta
                handleQuickAdd(product.id);
              }}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          
          {/* Adaptar llamada a productHasAdditions */}
          {productsData && productHasAdditions(product.id, productsData) && (
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

  if (isLoadingProducts) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Cargando productos...</p>
      </div>
    );
  }

  if (productsError) {
    return (
      <div className="text-red-500 text-center p-4 border border-red-300 rounded-md">
        <p>Error al cargar los productos: {productsError.message}</p>
        <p>Por favor, intente recargar la página o contacte a soporte.</p>
      </div>
    );
  }
  
  if (!productsData) {
    return <div className="text-center p-4">No hay productos disponibles en este momento.</div>;
  }

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
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.name}>{category.name}</TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* All Products Tab */} 
        <TabsContent value="all" className="mt-0">
          <ProductGrid products={getProductsByCategory('all')} />
        </TabsContent>

        {/* Category-specific Tabs */}
        {categories.map(category => (
          <TabsContent key={category.id} value={category.name} className="mt-0">
            <ProductGrid products={getProductsByCategory(category.name)} />
          </TabsContent>
        ))}
      </Tabs>

      {/* Selected Product Configuration */}
      {selectedProduct && (
        <Card className="p-4 border-primary">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedProduct.name}</h3> {/* Mostrar nombre */}
              <Button variant="ghost" size="sm" onClick={() => { setSelectedProductId(''); setSelectedAdditions([]); setQuantity(1); }}>
                Limpiar
              </Button>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center space-x-2">
              <label htmlFor="quantity" className="text-sm font-medium">Cantidad:</label>
              <Input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20"
                min="1"
              />
            </div>

            {/* Additions Selector (if any) */}
            {hasAdditions && availableAdditions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Adiciones Disponibles:</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {availableAdditions.map((productAddition) => {
                    const currentSelectedAddition = selectedAdditions.find(sa => sa.id === productAddition.id);
                    return (
                      <div key={productAddition.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div>
                          <span className="text-sm">{productAddition.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">(+{formatCurrency(productAddition.price)})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentSelectedAddition && (
                            <Input
                              type="number"
                              value={currentSelectedAddition.quantity}
                              onChange={(e) => handleAdditionQuantityChange(productAddition.id, parseInt(e.target.value) || 1)}
                              className="w-16 h-8 text-sm"
                              min="1"
                            />
                          )}                          <Button 
                            type="button"
                            size="sm" 
                            variant={currentSelectedAddition ? "default" : "outline"}
                            onClick={() => toggleAddition(productAddition)}
                            className="h-8"
                          >
                            {currentSelectedAddition ? "Quitar" : "Agregar"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Total Price & Add Button */}            <div className="flex justify-between items-center pt-2 border-t">
              <div>
                <span className="text-sm">Total:</span>
                <span className="font-bold text-lg ml-2">{formatCurrency(calculateTotal())}</span>
              </div><Button type="button" onClick={handleAddWithOptions} disabled={quantity <= 0}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar a la Orden
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default QuickProductSelector;
