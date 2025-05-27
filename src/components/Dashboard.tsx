
import React from 'react';
import { PiggyBank, CreditCard, AlertCircle } from 'lucide-react';
import StatCard from './stats/StatCard';
import RevenueChart from './charts/RevenueChart';
import InvoiceList from './InvoiceList';
import ClientList from './ClientList';
import { dashboardStats } from '@/lib/sample-data';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido a tu panel de facturación. Aquí tienes un resumen de tus finanzas.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos Totales"
          value={`$${dashboardStats.totalRevenue.toLocaleString()}`}
          icon={<PiggyBank />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Facturas Pagadas"
          value={`$${dashboardStats.paidInvoices.toLocaleString()}`}
          icon={<CreditCard />}
          description={`${dashboardStats.invoiceCount.paid} facturas`}
        />
        <StatCard
          title="Cantidad Pendiente"
          value={`$${dashboardStats.pendingAmount.toLocaleString()}`}
          icon={<CreditCard />}
          description={`${dashboardStats.invoiceCount.pending} facturas`}
        />
        <StatCard
          title="Cantidad Vencida"
          value={`$${dashboardStats.overdueAmount.toLocaleString()}`}
          icon={<AlertCircle />}
          description={`${dashboardStats.invoiceCount.overdue} facturas`}
          trend={{ value: 5, isPositive: false }}
        />
      </div>

      <RevenueChart />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoiceList limit={5} showCreateButton={false} />
        <ClientList limit={5} showCreateButton={false} />
      </div>
    </div>
  );
};

export default Dashboard;
