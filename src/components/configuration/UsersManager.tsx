import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { User as UserModel } from '@/models/user.model';
import { useUsers } from '@/hooks/useUsers';

const UsersManager: React.FC = () => {
  const { toast } = useToast();
  const { users, isLoading, createUser, updateUser, deleteUser, isCreating, isUpdating, isDeleting } = useUsers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    rol: 'empleado' as 'admin' | 'empleado',
    password: ''
  });

  const handleCreateUser = () => {
    if (!formData.nombre_usuario || !formData.password) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    createUser({
      nombre_usuario: formData.nombre_usuario,
      rol: formData.rol,
      password: formData.password
    });

    setFormData({ nombre_usuario: '', rol: 'empleado', password: '' });
    setIsCreateDialogOpen(false);
  };

  const handleEditUser = () => {
    if (!selectedUser || !formData.nombre_usuario) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    updateUser({
      id: selectedUser.id_usuario,
      data: {
        nombre_usuario: formData.nombre_usuario,
        rol: formData.rol,
        ...(formData.password && { password: formData.password })
      }
    });

    setIsEditDialogOpen(false);
    setSelectedUser(null);
    setFormData({ nombre_usuario: '', rol: 'empleado', password: '' });
  };

  const handleDeleteUser = (userId: number) => {
    const userToDelete = users.find(u => u.id_usuario === userId);
    if (userToDelete?.rol === 'admin' && users.filter(u => u.rol === 'admin').length === 1) {
      toast({
        title: "Error",
        description: "No puedes eliminar el único administrador del sistema",
        variant: "destructive",
      });
      return;
    }

    deleteUser(userId);
  };

  const toggleUserStatus = (userId: number) => {
    const user = users.find(u => u.id_usuario === userId);
    if (user) {
      updateUser({
        id: userId,
        data: { estado: !user.estado }
      });
    }
  };

  const openEditDialog = (user: UserModel) => {
    setSelectedUser(user);
    setFormData({
      nombre_usuario: user.nombre_usuario,
      rol: user.rol,
      password: ''
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <User size={20} />
          <h3 className="text-lg font-medium">Gestión de usuarios</h3>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Crear usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear nuevo usuario</DialogTitle>
              <DialogDescription>
                Completa la información para crear un nuevo usuario del sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.nombre_usuario}
                  onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                  placeholder="Nombre de usuario"
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Contraseña segura"
                />
              </div>
              <div>
                <Label htmlFor="role">Rol</Label>
                <Select value={formData.rol} onValueChange={(value: 'admin' | 'empleado') => setFormData({ ...formData, rol: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="empleado">Empleado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateUser} disabled={isCreating}>
                  {isCreating ? 'Creando...' : 'Crear usuario'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de usuarios</CardTitle>
          <CardDescription>
            Administra los usuarios que tienen acceso al sistema POS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre de usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id_usuario}>
                  <TableCell>{user.nombre_usuario}</TableCell>
                  <TableCell>
                    <Badge variant={user.rol === 'admin' ? 'default' : 'secondary'}>
                      {user.rol === 'admin' ? 'Administrador' : 'Empleado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.estado ? 'default' : 'destructive'}>
                      {user.estado ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id_usuario)}
                        disabled={isUpdating}
                      >
                        {user.estado ? 'Desactivar' : 'Activar'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(user.id_usuario)}
                        disabled={isDeleting}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nombre de usuario</Label>
              <Input
                id="edit-name"
                value={formData.nombre_usuario}
                onChange={(e) => setFormData({ ...formData, nombre_usuario: e.target.value })}
                placeholder="Nombre de usuario"
              />
            </div>
            <div>
              <Label htmlFor="edit-password">Contraseña (opcional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Nueva contraseña (dejar en blanco para mantener actual)"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Rol</Label>
              <Select value={formData.rol} onValueChange={(value: 'admin' | 'empleado') => setFormData({ ...formData, rol: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="empleado">Empleado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditUser} disabled={isUpdating}>
                {isUpdating ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManager;
