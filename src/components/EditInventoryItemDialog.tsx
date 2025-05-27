
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EditInventoryItemForm from './EditInventoryItemForm';
import { InventoryItem } from '@/types/inventory';

interface EditInventoryItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItem | null;
}

const EditInventoryItemDialog: React.FC<EditInventoryItemDialogProps> = ({
  open,
  onOpenChange,
  item,
}) => {
  if (!item) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
        </DialogHeader>
        <EditInventoryItemForm item={item} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default EditInventoryItemDialog;
