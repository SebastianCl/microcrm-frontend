
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreateInventoryItemForm from './CreateInventoryItemForm';

interface CreateInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateInventoryItemDialog: React.FC<CreateInventoryItemDialogProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Agregar nuevo producto</DialogTitle>
        </DialogHeader>
        <CreateInventoryItemForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default CreateInventoryItemDialog;
