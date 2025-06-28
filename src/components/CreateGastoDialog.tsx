import React, { useState } from 'react';
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

    const handleSubmit = async (data: CreateGastoDto) => {
        try {
            await createGastoMutation.mutateAsync(data);
            toast({
                title: "Gasto creado",
                description: "El gasto ha sido registrado exitosamente",
            });
            setOpen(false);
        } catch (error: any) {
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
                    Nuevo Gasto
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar Nuevo Gasto</DialogTitle>
                </DialogHeader>
                <CreateGastoForm
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={createGastoMutation.isPending}
                />
            </DialogContent>
        </Dialog>
    );
};

export default CreateGastoDialog;
