
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import SearchAndFilter from './ui/SearchAndFilter';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useNetwork } from '@/hooks/useNetwork';
import { useOrders } from '@/hooks/useOrders';
import OrderCard from './OrderCard';

interface OrderListProps {
  limit?: number;
  showCreateButton?: boolean;
}

const OrderList: React.FC<OrderListProps> = ({ 
  limit, 
  showCreateButton = true 
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  
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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleFilter = useCallback((filters: Record<string, any>) => {
    setActiveFilters(filters);
  }, []);

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

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
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
        <div className="mb-6">
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
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}
      
      {/* Mostrar cards cuando no hay error y no está cargando */}
      {!isLoading && !isError && (
        <div className="space-y-4">
          {displayOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron órdenes
            </div>
          ) : (
            displayOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </div>
      )}
    </Card>
  );
};

export default OrderList;
