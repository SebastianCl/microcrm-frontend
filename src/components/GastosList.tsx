import React, { useState, useCallback } from 'react';
import DataTable from './ui/DataTable';
import { Gasto } from '@/models/gastos.model';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SearchAndFilter from './ui/SearchAndFilter';
import { useGastos } from '@/hooks/useGastos';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useNetwork } from '@/hooks/useNetwork';
import CreateGastoDialog from './CreateGastoDialog';
import { Plus } from 'lucide-react';

interface GastosListProps {
    limit?: number;
    showCreateButton?: boolean;
}

const GastosList: React.FC<GastosListProps> = ({
    limit,
    showCreateButton = true
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const pageSize = 10;

    // Verificar conectividad de red
    const { isOnline } = useNetwork();

    // Usar React Query para obtener los gastos
    const {
        data: gastos = [],
        isLoading,
        isError,
        error,
        refetch
    } = useGastos();

    // Filtrar gastos
    const filteredGastos = React.useMemo(() => {
        if (!gastos || !Array.isArray(gastos)) return [];

        let result = [...gastos];

        // Aplicar búsqueda
        if (searchQuery && searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            result = result.filter(gasto => {
                try {
                    return (
                        (gasto.descripcion && gasto.descripcion.toLowerCase().includes(query)) ||
                        (gasto.nombre_tipo && gasto.nombre_tipo.toLowerCase().includes(query))
                    );
                } catch (error) {
                    console.error('Error filtrando gasto:', error, gasto);
                    return false;
                }
            });
        }

        // Aplicar filtro de tipo de gasto
        if (activeFilters.tipo_gasto) {
            result = result.filter(gasto => gasto.nombre_tipo === activeFilters.tipo_gasto);
        }

        // Aplicar filtro de monto mínimo
        if (activeFilters.monto_minimo) {
            const montoMinimo = parseInt(activeFilters.monto_minimo);
            if (!isNaN(montoMinimo)) {
                result = result.filter(gasto => {
                    const montoGasto = parseInt(gasto.monto);
                    return !isNaN(montoGasto) && montoGasto >= montoMinimo;
                });
            }
        }

        return result;
    }, [gastos, searchQuery, activeFilters]);

    // Aplicar límite si se especifica
    const displayGastos = limit ? filteredGastos.slice(0, limit) : filteredGastos;

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
            id: 'monto_minimo',
            label: 'Monto mínimo',
            type: 'number' as const,
            placeholder: '0',
            step: '1',
        },
    ];

    const columns = [
        {
            header: 'Fecha',
            accessorKey: 'fecha' as keyof Gasto,
            cell: (gasto: Gasto) => {
                try {
                    return gasto.fecha ? (
                        <span>{new Date(gasto.fecha).toLocaleDateString('es-ES')}</span>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                } catch (error) {
                    return <span className="text-muted-foreground">Fecha inválida</span>;
                }
            },
        },
        {
            header: 'Descripción',
            accessorKey: 'descripcion' as keyof Gasto,
            cell: (gasto: Gasto) => (
                <span className="max-w-48 truncate block" title={gasto.descripcion || ''}>
                    {gasto.descripcion || '-'}
                </span>
            ),
        },
        {
            header: 'Tipo',
            accessorKey: 'nombre_tipo' as keyof Gasto,
            cell: (gasto: Gasto) => (
                <Badge variant="outline">
                    {gasto.nombre_tipo || 'Sin tipo'}
                </Badge>
            ),
            hideOnMobile: true,
        },
        {
            header: 'Monto',
            accessorKey: 'monto' as keyof Gasto,
            cell: (gasto: Gasto) => {
                try {
                    const monto = parseInt(gasto.monto);
                    return (
                        <span className="font-medium">
                            {!isNaN(monto) ? `$${monto.toLocaleString('es-ES')}` : '$0'}
                        </span>
                    );
                } catch (error) {
                    return <span className="font-medium text-muted-foreground">$0</span>;
                }
            },
        }
    ];

    const handleRowClick = (gasto: Gasto) => {
        console.log('Gasto seleccionado:', gasto);
    };

    if (isLoading) {
        return (
            <Card className="p-4">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </Card>
        );
    }

    if (isError) {
        return (
            <Card className="p-4">
                <ErrorDisplay
                    error={error?.message || "Ha ocurrido un error al cargar los gastos"}
                    onRetry={() => refetch()}
                />
            </Card>
        );
    }

    return (
        <>
            <Card className="p-4">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
                    <h2 className="text-xl font-semibold">{limit ? 'Gastos Recientes' : 'Gastos'}</h2>
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
                            <Button
                                onClick={() => setIsCreateDialogOpen(true)}
                                size="sm"
                                className="gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Crear gasto
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
                            placeholder="Buscar por descripción o tipo"
                        />
                    </div>
                )}

                <DataTable
                    data={displayGastos}
                    columns={columns}
                    onRowClick={handleRowClick}
                    pagination={!limit ? {
                        currentPage: currentPage,
                        pageSize,
                        totalItems: filteredGastos.length,
                        onPageChange: setCurrentPage,
                    } : undefined}
                />
            </Card>

            <CreateGastoDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </>
    );
};

export default GastosList;
