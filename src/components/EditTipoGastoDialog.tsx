import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import EditTipoGastoForm from './EditTipoGastoForm';
import { TipoGasto } from '@/models/gastos.model';
import { Edit } from 'lucide-react';

interface EditTipoGastoDialogProps {
    tipoGasto: TipoGasto;
    trigger?: React.ReactNode;
}

const EditTipoGastoDialog: React.FC<EditTipoGastoDialogProps> = ({ tipoGasto, trigger }) => {
    const [open, setOpen] = useState(false);

    const handleSuccess = () => {
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const defaultTrigger = (
        <Button size="sm" variant="outline" className="gap-2">
            <Edit className="h-4 w-4" />
            Editar
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || defaultTrigger}
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar tipo de gasto</DialogTitle>
                </DialogHeader>
                <EditTipoGastoForm
                    tipoGasto={tipoGasto}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </DialogContent>
        </Dialog>
    );
};

export default EditTipoGastoDialog;
