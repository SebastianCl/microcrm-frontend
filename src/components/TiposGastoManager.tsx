import React, { useState } from 'react';
import { useTiposGasto } from '@/hooks/useGastos';
import { FileText, Edit } from 'lucide-react';
import ConfigurationTable from './configuration/ConfigurationTable';
import CreateTipoGastoDialog from './CreateTipoGastoDialog';
import EditTipoGastoDialog from './EditTipoGastoDialog';

const TiposGastoManager: React.FC = () => {
    const { data: tiposGasto = [], isLoading, error } = useTiposGasto();
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    const columns = [
        {
            key: 'nombre_tipo',
            header: 'Nombre',
            className: 'font-medium'
        },
        {
            key: 'descripcion',
            header: 'Descripción',
            render: (value: string) => value || '-'
        }
    ];

    const handleCreateTipoGasto = () => {
        setShowCreateDialog(true);
    };

    if (error) {
        return (
            <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Error al cargar tipos de gasto</h3>
                <p className="text-muted-foreground">
                    No se pudieron cargar los tipos de gasto. Por favor, inténtalo de nuevo.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <ConfigurationTable
                title="Tipos de gasto"
                description="Administra los tipos de gasto disponibles para categorizar los gastos del sistema."
                icon={<FileText size={20} />}
                data={tiposGasto.map(tipo => ({
                    ...tipo,
                    editAction: (
                        <EditTipoGastoDialog
                            tipoGasto={tipo}
                            trigger={
                                <button className="p-1 hover:bg-muted rounded transition-colors">
                                    <Edit size={14} />
                                </button>
                            }
                        />
                    )
                }))}
                columns={[
                    ...columns,
                    {
                        key: 'editAction',
                        header: 'Acciones',
                        render: (value: React.ReactNode) => value
                    }
                ]}
                actions={[]}
                onAdd={handleCreateTipoGasto}
                addButtonLabel="Nuevo tipo de gasto"
                isLoading={isLoading}
            />

            {showCreateDialog && (
                <CreateTipoGastoDialog
                    open={showCreateDialog}
                    onOpenChange={setShowCreateDialog}
                />
            )}
        </div>
    );
};

export default TiposGastoManager;
