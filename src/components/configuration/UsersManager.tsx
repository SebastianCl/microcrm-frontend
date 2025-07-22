import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, User, Key, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { User as UserModel } from '@/models/user.model';
import { useUsers } from '@/hooks/useUsers';
import { useClients } from '@/hooks/useClients';

const UsersManager: React.FC = () => {
  const { toast } = useToast();
  const { users, isLoading, createUser, updateUser, toggleUserStatus, resetPassword, isCreating, isUpdating, isTogglingStatus, isResettingPassword } = useUsers();
  const { data: clients, isLoading: isLoadingClients } = useClients();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [formData, setFormData] = useState({
    id_client: '',
    username: '',
    rol: 'empleado' as 'admin' | 'empleado',
    password: ''
  });
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleCreateUser = () => {
    if (!formData.id_client || !formData.username || !formData.password) {
      toast({
        title: "Error",
        description: "Todos los campos son obligatorios",
        variant: "destructive",
      });
      return;
    }

    createUser({
      id_client: parseInt(formData.id_client),
      username: formData.username,
      rol: formData.rol,
      password: formData.password
    });

    setFormData({ id_client: '', username: '', rol: 'empleado', password: '' });
    setIsCreateDialogOpen(false);
  };

  const handleEditUser = () => {
    if (!selectedUser || !formData.username) {
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
        nombre_usuario: formData.username,
        rol: formData.rol
      }
    });

    setSelectedUser(null);
    setFormData({ id_client: '', username: '', rol: 'empleado', password: '' });
    setIsEditDialogOpen(false);
  };

  const openEditDialog = (user: UserModel) => {
    setSelectedUser(user);
    setFormData({
      id_client: '',
      username: user.nombre_usuario,
      rol: user.rol,
      password: ''
    });
    setIsEditDialogOpen(true);
  };

  const handleResetPassword = () => {
    if (!selectedUser || !passwordData.newPassword) {
      toast({
        title: "Error",
        description: "La contraseña es obligatoria",
        variant: "destructive",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }

    resetPassword({
      id: selectedUser.id_usuario,
      newPassword: passwordData.newPassword
    });

    setIsPasswordDialogOpen(false);
    setSelectedUser(null);
    setPasswordData({ newPassword: '', confirmPassword: '' });
  };

  const handleToggleUserStatus = (userId: number) => {
    toggleUserStatus(userId);
  };

  const openPasswordDialog = (user: UserModel) => {
    setSelectedUser(user);
    setPasswordData({ newPassword: '', confirmPassword: '' });
    setIsPasswordDialogOpen(true);
  };

  if (isLoading || isLoadingClients) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando...</div>
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
                <Label htmlFor="client">Cliente</Label>
                <Select
                  value={formData.id_client}
                  onValueChange={(value) => {
                    const selectedClient = clients?.find(client => client.id_cliente.toString() === value);
                    setFormData({
                      ...formData,
                      id_client: value,
                      username: selectedClient ? selectedClient.correo : ''
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients && clients.length > 0 ? (
                      clients.map((client) => (
                        <SelectItem key={client.id_cliente} value={client.id_cliente.toString()}>
                          {client.nombre} - {client.correo}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No hay clientes disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="username">Nombre de usuario (Email)</Label>
                <Input
                  id="username"
                  type="email"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="usuario@correo.com"
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
            Administra los usuarios que tienen acceso al sistema.
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
                        onClick={() => openPasswordDialog(user)}
                      >
                        <Key size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id_usuario)}
                        disabled={isTogglingStatus}
                      >
                        {user.estado ? 'Desactivar' : 'Activar'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
            <DialogDescription>
              Modifica la información del usuario {selectedUser?.nombre_usuario}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Nombre de usuario (Email)</Label>
              <Input
                id="edit-username"
                type="email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="usuario@correo.com"
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
                {isUpdating ? 'Actualizando...' : 'Actualizar usuario'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Establece una nueva contraseña para el usuario {selectedUser?.nombre_usuario}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nueva contraseña</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmar contraseña</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleResetPassword} disabled={isResettingPassword}>
                {isResettingPassword ? 'Cambiando...' : 'Cambiar contraseña'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersManager;
