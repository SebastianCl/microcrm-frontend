export interface User {
  id_usuario: number;
  nombre_usuario: string;
  rol: 'admin' | 'empleado';
  estado: boolean;
}