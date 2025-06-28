import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import EditGastoForm from './EditGastoForm';
import { useUpdateGasto } from '@/hooks/useGastos';
import { Gasto, UpdateGastoDto } from '@/models/gastos.model';
import { toast } from '@/components/ui/use-toast';

interface EditGastoDialogProps {
    gasto: Gasto | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const EditGastoDialog: React.FC<EditGastoDialogProps> = ({
    gasto,
    open,
    onOpenChange,
}) => {
    const updateGastoMutation = useUpdateGasto(gasto?.id_gasto?.toString() || '');

    const handleSubmit = async (data: UpdateGastoDto) => {
        try {
            await updateGastoMutation.mutateAsync(data);
            toast({
                title: "Gasto actualizado",
                description: "El gasto ha sido actualizado exitosamente",
            });
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error al actualizar gasto",
                description: error.message || "Ha ocurrido un error al actualizar el gasto",
                variant: "destructive",
            });
        }
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    if (!gasto) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Editar Gasto</DialogTitle>
                </DialogHeader>
                <EditGastoForm
                    gasto={gasto}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={updateGastoMutation.isPending}
                />
            </DialogContent>
        </Dialog>
    );
};

export default EditGastoDialog;
