
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import CreateProductDialog from '@/components/products/CreateProductDialog';

// Mock data for demonstration
const mockProducts = [
  {
    id_producto: 1,
    nombre: 'Hamburguesa Clásica',
    descripcion: 'Hamburguesa con carne, lechuga, tomate y queso',
    precio: 12.50,
    stock: 25,
    maneja_inventario: true,
    estado: true,
    adiciones: [
      { id_adicion: 1, nombre: 'Queso Extra', precio_extra: 1.50 },
      { id_adicion: 2, nombre: 'Tocino', precio_extra: 2.00 }
    ]
  },
  {
    id_producto: 2,
    nombre: 'Pizza Margherita',
    descripcion: 'Pizza con salsa de tomate, mozzarella y albahaca',
    precio: 15.00,
    stock: null,
    maneja_inventario: false,
    estado: true,
    adiciones: [
      { id_adicion: 3, nombre: 'Pepperoni', precio_extra: 3.50 }
    ]
  },
  {
    id_producto: 3,
    nombre: 'Ensalada César',
    descripcion: 'Lechuga romana, parmesano, crutones y aderezo césar',
    precio: 8.75,
    stock: 15,
    maneja_inventario: true,
    estado: true,
    adiciones: []
  }
];

const ProductsPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [products, setProducts] = useState(mockProducts);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id_producto} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{product.nombre}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-2">
                {product.descripcion}
              </p>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Precio:</span>
                <span className="font-bold text-green-600">${product.precio.toFixed(2)}</span>
              </div>

              {product.maneja_inventario && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stock:</span>
                  <Badge variant={product.stock! > 10 ? "default" : "destructive"}>
                    {product.stock} unidades
                  </Badge>
                </div>
              )}

              {!product.maneja_inventario && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Inventario:</span>
                  <Badge variant="secondary">No maneja stock</Badge>
                </div>
              )}

              {product.adiciones.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Adiciones ({product.adiciones.length}):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.adiciones.slice(0, 2).map((adicion) => (
                      <Badge key={adicion.id_adicion} variant="outline" className="text-xs">
                        {adicion.nombre}
                      </Badge>
                    ))}
                    {product.adiciones.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{product.adiciones.length - 2} más
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <Badge variant={product.estado ? "default" : "secondary"}>
                  {product.estado ? 'Activo' : 'Inactivo'}
                </Badge>
                <Button size="sm" variant="outline">
                  Ver Detalles
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateProductDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProductCreated={(newProduct) => {
          setProducts([...products, newProduct]);
        }}
      />
    </div>
  );
};

export default ProductsPage;
