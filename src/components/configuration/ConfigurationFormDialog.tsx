import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FormFieldConfig {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  step?: string;
  min?: string;
}

interface ConfigurationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  fields: FormFieldConfig[];
  formData: Record<string, string>;
  onFormDataChange: (data: Record<string, string>) => void;
  onSubmit: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

const ConfigurationFormDialog: React.FC<ConfigurationFormDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  fields,
  formData,
  onFormDataChange,
  onSubmit,
  submitLabel = 'Guardar',
  isLoading = false
}) => {
  const handleInputChange = (key: string, value: string) => {
    onFormDataChange({
      ...formData,
      [key]: value
    });
  };

  const renderField = (field: FormFieldConfig) => {
    const commonProps = {
      id: field.key,
      value: formData[field.key] || '',
      placeholder: field.placeholder,
      disabled: isLoading
    };

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={field.rows || 3}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select 
            value={formData[field.key] || ''} 
            onValueChange={(value) => handleInputChange(field.key, value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'number':
        return (
          <Input
            {...commonProps}
            type="number"
            step={field.step}
            min={field.min}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
          />
        );

      default:
        return (
          <Input
            {...commonProps}
            type={field.type}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.key}>
              <Label htmlFor={field.key}>
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              {renderField(field)}
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading ? 'Guardando...' : submitLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigurationFormDialog;
