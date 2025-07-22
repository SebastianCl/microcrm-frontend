import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CreditCard, DollarSign, Banknote, ArrowRightLeft } from 'lucide-react';

interface PaymentMethodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (paymentMethod: string, paidAmount?: number) => void;
  isLoading?: boolean;
  orderId?: string;
  totalAmount?: number;
}

const PaymentMethodDialog: React.FC<PaymentMethodDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  orderId,
  totalAmount = 0,
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paidAmountInput, setPaidAmountInput] = useState<string>('');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [change, setChange] = useState<number>(0);

  // Calcular el cambio cuando cambie el monto pagado
  useEffect(() => {
    if (selectedPaymentMethod === 'efectivo' && paidAmount > 0) {
      if (paidAmount >= totalAmount) {
        setChange(paidAmount - totalAmount);
      } else {
        setChange(0);
      }
    } else {
      setChange(0);
    }
  }, [paidAmount, totalAmount, selectedPaymentMethod]);

  // Formatear el input como moneda
  const formatInputCurrency = (value: string) => {
    // Remover todo excepto números
    const numericValue = value.replace(/\D/g, '');
    if (!numericValue) return '';

    // Convertir a número y formatear
    const number = parseInt(numericValue);
    return new Intl.NumberFormat('es-CO').format(number);
  };

  // Obtener valor numérico del input formateado
  const getNumericValue = (formattedValue: string): number => {
    const numericString = formattedValue.replace(/\D/g, '');
    return numericString ? parseInt(numericString) : 0;
  };

  const handleConfirm = () => {
    if (selectedPaymentMethod) {
      if (selectedPaymentMethod === 'efectivo') {
        if (paidAmount >= totalAmount) {
          onConfirm(selectedPaymentMethod, paidAmount);
        }
      } else {
        onConfirm(selectedPaymentMethod);
      }
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedPaymentMethod('');
      setPaidAmountInput('');
      setPaidAmount(0);
      setChange(0);
    }
    onOpenChange(newOpen);
  };

  const handlePaymentMethodChange = (value: string) => {
    setSelectedPaymentMethod(value);
    if (value !== 'efectivo') {
      setPaidAmountInput('');
      setPaidAmount(0);
      setChange(0);
    } else {
      // Al seleccionar efectivo, limpiar los valores para empezar fresh
      setPaidAmountInput('');
      setPaidAmount(0);
      setChange(0);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatInputCurrency(value);
    const numeric = getNumericValue(formatted);

    setPaidAmountInput(formatted);
    setPaidAmount(numeric);
  };

  const isPaidAmountValid = () => {
    if (selectedPaymentMethod !== 'efectivo') {
      return true; // Para transferencia no necesitamos validar monto
    }

    // Para efectivo, necesitamos que el monto sea >= al total
    return paidAmount > 0 && paidAmount >= totalAmount;
  };

  const isFormValid = selectedPaymentMethod && isPaidAmountValid();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Método de pago
          </DialogTitle>
          <DialogDescription>
            Selecciona el método de pago para finalizar la orden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Método de pago *</label>
            <Select value={selectedPaymentMethod} onValueChange={handlePaymentMethodChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-4 w-4 text-green-600" />
                    Efectivo
                  </div>
                </SelectItem>
                <SelectItem value="transferencia">
                  <div className="flex items-center gap-2">
                    <ArrowRightLeft className="h-4 w-4 text-blue-600" />
                    Transferencia
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mostrar total de la orden */}
          {totalAmount > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total a pagar:</span>
                <span className="text-lg font-bold">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}

          {/* Campos adicionales para efectivo */}
          {selectedPaymentMethod === 'efectivo' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto recibido *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="0"
                    value={paidAmountInput}
                    onChange={handleAmountChange}
                    className="pl-9"
                  />
                </div>
                {paidAmount > 0 && paidAmount < totalAmount && (
                  <p className="text-sm text-destructive">
                    El monto debe ser igual o mayor al total
                  </p>
                )}
              </div>

              {/* Mostrar cambio */}
              {change > 0 && (
                <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Cambio a devolver:
                    </span>
                    <span className="text-lg font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(change)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'Finalizando...' : 'Finalizar orden'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentMethodDialog;