
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessorKey: keyof T | ((item: T) => React.ReactNode);
  cell?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  pagination?: {
    pageSize: number;
    currentPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
  };
  className?: string;
}

function DataTable<T>({ 
  columns, 
  data, 
  onRowClick,
  pagination,
  className = '' 
}: DataTableProps<T>) {
  const displayData = pagination 
    ? data.slice(
        (pagination.currentPage - 1) * pagination.pageSize,
        pagination.currentPage * pagination.pageSize
      )
    : data;

  const totalPages = pagination 
    ? Math.ceil(pagination.totalItems / pagination.pageSize) 
    : 1;

  // Determine visible page numbers for pagination
  const getVisiblePages = () => {
    const delta = 2; // Number of pages to show before and after current page
    const pages = [];
    
    if (totalPages <= 5) {
      // If 5 or fewer pages, show all
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Current page - delta and current page + delta
      const rangeStart = Math.max(2, pagination!.currentPage - delta);
      const rangeEnd = Math.min(totalPages - 1, pagination!.currentPage + delta);
      
      // If there's a gap after page 1, add ellipsis
      if (rangeStart > 2) {
        pages.push(-1); // -1 represents ellipsis
      }
      
      // Add all pages in the range
      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }
      
      // If there's a gap before the last page, add ellipsis
      if (rangeEnd < totalPages - 1) {
        pages.push(-2); // -2 represents ellipsis (different key than the first one)
      }
      
      // Always include last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="rounded-md border overflow-hidden responsive-table-wrapper">
        <Table className="responsive-table">
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead 
                  key={index}
                  className={`${column.className || ''} ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length} 
                  className="h-24 text-center"
                >
                  No hay resultados
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((item, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                >
                  {columns.map((column, colIndex) => (
                    <TableCell 
                      key={colIndex}
                      className={`${column.className || ''} ${column.hideOnMobile ? 'hidden md:table-cell' : ''}`}
                    >
                      {column.cell 
                        ? column.cell(item)
                        : typeof column.accessorKey === 'function'
                          ? column.accessorKey(item)
                          : String(item[column.accessorKey] || '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between py-4 gap-2">
          <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
            Mostrando {((pagination.currentPage - 1) * pagination.pageSize) + 1} a {
              Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)
            } de {pagination.totalItems} registros
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {getVisiblePages().map((page, i) => (
              page < 0 ? (
                <span key={page} className="px-2">...</span>
              ) : (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => pagination.onPageChange(page)}
                  className="hidden sm:inline-flex"
                >
                  {page}
                </Button>
              )
            ))}
            
            <span className="sm:hidden text-sm px-2">
              {pagination.currentPage} / {totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
