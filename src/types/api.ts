// Tipos para el manejo de las respuestas de la API

// ApiResponse genérico para envolver las respuestas
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Error personalizado para la API
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Estado de la petición
export enum RequestStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}
