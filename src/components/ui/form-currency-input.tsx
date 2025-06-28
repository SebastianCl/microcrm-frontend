import React, { forwardRef } from 'react';
import { CurrencyInput } from '@/components/ui/currency-input';

interface FormCurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type'> {
  value?: string;
  onChange?: (event: { target: { value: string } }) => void;
}

const FormCurrencyInput = forwardRef<HTMLInputElement, FormCurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const handleValueChange = (numericValue: number) => {
      // Crear un evento sintético para react-hook-form
      const syntheticEvent = {
        target: {
          value: numericValue.toString()
        }
      };
      onChange?.(syntheticEvent);
    };

    return (
      <CurrencyInput
        {...props}
        ref={ref}
        value={value ? parseFloat(value) : 0}
        onValueChange={handleValueChange}
      />
    );
  }
);

FormCurrencyInput.displayName = 'FormCurrencyInput';

export { FormCurrencyInput };
