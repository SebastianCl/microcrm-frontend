export interface Order {
  id_pedido: string;
  fecha: string;
  tipo_pedido: string;
  estado: "Pendiente" | "Cancelado" | "Preparando" | "Entregado" | "Finalizado";
  nombre_mesa?: string;
  nombre_cliente: string;
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
  quantity: number; // Añadido para la cantidad de la adición
}
