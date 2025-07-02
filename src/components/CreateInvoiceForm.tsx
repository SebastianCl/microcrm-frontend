import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { clients } from '@/lib/sample-data';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { formatCurrency, getCurrentDate } from '@/lib/utils';

// Schema for invoice creation form
const invoiceFormSchema = z.object({
  client: z.string({
    required_error: "Please select a client.",
  }),
  invoiceDate: z.string({
    required_error: "Please select an invoice date.",
  }),
  dueDate: z.string({
    required_error: "Please select a due date.",
  }),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      rate: z.coerce.number().min(0, "Rate must be at least 0"),
    })
  ).min(1, "Add at least one item"),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface CreateInvoiceFormProps {
  onClose: () => void;
}

const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Default form values
  const defaultValues: InvoiceFormValues = {
    client: "",
    invoiceDate: getCurrentDate(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [
      { description: "", quantity: 1, rate: 0 }
    ]
  };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues,
  });

  // Use useFieldArray for managing dynamic form items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  function onSubmit(data: InvoiceFormValues) {
    // In a real app, this would save to a database
    console.log("Invoice created:", data);

    // Calculate total for display in toast
    const total = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

    toast({
      title: "Invoice created",
      description: `Invoice for ${clients.find(c => c.id === data.client)?.name || data.client} with total ${formatCurrency(total)} has been created.`,
    });

    queryClient.invalidateQueries({ queryKey: ['orders'] });
    onClose();
  }

  function addItem() {
    append({ description: "", quantity: 1, rate: 0 });
  }

  function calculateTotal() {
    const items = form.getValues("items");
    return items.reduce((total, item) => {
      return total + (item.quantity * item.rate);
    }, 0);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Client Selection */}
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} - {client.company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Invoice Date */}
          <FormField
            control={form.control}
            name="invoiceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Invoice Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Due Date */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Invoice Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Invoice Items</h3>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start bg-gray-50 p-4 rounded-md">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full md:w-24">
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qty</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="w-full md:w-32">
                <FormField
                  control={form.control}
                  name={`items.${index}.rate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full md:w-32 self-end">
                <p className="text-sm font-medium mt-8">
                  Amount: {formatCurrency(form.watch(`items.${index}.quantity`, 0) * form.watch(`items.${index}.rate`, 0))}
                </p>
              </div>

              <div className="self-end pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => remove(index)}
                  className="h-10 w-10 p-0"
                  disabled={fields.length <= 1}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>

          <div className="text-right">
            <p className="text-lg font-bold">
              Total: {formatCurrency(calculateTotal())}
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create Invoice</Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateInvoiceForm;
