import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface ActionButton {
  label: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'outline' | 'destructive' | 'secondary' | 'ghost' | 'link';
  onClick: (item: any) => void;
  disabled?: (item: any) => boolean;
}

interface ColumnConfig {
  key: string;
  header: string;
  render?: (value: any, item: any) => React.ReactNode;
  className?: string;
}

interface ConfigurationTableProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  data: any[];
  columns: ColumnConfig[];
  actions: ActionButton[];
  onAdd?: () => void;
  addButtonLabel?: string;
  isLoading?: boolean;
}

const ConfigurationTable: React.FC<ConfigurationTableProps> = ({
  title,
  description,
  icon,
  data,
  columns,
  actions,
  onAdd,
  addButtonLabel = 'Crear',
  isLoading = false
}) => {
  const renderCell = (column: ColumnConfig, item: any) => {
    const value = item[column.key];
    
    if (column.render) {
      return column.render(value, item);
    }

    // Renderizado por defecto para tipos comunes
    if (column.key.includes('Date') || column.key.includes('At')) {
      return (
        <span className="text-sm text-muted-foreground">
          {formatDateTime(value)}
        </span>
      );
    }

    if (column.key.includes('price') || column.key.includes('Price')) {
      return (
        <span className="font-mono">
          {new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
          }).format(value)}
        </span>
      );
    }

    if (column.key.includes('active') || column.key.includes('Active') || column.key === 'status') {
      const isActive = value === true || value === 'active';
      return (
        <Badge variant={isActive ? 'default' : 'destructive'}>
          {isActive ? 'Activo' : 'Inactivo'}
        </Badge>
      );
    }

    return value;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            {icon}
            <h3 className="text-lg font-medium">{title}</h3>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Cargando...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
        {onAdd && (
          <Button onClick={onAdd}>
            <Plus size={16} className="mr-2" />
            {addButtonLabel}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                No hay elementos para mostrar
              </div>
              {onAdd && (
                <Button onClick={onAdd} variant="outline">
                  <Plus size={16} className="mr-2" />
                  Crear el primero
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead key={column.key} className={column.className}>
                      {column.header}
                    </TableHead>
                  ))}
                  {actions.length > 0 && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, index) => (
                  <TableRow key={item.id || item.id_mesa || index}>
                    {columns.map((column) => (
                      <TableCell key={column.key} className={column.className}>
                        {renderCell(column, item)}
                      </TableCell>
                    ))}
                    {actions.length > 0 && (
                      <TableCell>
                        <div className="flex space-x-2">
                          {actions.map((action, actionIndex) => (
                            <Button
                              key={actionIndex}
                              variant={action.variant || 'outline'}
                              size="sm"
                              onClick={() => action.onClick(item)}
                              disabled={action.disabled ? action.disabled(item) : false}
                              title={action.label}
                            >
                              {action.icon || <Edit size={14} />}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigurationTable;
