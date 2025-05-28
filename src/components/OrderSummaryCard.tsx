
import React from 'react';
import { Card } from '@/components/ui/card';
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
import { Percent, DollarSign } from 'lucide-react';

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
    <Card className="p-4 sticky top-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Resumen del Pedido</h3>
          <Badge variant="secondary">
            {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </Badge>
        </div>

        <Separator />

        {/* Discount Section */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Descuento</label>
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
                <Button variant="outline" size="icon">
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
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Descuento {discountType === DiscountTypes.PERCENTAGE ? `(${discount}%)` : `($${discount})`}:
              </span>
              <span className="text-red-600">-${discountAmount.toFixed(2)}</span>
            </div>
          )}
          
          <Separator />
          
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default OrderSummaryCard;
