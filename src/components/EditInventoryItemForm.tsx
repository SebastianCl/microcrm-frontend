
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { InventoryItem } from '@/types/inventory';
import { useCategories, useUpdateProduct } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),
  category: z.string().min(1, { message: "La categoría es obligatoria" }),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "El precio debe ser un número positivo",
  }),
  stockQuantity: z.string().refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
    message: "La cantidad debe ser un número entero positivo",
  }),
  description: z.string().optional(),
  managesInventory: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

interface EditInventoryItemFormProps {
  item: InventoryItem;
  onClose: () => void;
}

const EditInventoryItemForm: React.FC<EditInventoryItemFormProps> = ({ item, onClose }) => {
  const { data: categoriesData } = useCategories();
  const updateProductMutation = useUpdateProduct();
  const { user } = useAuth();

  // Verificar si el usuario es colaborador (no puede editar cantidad)
  const isCollaborator = user?.role === 'Collaborator';

  // Transformar los datos de categorías al formato esperado por el componente
  const categories = React.useMemo(() => {
    if (!categoriesData) return [];
    return categoriesData.map(category => ({
      id: category.id_categoria,
      name: category.nombre_categoria
    }));
  }, [categoriesData]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item.name,
      category: "",
      price: item.price.toString(),
      stockQuantity: item.stockQuantity === Infinity ? "0" : item.stockQuantity.toString(),
      description: item.description || "",
      managesInventory: item.managesInventory,
      isActive: item.isActive,
    },
  });

  // Establezca el valor de la categoría una vez cargadas las categorías
  React.useEffect(() => {
    if (categoriesData) {
      // Primero intenta usar categoryId si está disponible
      if (item.categoryId) {
        form.setValue('category', item.categoryId.toString());
      }
      // Regresar a la búsqueda por nombre de categoría para elementos heredados
      else if (item.category) {
        const matchingCategory = categoriesData.find(cat => cat.nombre_categoria === item.category);
        if (matchingCategory) {
          form.setValue('category', matchingCategory.id_categoria.toString());
        }
      }
    }
  }, [categoriesData, item.categoryId, item.category, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await updateProductMutation.mutateAsync({
        productId: item.id,
        productData: {
          nombre: values.name,
          descripcion: values.description,
          precio: values.price,
          // Si es colaborador, mantener el stock original; si es administrador, usar el nuevo valor
          stock: isCollaborator ? item.stockQuantity : parseInt(values.stockQuantity),
          estado: values.isActive,
          maneja_inventario: values.managesInventory,
          id_categoria: parseInt(values.category),
        },
      });

      toast.success("Producto actualizado correctamente");
      onClose();
    } catch (error) {
      toast.error("Error al actualizar el producto. Intenta nuevamente.");
      console.error("Error updating product:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre del producto</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoría</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price" render={({ field }) => (
              <FormItem>
                <FormLabel>Precio (COP)</FormLabel>
                <FormControl>
                  <CurrencyInput
                    value={field.value}
                    onValueChange={(value) => field.onChange(value.toString())}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stockQuantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cantidad</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...field}
                    disabled={isCollaborator}
                  />
                </FormControl>
                {isCollaborator && (
                  <p className="text-xs text-amber-600">
                    Los colaboradores no pueden editar la cantidad del producto
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe el producto..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="managesInventory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Manejar inventario
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Activar para controlar el stock del producto
                  </p>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Producto activo
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    El producto estará disponible para venta
                  </p>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            Actualizar producto
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditInventoryItemForm;
