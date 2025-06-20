
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface OrderListProps {
  limit?: number;
  showCreateButton?: boolean;
}

const ITEMS_PER_PAGE = 10;

const OrderList: React.FC<OrderListProps> = ({
  limit,
  showCreateButton = true
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Verificar conectividad de red
  const { isOnline } = useNetwork();

  // Usar React Query para obtener las pedidos
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch
  } = useOrders();
  // Estado para pedidos filtradas usando useMemo para evitar re-renders innecesarios
  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    let result = [...orders];

    // Aplicar filtro de busqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order =>
        order.id_pedido.toLowerCase().includes(query) ||
        (order.nombre_cliente && order.nombre_cliente.toLowerCase().includes(query))
      );
    }

    // Aplicar filtro de estado
    if (activeFilters.status) {
      result = result.filter(order => order.estado === activeFilters.status);
    }    // Aplicar filtro de tipo de pedido
    if (activeFilters.orderType) {
      if (activeFilters.orderType === 'En Mesa') {
        result = result.filter(order =>
          order.tipo_pedido === 'en_mesa' ||
          (order.nombre_mesa && order.nombre_mesa !== 'Para llevar')
        );
      } else if (activeFilters.orderType === 'Para Llevar') {
        result = result.filter(order =>
          order.tipo_pedido === 'para_llevar' ||
          order.nombre_mesa === 'Para llevar'
        );
      }
    }    // Definir el orden de prioridad de estados
    const statusOrder = {
      'Pendiente': 1,
      'Preparando': 2,
      'Finalizado': 3,
      'Cancelado': 4
    };

    // Aplicar ordenamiento por defecto por estado, luego por filtro personalizado si existe
    result.sort((a, b) => {
      // Si hay filtro de ordenamiento personalizado, aplicarlo
      if (activeFilters._sort) {
        if (activeFilters._sort === 'asc') {
          return a.id_pedido.toString().localeCompare(b.id_pedido.toString());
        } else {
          return b.id_pedido.toString().localeCompare(a.id_pedido.toString());
        }
      }
      
      // Ordenamiento por defecto: por estado
      const statusA = statusOrder[a.estado as keyof typeof statusOrder] || 999;
      const statusB = statusOrder[b.estado as keyof typeof statusOrder] || 999;
      
      if (statusA !== statusB) {
        return statusA - statusB;
      }
      
      // Si tienen el mismo estado, ordenar por ID de pedido (convertir a string para comparación segura)
      const idA = a.id_pedido?.toString() || '';
      const idB = b.id_pedido?.toString() || '';
      
      // Ordenar alfabéticamente por ID (más reciente primero si son numéricos)
      return idB.localeCompare(idA);
    });

    return result;
  }, [searchQuery, activeFilters.status, activeFilters.orderType, activeFilters._sort, orders]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;

  // Aplicar límite si se especifica, sino usar paginación
  const displayOrders = limit
    ? filteredOrders.slice(0, limit)
    : filteredOrders.slice(startIndex, endIndex);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleFilter = useCallback((filters: Record<string, any>) => {
    setActiveFilters(filters);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const filterOptions = [
    {
      id: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: ['Pendiente', 'Preparando', 'Finalizado', 'Cancelado']
    },
    {
      id: 'orderType',
      label: 'Tipo',
      type: 'select' as const,
      options: ['En Mesa', 'Para Llevar']
    }
  ];

  // Generar páginas visibles para paginación
  const getVisiblePages = () => {
    const delta = 2;
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const rangeStart = Math.max(2, currentPage - delta);
      const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

      if (rangeStart > 2) {
        pages.push(-1);
      }

      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }

      if (rangeEnd < totalPages - 1) {
        pages.push(-2);
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">{limit ? 'Pedidos Recientes' : 'Pedidos'}</h2>
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
          error={error instanceof Error ? error : 'Error al cargar las pedidos'}
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
              No se encontraron pedidos
            </div>
          ) : (
            displayOrders.map((order) => (
              <OrderCard key={order.id_pedido} order={order} />
            ))
          )}
        </div>
      )}

      {/* Paginación solo si no hay límite y hay más de una página */}
      {!limit && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredOrders.length)} de {filteredOrders.length} pedidos
          </div>
          <Pagination className="order-1 sm:order-2">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>

              {getVisiblePages().map((page, i) => (
                <PaginationItem key={page < 0 ? `ellipsis-${i}` : page}>
                  {page < 0 ? (
                    <PaginationEllipsis />
                  ) : (
                    <PaginationLink
                      onClick={() => handlePageChange(page)}
                      isActive={page === currentPage}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  )}
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </Card>
  );
};

export default OrderList;
