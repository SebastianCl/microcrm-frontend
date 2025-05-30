export interface Client {
  id_cliente: number;
  nombre: string;
  correo: string;
  telefono: string;
  estado: boolean;
  company?: string; // Mantenido como opcional por si se usa en otros contextos
}