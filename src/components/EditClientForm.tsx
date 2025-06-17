import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useUpdateClient } from '@/hooks/useClients';
import { Client } from '@/models/client.model';

// Schema for client edit form
const clientFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  correo: z.string().email("Dirección de correo electrónico inválida"),
  telefono: z.string().min(7, "El número de teléfono es obligatorio"),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

interface EditClientFormProps {
  client: Client;
  onClose: () => void;
}

const EditClientForm: React.FC<EditClientFormProps> = ({ client, onClose }) => {
  const { toast } = useToast();
  const updateClientMutation = useUpdateClient(client.id_cliente.toString());

  // Valores por defecto del formulario con los datos del cliente
  const defaultValues: ClientFormValues = {
    nombre: client.nombre,
    correo: client.correo,
    telefono: client.telefono,
  };

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues,
  });
  
  async function onSubmit(data: ClientFormValues) {
    const payload = {
      nombre: data.nombre,
      correo: data.correo,
      telefono: data.telefono,
    };

    updateClientMutation.mutate(payload, {
      onSuccess: () => {
        toast({
          title: "Cliente actualizado",
          description: `${data.nombre} ha sido actualizado correctamente.`,
        });
        onClose(); 
      },
      onError: (error) => {
        console.error("Error al actualizar el cliente:", error);
        toast({
          title: "Error al actualizar cliente",
          description: "Hubo un problema al intentar actualizar el cliente. Por favor, inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    });
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
                  <Input {...field} />
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
                  <Input type="email" {...field} />
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
                  <Input {...field} />
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
          <Button type="submit" disabled={updateClientMutation.isPending}>
            {updateClientMutation.isPending ? "Actualizando..." : "Actualizar Cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditClientForm;
