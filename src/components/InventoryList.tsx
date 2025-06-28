import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Package,
  Eye,
  Edit,
  Trash,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import SearchAndFilter from './ui/SearchAndFilter';
import EditInventoryItemDialog from './EditInventoryItemDialog';
import { InventoryItem } from '@/types/inventory';
import { useProducts } from '@/hooks/useProducts';
import { productsToInventoryItems } from '@/utils/inventoryUtils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const InventoryList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Obtener productos de la API
  const { data: products, isLoading, error, isError } = useProducts();

  // Convertir productos a items de inventario
  const inventoryItems = useMemo(() => {
    if (!products) return [];
    return productsToInventoryItems(products);
  }, [products]);

  // Usar useMemo para evitar re-renders innecesarios
  const filteredInventory = useMemo(() => {
    let result = [...inventoryItems];

    // Aplicar filtro de busqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (activeFilters.category) {
      result = result.filter(item => item.category === activeFilters.category);
    }

    // Aplicar filtro de estado
    if (activeFilters.status) {
      result = result.filter(item => item.status === activeFilters.status);
    }

    // Apply price range filter
    if (activeFilters.minPrice) {
      result = result.filter(item => item.price >= parseFloat(activeFilters.minPrice));
    }

    //  Aplicar ordenar
    if (activeFilters._sort) {
      result.sort((a, b) => {
        if (activeFilters._sort === 'asc') {
          return a.price > b.price ? 1 : -1;
        } else {
          return a.price < b.price ? 1 : -1;
        }
      });
    }

    return result;
  }, [inventoryItems, searchQuery, activeFilters.category, activeFilters.status, activeFilters.minPrice, activeFilters._sort]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En stock':
        return <Badge className="bg-green-500">En stock</Badge>;
      case 'Bajo stock':
        return <Badge className="bg-yellow-500">Bajo stock</Badge>;
      case 'Sin stock':
        return <Badge className="bg-red-500">Sin stock</Badge>;
      case 'Inactivo':
        return <Badge className="bg-gray-500">Inactivo</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

  const handleEditClick = (e: React.MouseEvent, item: InventoryItem) => {
    e.stopPropagation();
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  // Extract unique categories from inventory
  const categories = Array.from(new Set(inventoryItems.map(item => item.category)));

  const filterOptions = [
    {
      id: 'category',
      label: 'Categoría',
      type: 'select' as const,
      options: categories
    },
    {
      id: 'status',
      label: 'Estado',
      type: 'select' as const,
      options: ['En stock', 'Bajo stock', 'Sin stock', 'Inactivo']
    },
    {
      id: 'minPrice',
      label: 'Precio mínimo',
      type: 'number' as const
    }
  ];

  const columns = [
    {
      header: 'Producto',
      accessorKey: 'name',
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          <Package size={16} className="text-muted-foreground" />
          <span>{item.name}</span>
        </div>
      )
    },
    {
      header: 'Categoría',
      accessorKey: 'category',
      hideOnMobile: true
    },
    {
      header: 'Precio',
      accessorKey: (item: any) => `$${item.price.toLocaleString('es-CO')}`
    },
    {
      header: 'Cantidad',
      accessorKey: (item: any) => item.stockQuantity === Infinity ? '∞' : item.stockQuantity,
      hideOnMobile: true
    },
    {
      header: 'Estado',
      accessorKey: 'status',
      cell: (item: any) => getStatusBadge(item.status)
    },
    {
      header: 'Acciones',
      accessorKey: (item: any) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
            onClick={(e) => handleEditClick(e, item)}
          >
            <Edit size={16} />
          </Button>
        </div>
      ),
      className: "w-[80px] md:w-[120px]"
    },
  ];

  return (
    <div className="space-y-4">
      {/* Estado de carga */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando productos...</span>
        </div>
      )}

      {/* Estado de error */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error al cargar los productos: {error?.message || 'Error desconocido'}
          </AlertDescription>
        </Alert>
      )}

      {/* Contenido principal */}
      {!isLoading && !isError && (
        <>
          <div className="mb-4">
            <SearchAndFilter
              search={searchQuery}
              onSearchChange={handleSearch}
              filters={filterOptions}
              onFilter={handleFilter}
              placeholder="Buscar por nombre o categoría..."
            />
          </div>
          <DataTable
            columns={columns}
            data={filteredInventory}
            onRowClick={(item) => navigate(`/inventory/${item.id}`)}
            pagination={{
              pageSize: 5,
              currentPage: currentPage,
              totalItems: filteredInventory.length,
              onPageChange: setCurrentPage
            }}
          />
        </>
      )}

      <EditInventoryItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={selectedItem}
      />
    </div>
  );
};

export default InventoryList;
