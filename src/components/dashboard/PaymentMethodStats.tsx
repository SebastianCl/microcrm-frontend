import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            case 'total general':
                return 'Total general';
            default:
                return method;
        }
    };

    const isTotal = (method: string) => method.toLowerCase() === 'total general';

    // Filtrar datos excluyendo el total general
    const filteredData = data.filter(item => !isTotal(item.metodo_pago));

    // Encontrar el total general
    const totalGeneral = data.find(item => isTotal(item.metodo_pago));

    // Calcular el total de todos los métodos para los porcentajes
    const totalAmount = filteredData.reduce((sum, item) => sum + Number(item.total), 0);

    const getSegmentColor = (method: string) => {
        switch (method.toLowerCase()) {
            case 'efectivo':
                return 'bg-green-500';
            case 'transferencia':
                return 'bg-blue-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas por método de pago</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {filteredData.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <div
                                    className={`w-3 h-3 rounded-full ${getSegmentColor(item.metodo_pago)}`}
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-medium">
                                        {getPaymentLabel(item.metodo_pago)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {formatCurrency(Number(item.total))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Barra segmentada */}
                    <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700 overflow-hidden">
                        <div className="flex h-full">
                            {filteredData.map((item, index) => {
                                const percentage = totalAmount > 0 ? (Number(item.total) / totalAmount) * 100 : 0;
                                return (
                                    <div
                                        key={index}
                                        className={`${getSegmentColor(item.metodo_pago)} transition-all duration-500 ease-out`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {/* Total General */}
                    {totalGeneral && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-foreground">
                                    {getPaymentLabel(totalGeneral.metodo_pago)}
                                </span>
                                <span className="text-lg font-bold text-foreground">
                                    {formatCurrency(Number(totalGeneral.total))}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PaymentMethodStats;
