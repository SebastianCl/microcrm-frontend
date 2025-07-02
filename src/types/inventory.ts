export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  categoryId?: number;
  price: number;
  stockQuantity: number;
  status: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  lastUpdated?: string;
  managesInventory: boolean;
  isActive: boolean;
}

export interface InventoryMovement {
  id_producto: number;
  cantidad: number;
  fecha: string;
  tipo_movimiento: 'entrada' | 'salida';
  subtipo_salida?: 'venta' | 'dano' | 'vencimiento' | 'ajuste';
  comentario: string;
}
