
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import EditUserForm from './EditUserForm';
import { User } from '@/types/user';

interface EditUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({ user, open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 sm:p-6 overflow-y-auto max-h-[90vh]">
        <DialogHeader className="p-4 sm:p-0 pb-0 mb-4">
          <DialogTitle>Editar usuario</DialogTitle>
          <DialogDescription>
            Modifique la información del usuario {user.name}.
          </DialogDescription>
        </DialogHeader>
        <div className="px-4 pb-4 sm:px-0 sm:pb-0">
          <EditUserForm user={user} onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
