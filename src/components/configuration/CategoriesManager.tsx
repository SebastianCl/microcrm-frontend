import React, { useState, useEffect } from 'react';
import { Tag, Edit } from 'lucide-react';
import { Category } from '@/models/category.model';
import { useCategories } from '@/hooks/useCategories';
import { useConfigurationValidation } from '@/hooks/useConfiguration';
import ConfigurationTable from './ConfigurationTable';
import ConfigurationFormDialog from './ConfigurationFormDialog';

const CategoriesManager: React.FC = () => {
  const {
    categories,
    isLoading,
    fetchCategories,
    createCategory,
    updateCategory,
    showErrorToast,
  } = useCategories();
  const { validateRequired, validateUniqueName } = useConfigurationValidation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
      required: true
    }
  ];

  const columns = [
    { key: 'name', header: 'Nombre', className: 'font-medium' }
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

  const handleCreateCategory = async () => {
    if (!validateForm()) return;

    const success = await createCategory(formData.name);
    if (success) {
      setFormData({ name: '', description: '' });
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditCategory = async () => {
    if (!selectedCategory || !validateForm()) return;

    const success = await updateCategory(selectedCategory.id, formData.name);
    if (success) {
      setIsEditDialogOpen(false);
      setSelectedCategory(null);
      setFormData({ name: '', description: '' });
    }
  };

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: ''
    });
    setIsEditDialogOpen(true);
  };

  const actions = [
    {
      label: 'Editar',
      icon: <Edit size={14} />,
      onClick: openEditDialog
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
        title="Crear nueva categoría"
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
