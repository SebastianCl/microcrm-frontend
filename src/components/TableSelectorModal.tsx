import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Search, Utensils } from 'lucide-react';
import { Table } from '@/models/table.model';

interface TableSelectorModalProps {
  children: React.ReactNode;
  selectedTableId: string;
  onTableSelect: (tableId: string, tableName: string) => void;
  tables: Table[] | undefined;
  isLoading: boolean;
  error: any;
}

const TableSelectorModal = ({
  children,
  selectedTableId,
  onTableSelect,
  tables,
  isLoading,
  error,
}: TableSelectorModalProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTables = tables?.filter(table =>
    table.nombre_mesa.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleTableSelect = (table: Table) => {
    onTableSelect(table.id_mesa.toString(), table.nombre_mesa);
    setOpen(false);
  };  const getTableStatusColor = (activa: boolean) => {
    return activa 
      ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800'
      : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800';
  };

  const getTableStatusText = (activa: boolean) => {
    return activa ? 'Disponible' : 'Inactiva';
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-primary" />
            Seleccionar Mesa
          </DialogTitle>
        </DialogHeader>        <div className="space-y-4">
          {/* Información sobre mesas inactivas */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              💡 Las mesas marcadas como "Inactiva" no están disponibles para tomar ordenes.
            </p>
          </div>

          {/* Opción Para Llevar */}
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTableId === '' ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => {
              onTableSelect('', 'Para llevar');
              setOpen(false);
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Utensils className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Para Llevar</h3>
                    <p className="text-sm text-muted-foreground">Pedido para llevar</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  Disponible
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Lista de mesas */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Cargando mesas...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-4">
                    <MapPin className="h-6 w-6 text-red-600" />
                  </div>
                  <p className="text-sm text-red-600">Error al cargar las mesas</p>
                </div>
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="p-3 bg-gray-100 rounded-full w-fit mx-auto mb-4">
                    <Search className="h-6 w-6 text-gray-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'No se encontraron mesas' : 'No hay mesas disponibles'}
                  </p>
                </div>
              </div>
            ) : (              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTables.map((table) => {
                  const isDisabled = !table.activa;
                  return (
                    <Card
                      key={table.id_mesa}
                      className={`transition-all ${
                        isDisabled
                          ? 'opacity-50 cursor-not-allowed bg-muted/30'
                          : selectedTableId === table.id_mesa.toString()
                          ? 'ring-2 ring-primary cursor-pointer hover:shadow-md'
                          : 'cursor-pointer hover:shadow-md'
                      }`}
                      onClick={() => {
                        if (!isDisabled) {
                          handleTableSelect(table);
                        }
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`p-2 rounded-lg ${
                                isDisabled
                                  ? 'bg-muted text-muted-foreground/50'
                                  : 'bg-primary/10 text-primary'
                              }`}>
                                <MapPin className="h-4 w-4" />
                              </div>
                              <h3 className={`font-semibold ${isDisabled ? 'text-muted-foreground' : ''}`}>
                                {table.nombre_mesa}
                              </h3>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={getTableStatusColor(table.activa)}
                            >
                              {getTableStatusText(table.activa)}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableSelectorModal;
