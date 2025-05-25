
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import CreateCustomerDialog from '@/components/customers/CreateCustomerDialog';

// Mock data for demonstration
const mockCustomers = [
  {
    id_cliente: 1,
    nombre: 'Restaurante El Sabor',
    correo: 'admin@elsabor.com',
    telefono: '+1234567890',
    estado: true
  },
  {
    id_cliente: 2,
    nombre: 'Café Central',
    correo: 'info@cafecentral.com',
    telefono: '+0987654321',
    estado: true
  },
  {
    id_cliente: 3,
    nombre: 'Pizzería Roma',
    correo: 'contacto@pizzeriaroma.com',
    telefono: '+1122334455',
    estado: false
  }
];

const CustomersPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [customers, setCustomers] = useState(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.telefono?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id_cliente} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{customer.nombre}</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {customer.correo && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium truncate ml-2">{customer.correo}</span>
                </div>
              )}
              
              {customer.telefono && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Teléfono:</span>
                  <span className="font-medium">{customer.telefono}</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t">
                <Badge variant={customer.estado ? "default" : "secondary"}>
                  {customer.estado ? 'Activo' : 'Inactivo'}
                </Badge>
                <Button size="sm" variant="outline">
                  Ver Pedidos
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron clientes que coincidan con la búsqueda</p>
        </div>
      )}

      <CreateCustomerDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCustomerCreated={(newCustomer) => {
          setCustomers([...customers, newCustomer]);
        }}
      />
    </div>
  );
};

export default CustomersPage;
