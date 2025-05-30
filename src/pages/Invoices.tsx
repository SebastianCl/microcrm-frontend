
import { useState } from 'react';
import InvoiceList from '@/components/InvoiceList';
import CreateInvoiceDialog from '@/components/CreateInvoiceDialog';

const Invoices = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fcaturas</h1>
          <p className="text-muted-foreground mt-2">
            Descripción factura
          </p>
        </div>
      </div>
      <InvoiceList showCreateButton={false} />
      
      <CreateInvoiceDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};

export default Invoices;
