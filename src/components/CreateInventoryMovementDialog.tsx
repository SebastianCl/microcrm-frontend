import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TrendingUp, TrendingDown, ShoppingCart, AlertTriangle, Package } from 'lucide-react';
import { useCreateInventoryMovement } from '@/hooks/useInventoryMovements';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentDate } from '@/lib/utils';

const movementSchema = z.object({
    tipo_movimiento: z.enum(['entrada', 'salida'], {
        required_error: 'Debe seleccionar un tipo de movimiento',
    }),
    subtipo_salida: z.enum(['venta', 'dano', 'vencimiento', 'ajuste']).optional(),
    cantidad: z.string()
        .min(1, 'La cantidad es requerida')
        .refine((val) => {
            const num = parseInt(val);
            return !isNaN(num) && num > 0;
        }, 'La cantidad debe ser un número mayor a 0'),
    comentario: z.string()
        .min(1, 'El comentario es requerido')
        .max(255, 'El comentario no puede exceder 255 caracteres'),
    fecha: z.string()
        .min(1, 'La fecha es requerida'),
}).refine((data) => {
    // Si es salida, el subtipo_salida es requerido
    if (data.tipo_movimiento === 'salida' && !data.subtipo_salida) {
        return false;
    }
    return true;
}, {
    message: 'Debe seleccionar un motivo para la salida',
    path: ['subtipo_salida']
});

type MovementFormData = z.infer<typeof movementSchema>;

interface CreateInventoryMovementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: string;
    productName: string;
    currentStock: number;
}

