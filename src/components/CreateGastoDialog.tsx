import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import CreateGastoForm from './CreateGastoForm';

interface CreateGastoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreateGastoDialog: React.FC<CreateGastoDialogProps> = ({
    open,
    onOpenChange,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Crear nuevo gasto</DialogTitle>
                </DialogHeader>
                <CreateGastoForm onClose={() => onOpenChange(false)} />
            </DialogContent>
        </Dialog>
    );
};

export default CreateGastoDialog;
