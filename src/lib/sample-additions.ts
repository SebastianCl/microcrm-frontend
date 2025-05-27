
import { SAMPLE_INVENTORY } from "@/components/InventoryList";

export interface ProductAddition {
  id: string;
  name: string;
  price: number;
}

// Map of product ID to available additions
export const PRODUCT_ADDITIONS: Record<string, ProductAddition[]> = {
  // Food items
  "1": [
    { id: "add-001", name: "Queso", price: 3000 },
    { id: "add-002", name: "Tocineta", price: 5000 },
    { id: "add-003", name: "Aguacate", price: 4000 }
  ],
  "2": [
    { id: "add-004", name: "Chips de Chocolate", price: 3000 },
    { id: "add-005", name: "Crema vainilla", price: 2000 },
    { id: "add-006", name: "Fruta", price: 5000 }
  ],
  "5": [
    { id: "add-007", name: "Caramelo", price: 2000 },
    { id: "add-008", name: "Mora", price: 4000 },
    { id: "add-009", name: "Jarabe de vainilla", price: 3000 }
  ]
};

// Helper function to check if a product has available additions
export const productHasAdditions = (productId: string): boolean => {
  return !!PRODUCT_ADDITIONS[productId] && PRODUCT_ADDITIONS[productId].length > 0;
};

// Helper function to get additions for a product
export const getProductAdditions = (productId: string): ProductAddition[] => {
  return PRODUCT_ADDITIONS[productId] || [];
};
