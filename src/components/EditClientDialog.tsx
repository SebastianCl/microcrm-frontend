import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Client } from '@/models/client.model';
import EditClientForm from './EditClientForm';

interface EditClientDialogProps {
  client: Client;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditClientDialog: React.FC<EditClientDialogProps> = ({ 
  client, 
  open, 
  onOpenChange 
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar cliente</DialogTitle>
        </DialogHeader>
        <EditClientForm 
          client={client}
          onClose={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditClientDialog;
