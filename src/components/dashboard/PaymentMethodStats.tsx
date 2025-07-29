import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface VentaPorMedioPago {
    metodo_pago: string;
    total: string;
}

interface PaymentMethodStatsProps {
    data: VentaPorMedioPago[];
}

const PaymentMethodStats = ({ data }: PaymentMethodStatsProps) => {
    const getPaymentLabel = (method: string) => {
        switch (method.toLowerCase()) {
            case 'efectivo':
                return 'Efectivo';
            case 'transferencia':
                return 'Transferencia';
            case 'tarjeta':
                return 'Tarjeta';
            case 'total general':
                return 'Total General';
            default:
                return method;
        }
    };

    const getPaymentVariant = (method: string) => {
        if (method.toLowerCase() === 'total general') {
            return 'default' as const;
        }
        return 'outline' as const;
    };

    const isTotal = (method: string) => method.toLowerCase() === 'total general';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas por Método de Pago</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <div key={index} className={`flex items-center justify-between ${isTotal(item.metodo_pago) ? 'pt-2 border-t' : ''}`}>
                            <Badge variant={getPaymentVariant(item.metodo_pago)}>
                                {getPaymentLabel(item.metodo_pago)}
                            </Badge>
                            <span className={`font-bold ${isTotal(item.metodo_pago) ? 'text-lg' : 'text-sm'}`}>
                                {formatCurrency(Number(item.total))}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default PaymentMethodStats;
