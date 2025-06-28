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
  Calendar,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import EditInventoryItemDialog from '@/components/EditInventoryItemDialog';
import CreateInventoryMovementDialog from '@/components/CreateInventoryMovementDialog';
import { InventoryItem } from '@/types/inventory';
import { formatCurrency } from '@/lib/utils';
import { useInventoryMovements } from '@/hooks/useInventoryMovements';
import { useProduct } from '@/hooks/useProducts';
import { AppProduct } from '@/models/product.model';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);

  // Obtener los datos del producto desde la API
  const { data: productData, isLoading: productLoading, error: productError } = useProduct(id);

  // Obtener historial de movimientos del producto
  const { data: movements, isLoading: movementsLoading, error: movementsError } = useInventoryMovements(id || '');

  // Función para convertir AppProduct a InventoryItem (para compatibilidad con EditInventoryItemDialog)
  const convertToInventoryItem = (product: AppProduct): InventoryItem => {
    // Determinar el estado basado en el stock
    let status = 'En stock';
    if (!product.isActive) {
      status = 'Sin stock';
    } else if (product.stockQuantity <= 5) {
      status = 'Bajo stock';
    }

    return {
      id: product.id,
      name: product.name,
      category: product.categoryName || 'Sin categoría',
      categoryId: product.categoryId,
      price: product.price,
      stockQuantity: product.stockQuantity,
      status,
      description: product.description,
      location: 'Almacén Principal', // Valor por defecto ya que no viene de la API
      lastUpdated: new Date().toISOString().split('T')[0], // Fecha actual como fallback
      managesInventory: product.managesInventory ?? true, // Asume true si no existe la propiedad
      isActive: product.isActive
    };
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
          <h1 className="text-2xl font-bold">Detalles del producto</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsMovementDialogOpen(true)}
            disabled={productLoading || !!productError}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:inline">Movimiento</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => setIsEditDialogOpen(true)}
            disabled={productLoading || !!productError}
          >
            <Edit className="h-4 w-4" />
            <span className="hidden md:inline">Editar</span>
          </Button>
          {/* <Button variant="destructive" className="flex items-center gap-2">
            <Trash className="h-4 w-4" />
            <span className="hidden md:inline">Eliminar</span>
          </Button> */}
        </div>
      </div>

      {productError ? (
        <Alert className="border-red-200">
          <AlertDescription className="text-red-600">
            Error al cargar el producto: {productError.message}
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-semibold">Información del producto</h2>
                </div>
                {productLoading ? (
                  <Skeleton className="h-6 w-20" />
                ) : productData ? (
                  getStatusBadge(convertToInventoryItem(productData).status)
                ) : null}
              </div>

              {productLoading ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i}>
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </div>
              ) : productData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nombre</p>
                      <p className="font-medium">{productData.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Categoría</p>
                      <p className="font-medium">{productData.categoryName || 'Sin categoría'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Precio</p>
                      <p className="font-medium">{formatCurrency(productData.price)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Cantidad</p>
                      <p className="font-medium">{productData.stockQuantity} unidades</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Estado</p>
                      <p className="font-medium">{productData.isActive ? 'Activo' : 'Inactivo'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Descripción</p>
                    <p>{productData.description || 'Sin descripción'}</p>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Historial de movimientos</h3>
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
                    {movements
                      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
                      .map((movement, index) => (
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
      )}

      {productData && (
        <>
          <EditInventoryItemDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            item={convertToInventoryItem(productData)}
          />
          <CreateInventoryMovementDialog
            open={isMovementDialogOpen}
            onOpenChange={setIsMovementDialogOpen}
            productId={productData.id.toString()}
            productName={productData.name}
            currentStock={productData.stockQuantity}
          />
        </>
      )}
    </div>
  );
};

export default InventoryDetail;
