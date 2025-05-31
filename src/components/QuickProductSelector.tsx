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
import { AppProduct } from '@/models/product.model'; // Añadido

interface QuickProductSelectorProps {
  onAddProduct: (product: OrderItem) => void;
}

const QuickProductSelector: React.FC<QuickProductSelectorProps> = ({ onAddProduct }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedAdditions, setSelectedAdditions] = useState<Addition[]>([]); // Addition de order.model sigue siendo válido
  const [quantity, setQuantity] = useState(1);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data: productsData, isLoading: isLoadingProducts, error: productsError } = useProducts();

  // Get unique categories from inventory - Se debe adaptar para usar productsData y manejar el caso de que sea undefined
  const categories = React.useMemo(() => {
    if (!productsData) return [];
    // Asumimos que AppProduct no tiene 'category', si se necesita, se debe añadir a AppProduct o manejar de otra forma
    // Por ahora, como no hay categorías desde la API, devolvemos un array vacío o una categoría 'all' por defecto.
    // Si los productos de la API tuvieran una propiedad 'category', se usaría así:
    // return Array.from(new Set(productsData.map(product => product.category)));
    return ['all']; // Placeholder, ya que la API no devuelve categorías
  }, [productsData]);

  // Filter products based on search and category - Adaptar para usar productsData
  const filteredProducts = React.useMemo(() => {
    if (!productsData) return [];
    return productsData.filter(product => {
      const matchesSearch = product.isActive && // Usar isActive de AppProduct
        product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Si se implementan categorías reales, la lógica de activeCategory se usaría aquí
      // const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      // return matchesSearch && matchesCategory;
      return matchesSearch; // Por ahora, solo filtra por búsqueda y estado activo
    });
  }, [productsData, searchQuery, activeCategory]);

  const selectedProduct = productsData?.find(p => p.id === selectedProductId);
  // Adaptar llamadas a productHasAdditions y getProductAdditions
  const hasAdditions = selectedProductId && productsData ? productHasAdditions(selectedProductId, productsData) : false;
  const availableAdditions = selectedProductId && productsData ? getProductAdditions(selectedProductId, productsData) : [];

  const toggleAddition = (addition: Addition) => { // La 'Addition' aquí es la de order.model, que es compatible con AppAddition
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
    // selectedAdditions usa 'price', que es compatible con AppAddition.price
    const additionsTotal = selectedAdditions.reduce((sum, addition) => sum + addition.price, 0) * quantity;
    return productTotal + additionsTotal;
  };

  const handleQuickAdd = (productId: string) => {
    const product = productsData?.find(p => p.id === productId);
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

    // selectedAdditions usa 'price'
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

  // getProductsByCategory necesita adaptarse si se usan categorías reales
  const getProductsByCategory = (category: string) => {
    if (!productsData) return [];
    if (category === 'all') return filteredProducts;
    // return filteredProducts.filter(product => product.category === category); // Si AppProduct tuviera category
    return filteredProducts; // Placeholder
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
              <p className="text-xs text-muted-foreground">Precio: ${product.price.toFixed(2)}</p> {/* Mostrar precio */}
            </div>
            <Button
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
            {/* Renderizar TabsTrigger dinámicamente si hay categorías */}
            <TabsTrigger value="all">Todos</TabsTrigger>
            {/* {categories.map(category => (
              category !== 'all' && <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
            ))} */}
          </TabsList>
        </div>

        {/* All Products Tab */}
        <TabsContent value="all" className="mt-0">
          <ProductGrid products={filteredProducts} />
        </TabsContent>

        {/* Category-specific Tabs - Adaptar si hay categorías */}
        {/* {categories.map(category => (
          category !== 'all' && (
            <TabsContent key={category} value={category} className="mt-0">
              <ProductGrid products={getProductsByCategory(category)} />
            </TabsContent>
          )
        ))} */}
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
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableAdditions.map((addition) => (
                    <div key={addition.id} className="flex items-center justify-between p-2 border rounded-md">
                      <div>
                        <span className="text-sm">{addition.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">(+${addition.price.toFixed(2)})</span>
                      </div>
                      <Button 
                        size="sm" 
                        variant={selectedAdditions.some(a => a.id === addition.id) ? "default" : "outline"}
                        onClick={() => toggleAddition(addition as unknown as Addition)} // Casting necesario si AppAddition y Addition (order.model) difieren estructuralmente más allá de los nombres de campo
                      >
                        {selectedAdditions.some(a => a.id === addition.id) ? "Seleccionado" : "Agregar"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Price & Add Button */}
            <div className="flex justify-between items-center pt-2 border-t">
              <div>
                <span className="text-sm">Total:</span>
                <span className="font-bold text-lg ml-2">${calculateTotal().toFixed(2)}</span>
              </div>
              <Button onClick={handleAddWithOptions} disabled={quantity <= 0}>
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
