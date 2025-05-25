
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Addition {
  nombre: string;
  precio_extra: number;
}

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: (product: any) => void;
}

const CreateProductDialog = ({ open, onOpenChange, onProductCreated }: CreateProductDialogProps) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');
  const [manejaInventario, setManejaInventario] = useState(true);
  const [adiciones, setAdiciones] = useState<Addition[]>([]);
  const [nuevaAdicion, setNuevaAdicion] = useState({ nombre: '', precio_extra: '' });
  const { toast } = useToast();

  const addAddition = () => {
    if (nuevaAdicion.nombre && nuevaAdicion.precio_extra) {
      setAdiciones([...adiciones, {
        nombre: nuevaAdicion.nombre,
        precio_extra: parseFloat(nuevaAdicion.precio_extra)
      }]);
      setNuevaAdicion({ nombre: '', precio_extra: '' });
    }
  };

  const removeAddition = (index: number) => {
    setAdiciones(adiciones.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !precio) {
      toast({
        title: "Error",
        description: "El nombre y precio son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (manejaInventario && !stock) {
      toast({
        title: "Error",
        description: "El stock es obligatorio cuando se maneja inventario",
        variant: "destructive",
      });
      return;
    }

    const newProduct = {
      id_producto: Date.now(), // Mock ID
      nombre,
      descripcion,
      precio: parseFloat(precio),
      stock: manejaInventario ? parseInt(stock) : null,
      maneja_inventario: manejaInventario,
      estado: true,
      adiciones: adiciones.map((adicion, index) => ({
        id_adicion: Date.now() + index,
        ...adicion
      }))
    };

    onProductCreated(newProduct);
    onOpenChange(false);
    
    // Reset form
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setStock('');
    setManejaInventario(true);
    setAdiciones([]);
    setNuevaAdicion({ nombre: '', precio_extra: '' });

    toast({
      title: "Producto creado",
      description: `${newProduct.nombre} ha sido creado exitosamente`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Producto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre del Producto *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Hamburguesa Clásica"
                required
              />
            </div>
            <div>
              <Label htmlFor="precio">Precio *</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del producto..."
              rows={3}
            />
          </div>

          {/* Inventory Management */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="maneja-inventario"
                checked={manejaInventario}
                onCheckedChange={setManejaInventario}
              />
              <Label htmlFor="maneja-inventario">Manejar inventario</Label>
            </div>

            {manejaInventario && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock">Stock Inicial *</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    required={manejaInventario}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Additions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Adiciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Addition */}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Nombre de la adición"
                  value={nuevaAdicion.nombre}
                  onChange={(e) => setNuevaAdicion({ ...nuevaAdicion, nombre: e.target.value })}
                />
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Precio extra"
                    value={nuevaAdicion.precio_extra}
                    onChange={(e) => setNuevaAdicion({ ...nuevaAdicion, precio_extra: e.target.value })}
                  />
                  <Button type="button" onClick={addAddition} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* List of Additions */}
              {adiciones.length > 0 && (
                <div className="space-y-2">
                  <Label>Adiciones agregadas:</Label>
                  {adiciones.map((adicion, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{adicion.nombre} (+${adicion.precio_extra.toFixed(2)})</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAddition(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Producto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProductDialog;
