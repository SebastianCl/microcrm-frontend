import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { categoryService } from '@/services/categoryService';
import { Category, ApiCategory } from '@/models/category.model';
import { getCurrentTimestamp } from '@/lib/utils';

// Función utilitaria para convertir ApiCategory a Category
const mapApiCategoryToCategory = (apiCategory: ApiCategory): Category => ({
  id: apiCategory.id_categoria.toString(),
  name: apiCategory.nombre_categoria,
  description: '', // La API no maneja descripción por ahora
  isActive: true, // Asumimos que todas están activas por defecto
  createdAt: getCurrentTimestamp(),
  updatedAt: getCurrentTimestamp(),
});

export const useCategories = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Función genérica para mostrar toast de éxito
  const showSuccessToast = useCallback((title: string, description: string) => {
    toast({
      title,
      description,
    });
  }, [toast]);

  // Función genérica para mostrar toast de error
  const showErrorToast = useCallback((title: string, description: string) => {
    toast({
      title,
      description,
      variant: "destructive",
    });
  }, [toast]);

  // Obtener todas las categorías
  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const apiCategories = await categoryService.getCategories();
      const mappedCategories = apiCategories.map(mapApiCategoryToCategory);
      setCategories(mappedCategories);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
      showErrorToast('Error', 'No se pudieron cargar las categorías');
    } finally {
      setIsLoading(false);
    }
  }, [showErrorToast]);

  // Crear nueva categoría
  const createCategory = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      const response = await categoryService.createCategory({
        nombre_categoria: name
      });
      
      // Crear la nueva categoría con el ID recibido
      const newCategory: Category = {
        id: response.id.toString(),
        name: name,
        description: '',
        isActive: true,
        createdAt: getCurrentTimestamp(),
        updatedAt: getCurrentTimestamp(),
      };

      setCategories(prev => [...prev, newCategory]);
      showSuccessToast('Categoría creada', response.message);
      return true;
    } catch (error) {
      console.error('Error al crear categoría:', error);
      showErrorToast('Error', 'No se pudo crear la categoría');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccessToast, showErrorToast]);

  // Actualizar categoría
  const updateCategory = useCallback(async (categoryId: string, name: string) => {
    setIsLoading(true);
    try {
      const response = await categoryService.updateCategory(
        parseInt(categoryId),
        { nombre_categoria: name }
      );

      setCategories(prev => prev.map(category =>
        category.id === categoryId
          ? { ...category, name, updatedAt: getCurrentTimestamp() }
          : category
      ));

      showSuccessToast('Categoría actualizada', response.message);
      return true;
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      showErrorToast('Error', 'No se pudo actualizar la categoría');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [showSuccessToast, showErrorToast]);

  // Eliminar categoría (simulado localmente ya que no hay endpoint)
  const deleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(category => category.id !== categoryId));
    showSuccessToast('Categoría eliminada', 'Categoría eliminada exitosamente');
  }, [showSuccessToast]);

  // Cambiar estado de categoría (simulado localmente)
  const toggleCategoryStatus = useCallback((categoryId: string) => {
    setCategories(prev => prev.map(category =>
      category.id === categoryId
        ? { ...category, isActive: !category.isActive, updatedAt: getCurrentTimestamp() }
        : category
    ));
    
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      showSuccessToast(
        'Estado actualizado', 
        `Categoría "${category.name}" ${category.isActive ? 'desactivada' : 'activada'}`
      );
    }
  }, [categories, showSuccessToast]);

  return {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    showSuccessToast,
    showErrorToast,
  };
};
