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
import { useCreateGasto, useTiposGasto } from "@/hooks/useGastos";
import { CreateGastoDto } from "@/models/gastos.model";
import { Tag, FileText, DollarSign, Calendar } from 'lucide-react';

import { getCurrentDate } from '@/lib/utils';

const formSchema = z.object({
    descripcion: z.string().min(1, { message: "La descripción es obligatoria" }),
    monto: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
        message: "El monto debe ser un número positivo",
    }),
    fecha: z.string().min(1, { message: "La fecha es obligatoria" }),
    id_tipo_gasto: z.string().min(1, { message: "El tipo de gasto es obligatorio" }),
});

interface CreateGastoFormProps {
    onClose: () => void;
}

const CreateGastoForm: React.FC<CreateGastoFormProps> = ({ onClose }) => {
    const { data: tiposGasto = [] } = useTiposGasto();
    const createGastoMutation = useCreateGasto();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            descripcion: "",
            monto: "",
            fecha: getCurrentDate(), // Fecha actual por defecto
            id_tipo_gasto: "",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const gastoData: CreateGastoDto = {
                id_cliente: 1,
                descripcion: values.descripcion,
                monto: parseFloat(values.monto),
                fecha: values.fecha,
                id_tipo_gasto: parseInt(values.id_tipo_gasto),
            };

            await createGastoMutation.mutateAsync(gastoData);

            toast.success("Gasto creado exitosamente");
            onClose();
        } catch (error: any) {
            console.error('Error al crear gasto:', error);
            toast.error(error?.message || "Error al crear el gasto");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <FormField
                    control={form.control}
                    name="id_tipo_gasto"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Tipo de gasto
                            </FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccionar tipo de gasto" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {tiposGasto.map((tipo) => (
                                        <SelectItem
                                            key={tipo.id_tipo_gasto}
                                            value={tipo.id_tipo_gasto.toString()}
                                        >
                                            {tipo.nombre_tipo}
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
                    name="descripcion"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Descripción
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Descripción del gasto..."
                                    {...field}
                                    rows={3}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="monto"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Monto
                            </FormLabel>
                            <FormControl>
                                <CurrencyInput
                                    value={field.value}
                                    onValueChange={(value) => field.onChange(value.toString())}
                                    placeholder="0"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="fecha"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Fecha
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="date"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={createGastoMutation.isPending}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={createGastoMutation.isPending}
                    >
                        {createGastoMutation.isPending ? "Creando..." : "Crear gasto"}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default CreateGastoForm;
