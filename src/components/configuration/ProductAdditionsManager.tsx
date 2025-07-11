import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { ProductAddition } from '@/models/product-addition.model';

const ProductAdditionsManager: React.FC = () => {
  const { toast } = useToast();

  // Mock data de productos para el selector
  const mockProducts = [
    { id: '1', name: 'Hamburguesa Clásica' },
    { id: '2', name: 'Pizza Margherita' },
    { id: '3', name: 'Ensalada César' },
    { id: '4', name: 'Café Americano' },
    { id: '5', name: 'Jugo Natural' }
  ];

  const [additions, setAdditions] = useState<ProductAddition[]>([
    {
      id: '1',
      name: 'Queso Extra',
      price: 2.50,
      productId: '1',
      productName: 'Hamburguesa Clásica',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Bacon',
      price: 3.00,
      productId: '1',
      productName: 'Hamburguesa Clásica',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '3',
      name: 'Champiñones',
      price: 1.75,
      productId: '2',
      productName: 'Pizza Margherita',
      isActive: false,
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-15T11:00:00Z'
    }
  ]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAddition, setSelectedAddition] = useState<ProductAddition | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    productId: ''
  });

  const handleCreateAddition = () => {
    if (!formData.name.trim() || !formData.price || !formData.productId) {
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

    const selectedProduct = mockProducts.find(p => p.id === formData.productId);

    const newAddition: ProductAddition = {
      id: Date.now().toString(),
      name: formData.name,
      price: price,
      productId: formData.productId,
      productName: selectedProduct?.name || '',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAdditions([...additions, newAddition]);
    setFormData({ name: '', price: '', productId: '' });
    setIsCreateDialogOpen(false);

    toast({
      title: "Adición creada",
      description: `Adición "${formData.name}" creada exitosamente`,
    });
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

    const selectedProduct = mockProducts.find(p => p.id === formData.productId);

    const updatedAdditions = additions.map(addition =>
      addition.id === selectedAddition.id
        ? {
          ...addition,
          name: formData.name,
          price: price,
          productId: formData.productId,
          productName: selectedProduct?.name || '',
          updatedAt: new Date().toISOString()
        }
        : addition
    );

    setAdditions(updatedAdditions);
    setIsEditDialogOpen(false);
    setSelectedAddition(null);
    setFormData({ name: '', price: '', productId: '' });

    toast({
      title: "Adición actualizada",
      description: `Adición "${formData.name}" actualizada exitosamente`,
    });
  };

  const handleDeleteAddition = (additionId: string) => {
    setAdditions(additions.filter(addition => addition.id !== additionId));
    toast({
      title: "Adición eliminada",
      description: "Adición eliminada exitosamente",
    });
  };

  const toggleAdditionStatus = (additionId: string) => {
    const updatedAdditions = additions.map(addition =>
      addition.id === additionId
        ? { ...addition, isActive: !addition.isActive, updatedAt: new Date().toISOString() }
        : addition
    );
    setAdditions(updatedAdditions);

    const addition = additions.find(a => a.id === additionId);
    toast({
      title: "Estado actualizado",
      description: `Adición "${addition?.name}" ${addition?.isActive ? 'desactivada' : 'activada'}`,
    });
  };

  const openEditDialog = (addition: ProductAddition) => {
    setSelectedAddition(addition);
    setFormData({
      name: addition.name,
      price: addition.price.toString(),
      productId: addition.productId
    });
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

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
          <DialogContent>
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
                  placeholder="ej: Queso Extra, Bacon, Champiñones"
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
                  placeholder="ej: 2.50"
                />
              </div>
              <div>
                <Label htmlFor="productId">Producto Vinculado</Label>
                <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un producto" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateAddition}>
                  Crear Adición
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
                <TableHead>Producto Vinculado</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Creada</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {additions.map((addition) => (
                <TableRow key={addition.id}>
                  <TableCell className="font-medium">{addition.name}</TableCell>
                  <TableCell className="font-mono">{formatPrice(addition.price)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {addition.productName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={addition.isActive ? 'default' : 'destructive'}>
                      {addition.isActive ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(addition.createdAt)}
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
                        onClick={() => toggleAdditionStatus(addition.id)}
                      >
                        {addition.isActive ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteAddition(addition.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Adición</DialogTitle>
            <DialogDescription>
              Modifica la información de la adición seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre de la Adición</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej: Queso Extra, Bacon, Champiñones"
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
                placeholder="ej: 2.50"
              />
            </div>
            <div>
              <Label htmlFor="edit-productId">Producto Vinculado</Label>
              <Select value={formData.productId} onValueChange={(value) => setFormData({ ...formData, productId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditAddition}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductAdditionsManager;
