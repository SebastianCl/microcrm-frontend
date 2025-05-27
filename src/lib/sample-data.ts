export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  totalBilled: number;
  invoiceCount: number;
  status: 'active' | 'inactive';
}

export interface Invoice {
  id: string;
  clientId: string;
  client: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  items: InvoiceItem[];
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

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
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Administrator' | 'Collaborator' | 'Viewer';
  status: 'Active' | 'Inactive';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export const clients: Client[] = [
  {
    id: 'client-001',
    name: 'John Smith',
    email: 'john@techcorp.com',
    company: 'Tech Corp',
    phone: '(555) 123-4567',
    totalBilled: 12500,
    invoiceCount: 5,
    status: 'active',
  },
  {
    id: 'client-002',
    name: 'Sarah Johnson',
    email: 'sarah@innovate.io',
    company: 'Innovate IO',
    phone: '(555) 234-5678',
    totalBilled: 8750,
    invoiceCount: 3,
    status: 'active',
  },
  {
    id: 'client-003',
    name: 'David Williams',
    email: 'david@nextstep.co',
    company: 'NextStep Co',
    phone: '(555) 345-6789',
    totalBilled: 15200,
    invoiceCount: 7,
    status: 'active',
  },
  {
    id: 'client-004',
    name: 'Emily Brown',
    email: 'emily@designhub.net',
    company: 'DesignHub',
    phone: '(555) 456-7890',
    totalBilled: 4200,
    invoiceCount: 2,
    status: 'inactive',
  },
  {
    id: 'client-005',
    name: 'Michael Jones',
    email: 'michael@webfront.dev',
    company: 'WebFront',
    phone: '(555) 567-8901',
    totalBilled: 9800,
    invoiceCount: 4,
    status: 'active',
  },
];

export const invoices: Invoice[] = [
  {
    id: 'INV-001',
    clientId: 'client-001',
    client: 'Tech Corp',
    amount: 2500,
    date: '2025-04-15',
    dueDate: '2025-04-30',
    status: 'paid',
    items: [
      {
        description: 'Web Development Services',
        quantity: 1,
        rate: 2500,
        amount: 2500,
      },
    ],
  },
  {
    id: 'INV-002',
    clientId: 'client-002',
    client: 'Innovate IO',
    amount: 3500,
    date: '2025-04-20',
    dueDate: '2025-05-05',
    status: 'pending',
    items: [
      {
        description: 'UI/UX Design',
        quantity: 1,
        rate: 2000,
        amount: 2000,
      },
      {
        description: 'Frontend Implementation',
        quantity: 1,
        rate: 1500,
        amount: 1500,
      },
    ],
  },
  {
    id: 'INV-003',
    clientId: 'client-003',
    client: 'NextStep Co',
    amount: 1800,
    date: '2025-04-05',
    dueDate: '2025-04-20',
    status: 'overdue',
    items: [
      {
        description: 'Consulting Services',
        quantity: 3,
        rate: 600,
        amount: 1800,
      },
    ],
  },
  {
    id: 'INV-004',
    clientId: 'client-001',
    client: 'Tech Corp',
    amount: 3200,
    date: '2025-04-25',
    dueDate: '2025-05-10',
    status: 'pending',
    items: [
      {
        description: 'Server Maintenance',
        quantity: 1,
        rate: 1500,
        amount: 1500,
      },
      {
        description: 'Security Audit',
        quantity: 1,
        rate: 1700,
        amount: 1700,
      },
    ],
  },
  {
    id: 'INV-005',
    clientId: 'client-005',
    client: 'WebFront',
    amount: 4500,
    date: '2025-04-10',
    dueDate: '2025-04-25',
    status: 'paid',
    items: [
      {
        description: 'E-commerce Implementation',
        quantity: 1,
        rate: 4500,
        amount: 4500,
      },
    ],
  },
];

export const monthlyRevenue = [
  { month: 'Jan', revenue: 8500 },
  { month: 'Feb', revenue: 7200 },
  { month: 'Mar', revenue: 9300 },
  { month: 'Apr', revenue: 12500 },
  { month: 'May', revenue: 11000 },
  { month: 'Jun', revenue: 13500 },
];

export const dashboardStats = {
  totalRevenue: 42000,
  paidInvoices: 25800,
  pendingAmount: 12400,
  overdueAmount: 3800,
  invoiceCount: {
    total: 15,
    paid: 8,
    pending: 5,
    overdue: 2
  },
  clientCount: 5
};

export const orders: Order[] = [
  {
    id: 'ORD-001',
    clientId: 'client-001',
    clientName: 'Tech Corp',
    date: '2025-05-01',
    status: 'completed',
    items: [
      {
        productId: '1',
        name: 'Laptop Dell XPS 13',
        quantity: 2,
        price: 3000000,
        total: 6000000
      }
    ],
    total: 6000000
  },
  {
    id: 'ORD-002',
    clientId: 'client-002',
    clientName: 'Innovate IO',
    date: '2025-05-05',
    status: 'pending',
    items: [
      {
        productId: '3',
        name: 'Teclado Mecánico Logitech',
        quantity: 5,
        price: 500000,
        total: 1500000
      }
    ],
    total: 1500000
  },
  {
    id: 'ORD-003',
    clientId: 'client-003',
    clientName: 'NextStep Co',
    date: '2025-05-08',
    status: 'processed',
    items: [
      {
        productId: '4',
        name: 'Auriculares Sony WH-1000XM4',
        quantity: 3,
        price: 349.99,
        total: 1049.97
      },
      {
        productId: '6',
        name: 'Ratón Logitech MX Master 3',
        quantity: 3,
        price: 99.99,
        total: 299.97
      }
    ],
    total: 1349.94
  },
  {
    id: 'ORD-004',
    clientId: 'client-005',
    clientName: 'WebFront',
    date: '2025-05-10',
    status: 'canceled',
    items: [
      {
        productId: '7',
        name: 'iPad Pro 12.9"',
        quantity: 1,
        price: 999.99,
        total: 999.99
      }
    ],
    total: 999.99
  }
];

export const users: User[] = [
  {
    id: 'user-001',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Administrator',
    status: 'Active',
    createdAt: '2023-01-01T10:00:00Z',
    lastLogin: '2023-05-15T08:30:00Z'
  },
  {
    id: 'user-002',
    name: 'John Editor',
    email: 'john@example.com',
    role: 'Collaborator',
    status: 'Active',
    createdAt: '2023-02-15T14:30:00Z',
    lastLogin: '2023-05-14T16:45:00Z'
  },
  {
    id: 'user-003',
    name: 'Maria Viewer',
    email: 'maria@example.com',
    role: 'Viewer',
    status: 'Active',
    createdAt: '2023-03-10T09:15:00Z',
    lastLogin: '2023-05-10T11:20:00Z'
  },
  {
    id: 'user-004',
    name: 'Carlos Collaborator',
    email: 'carlos@example.com',
    role: 'Collaborator',
    status: 'Inactive',
    createdAt: '2023-01-20T16:00:00Z',
    lastLogin: '2023-04-05T14:30:00Z'
  }
];
