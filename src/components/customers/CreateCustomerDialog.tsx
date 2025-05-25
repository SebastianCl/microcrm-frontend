
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CreateCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCustomerCreated: (customer: any) => void;
}

const CreateCustomerDialog = ({ open, onOpenChange, onCustomerCreated }: CreateCustomerDialogProps) => {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es obligatorio",
        variant: "destructive",
      });
      return;
    }

    const newCustomer = {
      id_cliente: Date.now(), // Mock ID
      nombre: nombre.trim(),
      correo: correo.trim() || null,
      telefono: telefono.trim() || null,
      estado: true
    };

    onCustomerCreated(newCustomer);
    onOpenChange(false);
    
    // Reset form
    setNombre('');
    setCorreo('');
    setTelefono('');

    toast({
      title: "Cliente creado",
      description: `${newCustomer.nombre} ha sido creado exitosamente`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del cliente"
              required
            />
          </div>

          <div>
            <Label htmlFor="correo">Correo Electrónico</Label>
            <Input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+1234567890"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Cliente
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateCustomerDialog;
