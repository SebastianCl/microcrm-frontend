import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCreateTipoGasto } from '@/hooks/useGastos';
import { CreateTipoGastoDto } from '@/models/gastos.model';
import { useToast } from '@/hooks/use-toast';

const tipoGastoSchema = z.object({
    nombre_tipo: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
    descripcion: z.string().max(255, 'La descripción no puede exceder 255 caracteres').optional(),
});

type TipoGastoFormData = z.infer<typeof tipoGastoSchema>;

interface CreateTipoGastoFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CreateTipoGastoForm: React.FC<CreateTipoGastoFormProps> = ({ onSuccess, onCancel }) => {
    const { toast } = useToast();
    const createTipoGastoMutation = useCreateTipoGasto();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<TipoGastoFormData>({
        resolver: zodResolver(tipoGastoSchema),
    });

    const onSubmit = async (data: TipoGastoFormData) => {
        try {
            const tipoGastoData: CreateTipoGastoDto = {
                nombre_tipo: data.nombre_tipo.trim(),
                descripcion: data.descripcion?.trim() || '',
            };

            await createTipoGastoMutation.mutateAsync(tipoGastoData);

            toast({
                title: 'Éxito',
                description: 'Tipo de gasto creado correctamente',
            });

            reset();
            onSuccess?.();
        } catch (error) {
            console.error('Error al crear tipo de gasto:', error);
            toast({
                title: 'Error',
                description: 'Hubo un problema al crear el tipo de gasto',
                variant: 'destructive',
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="nombre_tipo">Nombre del tipo *</Label>
                <Input
                    id="nombre_tipo"
                    type="text"
                    {...register('nombre_tipo')}
                    disabled={isSubmitting}
                />
                {errors.nombre_tipo && (
                    <p className="text-sm text-red-500">{errors.nombre_tipo.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                    id="descripcion"
                    placeholder="Descripción del tipo de gasto (opcional)"
                    {...register('descripcion')}
                    disabled={isSubmitting}
                    rows={3}
                />
                {errors.descripcion && (
                    <p className="text-sm text-red-500">{errors.descripcion.message}</p>
                )}
            </div>

            <div className="flex gap-2 pt-4">
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                >
                    {isSubmitting ? 'Creando...' : 'Crear tipo de gasto'}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                )}
            </div>
        </form>
    );
};

export default CreateTipoGastoForm;
