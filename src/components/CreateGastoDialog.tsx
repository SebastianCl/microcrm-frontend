import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import CreateGastoForm from './CreateGastoForm';
import { useCreateGasto } from '@/hooks/useGastos';
import { CreateGastoDto } from '@/models/gastos.model';
import { toast } from '@/components/ui/use-toast';

const CreateGastoDialog: React.FC = () => {
    const [open, setOpen] = useState(false);
    const createGastoMutation = useCreateGasto();

    // Resetear el estado de la mutación cuando se cierre el modal
    useEffect(() => {
        if (!open) {
            createGastoMutation.reset();
        }
    }, [open]);

    const handleSubmit = async (data: CreateGastoDto) => {
        try {
            await createGastoMutation.mutateAsync(data);
            toast({
                title: "Gasto creado",
                description: "El gasto ha sido registrado exitosamente",
            });
            setOpen(false); // Cerrar el modal después del éxito
        } catch (error: any) {
            console.error('Error al crear gasto:', error);
            toast({
                title: "Error al crear gasto",
                description: error.message || "Ha ocurrido un error al registrar el gasto",
                variant: "destructive",
            });
        }
    };

    const handleCancel = () => {
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo gasto
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar nuevo gasto</DialogTitle>
                </DialogHeader>
                <CreateGastoForm
                    key={open ? 'open' : 'closed'} // Resetea el formulario cuando se abre/cierra
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={createGastoMutation.isPending}
                />
            </DialogContent>
        </Dialog>
    );
};

export default CreateGastoDialog;
