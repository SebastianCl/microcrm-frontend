export interface ProductAddition {
  id: string;
  name: string;
  price: number;
  productId: string;
  productName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
