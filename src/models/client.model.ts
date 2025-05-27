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