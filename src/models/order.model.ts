export interface Order {
  id_pedido: string;
  fecha: string;
  tipo_pedido: string;
  estado: "Pendiente" | "Cancelado" | "Entregado" | "Finalizado";
  nombre_mesa?: string;
  nombre_cliente: string;
  correo_cliente?: string;
  nombre_usuario?: string;
  total_pedido?: string;
  id_venta?: number;
  observacion_pedido?: string;
  medio_pago?: string;
}

export interface OrderItem {
  id_detalle_pedido?: number;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
  discount?: number;
  discountType?: string;
  additions?: Addition[];
  observacion?: string;
}

export interface Addition {
  id: string;
  name: string;
  price: number;
  quantity: number;
}
