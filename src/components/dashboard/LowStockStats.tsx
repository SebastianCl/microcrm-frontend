import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package } from 'lucide-react';

interface ProductoConMenosStock {
    id_producto: number;
    nombre: string;
    stock: number;
}

interface LowStockStatsProps {
    data: ProductoConMenosStock[];
}

const LowStockStats = ({ data }: LowStockStatsProps) => {
    const getStockVariant = (stock: number) => {
        if (stock === 0) return 'destructive' as const;
        if (stock <= 10) return 'outline' as const;
        return 'secondary' as const;
    };

    const getStockIcon = (stock: number) => {
        if (stock === 0) return <AlertTriangle className="h-3 w-3" />;
        return <Package className="h-3 w-3" />;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos con Menos Stock</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.slice(0, 5).map((item) => (
                        <div key={item.id_producto} className="flex items-center justify-between">
                            <span className="text-sm font-medium truncate max-w-[150px]" title={item.nombre}>
                                {item.nombre}
                            </span>
                            <Badge variant={getStockVariant(item.stock)} className="flex items-center space-x-1">
                                {getStockIcon(item.stock)}
                                <span>{item.stock}</span>
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default LowStockStats;
