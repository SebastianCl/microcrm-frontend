import React, { useState, useEffect } from 'react';
import { 
  Package,
  Eye,
  Edit,
  Trash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DataTable from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import SearchAndFilter from './ui/SearchAndFilter';
import EditInventoryItemDialog from './EditInventoryItemDialog';
import { InventoryItem } from '@/types/inventory';

// Datos de inventario de muestra: exportados para su reutilización
export const SAMPLE_INVENTORY: InventoryItem[] = [
  {
    id: '1',
    name: 'Laptop Dell XPS 13',
    sku: 'DELL-XPS13-001',
    category: 'Electrónica',
    price: 3000000,
    stockQuantity: 24,
    status: 'En stock'
  },
  {
    id: '2',
    name: 'Monitor LG UltraWide',
    sku: 'LG-UW-34IN-002',
    category: 'Periféricos',
    price: 1000000,
    stockQuantity: 12,
    status: 'En stock'
  },
  {
    id: '3',
    name: 'Teclado Mecánico Logitech',
    sku: 'LOG-KB-MX-003',
    category: 'Periféricos',
    price: 500000,
    stockQuantity: 45,
    status: 'En stock'
  },
  {
    id: '4',
    name: 'Auriculares Sony WH-1000XM4',
    sku: 'SONY-WH1000-004',
    category: 'Audio',
    price: 900000,
    stockQuantity: 8,
    status: 'Bajo stock'
  },
  {
    id: '5',
    name: 'MacBook Pro M1',
    sku: 'APPLE-MBP-M1-005',
    category: 'Electrónica',
    price: 10000000,
    stockQuantity: 0,
    status: 'Sin stock'
  },
  {
    id: '6',
    name: 'Ratón Logitech MX Master 3',
    sku: 'LOG-MX3-006',
    category: 'Periféricos',
    price: 120000,
    stockQuantity: 17,
    status: 'En stock'
  },
  {
    id: '7',
    name: 'iPad Pro 12.9"',
    sku: 'APPLE-IPAD-PRO-007',
    category: 'Tablets',
    price: 6000000,
    stockQuantity: 3,
    status: 'Bajo stock'
  }
];

const InventoryList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredInventory, setFilteredInventory] = useState(SAMPLE_INVENTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  useEffect(() => {
    let result = [...SAMPLE_INVENTORY];

    // Aplicar filtro de busqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
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

    setFilteredInventory(result);
  }, [searchQuery, activeFilters]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En stock':
        return <Badge className="bg-green-500">En stock</Badge>;
      case 'Bajo stock':
        return <Badge className="bg-yellow-500">Bajo stock</Badge>;
      case 'Sin stock':
        return <Badge className="bg-red-500">Sin stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilter = (filters: Record<string, any>) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  const handleEditClick = (e: React.MouseEvent, item: InventoryItem) => {
    e.stopPropagation();
    setSelectedItem(item);
    setIsEditDialogOpen(true);
  };

  // Extract unique categories from inventory
  const categories = Array.from(new Set(SAMPLE_INVENTORY.map(item => item.category)));
  
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
      options: ['En stock', 'Bajo stock', 'Sin stock']
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
      header: 'SKU',
      accessorKey: 'sku',
      hideOnMobile: true
    },
    {
      header: 'Categoría',
      accessorKey: 'category',
      hideOnMobile: true
    },
    {
      header: 'Precio',
      accessorKey: (item: any) => `$${item.price}`
    },
    {
      header: 'Cantidad',
      accessorKey: 'stockQuantity',
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
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/inventory/${item.id}`);
            }}
          >
            <Eye size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="hidden md:inline-flex"
            onClick={(e) => handleEditClick(e, item)}
          >
            <Edit size={16} />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="hidden md:inline-flex"
            onClick={(e) => {
              e.stopPropagation();
              // Delete functionality
            }}
          >
            <Trash size={16} />
          </Button>
        </div>
      ),
      className: "w-[80px] md:w-[120px]"
    },
  ];

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <SearchAndFilter 
          search={searchQuery}
          onSearchChange={handleSearch}
          filters={filterOptions}
          onFilter={handleFilter}
          placeholder="Buscar por nombre, SKU o categoría..."
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
      
      <EditInventoryItemDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        item={selectedItem}
      />
    </div>
  );
};

export default InventoryList;
