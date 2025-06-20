import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package,
  ArrowLeft,
  Edit,
  Trash,
  Box
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EditInventoryItemDialog from '@/components/EditInventoryItemDialog';
import { InventoryItem } from '@/types/inventory';
import { formatCurrency } from '@/lib/utils';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Sample inventory item (in a real app, this would come from an API)
  const item: InventoryItem = {
    id: '1',
    name: 'Laptop Dell XPS 13',
    sku: 'DELL-XPS13-001',
    category: 'Electrónica',
    price: 1299.99,
    stockQuantity: 24,
    status: 'En stock',
    description: 'Laptop Dell XPS 13 con procesador Intel Core i7, 16GB de RAM y 512GB SSD. Pantalla InfinityEdge de 13.4 pulgadas.',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=500&q=60',
    location: 'Almacén Principal',
    lastUpdated: '2023-06-15'
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En stock':
        return <Badge className="bg-green-500">En stock</Badge>;
      case 'Bajo stock':
        return <Badge className="bg-yellow-500">Bajo stock</Badge>;
      case 'Sin stock':
        return <Badge className="bg-red-500">Sin stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate('/inventory')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Detalles del Producto</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4" />
            <span className="hidden md:inline">Editar</span>
          </Button>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash className="h-4 w-4" />
            <span className="hidden md:inline">Eliminar</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Información del Producto</h2>
              </div>
              {getStatusBadge(item.status)}
            </div>
            
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden h-48">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Box className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{item.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">SKU</p>
                  <p className="font-medium">{item.sku}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Categoría</p>
                  <p className="font-medium">{item.category}</p>
                </div>                <div>
                  <p className="text-sm text-muted-foreground">Precio</p>
                  <p className="font-medium">{formatCurrency(item.price)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cantidad</p>
                  <p className="font-medium">{item.stockQuantity} unidades</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{item.location}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p>{item.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Última Actualización</p>
                <p className="font-medium">{item.lastUpdated}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Historial de Movimientos</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">Entrada de Stock</p>
                    <p className="text-sm text-muted-foreground">10 unidades</p>
                  </div>
                  <p className="text-sm">12/05/2023</p>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">Salida de Stock</p>
                    <p className="text-sm text-muted-foreground">2 unidades</p>
                  </div>
                  <p className="text-sm">15/05/2023</p>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">Ajuste de Inventario</p>
                    <p className="text-sm text-muted-foreground">+1 unidad</p>
                  </div>
                  <p className="text-sm">20/05/2023</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert>
            <AlertDescription>
              Este producto tiene una alta rotación de inventario. Considere revisar su nivel de stock mínimo.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      <EditInventoryItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={item}
      />
    </div>
  );
};

export default InventoryDetail;
