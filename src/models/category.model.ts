export interface Category {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para la API
export interface ApiCategory {
  id_categoria: number;
  nombre_categoria: string;
}

export interface CreateCategoryRequest {
  nombre_categoria: string;
}

export interface CreateCategoryResponse {
  message: string;
  id: number;
}

export interface UpdateCategoryRequest {
  nombre_categoria: string;
}

export interface UpdateCategoryResponse {
  message: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  isActive?: boolean;
}
