
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Search } from "lucide-react";
import { clients } from '@/lib/sample-data';
import CreateClientDialog from './CreateClientDialog';

interface ClientSelectorModalProps {
  selectedClientId?: string;
  onClientSelect: (clientId: string, clientName: string) => void;
  children?: React.ReactNode;
}

const ClientSelectorModal: React.FC<ClientSelectorModalProps> = ({
  selectedClientId,
  onClientSelect,
  children
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClient = clients.find(client => client.id === selectedClientId);

  const handleClientSelect = (client: typeof clients[0]) => {
    onClientSelect(client.id, client.name);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full justify-start text-left">
            <User className="h-4 w-4 mr-2" />
            {selectedClient ? selectedClient.name : 'Agregar Cliente'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Cliente</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredClients.map(client => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                onClick={() => handleClientSelect(client)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{client.name}</p>
                  {client.company && (
                    <p className="text-xs text-muted-foreground">{client.company}</p>
                  )}
                </div>
              </div>
            ))}
            
            {filteredClients.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p className="text-sm">No se encontraron clientes</p>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t">
            <CreateClientDialog>
              <Button variant="outline" className="w-full">
                <User className="h-4 w-4 mr-2" />
                Crear Nuevo Cliente
              </Button>
            </CreateClientDialog>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientSelectorModal;
