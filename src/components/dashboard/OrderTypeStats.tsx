import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, CreditCard } from 'lucide-react';

interface PedidoPorTipo {
    tipo_pedido: string;
    cantidad_pedidos: number;
}

interface OrderTypeStatsProps {
    data: PedidoPorTipo[];
}

const OrderTypeStats = ({ data }: OrderTypeStatsProps) => {
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'en_mesa':
                return 'En mesa';
            case 'para_llevar':
                return 'Para llevar';
            default:
                return type;
        }
    };

    const getTypeVariant = (type: string) => {
        switch (type) {
            case 'en_mesa':
                return 'default' as const;
            case 'para_llevar':
                return 'secondary' as const;
            default:
                return 'outline' as const;
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resumen de ordenes</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <Badge variant={getTypeVariant(item.tipo_pedido)}>
                                {getTypeLabel(item.tipo_pedido)}
                            </Badge>
                            <span className="text-2xl font-bold">{item.cantidad_pedidos}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderTypeStats;
