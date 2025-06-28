import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CreateGastoDto } from '@/models/gastos.model';
import { useClients } from '@/hooks/useClients';
import { useTiposGasto } from '@/hooks/useGastos';
import { Loader2 } from 'lucide-react';

const gastoSchema = z.object({
    id_cliente: z.string().min(1, 'Debe seleccionar un cliente'),
    descripcion: z.string().min(1, 'La descripción es requerida').max(500, 'La descripción no puede exceder 500 caracteres'),
    monto: z.string().min(1, 'El monto es requerido').refine((val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num > 0;
    }, 'El monto debe ser un número positivo'),
    fecha: z.string().min(1, 'La fecha es requerida'),
    id_tipo_gasto: z.string().min(1, 'Debe seleccionar un tipo de gasto'),
});

type FormData = z.infer<typeof gastoSchema>;

interface CreateGastoFormProps {
    onSubmit: (data: CreateGastoDto) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const CreateGastoForm: React.FC<CreateGastoFormProps> = ({
    onSubmit,
    onCancel,
    isLoading = false,
}) => {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(gastoSchema),
        defaultValues: {
            fecha: new Date().toISOString().split('T')[0], // Fecha actual por defecto
        },
    });

    // Cargar datos para los selects
    const { data: clientes = [], isLoading: loadingClientes } = useClients();
    const { data: tiposGasto = [], isLoading: loadingTipos } = useTiposGasto();

    const handleFormSubmit = (data: FormData) => {
        const gastoData: CreateGastoDto = {
            id_cliente: parseInt(data.id_cliente),
            descripcion: data.descripcion,
            monto: parseFloat(data.monto),
            fecha: data.fecha,
            id_tipo_gasto: parseInt(data.id_tipo_gasto),
        };
        onSubmit(gastoData);
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente */}
                <div className="space-y-2">
                    <Label htmlFor="id_cliente">Cliente *</Label>
                    <Select onValueChange={(value) => setValue('id_cliente', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder={loadingClientes ? "Cargando..." : "Seleccionar cliente"} />
                        </SelectTrigger>
                        <SelectContent>
                            {clientes.map((cliente) => (
                                <SelectItem key={cliente.id_cliente} value={cliente.id_cliente.toString()}>
                                    {cliente.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.id_cliente && (
                        <p className="text-sm text-red-600">{errors.id_cliente.message}</p>
                    )}
                </div>

                {/* Tipo de gasto */}
                <div className="space-y-2">
                    <Label htmlFor="id_tipo_gasto">Tipo de gasto *</Label>
                    <Select onValueChange={(value) => setValue('id_tipo_gasto', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder={loadingTipos ? "Cargando..." : "Seleccionar tipo"} />
                        </SelectTrigger>
                        <SelectContent>
                            {tiposGasto.map((tipo) => (
                                <SelectItem key={tipo.id_tipo_gasto} value={tipo.id_tipo_gasto.toString()}>
                                    {tipo.nombre_tipo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.id_tipo_gasto && (
                        <p className="text-sm text-red-600">{errors.id_tipo_gasto.message}</p>
                    )}
                </div>

                {/* Monto */}
                <div className="space-y-2">
                    <Label htmlFor="monto">Monto *</Label>
                    <Input
                        id="monto"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('monto')}
                    />
                    {errors.monto && (
                        <p className="text-sm text-red-600">{errors.monto.message}</p>
                    )}
                </div>

                {/* Fecha */}
                <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha *</Label>
                    <Input
                        id="fecha"
                        type="date"
                        {...register('fecha')}
                    />
                    {errors.fecha && (
                        <p className="text-sm text-red-600">{errors.fecha.message}</p>
                    )}
                </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                    id="descripcion"
                    placeholder="Describe el gasto..."
                    rows={3}
                    {...register('descripcion')}
                />
                {errors.descripcion && (
                    <p className="text-sm text-red-600">{errors.descripcion.message}</p>
                )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={isLoading || loadingClientes || loadingTipos}
                >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Crear gasto
                </Button>
            </div>
        </form>
    );
};

export default CreateGastoForm;
