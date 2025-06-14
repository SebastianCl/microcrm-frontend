import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { clientService } from '@/services/clientService'; // Nueva importación

// Schema for client creation form
const clientFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  correo: z.string().email("Dirección de correo electrónico inválida"),
  telefono: z.string().min(7, "El número de teléfono es obligatorio"),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface CreateClientFormProps {
  onClose: () => void;
}

const CreateClientForm: React.FC<CreateClientFormProps> = ({ onClose }) => {
  const { toast } = useToast();
  
  // Default form values
  const defaultValues: ClientFormValues = {
    nombre: "",
    correo: "",
    telefono: "",
  };

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });
  
  async function onSubmit(data: ClientFormValues) {
    try {
      await clientService.create(data);
      toast({
        title: "Cliente creado",
        description: `${data.nombre} ha sido añadido a tus clientes.`,
      });
      onClose(); // Llamar a onClose después de crear el cliente
    } catch (error) {
      console.error("Error al crear el cliente:", error);
      toast({
        title: "Error al crear cliente",
        description: "Hubo un problema al intentar crear el cliente. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {/* Client Name */}
          <FormField
            control={form.control}
            name="nombre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="correo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección de correo electrónico</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone */}
          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de teléfono</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">Crear Cliente</Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateClientForm;
