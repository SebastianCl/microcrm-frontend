// Configuración centralizada para la API
export const API_CONFIG = {
  BASE_URL: import.meta.env.BACKEND_API_URL || 'http://localhost:3000/api',
  ENDPOINTS: {
    AUTH: '/auth',
    INVOICES: '/factura',
    CLIENTS: '/clients',
    ORDERS: '/pedido',
    INVENTORY: '/inventory',
    USERS: '/users',
    GASTOS: '/expenses',
    TIPOS_GASTO: '/type-of-expense',
    ADDITIONS: '/additions',
    CATEGORIES: '/categories',
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  TIMEOUT: 15000, // 15 segundos
};
