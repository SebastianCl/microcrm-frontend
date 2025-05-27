
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Loader, Clock, RefreshCcw, Eye, Edit } from 'lucide-react';
import { Order } from '@/models/order.model';
import { Button } from '@/components/ui/button';
import DataTable from './ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SearchAndFilter from './ui/SearchAndFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useNetwork } from '@/hooks/useNetwork';
import { useOrders, useUpdateOrderStatus } from '@/hooks/useOrders';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface OrderListProps {
  limit?: number;
  showCreateButton?: boolean;
}

const OrderList: React.FC<OrderListProps> = ({ 
  limit, 
  showCreateButton = true 
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const pageSize = 5;
  
  // Verificar conectividad de red
  const { isOnline } = useNetwork();
  
  // Usar React Query para obtener las órdenes
  const { 
    data: orders = [], 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useOrders();
    // Estado para órdenes filtradas usando useMemo para evitar re-renders innecesarios
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let result = [...orders];

    // Aplicar filtro de busqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) ||
        (order.clientName && order.clientName.toLowerCase().includes(query))
      );
    }

    // Aplicar filtro de estado
    if (activeFilters.status) {
      result = result.filter(order => order.status === activeFilters.status);
    }

    // Aplicar filtro de fecha
    if (activeFilters.date) {
      result = result.filter(order => {
        const orderDate = new Date(order.date).toISOString().split('T')[0];
        return orderDate === activeFilters.date;
      });
    }

    // Aplicar ordenar
    if (activeFilters._sort) {
      result.sort((a, b) => {
        if (activeFilters._sort === 'asc') {
          return a.date > b.date ? 1 : -1;
        } else {
          return a.date < b.date ? 1 : -1;
        }
      });
    }

    return result;
  }, [searchQuery, activeFilters.status, activeFilters.date, activeFilters._sort, orders]);
  
  // Aplicar límite si se especifica
  const displayOrders = limit ? filteredOrders.slice(0, limit) : filteredOrders;
  
  const getStatusBadge = (status: 'pending' | 'processed' | 'canceled' | 'completed') => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1">
            <Check className="h-3 w-3" />
            <span>Completada</span>
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Pendiente</span>
          </Badge>
        );
      case 'processed':
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 flex items-center gap-1">
            <Loader className="h-3 w-3" />
            <span>Procesando</span>
          </Badge>
        );
      case 'canceled':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 flex items-center gap-1">
            <X className="h-3 w-3" />
            <span>Cancelada</span>
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch (error) {
      return dateString;
    }
  };
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleFilter = useCallback((filters: Record<string, any>) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  }, []);

  // Quick status change component
  const QuickStatusChange = ({ order }: { order: Order }) => {
    const updateStatus = useUpdateOrderStatus(order.id);

    const handleStatusChange = async (newStatus: 'pending' | 'processed' | 'canceled' | 'completed') => {
      if (newStatus === order.status) return;
      
      try {
        await updateStatus.mutateAsync(newStatus);
        toast.success(`Estado de orden ${order.id} actualizado`);
      } catch (error) {
        toast.error('Error al actualizar el estado');
        console.error('Error updating status:', error);
      }
    };

    return (
      <Select value={order.status} onValueChange={handleStatusChange} disabled={updateStatus.isPending}>
        <SelectTrigger className="w-32 h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pendiente</SelectItem>
          <SelectItem value="processed">Procesando</SelectItem>
          <SelectItem value="completed">Completada</SelectItem>
          <SelectItem value="canceled">Cancelada</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  const filterOptions = [
    {
      id: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: ['pending', 'processed', 'canceled', 'completed']
    },
    {
      id: 'date',
      label: 'Fecha',
      type: 'date' as const
    }
  ];

  const columns = [
    {
      header: 'Orden',
      accessorKey: (order: Order) => (
        <div className="font-medium">
          #{order.id}
          {order.tableNumber && (
            <div className="text-xs text-muted-foreground">
              Mesa {order.tableNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Cliente',
      accessorKey: (order: Order) => (
        <div>
          <div className="font-medium">{order.clientName}</div>
          <div className="text-xs text-muted-foreground">
            {formatDate(order.date)}
          </div>
        </div>
      ),
    },
    {
      header: 'Total',
      accessorKey: (order: Order) => (
        <div className="font-semibold text-right">
          ${order.total.toFixed(2)}
        </div>
      ),
      className: "text-right"
    },
    {
      header: 'Estado',
      accessorKey: (order: Order) => order.status,
      cell: (order: Order) => <QuickStatusChange order={order} />,
      className: "w-[140px]"
    },
    {
      header: 'Acciones',
      accessorKey: (order: Order) => order.id,
      cell: (order: Order) => (
        <div className="flex gap-1">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/orders/${order.id}`);
            }}
          >
            <Eye className="h-3 w-3" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/orders/${order.id}/edit`);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
      ),
      className: "w-[100px]"
    },
  ];

  const handleRowClick = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">{limit ? 'Órdenes Recientes' : 'Órdenes'}</h2>
        {showCreateButton && (
          <div className="flex gap-2 items-center">
            {!isOnline && <Badge variant="destructive">Sin conexión</Badge>}
            {isError && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
              >
                <RefreshCcw className="h-4 w-4 mr-1" /> Reintentar
              </Button>
            )}
            <Button 
              onClick={() => navigate('/orders/new')}
              className="w-full md:w-auto"
            >
              Crear Orden
            </Button>
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
            placeholder="Buscar por ID o cliente..."
          />
        </div>
      )}
      
      {/* Mostrar error si existe */}
      {isError && (
        <ErrorDisplay 
          error={error instanceof Error ? error : 'Error al cargar las órdenes'} 
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
          data={displayOrders} 
          onRowClick={handleRowClick}
          pagination={!limit ? {
            pageSize,
            currentPage,
            totalItems: filteredOrders.length,
            onPageChange: setCurrentPage,
          } : undefined}
        />
      )}
    </Card>
  );
};

export default OrderList;
