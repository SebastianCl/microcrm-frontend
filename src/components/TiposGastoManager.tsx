import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useTiposGasto } from '@/hooks/useGastos';
import { Card } from '@/components/ui/card';

const TiposGastoManager: React.FC = () => {
    const { data: tiposGasto = [], isLoading } = useTiposGasto();

    return (
        <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Tipos de Gasto</h3>
            </div>

            {isLoading ? (
                <div className="text-center py-4">Cargando tipos de gasto...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tiposGasto.map((tipo) => (
                        <div key={tipo.id_tipo_gasto} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{tipo.nombre_tipo}</h4>
                                <Badge variant="default">Activo</Badge>
                            </div>
                            {tipo.descripcion && (
                                <p className="text-sm text-muted-foreground">{tipo.descripcion}</p>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
};

export default TiposGastoManager;
