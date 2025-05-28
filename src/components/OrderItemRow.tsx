
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Edit3, Trash2, Check, X } from 'lucide-react';
import { OrderItem, Addition } from '@/models/order.model';
import { productHasAdditions, getProductAdditions } from '@/lib/sample-additions';
import { useLanguage } from '@/contexts/LanguageProvider';

interface OrderItemRowProps {
  item: OrderItem & { discount?: number; discountType?: string };
  onUpdate: (updatedItem: OrderItem & { discount?: number; discountType?: string }) => void;
  onRemove: () => void;
}

const OrderItemRow: React.FC<OrderItemRowProps> = ({ item, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [editAdditions, setEditAdditions] = useState<Addition[]>(item.additions || []);
  const { t } = useLanguage();

  const hasAdditions = productHasAdditions(item.productId);
  const availableAdditions = getProductAdditions(item.productId);

  const toggleEditAddition = (addition: Addition) => {
    const isSelected = editAdditions.some(a => a.id === addition.id);
    if (isSelected) {
      setEditAdditions(editAdditions.filter(a => a.id !== addition.id));
    } else {
      setEditAdditions([...editAdditions, addition]);
    }
  };

  const calculateNewTotal = () => {
    const productTotal = item.price * editQuantity;
    const additionsTotal = editAdditions.reduce((sum, addition) => sum + addition.price, 0) * editQuantity;
    return productTotal + additionsTotal;
  };

  const handleSave = () => {
    const updatedItem = {
      ...item,
      quantity: editQuantity,
      additions: editAdditions,
      total: calculateNewTotal()
    };
    onUpdate(updatedItem);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditQuantity(item.quantity);
    setEditAdditions(item.additions || []);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="p-3 border-primary">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{item.name}</h4>
            <div className="flex space-x-1">
              <Button size="sm" onClick={handleSave} className="h-7 w-7 p-0">
                <Check className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="outline" onClick={handleCancel} className="h-7 w-7 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Quantity Editor */}
          <div className="flex items-center space-x-2">
            <label className="text-sm">Cantidad:</label>
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditQuantity(Math.max(1, editQuantity - 1))}
                className="h-7 w-7 p-0"
              >
                -
              </Button>
              <Input
                type="number"
                value={editQuantity}
                onChange={(e) => setEditQuantity(parseInt(e.target.value) || 1)}
                className="w-16 h-7 text-center"
                min="1"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditQuantity(editQuantity + 1)}
                className="h-7 w-7 p-0"
              >
                +
              </Button>
            </div>
          </div>

          {/* Additions Editor */}
          {hasAdditions && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Adiciones:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {availableAdditions.map(addition => (
                  <div key={addition.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`edit-addition-${addition.id}`}
                      checked={editAdditions.some(a => a.id === addition.id)}
                      onCheckedChange={() => toggleEditAddition(addition)}
                    />
                    <label 
                      htmlFor={`edit-addition-${addition.id}`} 
                      className="text-xs cursor-pointer"
                    >
                      {addition.name} (+${addition.price})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm font-medium text-right">
            Nuevo total: ${calculateNewTotal()}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <tr className="border-b hover:bg-muted/30">
      <td className="p-3">
        <div>
          <div className="font-medium">{item.name}</div>
          {item.additions && item.additions.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {item.additions.map((addition, i) => (
                <Badge key={addition.id} variant="secondary" className="text-xs mr-1">
                  {addition.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="p-3 text-center">{item.quantity}</td>
      <td className="p-3 text-right">${item.price}</td>
      <td className="p-3 text-right">${item.total}</td>
      <td className="p-3">
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-7 w-7 p-0"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            className="h-7 w-7 p-0 hover:text-red-500"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default OrderItemRow;
