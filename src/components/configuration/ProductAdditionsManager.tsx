import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Package, Loader2, Search } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProductAddition } from '@/models/product-addition.model';
import { useAdditions } from '@/hooks/useAdditions';
import { useProducts } from '@/hooks/useProducts';

const ProductAdditionsManager: React.FC = () => {
  const { toast } = useToast();

  // Hooks para obtener datos
  const {
    additions,
    isLoading,
    isCreating,
    isUpdating,
    isTogglingStatus,
    createAddition,
    updateAddition,
    toggleAdditionStatus
  } = useAdditions();

  const productsQuery = useProducts();
  const products = productsQuery.data || [];
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAddition, setSelectedAddition] = useState<ProductAddition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    productId: ''
  });
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  const handleCreateAddition = () => {
    if (!formData.name.trim() || !formData.price || !formData.productId) {
      toast({
        title: "Advertencia",
        description: "Todos los campos son obligatorios",
        variant: "default",
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (price <= 0) {
      toast({
        title: "Advertencia",
        description: "El precio debe ser mayor a 0",
        variant: "default",
      });
      return;
    }

    createAddition({
      name: formData.name,
      price: price,
      productId: formData.productId
    });

    handleCreateDialogClose();
  };

  const handleEditAddition = () => {
    if (!selectedAddition || !formData.name.trim() || !formData.price || !formData.productId) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    const price = parseFloat(formData.price);
    if (price <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser mayor a 0",
        variant: "destructive",
      });
      return;
    }

    updateAddition({
      id: selectedAddition.id,
      data: {
        name: formData.name,
        price: price,
        productId: formData.productId
      }
    });

    handleEditDialogClose();
  };

  const handleToggleAdditionStatus = (additionId: string) => {
    toggleAdditionStatus(additionId);
  };

  const openEditDialog = (addition: ProductAddition) => {
    setSelectedAddition(addition);
    const productName = getProductName(addition.productId);
    setFormData({
      name: addition.name,
      price: addition.price.toString(),
      productId: addition.productId
    });
    setProductSearchTerm(productName);
    setIsEditDialogOpen(true);
    setShowProductSuggestions(false);
  };

  const getProductName = (productId: string) => {
    const product = products?.find(p => p.id === productId);
    return product ? product.name : 'Producto no encontrado';
  };

  const getFilteredProducts = () => {
    if (!productSearchTerm.trim()) {
      return products || [];
    }
    return (products || []).filter(product =>
      product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
    );
  };

  const resetProductSearch = () => {
    setProductSearchTerm('');
    setShowProductSuggestions(false);
  };

  const handleProductSelect = (product: any) => {
    setFormData({ ...formData, productId: product.id });
    setProductSearchTerm(product.name);
    setShowProductSuggestions(false);
  };

  const handleProductSearchChange = (value: string) => {
    setProductSearchTerm(value);
    setShowProductSuggestions(value.length > 0);

    // Si el valor coincide exactamente con un producto, seleccionarlo
    const exactMatch = products?.find(p => p.name.toLowerCase() === value.toLowerCase());
    if (exactMatch) {
      setFormData({ ...formData, productId: exactMatch.id });
    } else {
      setFormData({ ...formData, productId: '' });
    }
  };

  const handleProductInputFocus = () => {
    if (productSearchTerm.length > 0) {
      setShowProductSuggestions(true);
    }
  };

  const handleProductInputBlur = () => {
    // Delay para permitir que el click en sugerencia funcione
    setTimeout(() => {
      setShowProductSuggestions(false);
    }, 150);
  };

  const handleCreateDialogClose = () => {
    setIsCreateDialogOpen(false);
    setFormData({ name: '', price: '', productId: '' });
    resetProductSearch();
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setSelectedAddition(null);
    setFormData({ name: '', price: '', productId: '' });
    resetProductSearch();
  };

  // Mostrar loading si estamos cargando los datos
  if (isLoading || productsQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Package size={20} />
          <h3 className="text-lg font-medium">Gestión de adiciones</h3>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Crear adición
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Crear nueva adición</DialogTitle>
              <DialogDescription>
                Completa la información para crear una nueva adición para productos.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la adición</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="productId">Producto vinculado</Label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Escribe el nombre del producto..."
                      value={productSearchTerm}
                      onChange={(e) => handleProductSearchChange(e.target.value)}
                      onFocus={handleProductInputFocus}
                      onBlur={handleProductInputBlur}
                      className="pl-10"
                    />
                  </div>

                  {showProductSuggestions && getFilteredProducts().length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {getFilteredProducts().map((product) => (
                        <div
                          key={product.id}
                          className="px-3 py-2 cursor-pointer hover:bg-muted border-b last:border-b-0 text-foreground"
                          onMouseDown={() => handleProductSelect(product)}
                        >
                          <div className="font-medium">{product.name}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.productId && (
                    <div className="text-sm text-green-600 mt-2 flex items-center">
                      <span className="mr-1">✓</span>
                      Producto seleccionado
                    </div>
                  )}

                  {productSearchTerm && !formData.productId && (
                    <div className="text-sm text-amber-600 mt-2 flex items-center">
                      <span className="mr-1">⚠</span>
                      Selecciona un producto de la lista
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCreateDialogClose}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAddition} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear adición'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de adiciones</CardTitle>
          <CardDescription>
            Administra las adiciones disponibles para los productos del menú.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Producto vinculado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {additions && additions.length > 0 ? (
                additions.map((addition) => (
                  <TableRow key={addition.id}>
                    <TableCell className="font-medium">{addition.name}</TableCell>
                    <TableCell className="font-mono">{addition.price.toLocaleString('es-CO')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getProductName(addition.productId)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={addition.isActive ? 'default' : 'destructive'}>
                        {addition.isActive ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(addition)}
                        >
                          <Edit size={14} />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleAdditionStatus(addition.id)}
                          disabled={isTogglingStatus}
                        >
                          {isTogglingStatus ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            addition.isActive ? 'Desactivar' : 'Activar'
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground mb-4">
                      No hay adiciones disponibles
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
                      <Plus size={16} className="mr-2" />
                      Crear la primera adición
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar adición</DialogTitle>
            <DialogDescription>
              Modifica la información de la adición seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre de la adición</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-price">Precio</Label>
              <Input
                id="edit-price"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-productId">Producto vinculado</Label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Escribe el nombre del producto..."
                    value={productSearchTerm}
                    onChange={(e) => handleProductSearchChange(e.target.value)}
                    onFocus={handleProductInputFocus}
                    onBlur={handleProductInputBlur}
                    className="pl-10"
                  />
                </div>

                {showProductSuggestions && getFilteredProducts().length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {getFilteredProducts().map((product) => (
                      <div
                        key={product.id}
                        className="px-3 py-2 cursor-pointer hover:bg-muted border-b last:border-b-0 text-foreground"
                        onMouseDown={() => handleProductSelect(product)}
                      >
                        <div className="font-medium">{product.name}</div>
                      </div>
                    ))}
                  </div>
                )}

                {formData.productId && (
                  <div className="text-sm text-green-600 mt-2 flex items-center">
                    <span className="mr-1">✓</span>
                    Producto seleccionado
                  </div>
                )}

                {productSearchTerm && !formData.productId && (
                  <div className="text-sm text-amber-600 mt-2 flex items-center">
                    <span className="mr-1">⚠</span>
                    Selecciona un producto de la lista
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleEditDialogClose}>
                Cancelar
              </Button>
              <Button onClick={handleEditAddition} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductAdditionsManager;
