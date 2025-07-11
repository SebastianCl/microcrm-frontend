// Modelo para la respuesta de la API (coincide con la estructura del backend)
export interface ApiProductAddition {
  id_adicion: number;
  id_producto: number;
  nombre: string;
  precio_extra: string;
  estado: boolean;
}

// Respuestas específicas de la API
export interface CreateAdditionResponse {
  message: string;
  ProductAdditionId: number;
}

export interface ToggleStatusResponse {
  message: string;
}

export interface UpdateAdditionResponse {
  message: string;
}

// Modelo para uso interno del frontend
export interface ProductAddition {
  id: string;
  name: string;
  price: number;
  productId: string;
  productName?: string;
  isActive: boolean;
}

// DTOs para las operaciones de la API
export interface CreateProductAdditionDto {
  id_producto: number;
  nombre: string;
  precio_extra: number;
}

export interface UpdateProductAdditionDto {
  id_producto: number;
  nombre: string;
  precio_extra: number;
}

// DTOs para uso interno del frontend
export interface CreateProductAdditionData {
  name: string;
  price: number;
  productId: string;
}

export interface UpdateProductAdditionData {
  name?: string;
  price?: number;
  productId?: string;
  isActive?: boolean;
}
