
import React, { useState } from 'react';
import { useUsers } from '@/hooks/useUsers';
import { User } from '@/types/user';
import DataTable, { Column } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import SearchAndFilter from '@/components/ui/SearchAndFilter';
import { Card } from '@/components/ui/card';
import CreateUserDialog from '@/components/users/CreateUserDialog';
import EditUserDialog from '@/components/users/EditUserDialog';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useIsMobile } from '@/hooks/use-mobile';

const Users = () => {
  const { users = [], isLoading, error, refetch } = useUsers();
  const isMobile = useIsMobile();

  const [search, setSearch] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<User>[] = [
    {
      header: "Nombre",
      accessorKey: "name"
    },
    {
      header: "Email",
      accessorKey: "email",
      hideOnMobile: true
    },
    {
      header: "Rol",
      accessorKey: "role",
      cell: (user) => {
        const roleColors = {
          'Administrator': 'bg-purple-500 hover:bg-purple-600',
          'Collaborator': 'bg-blue-500 hover:bg-blue-600',
          'Viewer': 'bg-green-500 hover:bg-green-600'
        };

        return (
          <Badge className={roleColors[user.role]}>
            {user.role === 'Administrator' ? 'Administrador' :
              user.role === 'Collaborator' ? 'Colaborador' : 'Visualizador'}
          </Badge>
        );
      }
    },
    {
      header: "Estado",
      accessorKey: "status",
      cell: (user) => (
        <Badge
          variant={user.status === "Active" ? "default" : "outline"}
          className={user.status === "Active" ? "bg-green-500 hover:bg-green-600" : ""}
        >
          {user.status === "Active" ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
    {
      header: "Acciones",
      accessorKey: "id",
      cell: (user) => (
        <div className="flex space-x-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingUser(user);
            }}
          >
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 ${isMobile ? '' : 'hidden md:inline-flex'}`}
            onClick={(e) => {
              e.stopPropagation();
              setDeletingUser(user);
            }}
          >
            Eliminar
          </Button>
        </div>
      ),
      className: "w-[100px] md:w-[180px]"
    }
  ];

  return (
    <div className="space-y-4 responsive-container fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground mt-2">
            Administrar usuarios y permisos del sistema
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="hover-scale">
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      <Card className="p-4 responsive-card">
        <SearchAndFilter
          search={search}
          onSearchChange={setSearch}
          placeholder="Buscar por nombre o email..."
        />

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : error ? (
            <ErrorDisplay
              error={error instanceof Error ? error : 'Error al cargar los usuarios'}
              onRetry={refetch}
            />
          ) : (
            <div className="responsive-table-wrapper">
              <DataTable
                columns={columns}
                data={filteredUsers}
                className="responsive-table"
              />
            </div>
          )}
        </div>
      </Card>

      <CreateUserDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          open={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
        />
      )}

      {deletingUser && (
        <DeleteUserDialog
          user={deletingUser}
          open={!!deletingUser}
          onOpenChange={(open) => !open && setDeletingUser(null)}
        />
      )}
    </div>
  );
};

export default Users;
