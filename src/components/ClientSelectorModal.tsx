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
import { User, Search, Plus } from "lucide-react";
// Remove sample data import
// import { clients } from '@/lib/sample-data';
import CreateClientDialog from './CreateClientDialog';
import { Client } from '@/models/client.model'; // Import Client model

interface ClientSelectorModalProps {
  selectedClientId?: string;
  onClientSelect: (clientId: string, clientName: string) => void;
  children?: React.ReactNode;
  clients?: Client[]; // Add clients prop
  isLoading?: boolean; // Add isLoading prop
  error?: Error | null; // Add error prop
}

const ClientSelectorModal: React.FC<ClientSelectorModalProps> = ({
  selectedClientId,
  onClientSelect,
  children,
  clients = [], // Default to empty array
  isLoading,
  error
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter(client => 
    client.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.telefono && client.telefono.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedClient = clients.find(client => client.id_cliente.toString() === selectedClientId);

  const handleClientSelect = (client: Client) => { 
    onClientSelect(client.id_cliente.toString(), client.nombre);
    setOpen(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full justify-start text-left h-11">
            <User className="h-4 w-4 mr-2" />
            {selectedClient ? selectedClient.nombre : 'Agregar Cliente'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Seleccionar Cliente
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar cliente por nombre o empresa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          
          <div className="max-h-80 overflow-y-auto space-y-2">
            {isLoading && <p className="text-center py-4">Cargando clientes...</p>}
            {error && <p className="text-center py-4 text-red-500">Error al cargar clientes: {error.message}</p>}
            {!isLoading && !error && filteredClients.map(client => (
              <div
                key={client.id_cliente} 
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                onClick={() => handleClientSelect(client)}
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{client.nombre}</p>
                  {client.telefono && ( 
                    <p className="text-sm text-gray-500">{client.telefono}</p>
                  )}
                  {client.correo && ( 
                    <p className="text-xs text-gray-400">{client.correo}</p>
                  )}
                </div>
                <div className="text-right">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
            
            {!isLoading && !error && filteredClients.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-1">No se encontraron clientes</p>
                <p className="text-sm">Intenta con otros términos de búsqueda</p>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <CreateClientDialog>
              <Button variant="outline" className="w-full h-11 hover:bg-gray-50">
                <Plus className="h-4 w-4 mr-2" />
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
