import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table as TableComponent, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Table, Loader2 } from 'lucide-react';
import { Table as TableModel } from '@/models/table.model';
import { useTables, useCreateTable, useUpdateTable, useToggleTableStatus } from '@/hooks/useTables';

const TablesManager: React.FC = () => {
  const { data: tables, isLoading, error } = useTables();
  const createTableMutation = useCreateTable();
  const updateTableMutation = useUpdateTable();
  const toggleStatusMutation = useToggleTableStatus();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<TableModel | null>(null);
  const [formData, setFormData] = useState({
    nombre_mesa: ''
  });

  const handleCreateTable = async () => {
    if (!formData.nombre_mesa.trim()) {
      return;
    }

    try {
      await createTableMutation.mutateAsync({ nombre_mesa: formData.nombre_mesa });
      setFormData({ nombre_mesa: '' });
      setIsCreateDialogOpen(false);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleEditTable = async () => {
    if (!selectedTable || !formData.nombre_mesa.trim()) {
      return;
    }

    try {
      await updateTableMutation.mutateAsync({
        id: selectedTable.id_mesa,
        data: { nombre_mesa: formData.nombre_mesa }
      });
      setIsEditDialogOpen(false);
      setSelectedTable(null);
      setFormData({ nombre_mesa: '' });
    } catch (error) {
      // Error handling is done in the hook
    }
  };



  const handleToggleTableStatus = async (tableId: number) => {
    try {
      await toggleStatusMutation.mutateAsync(tableId);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const openEditDialog = (table: TableModel) => {
    setSelectedTable(table);
    setFormData({
      nombre_mesa: table.nombre_mesa
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando mesas...</span>
      </div>
    );
  }

  // Si es un error 404 (no hay mesas), seguimos mostrando la interfaz
  // para permitir crear la primera mesa
  const is404Error = error && error.message && error.message.includes('404');
  const emptyTables = is404Error || (tables && tables.length === 0);

  if (error && !is404Error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>Error al cargar las mesas: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Table size={20} />
          <h3 className="text-lg font-medium">Gestión de mesas</h3>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Crear mesa
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nueva mesa</DialogTitle>
              <DialogDescription>
                Ingresa el nombre para la nueva mesa del restaurante.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre_mesa">Nombre de la mesa</Label>
                <Input
                  id="nombre_mesa"
                  value={formData.nombre_mesa}
                  onChange={(e) => setFormData({ ...formData, nombre_mesa: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateTable}
                  disabled={createTableMutation.isPending || !formData.nombre_mesa.trim()}
                >
                  {createTableMutation.isPending ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Creando...
                    </>
                  ) : (
                    'Crear mesa'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de mesas</CardTitle>
          <CardDescription>
            Administra las mesas disponibles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TableComponent>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!emptyTables ? (
                tables?.map((table) => (
                  <TableRow key={table.id_mesa}>
                    <TableCell className="font-medium">{table.nombre_mesa}</TableCell>
                    <TableCell>
                      <Badge variant={table.activa ? 'default' : 'destructive'}>
                        {table.activa ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(table)}
                          disabled={updateTableMutation.isPending}
                        >
                          {updateTableMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Edit size={14} />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleTableStatus(table.id_mesa)}
                          disabled={toggleStatusMutation.isPending}
                        >
                          {toggleStatusMutation.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            table.activa ? 'Desactivar' : 'Activar'
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <div className="text-muted-foreground mb-4">
                      No hay mesas disponibles
                    </div>
                    <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
                      <Plus size={16} className="mr-2" />
                      Crear la primera mesa
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </TableComponent>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar mesa</DialogTitle>
            <DialogDescription>
              Modifica el nombre de la mesa seleccionada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-nombre_mesa">Nombre de la mesa</Label>
              <Input
                id="edit-nombre_mesa"
                value={formData.nombre_mesa}
                onChange={(e) => setFormData({ ...formData, nombre_mesa: e.target.value })}
                placeholder="ej: mesa 1, mesa VIP, Terraza 1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleEditTable}
                disabled={updateTableMutation.isPending || !formData.nombre_mesa.trim()}
              >
                {updateTableMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TablesManager;
