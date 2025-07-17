
export type UserRole = 'admin' | 'empleado';

export interface User {
  id_usuario: number;
  nombre_usuario: string;
  rol: UserRole;
  estado: boolean;
}

export interface CreateUserDto {
  id_client: number;
  username: string;
  password: string;
  rol: UserRole;
}

export interface UpdateUserDto {
  nombre_usuario?: string;
  rol?: UserRole;
  estado?: boolean;
}

export interface ResetPasswordDto {
  newPassword: string;
}
