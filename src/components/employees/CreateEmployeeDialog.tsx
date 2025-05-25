
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface CreateEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmployeeCreated: (employee: any) => void;
}

const CreateEmployeeDialog = ({ open, onOpenChange, onEmployeeCreated }: CreateEmployeeDialogProps) => {
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [rol, setRol] = useState<'admin' | 'empleado'>('empleado');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreUsuario.trim() || !contrasena.trim()) {
      toast({
        title: "Error",
        description: "El nombre de usuario y contraseña son obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (contrasena.length < 4) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 4 caracteres",
        variant: "destructive",
      });
      return;
    }

    const newEmployee = {
      id_usuario: Date.now(), // Mock ID
      nombre_usuario: nombreUsuario.trim(),
      rol,
      estado: true,
      id_cliente: 1 // Mock client ID
    };

    onEmployeeCreated(newEmployee);
    onOpenChange(false);
    
    // Reset form
    setNombreUsuario('');
    setContrasena('');
    setRol('empleado');

    toast({
      title: "Empleado creado",
      description: `${newEmployee.nombre_usuario} ha sido creado exitosamente`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Empleado</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre-usuario">Nombre de Usuario *</Label>
            <Input
              id="nombre-usuario"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              placeholder="Nombre de usuario"
              required
            />
          </div>

          <div>
            <Label htmlFor="contrasena">Contraseña *</Label>
            <Input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Contraseña"
              required
              minLength={4}
            />
          </div>

          <div>
            <Label htmlFor="rol">Rol</Label>
            <Select value={rol} onValueChange={(value: 'admin' | 'empleado') => setRol(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="empleado">Empleado</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Empleado
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEmployeeDialog;
