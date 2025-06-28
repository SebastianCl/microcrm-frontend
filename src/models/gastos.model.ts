export interface TipoGasto {
    id_tipo_gasto: number;
    nombre_tipo: string;
    descripcion: string;
}

export interface Gasto {
    id_gasto: number;
    descripcion: string;
    monto: string; // Viene como string del backend
    fecha: string; // ISO date string
    nombre_tipo: string;
    descripcion_tipo: string;
    nombre_usuario: string;
}

export interface CreateGastoDto {
    id_cliente: number;
    descripcion: string;
    monto: number;
    fecha: string;
    id_tipo_gasto: number;
}

export interface UpdateGastoDto {
    id_cliente?: number;
    descripcion?: string;
    monto?: number;
    fecha?: string;
    id_tipo_gasto?: number;
}
