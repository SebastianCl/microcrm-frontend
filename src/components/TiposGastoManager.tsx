import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useTiposGasto } from '@/hooks/useGastos';
import { Card } from '@/components/ui/card';
import CreateTipoGastoDialog from './CreateTipoGastoDialog';
import EditTipoGastoDialog from './EditTipoGastoDialog';
import { Edit, FileText } from 'lucide-react';

const TiposGastoManager: React.FC = () => {
    const { data: tiposGasto = [], isLoading, error } = useTiposGasto();

    if (error) {
        return (
            <Card className="p-4">
                <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Error al cargar tipos de gasto</h3>
                    <p className="text-muted-foreground">
                        No se pudieron cargar los tipos de gasto. Por favor, inténtalo de nuevo.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tipos de gasto</h3>
                <CreateTipoGastoDialog />
            </div>

            {isLoading ? (
                <div className="text-center py-8">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-muted rounded w-1/3 mx-auto"></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="p-3 border rounded-lg space-y-2">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-3 bg-muted rounded w-1/2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : tiposGasto.length === 0 ? (
                <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No hay tipos de gasto</h3>
                    <p className="text-muted-foreground mb-4">
                        Crea tu primer tipo de gasto para comenzar a organizar tus gastos.
                    </p>
                    <CreateTipoGastoDialog />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tiposGasto.map((tipo) => (
                        <div key={tipo.id_tipo_gasto} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-sm leading-tight truncate">
                                        {tipo.nombre_tipo}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    <EditTipoGastoDialog
                                        tipoGasto={tipo}
                                        trigger={
                                            <button className="p-1 hover:bg-muted rounded transition-colors">
                                                <Edit className="h-3 w-3" />
                                            </button>
                                        }
                                    />
                                </div>
                            </div>
                            {tipo.descripcion && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {tipo.descripcion}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default TiposGastoManager;
