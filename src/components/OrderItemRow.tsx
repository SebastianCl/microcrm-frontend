
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Edit3, Trash2, Check, X } from 'lucide-react';
import { OrderItem, Addition } from '@/models/order.model';
import { useProducts, productHasAdditions, getProductAdditions } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';

interface OrderItemRowProps {
  item: OrderItem & { discount?: number; discountType?: string };
  onUpdate: (updatedItem: OrderItem & { discount?: number; discountType?: string }) => void;
  onRemove: () => void;
}

const OrderItemRow: React.FC<OrderItemRowProps> = ({ item, onUpdate, onRemove }) => {  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantity);
  const [editAdditions, setEditAdditions] = useState<Addition[]>(item.additions || []);

  // Sincronizar el estado cuando cambie el item
  useEffect(() => {
    setEditQuantity(item.quantity);
    setEditAdditions(item.additions || []);
  }, [item.quantity, item.additions]);

  // Obtener productos de la API
  const { data: products = [], isLoading, isError } = useProducts();

  // Si hay error o está cargando, mostrar los datos sin funcionalidad de edición de adiciones
  const hasAdditions = !isLoading && !isError ? productHasAdditions(item.productId, products) : false;
  const availableAdditions = !isLoading && !isError ? getProductAdditions(item.productId, products) : [];  // Convertir AppAddition a Addition cuando sea necesario
  const convertToAddition = (appAddition: typeof availableAdditions[0]): Addition => {
    // Verificar si ya existe en editAdditions para preservar la cantidad
    const existingAddition = editAdditions.find(a => a.id === appAddition.id);
    return {
      id: appAddition.id,
      name: appAddition.name,
      price: appAddition.price,
      quantity: existingAddition?.quantity || 1
    };
  };
  
  const toggleEditAddition = (appAddition: typeof availableAdditions[0]) => {
    const isSelected = editAdditions.some(a => a.id === appAddition.id);
    if (isSelected) {
      setEditAdditions(editAdditions.filter(a => a.id !== appAddition.id));
    } else {
      const addition = convertToAddition(appAddition);
      setEditAdditions([...editAdditions, addition]);
    }
  };

  const updateAdditionQuantity = (additionId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setEditAdditions(editAdditions.filter(a => a.id !== additionId));
    } else {
      setEditAdditions(editAdditions.map(a => 
        a.id === additionId ? { ...a, quantity: newQuantity } : a
      ));
    }
  };
  const calculateNewTotal = () => {
    const productTotal = item.price * editQuantity;
    const additionsTotal = editAdditions.reduce((sum, addition) => sum + (addition.price * addition.quantity), 0) * editQuantity;
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
            <h4 className="font-medium">{item.name}</h4>            <div className="flex space-x-1">
              <Button type="button" size="sm" onClick={handleSave} className="h-7 w-7 p-0">
                <Check className="h-3 w-3" />
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={handleCancel} className="h-7 w-7 p-0">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Quantity Editor */}
          <div className="flex items-center space-x-2">
            <label className="text-sm">Cantidad:</label>
            <div className="flex items-center space-x-1">
              <Button
                type="button"
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
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setEditQuantity(editQuantity + 1)}
                className="h-7 w-7 p-0"
              >
                +
              </Button>
            </div></div>

          {/* Additions Editor */}
          {isLoading && (
            <div className="text-sm text-muted-foreground">
              Cargando adiciones...
            </div>
          )}
          {isError && (
            <div className="text-sm text-red-500">
              Error al cargar las adiciones
            </div>
          )}          {hasAdditions && availableAdditions.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Adiciones:</label>
              <div className="space-y-2">
                {availableAdditions.map(appAddition => {
                  const selectedAddition = editAdditions.find(a => a.id === appAddition.id);
                  const isSelected = !!selectedAddition;
                  
                  return (
                    <div key={appAddition.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-addition-${appAddition.id}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleEditAddition(appAddition)}
                      />
                      <label
                        htmlFor={`edit-addition-${appAddition.id}`}
                        className="text-xs cursor-pointer flex-1"
                      >
                        {appAddition.name} (+{formatCurrency(appAddition.price)})
                      </label>
                      
                      {/* Controles de cantidad para adición seleccionada */}
                      {isSelected && (
                        <div className="flex items-center space-x-1">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => updateAdditionQuantity(appAddition.id, selectedAddition.quantity - 1)}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            -
                          </Button>
                          <span className="text-xs w-6 text-center">{selectedAddition.quantity}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => updateAdditionQuantity(appAddition.id, selectedAddition.quantity + 1)}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            +
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}          <div className="text-sm font-medium text-right">
            Nuevo total: {formatCurrency(calculateNewTotal())}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <tr className="border-b hover:bg-muted/30">
      <td className="p-3">
        <div>
          <div className="font-medium">{item.name}</div>          {item.additions && item.additions.length > 0 && (
            <div className="text-xs text-muted-foreground mt-1">
              {item.additions.map((addition, i) => (
                <Badge key={addition.id} variant="secondary" className="text-xs mr-1">
                  {addition.name} {addition.quantity > 1 && `x${addition.quantity}`}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </td>      <td className="p-3 text-center">{item.quantity}</td>
      <td className="p-3 text-right">{formatCurrency(item.price)}</td>
      <td className="p-3 text-right">{formatCurrency(item.total)}</td>
      <td className="p-3">        <div className="flex space-x-1">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          className="h-7 w-7 p-0"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
        <Button
          type="button"
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
