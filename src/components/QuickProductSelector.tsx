import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// Checkbox no se usa, se puede eliminar si no se va a usar más adelante
// import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, ShoppingCart, Filter, Loader2, X, Minus } from 'lucide-react';
// import { SAMPLE_INVENTORY } from '@/components/InventoryList'; // Eliminado
import { OrderItem, Addition } from '@/models/order.model';
// import { productHasAdditions, getProductAdditions } from '@/lib/sample-additions'; // Eliminado
import { useProducts, productHasAdditions, getProductAdditions } from '@/hooks/useProducts'; // Añadido
import { AppProduct, AppAddition as AppAdditionFromProduct } from '@/models/product.model'; // Renombrar AppAddition para evitar conflicto
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface QuickProductSelectorProps {
  onAddProduct: (product: OrderItem) => void;
  onUpdateProduct?: (index: number, product: OrderItem) => void;
  onRemoveProduct?: (index: number) => void;
  existingProducts?: OrderItem[];
}

const QuickProductSelector: React.FC<QuickProductSelectorProps> = ({
  onAddProduct,
  onUpdateProduct,
  onRemoveProduct,
  existingProducts = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedAdditions, setSelectedAdditions] = useState<Addition[]>([]); // Addition de order.model ahora incluye cantidad
  const [quantity, setQuantity] = useState(1);
  const [observaciones, setObservaciones] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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
    const effectivePrice = selectedProduct.price === 0 ? customPrice : selectedProduct.price;
    const productTotal = effectivePrice * quantity;
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

    const effectivePrice = selectedProduct.price === 0 ? customPrice : selectedProduct.price;

    // Validar que el precio sea válido cuando es personalizado
    if (selectedProduct.price === 0 && (customPrice <= 0 || isNaN(customPrice))) {
      toast.error('Por favor ingresa un precio válido para este producto');
      return;
    }

    // El precio base del producto ya está en selectedProduct.price
    // Las adiciones se manejan por separado y su costo se suma al total del OrderItem
    const baseProductTotal = effectivePrice * quantity;
    const additionsTotalForOrderItem = selectedAdditions.reduce((sum, addition) => sum + (addition.price * addition.quantity), 0);

    const orderItem: OrderItem = {
      productId: selectedProduct.id,
      name: selectedProduct.name,
      quantity: quantity,
      price: effectivePrice, // Usar el precio efectivo (original o personalizado)
      total: baseProductTotal + additionsTotalForOrderItem, // Total para esta cantidad de producto, incluyendo sus adiciones
      additions: selectedAdditions.length > 0 ? selectedAdditions : undefined,
      observacion: observaciones.trim() || undefined
    };

    // Si está editando un producto existente, usar onUpdateProduct
    if (editingIndex !== null && onUpdateProduct) {
      onUpdateProduct(editingIndex, orderItem);
      toast.success(`${selectedProduct.name} actualizado en la orden`);
    } else {
      // Si no está editando, agregar nuevo producto
      onAddProduct(orderItem);
      toast.success(`${selectedProduct.name} agregado a la orden`);
    }

    // Reset selection
    setSelectedProductId('');
    setSelectedAdditions([]);
    setQuantity(1);
    setObservaciones('');
    setCustomPrice(0);
    setEditingIndex(null);
  };

  const getProductsByCategory = (categoryName: string) => {
    if (!productsData) return [];
    if (categoryName === 'all') return filteredProducts;
    // Ahora filtramos por categoryName en lugar de una propiedad 'category' que no existía
    return filteredProducts.filter(product => product.categoryName === categoryName);
  };

  // ProductGrid ahora recibe AppProduct[]
  const ProductGrid = ({ products }: { products: AppProduct[] }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
      {products.map((product) => (
        <Card
          key={product.id}
          className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] border-2 ${selectedProductId === product.id ? 'border-primary bg-primary/5 shadow-lg' : 'border-border hover:border-primary/50'
            }`}
          onClick={() => {
            setSelectedProductId(product.id);
            // Inicializar el precio personalizado cuando el producto tiene precio 0
            if (product.price === 0) {
              setCustomPrice(0);
            }
          }}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-base truncate">{product.name}</h4>
                <p className="text-sm text-muted-foreground">{formatCurrency(product.price)}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(product.id);
                }}
                className="h-10 w-10 p-0 ml-2 flex-shrink-0 hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              {/* Adaptar llamada a productHasAdditions */}
              {productsData && productHasAdditions(product.id, productsData) && (
                <Badge variant="secondary" className="text-xs px-2 py-1">
                  Tiene adiciones
                </Badge>
              )}
              <div className="flex-1"></div>
              {selectedProductId === product.id && (
                <Badge className="text-xs px-2 py-1 bg-primary text-primary-foreground">
                  Seleccionado
                </Badge>
              )}
            </div>
          </div>
        </Card>
      ))}
      {products.length === 0 && (
        <div className="col-span-full text-center py-12 text-muted-foreground">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No se encontraron productos</p>
          <p className="text-sm">Intenta con una búsqueda diferente</p>
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
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar productos"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <div className="flex items-start gap-2 mb-4">
          <Filter className="h-4 w-4 text-muted-foreground mt-2 flex-shrink-0" />
          <div className="flex-1 overflow-hidden">
            <TabsList className="h-auto p-1 bg-muted rounded-md">
              <div className="flex flex-wrap gap-1">
                <TabsTrigger value="all" className="text-sm px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  Todos
                </TabsTrigger>
                {categories.map(category => (
                  <TabsTrigger
                    key={category.id}
                    value={category.name}
                    className="text-sm px-4 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm whitespace-nowrap"
                  >
                    {category.name}
                  </TabsTrigger>
                ))}
              </div>
            </TabsList>
          </div>
        </div>

        {/* Contenido principal organizado en dos columnas para aprovechar el espacio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Lista de productos (2/3 del espacio en pantallas grandes) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lista de productos disponibles */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Productos disponibles</h3>
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
            </div>

            {/* Productos ya agregados */}
            {existingProducts.length > 0 && (
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Productos en la orden ({existingProducts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {existingProducts.map((item, index) => (
                      <div key={`existing-${index}`} className="flex items-center justify-between p-3 bg-muted/30 border rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Cantidad: {item.quantity}</span>
                            <span>Precio: {formatCurrency(item.price)}</span>
                            <span className="font-medium text-primary">Total: {formatCurrency(item.total)}</span>
                          </div>
                          {item.additions && item.additions.length > 0 && (
                            <div className="mt-1">
                              <span className="text-xs text-blue-600 dark:text-blue-400">
                                Adiciones: {item.additions.map(add => `${add.name} (${add.quantity})`).join(', ')}
                              </span>
                            </div>
                          )}
                          {item.observacion && (
                            <div className="mt-1">
                              <span className="text-xs text-orange-600 dark:text-orange-400">Nota: {item.observacion}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Cargar el producto para edición
                              const product = productsData?.find(p => p.id === item.productId);
                              if (product) {
                                setSelectedProductId(item.productId);
                                setQuantity(item.quantity);
                                setObservaciones(item.observacion || '');
                                setSelectedAdditions(item.additions || []);
                                setEditingIndex(index); // Establecer el índice de edición
                                if (product.price === 0) {
                                  setCustomPrice(item.price);
                                }
                              }
                            }}
                            className="h-8 px-3 text-xs"
                          >
                            Editar
                          </Button>
                          {onRemoveProduct && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveProduct(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Columna derecha: Configuración del producto seleccionado (1/3 del espacio) */}
          <div className="lg:col-span-1">
            {selectedProduct && (
              <Card className="sticky top-4 border-primary shadow-lg">
                <div className="p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold truncate">{selectedProduct.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedProductId('');
                        setSelectedAdditions([]);
                        setQuantity(1);
                        setObservaciones('');
                        setCustomPrice(0);
                        setEditingIndex(null);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Cantidad y precio base en una fila */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Cantidad</label>
                      <div className="flex items-center border rounded-lg">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="h-12 w-12 p-0 hover:bg-muted"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                          className="border-0 text-center h-12 focus-visible:ring-0"
                          min="1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuantity(quantity + 1)}
                          className="h-12 w-12 p-0 hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">
                        {selectedProduct.price === 0 ? 'Precio (editable)' : 'Precio'}
                      </label>
                      {selectedProduct.price === 0 ? (
                        <div className="relative">
                          <Input
                            type="number"
                            value={customPrice || ''}
                            onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                            placeholder="Ingresa el precio"
                            className="h-12 text-center font-semibold text-base"
                            min="0"
                            step="0.01"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            $
                          </div>
                        </div>
                      ) : (
                        <div className="h-12 flex items-center justify-center bg-muted rounded-lg">
                          <span className="font-semibold">{formatCurrency(selectedProduct.price)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Adiciones en formato compacto */}
                  {hasAdditions && availableAdditions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Adiciones</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {availableAdditions.map((productAddition) => {
                          const currentSelectedAddition = selectedAdditions.find(sa => sa.id === productAddition.id);
                          return (
                            <div key={productAddition.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{productAddition.name}</p>
                                <p className="text-xs text-muted-foreground">+{formatCurrency(productAddition.price)}</p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                {currentSelectedAddition && (
                                  <div className="flex items-center border rounded">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAdditionQuantityChange(productAddition.id, currentSelectedAddition.quantity - 1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center text-sm">{currentSelectedAddition.quantity}</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleAdditionQuantityChange(productAddition.id, currentSelectedAddition.quantity + 1)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant={currentSelectedAddition ? "default" : "outline"}
                                  onClick={() => toggleAddition(productAddition)}
                                  className="h-8 px-3 text-xs"
                                >
                                  {currentSelectedAddition ? "✓" : "+"}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Observaciones compactas */}
                  <div>
                    <label className="text-sm font-medium mb-1 block">Observaciones</label>
                    <Textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      placeholder="Notas especiales..."
                      className="min-h-[60px] resize-none text-sm"
                    />
                  </div>

                  {/* Total y botón agregar */}
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total:</span>
                      <span className="font-bold text-xl text-primary">{formatCurrency(calculateTotal())}</span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleAddWithOptions}
                      disabled={quantity <= 0 || (selectedProduct.price === 0 && (customPrice <= 0 || isNaN(customPrice)))}
                      className="w-full h-12 text-base font-semibold shadow-md"
                      size="lg"
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      {editingIndex !== null ? 'Actualizar producto' : 'Agregar a la orden'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            {!selectedProduct && (
              <Card className="p-8 text-center border-dashed">
                <div className="text-muted-foreground">
                  <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Selecciona un producto para configurarlo</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};

export default QuickProductSelector;
