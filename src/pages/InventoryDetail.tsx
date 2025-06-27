import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Package,
  ArrowLeft,
  Edit,
  Trash,
  Box,
  Activity,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import EditInventoryItemDialog from '@/components/EditInventoryItemDialog';
import { InventoryItem } from '@/types/inventory';
import { formatCurrency } from '@/lib/utils';
import { useInventoryMovements } from '@/hooks/useInventoryMovements';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Obtener historial de movimientos del producto
  const { data: movements, isLoading: movementsLoading, error: movementsError } = useInventoryMovements(id || '');

  // Sample inventory item (in a real app, this would come from an API)
  const item: InventoryItem = {
    id: '1',
    name: 'Laptop Dell XPS 13',
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entrada':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'salida':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <RotateCcw className="h-4 w-4 text-blue-600" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case 'entrada':
        return <Badge className="bg-green-100 text-green-800">Entrada</Badge>;
      case 'salida':
        return <Badge className="bg-red-100 text-red-800">Salida</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800">Ajuste</Badge>;
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
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Historial de Movimientos</h3>
              </div>

              {movementsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center border-b pb-3">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))}
                </div>
              ) : movementsError ? (
                <Alert className="border-red-200">
                  <AlertDescription className="text-red-600">
                    Error al cargar el historial de movimientos
                  </AlertDescription>
                </Alert>
              ) : movements && movements.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {movements.map((movement, index) => (
                    <div key={index} className="flex justify-between items-start border-b pb-3 last:border-b-0">
                      <div className="flex items-start gap-3">
                        {getMovementIcon(movement.tipo_movimiento)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {getMovementBadge(movement.tipo_movimiento)}
                            <p className="font-medium text-sm">
                              {movement.tipo_movimiento === 'entrada' ? '+' : '-'}{movement.cantidad} unidades
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">{movement.comentario}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{formatDate(movement.fecha)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Box className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-muted-foreground">No hay movimientos registrados</p>
                </div>
              )}
            </CardContent>
          </Card>

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
