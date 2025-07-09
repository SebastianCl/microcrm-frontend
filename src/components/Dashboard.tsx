import { PiggyBank, CreditCard, AlertCircle, ShoppingCart, BarChart4, Package, Users, Receipt } from 'lucide-react';
import StatCard from './stats/StatCard';
import { useFinancialSummary } from '@/hooks/useFinancialSummary';
import QuickActionCard from './dashboard/QuickActionCard';
import { formatCurrency } from '@/lib/utils';

const Dashboard = () => {
  const { data: financialData, isLoading, error } = useFinancialSummary();
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de control</h1>
        <p className="text-muted-foreground mt-2">
          Bienvenido. Realiza acciones rápidas o revisa el estado de tu negocio.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <QuickActionCard
            title="Crear orden"
            description="Inicia una nueva orden"
            icon={<ShoppingCart className="h-6 w-6 text-muted-foreground" />}
            href="/orders/new"
          />
          <QuickActionCard
            title="Registrar gasto"
            description="Registra un nuevo gasto del negocio"
            icon={<CreditCard className="h-6 w-6 text-muted-foreground" />}
            href="/gastos"
          />
          <QuickActionCard
            title="Gestionar clientes"
            description="Añade o edita la información de tus clientes"
            icon={<Users className="h-6 w-6 text-muted-foreground" />}
            href="/clients"
          />
          <QuickActionCard
            title="Gestionar inventario"
            description="Controla el stock de tus productos"
            icon={<Package className="h-6 w-6 text-muted-foreground" />}
            href="/inventory"
          />
          <QuickActionCard
            title="Ver informes"
            description="Analiza las ventas y el rendimiento"
            icon={<BarChart4 className="h-6 w-6 text-muted-foreground" />}
            href="/reports"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Resumen financiero</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
            <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
          </div>
        ) : error ? (
          <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
            <p>Error al cargar el resumen financiero</p>
          </div>
        ) : financialData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              title="Total en ventas"
              value={formatCurrency(Number(financialData.total_venta) || 0)}
              icon={<PiggyBank />}
              description="Ingresos por ventas"
            />
            <StatCard
              title="Total en gastos"
              value={formatCurrency(Number(financialData.total_gastos) || 0)}
              icon={<CreditCard />}
              description="Gastos registrados"
            />
            <StatCard
              title="Ordenes pendientes"
              value={financialData.total_pen}
              icon={<AlertCircle />}
              description="Ordenes por procesar"
            />
          </div>
        ) : null}
      </div>

    </div>
  );
};

export default Dashboard;
