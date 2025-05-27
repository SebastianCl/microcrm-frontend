
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import CreateUserForm from './CreateUserForm';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateUserDialog: React.FC<CreateUserDialogProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="p-4 sm:p-0 pb-0 mb-4">
          <DialogTitle>Crear nuevo usuario</DialogTitle>
          <DialogDescription>
            Complete el formulario para crear un nuevo usuario en el sistema.
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-4 sm:px-0 sm:pb-0">
          <CreateUserForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateUserDialog;
