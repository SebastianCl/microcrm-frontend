import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface CashFlowCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    description?: string;
    amount: number;
}

const CashFlowCard = ({
    title,
    value,
    icon,
    description,
    amount,
}: CashFlowCardProps) => {
    const isPositive = amount >= 0;

    return (
        <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className="h-4 w-4 text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className={cn(
                    "text-2xl font-bold",
                    isPositive ? "text-green-600" : "text-red-600"
                )}>
                    {value}
                </div>
                {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </CardContent>
        </Card>
    );
};

export default CashFlowCard;