const CreateInventoryMovementDialog = ({
    open,
    onOpenChange,
    productId,
    productName,
    currentStock
}: CreateInventoryMovementDialogProps) => {
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { user } = useAuth();
    const createMovementMutation = useCreateInventoryMovement();

    const form = useForm<MovementFormData>({
        resolver: zodResolver(movementSchema),
        defaultValues: {
            tipo_movimiento: undefined,
            subtipo_salida: undefined,
            cantidad: '',
            comentario: '',
            fecha: getCurrentDate(),
        },
    });

    const watchedTipoMovimiento = form.watch('tipo_movimiento');
    const watchedSubtipoSalida = form.watch('subtipo_salida');
    const watchedCantidad = form.watch('cantidad');

    const onSubmit = async (data: MovementFormData) => {
        setError(null);

        const cantidad = parseInt(data.cantidad);

        // Validaciones por roles
        if (user) {
            // Validar permisos para salidas según el rol
            if (data.tipo_movimiento === 'salida') {
                if (user.role === 'Collaborator') {
                    setError('Los colaboradores no pueden realizar salidas de inventario. Solo un administrador puede autorizar las salidas.');
                    return;
                }

                if (user.role === 'Viewer') {
                    setError('No tienes permisos para realizar movimientos de inventario.');
                    return;
                }

                // Validar subtipo de salida es requerido
                if (!data.subtipo_salida) {
                    setError('Debe seleccionar un motivo para la salida.');
                    return;
                }

                // Solo administradores pueden realizar salidas diferentes a ventas
                if (user.role !== 'Administrator' && data.subtipo_salida !== 'venta') {
                    setError('Solo los administradores pueden autorizar salidas por motivos diferentes a ventas.');
                    return;
                }
            }

            // Validar permisos para entradas
            if (data.tipo_movimiento === 'entrada') {
                if (user.role === 'Viewer') {
                    setError('Los visualizadores no pueden realizar movimientos de inventario.');
                    return;
                }
            }
        }

        // Validar que no se pueda sacar más stock del disponible
        if (data.tipo_movimiento === 'salida' && cantidad > currentStock) {
            setError(`No se puede realizar una salida de ${cantidad} unidades. Stock actual: ${currentStock}`);
            return;
        }

        try {
            await createMovementMutation.mutateAsync({
                id_producto: parseInt(productId),
                cantidad,
                tipo_movimiento: data.tipo_movimiento,
                subtipo_salida: data.subtipo_salida,
                comentario: data.comentario,
                fecha: data.fecha,
            });

            const tipoMovimientoText = data.tipo_movimiento === 'entrada' ? 'entrada' :
                `salida${data.subtipo_salida ? ` por ${data.subtipo_salida}` : ''}`;

            toast({
                title: 'Movimiento registrado',
                description: `Se ha registrado exitosamente el movimiento de ${tipoMovimientoText} de ${cantidad} unidades.`,
            });

            form.reset();
            onOpenChange(false);
        } catch (err: any) {
            setError(err.message || 'Error al registrar el movimiento');
        }
    };

    const handleClose = () => {
        form.reset({
            tipo_movimiento: undefined,
            subtipo_salida: undefined,
            cantidad: '',
            comentario: '',
            fecha: getCurrentDate(),
        });
        setError(null);
        onOpenChange(false);
    };

    const calculateNewStock = () => {
        if (!watchedTipoMovimiento || !watchedCantidad) return currentStock;

        const cantidad = parseInt(watchedCantidad);
        if (isNaN(cantidad)) return currentStock;

        return watchedTipoMovimiento === 'entrada'
            ? currentStock + cantidad
            : currentStock - cantidad;
    };

    const newStock = calculateNewStock();

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Registrar movimiento
                    </DialogTitle>
                    <DialogDescription>
                        Registra un movimiento de inventario para <strong>{productName}</strong>
                        <br />
                        <span className="text-sm text-muted-foreground">
                            Stock actual: {currentStock} unidades
                        </span>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="tipo_movimiento"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tipo de movimiento</FormLabel>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            // Limpiar subtipo cuando cambie el tipo
                                            if (value === 'entrada') {
                                                form.setValue('subtipo_salida', undefined);
                                            }
                                        }}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona el tipo de movimiento" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="entrada">
                                                <div className="flex items-center gap-2">
                                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                                    Entrada (Agregar stock)
                                                </div>
                                            </SelectItem>
                                            {/* Solo mostrar opción de salida si el usuario tiene permisos */}
                                            {user && user.role !== 'Collaborator' && (
                                                <SelectItem value="salida">
                                                    <div className="flex items-center gap-2">
                                                        <TrendingDown className="h-4 w-4 text-red-600" />
                                                        Salida (Reducir stock)
                                                    </div>
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                    {user && user.role === 'Collaborator' && (
                                        <p className="text-xs text-amber-600">
                                            Los colaboradores solo pueden registrar entradas de inventario
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        {/* Campo de subtipo de salida - solo se muestra cuando se selecciona "salida" */}
                        {watchedTipoMovimiento === 'salida' && (
                            <FormField
                                control={form.control}
                                name="subtipo_salida"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Motivo de la salida</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el motivo de la salida" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="venta">
                                                    <div className="flex items-center gap-2">
                                                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                                                        Venta
                                                    </div>
                                                </SelectItem>
                                                {/* Solo administradores pueden seleccionar otros motivos */}
                                                {user && user.role === 'Administrator' && (
                                                    <>
                                                        <SelectItem value="dano">
                                                            <div className="flex items-center gap-2">
                                                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                                                Daño/Deterioro
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="vencimiento">
                                                            <div className="flex items-center gap-2">
                                                                <Package className="h-4 w-4 text-orange-600" />
                                                                Vencimiento
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="ajuste">
                                                            <div className="flex items-center gap-2">
                                                                <TrendingDown className="h-4 w-4 text-purple-600" />
                                                                Ajuste de inventario
                                                            </div>
                                                        </SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        {user && user.role !== 'Administrator' && (
                                            <p className="text-xs text-amber-600">
                                                Solo los administradores pueden autorizar salidas diferentes a ventas
                                            </p>
                                        )}
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="cantidad"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cantidad</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            placeholder="Ingresa la cantidad"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    {watchedTipoMovimiento && watchedCantidad && (
                                        <div className="text-sm">
                                            <span className="text-muted-foreground">Nuevo stock: </span>
                                            <span className={`font-medium ${newStock < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {newStock} unidades
                                            </span>
                                        </div>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fecha"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fecha</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="comentario"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comentario</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe el motivo del movimiento."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {error && (
                            <Alert className="border-red-200">
                                <AlertDescription className="text-red-600">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={createMovementMutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={createMovementMutation.isPending}
                            >
                                {createMovementMutation.isPending && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Registrar movimiento
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateInventoryMovementDialog;
