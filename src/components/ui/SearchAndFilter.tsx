import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, FilterX, ArrowDown, ArrowUp } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export interface FilterOption {
  id: string;
  label: string;
  type: "select" | "date" | "number" | "boolean";
  options?: string[] | { value: string; label: string; }[];
}

interface SearchAndFilterProps {
  search: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
  filters?: FilterOption[];
  onFilter?: (filters: Record<string, any>) => void;
  className?: string;
}

const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  search,
  onSearchChange,
  placeholder = "Buscar...",
  filters = [],
  onFilter,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState(search);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  useEffect(() => {
    setSearchQuery(search);
  }, [search]);
  
  const handleSearch = useCallback(() => {
    onSearchChange(searchQuery);
  }, [searchQuery, onSearchChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value === '') {
      onSearchChange('');
    }
  }, [onSearchChange]);

  const handleInputKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  const handleFilterChange = useCallback((filterId: string, value: any) => {
    setActiveFilters(prevFilters => {
      const newFilters = { ...prevFilters };
      
      if (value === '' || value === null || value === undefined) {
        delete newFilters[filterId];
      } else {
        newFilters[filterId] = value;
      }
      
      // Llamar onFilter solo si realmente cambió algo
      if (JSON.stringify(newFilters) !== JSON.stringify(prevFilters)) {
        setTimeout(() => {
          if (onFilter) {
            onFilter(newFilters);
          }
        }, 0);
      }
      
      return newFilters;
    });
  }, [onFilter]);

  const clearFilters = useCallback(() => {
    setActiveFilters(prevFilters => {
      // Solo llamar onFilter si realmente había filtros activos
      if (Object.keys(prevFilters).length > 0) {
        setTimeout(() => {
          if (onFilter) {
            onFilter({});
          }
        }, 0);
      }
      return {};
    });
  }, [onFilter]);

  const toggleSortDirection = useCallback(() => {
    setSortDirection(prevDirection => {
      const newDirection = prevDirection === 'asc' ? 'desc' : 'asc';
      
      setTimeout(() => {
        if (onFilter) {
          onFilter({ ...activeFilters, _sort: newDirection });
        }
      }, 0);
      
      return newDirection;
    });
  }, [onFilter, activeFilters]);

  const activeFilterCount = Object.keys(activeFilters).filter(key => key !== '_sort').length;

  const renderSelectOptions = (filter: FilterOption) => {
    if (!filter.options) return null;
    
    // Check if options is an array of strings or objects
    const isStringArray = typeof filter.options[0] === 'string';
    
    if (isStringArray) {
      return (filter.options as string[]).map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ));
    } else {
      return (filter.options as { value: string; label: string; }[]).map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ));
    }
  };

  return (
    <div className={`flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 ${className}`}>
      <div className="relative flex-1">
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onKeyPress={handleInputKeyPress}
          className="pr-10"
        />
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full"
          onClick={handleSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex space-x-2">
        {filters.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-1">
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
                {activeFilterCount > 0 && (
                  <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="grid gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none">Filtros</h4>
                  {activeFilterCount > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearFilters}
                      className="h-auto p-1 text-xs"
                    >
                      <FilterX className="h-3 w-3 mr-1" />
                      Limpiar
                    </Button>
                  )}
                </div>
                <Separator />
                <div className="grid gap-2">
                  {filters.map((filter) => (
                    <div key={filter.id} className="grid gap-1">
                      <label htmlFor={filter.id} className="text-sm font-medium">
                        {filter.label}
                      </label>
                      {filter.type === 'select' && filter.options && (
                        <select
                          id={filter.id}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={activeFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        >
                          <option value="">Todos</option>
                          {renderSelectOptions(filter)}
                        </select>
                      )}
                      {filter.type === 'date' && (
                        <Input
                          id={filter.id}
                          type="date"
                          value={activeFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        />
                      )}
                      {filter.type === 'number' && (
                        <Input
                          id={filter.id}
                          type="number"
                          value={activeFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          placeholder="0"
                        />
                      )}
                      {filter.type === 'boolean' && (
                        <select
                          id={filter.id}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={activeFilters[filter.id] || ''}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                        >
                          <option value="">Todos</option>
                          <option value="true">Sí</option>
                          <option value="false">No</option>
                        </select>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
        <Button 
          variant="outline" 
          onClick={toggleSortDirection} 
          className="flex items-center gap-1"
          title={sortDirection === 'asc' ? 'Ordenar ascendente' : 'Ordenar descendente'}
        >
          {sortDirection === 'asc' ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchAndFilter;
