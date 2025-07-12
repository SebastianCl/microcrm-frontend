import { apiClient } from './apiClient';
import { 
  ApiCategory, 
  CreateCategoryRequest, 
  CreateCategoryResponse, 
  UpdateCategoryRequest, 
  UpdateCategoryResponse 
} from '@/models/category.model';

export const categoryService = {
  /**
   * Obtener todas las categorías
   */
  async getCategories(): Promise<ApiCategory[]> {
    return await apiClient.get<ApiCategory[]>('/categories');
  },

  /**
   * Crear una nueva categoría
   */
  async createCategory(categoryData: CreateCategoryRequest): Promise<CreateCategoryResponse> {
    return await apiClient.post<CreateCategoryResponse>('/categories', categoryData);
  },

  /**
   * Actualizar una categoría existente
   */
  async updateCategory(
    categoryId: number, 
    categoryData: UpdateCategoryRequest
  ): Promise<UpdateCategoryResponse> {
    return await apiClient.put<UpdateCategoryResponse>(`/categories/${categoryId}`, categoryData);
  },
};
