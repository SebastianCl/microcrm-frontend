
import React from 'react';
import { PiggyBank, CreditCard, AlertCircle, ShoppingCart, BarChart4, Package, Users, Receipt } from 'lucide-react';
import StatCard from './stats/StatCard';
import InvoiceList from './InvoiceList';
import ClientList from './ClientList';
import { dashboardStats } from '@/lib/sample-data';
import QuickActionCard from './dashboard/QuickActionCard';
import { formatCurrency } from '@/lib/utils';

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido. Realiza acciones rápidas o revisa el estado de tu negocio.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <QuickActionCard
            title="Crear Pedido"
            description="Inicia un nuevo pedido para un cliente."
            icon={<ShoppingCart className="h-6 w-6 text-muted-foreground" />}
            href="/orders/new"
          />
          {/*<QuickActionCard
            title="Ver Facturas"
            description="Consulta y gestiona tus facturas."
            icon={<Receipt className="h-6 w-6 text-muted-foreground" />}
            href="/invoices"
          />*/}
          <QuickActionCard
            title="Gestionar Clientes"
            description="Añade o edita la información de tus clientes."
            icon={<Users className="h-6 w-6 text-muted-foreground" />}
            href="/clients"
          />
          <QuickActionCard
            title="Gestionar Inventario"
            description="Controla el stock de tus productos."
            icon={<Package className="h-6 w-6 text-muted-foreground" />}
            href="/inventory"
          />
          <QuickActionCard
            title="Ver Informes"
            description="Analiza las ventas y el rendimiento."
            icon={<BarChart4 className="h-6 w-6 text-muted-foreground" />}
            href="/reports"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Resumen Financiero</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">          <StatCard
          title="Ingresos Totales"
          value={formatCurrency(dashboardStats.totalRevenue)}
          icon={<PiggyBank />}
          trend={{ value: 12, isPositive: true }}
        />
          <StatCard
            title="Facturas Pagadas"
            value={formatCurrency(dashboardStats.paidInvoices)}
            icon={<CreditCard />}
            description={`${dashboardStats.invoiceCount.paid} facturas`}
          />
          <StatCard
            title="Cantidad Pendiente"
            value={formatCurrency(dashboardStats.pendingAmount)}
            icon={<CreditCard />}
            description={`${dashboardStats.invoiceCount.pending} facturas`}
          />
          <StatCard
            title="Cantidad Vencida"
            value={formatCurrency(dashboardStats.overdueAmount)}
            icon={<AlertCircle />}
            description={`${dashboardStats.invoiceCount.overdue} facturas`}
            trend={{ value: 5, isPositive: false }}
          />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
