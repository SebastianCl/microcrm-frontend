
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import CreateEmployeeDialog from '@/components/employees/CreateEmployeeDialog';

// Mock data for demonstration
const mockEmployees = [
  {
    id_usuario: 1,
    nombre_usuario: 'admin',
    rol: 'admin' as const,
    estado: true,
    id_cliente: 1
  },
  {
    id_usuario: 2,
    nombre_usuario: 'empleado1',
    rol: 'empleado' as const,
    estado: true,
    id_cliente: 1
  },
  {
    id_usuario: 3,
    nombre_usuario: 'cajero1',
    rol: 'empleado' as const,
    estado: false,
    id_cliente: 1
  }
];

const EmployeesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(employee =>
    employee.nombre_usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Empleado';
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar empleados..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Empleado
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id_usuario} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{employee.nombre_usuario}</CardTitle>
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
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Rol:</span>
                <Badge className={getRoleColor(employee.rol)}>
                  {getRoleLabel(employee.rol)}
                </Badge>
              </div>

              <div className="flex justify-between items-center pt-2 border-t">
                <Badge variant={employee.estado ? "default" : "secondary"}>
                  {employee.estado ? 'Activo' : 'Inactivo'}
                </Badge>
                <Button size="sm" variant="outline">
                  Ver Actividad
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No se encontraron empleados que coincidan con la búsqueda</p>
        </div>
      )}

      <CreateEmployeeDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onEmployeeCreated={(newEmployee) => {
          setEmployees([...employees, newEmployee]);
        }}
      />
    </div>
  );
};

export default EmployeesPage;
