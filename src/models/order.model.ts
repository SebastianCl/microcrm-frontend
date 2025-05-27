
export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  status: 'pending' | 'processed' | 'canceled' | 'completed';
  items: OrderItem[];
  total: number;
  tableNumber?: number; // Optional table number
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  additions?: Addition[];
}

export interface Addition {
  id: string;
  name: string;
  price: number;
}
