// Para la respuesta de la API
export interface ApiAddition {
  id_adicion: number;
  nombre: string;
  precio_extra: number;
  estado: boolean;
}

// Para la respuesta de detalle del producto (GET /products/{id})
export interface ApiProductDetail {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: string; // Viene como string de la API
  stock: number;
  estado: boolean;
}

export interface ApiProduct {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: string; // Viene como string de la API
  stock: number | null;
  maneja_inventario: boolean;
  estado: boolean;
  id_categoria: number;
  nombre_categoria: string;
  adiciones: ApiAddition[];
}

// Para uso interno en la aplicación, compatible con OrderItem y Addition existentes
export interface AppAddition {
  id: string; // Convertido a string
  name: string;
  price: number;
  isActive: boolean;
}

export interface AppProduct {
  id: string; // Convertido a string, productId en OrderItem es string
  name: string;
  description: string;
  price: number; // Convertido a number
  stockQuantity: number; // Calculado basado en stock y maneja_inventario
  managesInventory: boolean;
  isActive: boolean; // Basado en el campo estado de la API
  additions: AppAddition[];
  categoryId: number; // Añadido para la categoría
  categoryName: string; // Añadido para el nombre de la categoría
}
