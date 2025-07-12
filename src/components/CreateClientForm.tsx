import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCreateClient } from '@/hooks/useClients';
import { User, Mail, Phone } from 'lucide-react';

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
  const createClientMutation = useCreateClient();

  // Valor por defecto para el formulario
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
    const payload = {
      nombre: data.nombre,
      correo: data.correo,
      telefono: data.telefono,
      id_cliente: 0,
      estado: true,
    };
    createClientMutation.mutate(payload, {
      onSuccess: (nuevoCliente) => {
        toast({
          title: "Cliente creado",
          description: `${data.nombre} ha sido añadido a tus clientes.`,
        });
        onClose();
      },
      onError: (error) => {
        console.error("Error al crear el cliente:", error);
        toast({
          title: "Error al crear cliente",
          description: "Hubo un problema al intentar crear el cliente. Por favor, inténtalo de nuevo.",
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
                <FormLabel className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre completo
                </FormLabel>
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
                <FormLabel className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Dirección de correo electrónico
                </FormLabel>
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
                <FormLabel className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Número de teléfono
                </FormLabel>
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
          <Button type="submit" disabled={createClientMutation.isPending}>
            {createClientMutation.isPending ? "Creando..." : "Crear cliente"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateClientForm;
