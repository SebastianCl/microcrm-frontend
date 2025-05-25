
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import CreateTableDialog from '@/components/tables/CreateTableDialog';

// Mock data for demonstration
const mockTables = [
  {
    id_mesa: 1,
    nombre_mesa: 'Mesa 1',
    activa: true,
    ocupada: false,
    id_cliente: 1
  },
  {
    id_mesa: 2,
    nombre_mesa: 'Mesa 2',
    activa: true,
    ocupada: true,
    id_cliente: 1
  },
  {
    id_mesa: 3,
    nombre_mesa: 'Mesa 3',
    activa: true,
    ocupada: false,
    id_cliente: 1
  },
  {
    id_mesa: 4,
    nombre_mesa: 'Mesa 4',
    activa: false,
    ocupada: false,
    id_cliente: 1
  },
  {
    id_mesa: 5,
    nombre_mesa: 'Mesa 5',
    activa: true,
    ocupada: true,
    id_cliente: 1
  }
];

const TablesPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tables, setTables] = useState(mockTables);

  const getTableStatus = (table: any) => {
    if (!table.activa) return { label: 'Inactiva', color: 'bg-gray-100 text-gray-800' };
    if (table.ocupada) return { label: 'Ocupada', color: 'bg-red-100 text-red-800' };
    return { label: 'Disponible', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Mesas</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Mesa
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tables.map((table) => {
          const status = getTableStatus(table);
          return (
            <Card key={table.id_mesa} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{table.nombre_mesa}</CardTitle>
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
                <div className="flex justify-center">
                  <Badge className={status.color}>
                    {status.label}
                  </Badge>
                </div>

                <div className="flex justify-center pt-2">
                  {table.activa && !table.ocupada && (
                    <Button size="sm" className="w-full">
                      Asignar Pedido
                    </Button>
                  )}
                  {table.activa && table.ocupada && (
                    <Button size="sm" variant="outline" className="w-full">
                      Ver Pedido
                    </Button>
                  )}
                  {!table.activa && (
                    <Button size="sm" variant="secondary" className="w-full">
                      Activar Mesa
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CreateTableDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTableCreated={(newTable) => {
          setTables([...tables, newTable]);
        }}
      />
    </div>
  );
};

export default TablesPage;
