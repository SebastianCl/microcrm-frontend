import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import CreateTipoGastoForm from './CreateTipoGastoForm';
import { Plus } from 'lucide-react';

interface CreateTipoGastoDialogProps {
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const CreateTipoGastoDialog: React.FC<CreateTipoGastoDialogProps> = ({
    trigger,
    open: controlledOpen,
    onOpenChange
}) => {
    const [internalOpen, setInternalOpen] = useState(false);

    // Use controlled state if provided, otherwise use internal state
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    const handleSuccess = () => {
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
    };

    const defaultTrigger = (
        <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo tipo
        </Button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {(trigger || (!controlledOpen && controlledOpen !== false)) && (
                <DialogTrigger asChild>
                    {trigger || defaultTrigger}
                </DialogTrigger>
            )}
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Crear nuevo tipo de gasto</DialogTitle>
                </DialogHeader>
                <CreateTipoGastoForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </DialogContent>
        </Dialog>
    );
};

export default CreateTipoGastoDialog;
