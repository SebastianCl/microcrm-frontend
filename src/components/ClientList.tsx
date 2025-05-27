import React, { useState, useCallback } from 'react';
import DataTable from './ui/DataTable';
import { Client } from '@/models/client.model';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CreateClientDialog from './CreateClientDialog';
import { Button } from '@/components/ui/button';
import SearchAndFilter from './ui/SearchAndFilter';
import { useClients } from '@/hooks/useClients';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useNetwork } from '@/hooks/useNetwork';

interface ClientListProps {
  limit?: number;
  showCreateButton?: boolean;
}

const ClientList: React.FC<ClientListProps> = ({ 
  limit, 
  showCreateButton = true 
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const pageSize = 5;
  
  // Verificar conectividad de red
  const { isOnline } = useNetwork();
  
  // Usar React Query para obtener los clientes
  const { 
    data: clients = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useClients();
  
  // Estado para clientes filtrados
  // const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  
  // useEffect(() => {
  //   if (!clients) return;
    
  //   let result = [...clients];

  //   // Aplicar búsqueda
  //   if (searchQuery) {
  //     const query = searchQuery.toLowerCase();
  //     result = result.filter(client => 
  //       client.name.toLowerCase().includes(query) ||
  //       client.email.toLowerCase().includes(query) ||
  //       client.company.toLowerCase().includes(query)
  //     );
  //   }

  //   // Aplicar filtro de estado
  //   if (activeFilters.status) {
  //     result = result.filter(client => client.status === activeFilters.status);
  //   }

  //   // Aplicar filtro de facturación mínima
  //   if (activeFilters.minBilled) {
  //     result = result.filter(client => client.totalBilled >= parseFloat(activeFilters.minBilled));
  //   }

  //   // Applicar ordenar
  //   if (activeFilters._sort) {
  //     result.sort((a, b) => {
  //       if (activeFilters._sort === 'asc') {
  //         return a.totalBilled > b.totalBilled ? 1 : -1;
  //       } else {
  //         return a.totalBilled < b.totalBilled ? 1 : -1;
  //       }
  //     });
  //   }    setFilteredClients(result);
  // }, [searchQuery, activeFilters, clients]);

  const filteredClients = React.useMemo(() => {
    if (!clients) return [];

    let result = [...clients];

    // Aplicar búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(client => 
        client.name.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.company.toLowerCase().includes(query)
      );
    }

    // Aplicar filtro de estado
    if (activeFilters.status) {
      result = result.filter(client => client.status === activeFilters.status);
    }

    // Aplicar filtro de facturación mínima
    if (activeFilters.minBilled) {
      result = result.filter(client => client.totalBilled >= parseFloat(activeFilters.minBilled as string));
    }

    // Applicar ordenar
    if (activeFilters._sort) {
      result.sort((a, b) => {
        if (activeFilters._sort === 'asc') {
          return a.totalBilled > b.totalBilled ? 1 : -1;
        } else {
          return a.totalBilled < b.totalBilled ? 1 : -1;
        }
      });
    }
    return result;
  }, [clients, searchQuery, activeFilters]);
  
  // Aplicar límite si se especifica
  const displayClients = limit ? filteredClients.slice(0, limit) : filteredClients;
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleFilter = useCallback((filters: Record<string, any>) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  }, []);

  const filterOptions = [
    {
      id: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: ['active', 'inactive']
    },
    {
      id: 'minBilled',
      label: 'Facturación mínima',
      type: 'number' as const
    }
  ];

  const columns = [
    {
      header: 'Nombre',
      accessorKey: 'name' as keyof Client,
    },
    {
      header: 'Email',
      accessorKey: 'email' as keyof Client,
      hideOnMobile: true
    },
    {
      header: 'Empresa',
      accessorKey: 'company' as keyof Client,
      hideOnMobile: true
    },
    {
      header: 'Teléfono',
      accessorKey: 'phone' as keyof Client,
      hideOnMobile: true
    },
    {
      header: 'Total Facturado',
      accessorKey: (client: Client) => `$${client.totalBilled}`,
    },
    {
      header: 'Estado',
      accessorKey: 'status' as keyof Client,
      cell: (client: Client) => (
        <Badge className={client.status === 'active' 
          ? 'bg-green-100 text-green-800 hover:bg-green-200' 
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}>
          {client.status === 'active' ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      header: 'Acciones',
      accessorKey: (client: Client) => (
        <div className="flex space-x-2 justify-end">
          <Button variant="outline" size="sm">Ver</Button>
          <Button variant="outline" size="sm" className="hidden md:inline-flex">Editar</Button>
        </div>
      ),
      className: "w-[100px] md:w-[180px]"
    },
  ];

  const handleRowClick = (client: Client) => {
    console.log('Cliente seleccionado:', client);
  };
  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">{limit ? 'Clientes Activos' : 'Clientes'}</h2>
        {showCreateButton && (
          <div className="flex gap-2 items-center">
            {!isOnline && <Badge variant="destructive">Sin conexión</Badge>}
            {isError && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
              >
                Reintentar
              </Button>
            )}
            <CreateClientDialog />
          </div>
        )}
      </div>

      {!limit && (
        <div className="mb-4">
          <SearchAndFilter 
            search={searchQuery}
            onSearchChange={handleSearch}
            filters={filterOptions}
            onFilter={handleFilter}
            placeholder="Buscar por nombre, email o empresa..."
          />
        </div>
      )}
        {/* Mostrar error si existe */}
      {isError && (
        <ErrorDisplay 
          error={error instanceof Error ? error : 'Error al cargar los clientes'} 
          onRetry={() => refetch()}
        />
      )}
      
      {/* Mostrar esqueleto durante la carga */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      )}
      
      {/* Mostrar tabla cuando no hay error y no está cargando */}
      {!isLoading && !isError && (
        <DataTable 
          columns={columns} 
          data={displayClients} 
          onRowClick={handleRowClick}
          pagination={!limit ? {
            pageSize,
            currentPage,
            totalItems: filteredClients.length,
            onPageChange: setCurrentPage,
          } : undefined}
        />
      )}
    </Card>
  );
};

export default ClientList;
