import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Percent, DollarSign, ShoppingCart, Receipt } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface OrderSummaryCardProps {
  itemCount: number;
  subtotal: number;
  discount: number;
  discountType: string;
  total: number;
  onDiscountChange: (discount: number, type: string) => void;
}

const DiscountTypes = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
  NONE: 'none'
};

const OrderSummaryCard: React.FC<OrderSummaryCardProps> = ({
  itemCount,
  subtotal,
  discount,
  discountType,
  total,
  onDiscountChange
}) => {
  const calculateOrderDiscount = () => {
    if (discountType === DiscountTypes.PERCENTAGE) {
      return subtotal * (discount / 100);
    }
    if (discountType === DiscountTypes.FIXED) {
      return Math.min(subtotal, discount);
    }
    return 0;
  };

  const discountAmount = calculateOrderDiscount();

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow sticky top-4">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            <span>Resumen</span>
          </div>
          <Badge variant="secondary" className="ml-2">
            {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Discount Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Descuento
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="0"
              value={discount || ''}
              onChange={(e) => onDiscountChange(Number(e.target.value), discountType)}
              className="flex-1"
              placeholder="0"
              disabled={discountType === DiscountTypes.NONE}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  {discountType === DiscountTypes.PERCENTAGE ? (
                    <Percent className="h-4 w-4" />
                  ) : discountType === DiscountTypes.FIXED ? (
                    <DollarSign className="h-4 w-4" />
                  ) : (
                    '-'
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onDiscountChange(0, DiscountTypes.NONE)}>
                  Sin descuento
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDiscountChange(discount, DiscountTypes.PERCENTAGE)}>
                  Porcentaje (%)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDiscountChange(discount, DiscountTypes.FIXED)}>
                  Cantidad fija ($)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-3">          <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal:</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Descuento {discountType === DiscountTypes.PERCENTAGE ? `(${discount}%)` : `(${formatCurrency(discount)})`}:
              </span>
              <span className="text-destructive font-medium">-{formatCurrency(discountAmount)}</span>
            </div>
          )}

          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span className="text-foreground">Total:</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Summary Badge */}
        {itemCount > 0 && (
          <div className="p-3 bg-muted border rounded-lg">
            <div className="flex items-center gap-2 text-foreground">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm font-medium">
                {itemCount} producto{itemCount !== 1 ? 's' : ''} agregado{itemCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderSummaryCard;
