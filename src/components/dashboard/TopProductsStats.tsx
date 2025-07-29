import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookHeart } from 'lucide-react';

interface TopProducto {
    id_producto: number;
    producto: string;
    total_vendido: string;
}

interface TopProductsStatsProps {
    data: TopProducto[];
}

const TopProductsStats = ({ data }: TopProductsStatsProps) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos más vendidos</CardTitle>
                <BookHeart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {data.slice(0, 5).map((item, index) => (
                        <div key={item.id_producto} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                                    {index + 1}
                                </Badge>
                                <span className="text-sm font-medium truncate max-w-[150px]" title={item.producto}>
                                    {item.producto}
                                </span>
                            </div>
                            <Badge variant="secondary">
                                {item.total_vendido}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default TopProductsStats;
