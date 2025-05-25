
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CreateTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTableCreated: (table: any) => void;
}

const CreateTableDialog = ({ open, onOpenChange, onTableCreated }: CreateTableDialogProps) => {
  const [nombreMesa, setNombreMesa] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombreMesa.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la mesa es obligatorio",
        variant: "destructive",
      });
      return;
    }

    const newTable = {
      id_mesa: Date.now(), // Mock ID
      nombre_mesa: nombreMesa.trim(),
      activa: true,
      ocupada: false,
      id_cliente: 1 // Mock client ID
    };

    onTableCreated(newTable);
    onOpenChange(false);
    
    // Reset form
    setNombreMesa('');

    toast({
      title: "Mesa creada",
      description: `${newTable.nombre_mesa} ha sido creada exitosamente`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nueva Mesa</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nombre-mesa">Nombre de la Mesa *</Label>
            <Input
              id="nombre-mesa"
              value={nombreMesa}
              onChange={(e) => setNombreMesa(e.target.value)}
              placeholder="Ej: Mesa 1, Terraza A, etc."
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Mesa
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTableDialog;
