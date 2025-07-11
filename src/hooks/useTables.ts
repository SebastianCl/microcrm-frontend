import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTables, createTable, updateTable, toggleTableStatus } from "../services/tableService";
import { useToast } from "@/components/ui/use-toast";

export const useTables = () => {
    return useQuery({
        queryKey: ["tables"],
        queryFn: getTables,
        staleTime: 0
    });
};

export const useCreateTable = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: createTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
            toast({
                title: "Mesa creada",
                description: "La mesa se ha creado exitosamente",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Error al crear la mesa",
                variant: "destructive",
            });
        }
    });
};

export const useUpdateTable = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: { nombre_mesa: string; activa?: boolean } }) => 
            updateTable(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
            toast({
                title: "Mesa actualizada",
                description: "La mesa se ha actualizado exitosamente",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Error al actualizar la mesa",
                variant: "destructive",
            });
        }
    });
};



export const useToggleTableStatus = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: toggleTableStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
            toast({
                title: "Estado actualizado",
                description: "El estado de la mesa se ha actualizado exitosamente",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message || "Error al actualizar el estado de la mesa",
                variant: "destructive",
            });
        }
    });
};
