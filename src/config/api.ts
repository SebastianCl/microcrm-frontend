// Configuración centralizada para la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.BACKEND_API_URL || 'http://localhost:3000/api',
  ENDPOINTS: {
    AUTH: '/auth',
    INVOICES: '/invoices',
    CLIENTS: '/clients',
    ORDERS: '/pedido',
    INVENTORY: '/inventory',
    USERS: '/users',
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  TIMEOUT: 15000, // 15 segundos
};
