import React, { useState } from 'react';
import { Tag, Edit, Trash2 } from 'lucide-react';
import { Category } from '@/models/category.model';
import { useConfiguration, useConfigurationValidation } from '@/hooks/useConfiguration';
import ConfigurationTable from './ConfigurationTable';
import ConfigurationFormDialog from './ConfigurationFormDialog';

const CategoriesManager: React.FC = () => {
  const { isLoading, showSuccessToast, showErrorToast, simulateApiCall } = useConfiguration();
  const { validateRequired, validateUniqueName } = useConfigurationValidation();
  
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Bebidas',
      description: 'Bebidas frías y calientes',
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      name: 'Comida Rápida',
      description: 'Hamburguesas, hot dogs, papas fritas',
      isActive: true,
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '3',
      name: 'Postres',
      description: 'Postres y dulces',
      isActive: false,
      createdAt: '2024-01-15T11:00:00Z',
      updatedAt: '2024-01-15T11:00:00Z'
    }
  ]);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleFormDataChange = (data: Record<string, string>) => {
    setFormData({
      name: data.name || '',
      description: data.description || ''
    });
  };

  const formFields = [
    {
      key: 'name',
      label: 'Nombre',
      type: 'text' as const,
      placeholder: 'ej: Bebidas, Comida Rápida, Postres',
      required: true
    },
    {
      key: 'description',
      label: 'Descripción',
      type: 'textarea' as const,
      placeholder: 'Describe brevemente esta categoría',
      rows: 3
    }
  ];

  const columns = [
    { key: 'name', header: 'Nombre', className: 'font-medium' },
    { 
      key: 'description', 
      header: 'Descripción',
      className: 'max-w-xs',
      render: (value: string) => value ? (
        <span className="text-sm text-muted-foreground">{value}</span>
      ) : (
        <span className="text-muted-foreground italic">Sin descripción</span>
      )
    },
    { key: 'isActive', header: 'Estado' },
    { key: 'createdAt', header: 'Creada' },
    { key: 'updatedAt', header: 'Actualizada' }
  ];

  const validateForm = () => {
    const nameError = validateRequired(formData.name, 'Nombre');
    if (nameError) {
      showErrorToast('Error', nameError);
      return false;
    }

    const uniqueError = validateUniqueName(formData.name, categories, selectedCategory?.id);
    if (uniqueError) {
      showErrorToast('Error', uniqueError);
      return false;
    }

    return true;
  };

  const handleCreateCategory = () => {
    if (!validateForm()) return;

    simulateApiCall(() => {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCategories([...categories, newCategory]);
      setFormData({ name: '', description: '' });
      setIsCreateDialogOpen(false);
      showSuccessToast('Categoría creada', `Categoría "${formData.name}" creada exitosamente`);
    });
  };

  const handleEditCategory = () => {
    if (!selectedCategory || !validateForm()) return;

    simulateApiCall(() => {
      const updatedCategories = categories.map(category => 
        category.id === selectedCategory.id 
          ? { 
              ...category, 
              name: formData.name, 
              description: formData.description,
              updatedAt: new Date().toISOString()
            }
          : category
      );

      setCategories(updatedCategories);
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '' });
      showSuccessToast('Categoría actualizada', `Categoría "${formData.name}" actualizada exitosamente`);
    });
  };

  const handleDeleteCategory = (category: Category) => {
    simulateApiCall(() => {
      setCategories(categories.filter(c => c.id !== category.id));
      showSuccessToast('Categoría eliminada', 'Categoría eliminada exitosamente');
    });
  };

  const toggleCategoryStatus = (category: Category) => {
    simulateApiCall(() => {
      const updatedCategories = categories.map(c => 
        c.id === category.id 
          ? { ...c, isActive: !c.isActive, updatedAt: new Date().toISOString() }
          : c
      );
      setCategories(updatedCategories);
      showSuccessToast('Estado actualizado', `Categoría "${category.name}" ${category.isActive ? 'desactivada' : 'activada'}`);
    });
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const actions = [
    {
      label: 'Editar',
      icon: <Edit size={14} />,
      onClick: openEditDialog
    },
    {
      label: 'Cambiar estado',
      onClick: toggleCategoryStatus
    },
    {
      label: 'Eliminar',
      icon: <Trash2 size={14} />,
      variant: 'destructive' as const,
      onClick: handleDeleteCategory
    }
  ];

  return (
    <>
      <ConfigurationTable
        title="Gestión de categorías"
        description="Administra las categorías de productos disponibles en el sistema."
        icon={<Tag size={20} />}
        data={categories}
        columns={columns}
        actions={actions}
        onAdd={() => setIsCreateDialogOpen(true)}
        addButtonLabel="Crear categoría"
        isLoading={isLoading}
      />

      <ConfigurationFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        title="Crear Nueva categoría"
        description="Completa la información para crear una nueva categoría de productos."
        fields={formFields}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleCreateCategory}
        submitLabel="Crear categoría"
        isLoading={isLoading}
      />

      <ConfigurationFormDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        title="Editar categoría"
        description="Modifica la información de la categoría seleccionada."
        fields={formFields}
        formData={formData}
        onFormDataChange={handleFormDataChange}
        onSubmit={handleEditCategory}
        submitLabel="Guardar cambios"
        isLoading={isLoading}
      />
    </>
  );
};

export default CategoriesManager;
