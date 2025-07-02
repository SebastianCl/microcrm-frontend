import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from './ui/DataTable';
import { Invoice } from '@/models/invoice.model';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Eye, RefreshCcw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import CreateInvoiceDialog from './CreateInvoiceDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useInvoices } from '@/hooks/useInvoices';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useNetwork } from '@/hooks/useNetwork';
import SearchAndFilter from './ui/SearchAndFilter';
import { formatCurrency, getCurrentDate } from '@/lib/utils';

interface InvoiceListProps {
  limit?: number;
  showCreateButton?: boolean;
}

const InvoiceList: React.FC<InvoiceListProps> = ({
  limit,
  showCreateButton = true
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const pageSize = 5;

  // Verificar conectividad de red
  const { isOnline } = useNetwork();

  // Usar React Query para obtener las facturas
  const {
    data: invoices = [],
    isLoading: loading,
    isError,
    error,
    refetch
  } = useInvoices();

  const filteredInvoices = React.useMemo(() => {
    if (!invoices) return [];

    let result = [...invoices];

    // Aplicar filtro de busqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(invoice =>
        invoice.id.toLowerCase().includes(query) ||
        invoice.client.toLowerCase().includes(query)
      );
    }

    // Aplicar filtro de estado
    if (activeFilters.status) {
      result = result.filter(invoice => invoice.status === activeFilters.status);
    }

    //  Aplicar filtro de fecha
    if (activeFilters.date) {
      result = result.filter(invoice => {
        const invoiceDate = getCurrentDate();
        return invoiceDate === activeFilters.date;
      });
    }

    // Aplicar filtro de cantidad mínima
    if (activeFilters.minAmount) {
      result = result.filter(invoice => invoice.amount >= parseFloat(activeFilters.minAmount as string));
    }

    //  Aplicar ordenar
    if (activeFilters._sort) {
      result.sort((a, b) => {
        if (activeFilters._sort === 'asc') {
          return a.amount > b.amount ? 1 : -1;
        } else {
          return a.amount < b.amount ? 1 : -1;
        }
      });
    }
    return result;
  }, [invoices, searchQuery, activeFilters]);

  // Aplicar límite si se especifica
  const displayInvoices = limit ? filteredInvoices.slice(0, limit) : filteredInvoices;

  const getStatusBadge = (status: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Pagada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Vencida</Badge>;
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

  const filterOptions = [
    {
      id: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: ['paid', 'pending', 'overdue']
    },
    {
      id: 'date',
      label: 'Fecha',
      type: 'date' as const
    },
    {
      id: 'minAmount',
      label: 'Importe mínimo',
      type: 'number' as const
    }
  ];

  const columns = [
    {
      header: 'Factura',
      accessorKey: (invoice: Invoice) => invoice.id,
    },
    {
      header: 'Cliente',
      accessorKey: (invoice: Invoice) => invoice.client,
    }, {
      header: 'Importe',
      accessorKey: (invoice: Invoice) => formatCurrency(invoice.amount),
    },
    {
      header: 'Fecha',
      accessorKey: (invoice: Invoice) => invoice.date,
      hideOnMobile: true
    },
    {
      header: 'Fecha Venc.',
      accessorKey: (invoice: Invoice) => invoice.dueDate,
      hideOnMobile: true
    },
    {
      header: 'Estado',
      accessorKey: (invoice: Invoice) => invoice.status,
      cell: (invoice: Invoice) => getStatusBadge(invoice.status),
    },
    {
      header: 'Acciones',
      accessorKey: (invoice: Invoice) => invoice.id,
      cell: (invoice: Invoice) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/invoices/${invoice.id}`);
            }}
          >
            <Eye className="h-4 w-4 mr-1" /> Ver
          </Button>
        </div>
      ),
      className: "w-[100px]"
    },
  ];

  const handleRowClick = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
        <h2 className="text-xl font-semibold">{limit ? 'Facturas Recientes' : 'Facturas'}</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          {!limit && (
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={loading}
              className="w-full sm:w-auto"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              <span>Actualizar</span>
            </Button>
          )}
          {showCreateButton && (
            <Button
              className="flex items-center gap-1 w-full sm:w-auto"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>Crear Factura</span>
            </Button>
          )}
        </div>
      </div>

      {!isOnline && (
        <ErrorDisplay
          error="No hay conexión a Internet. Verifica tu conexión e intenta nuevamente."
          variant="warning"
        />
      )}

      {isError && (
        <ErrorDisplay
          error={error}
          onRetry={() => refetch()}
          variant="error"
        />
      )}

      {!limit && !loading && (
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

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={displayInvoices}
          onRowClick={handleRowClick}
          pagination={!limit ? {
            pageSize,
            currentPage,
            totalItems: filteredInvoices.length,
            onPageChange: setCurrentPage,
          } : undefined}
        />
      )}

      <CreateInvoiceDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </Card>
  );
};

export default InvoiceList;
