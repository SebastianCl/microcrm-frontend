import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { dashboardStats, monthlyRevenue } from '@/lib/sample-data';
import { formatCurrency } from '@/lib/utils';
import RevenueChart from '@/components/charts/RevenueChart';

const Reports = () => {
  const invoiceStatusData = [
    { name: 'Pagado', value: dashboardStats.paidInvoices, color: '#10B981' },
    { name: 'Pendiente', value: dashboardStats.pendingAmount, color: '#F59E0B' },
    { name: 'Vencido', value: dashboardStats.overdueAmount, color: '#EF4444' },
  ];

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const currentMonth = new Date().getMonth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Informes</h1>
        <p className="text-muted-foreground mt-2">
          Informes financieros y análisis para tu negocio.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Distribución de estado de facturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={invoiceStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {invoiceStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Cantidad']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Ingresos totales</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardStats.totalRevenue)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total facturas</p>
                  <p className="text-2xl font-bold">{dashboardStats.invoiceCount.total}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Total clientes</p>
                  <p className="text-2xl font-bold">{dashboardStats.clientCount}</p>
                </div>                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Factura promedio</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(Math.round(dashboardStats.totalRevenue / dashboardStats.invoiceCount.total))}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Resumen mensual</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Ingresos para {monthNames[currentMonth]}:
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(monthlyRevenue[currentMonth % monthlyRevenue.length].revenue)}
                </p>

                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Desglose por Estado</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span className="text-sm">Pagado</span>
                      </div>
                      <span className="font-medium">{formatCurrency(dashboardStats.paidInvoices)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-sm">Pendiente</span>
                      </div>
                      <span className="font-medium">{formatCurrency(dashboardStats.pendingAmount)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span className="text-sm">Vencido</span>
                      </div>
                      <span className="font-medium">{formatCurrency(dashboardStats.overdueAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RevenueChart />
    </div>

  );
};

export default Reports;
