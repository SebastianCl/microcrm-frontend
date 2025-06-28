import { useState, useCallback } from 'react';
import { formatCurrency } from '@/lib/utils';

interface UseCurrencyInputProps {
  initialValue?: number | string;
  onChange?: (value: number) => void;
}

export const useCurrencyInput = ({ initialValue = '', onChange }: UseCurrencyInputProps = {}) => {
  const [displayValue, setDisplayValue] = useState<string>(() => {
    if (initialValue === '' || initialValue === 0) return '';
    const numericValue = typeof initialValue === 'string' ? parseFloat(initialValue) : initialValue;
    return isNaN(numericValue) ? '' : numericValue.toString();
  });

  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (displayValue) {
      const numericValue = parseFloat(displayValue);
      if (!isNaN(numericValue)) {
        onChange?.(numericValue);
      }
    }
  }, [displayValue, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Permitir solo números y punto decimal
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setDisplayValue(value);
    }
  }, []);

  const inputProps = {
    type: "text" as const,
    value: isFocused ? displayValue : (displayValue ? formatCurrency(parseFloat(displayValue) || 0) : ''),
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    placeholder: isFocused ? '0' : '$0',
  };

  return {
    inputProps,
    numericValue: parseFloat(displayValue) || 0,
    setDisplayValue,
    isFocused,
  };
};
