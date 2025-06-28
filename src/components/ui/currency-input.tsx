import React, { forwardRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { useCurrencyInput } from '@/hooks/useCurrencyInput';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value?: number | string;
  onValueChange?: (value: number) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const { inputProps, setDisplayValue } = useCurrencyInput({
      initialValue: value,
      onChange: onValueChange,
    });

    // Sincronizar con el valor externo cuando cambie
    useEffect(() => {
      if (value !== undefined) {
        const stringValue = typeof value === 'string' ? value : value.toString();
        setDisplayValue(stringValue === '0' ? '' : stringValue);
      }
    }, [value, setDisplayValue]);

    return (
      <Input
        {...props}
        {...inputProps}
        ref={ref}
        className={cn(className)}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
