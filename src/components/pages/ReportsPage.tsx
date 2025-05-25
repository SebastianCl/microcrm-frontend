
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, DollarSign, Package, Users, TrendingUp } from 'lucide-react';
import { useState } from 'react';

// Mock data for reports
const salesData = [
  { day: 'Lun', ventas: 450 },
  { day: 'Mar', ventas: 380 },
  { day: 'Mié', ventas: 520 },
  { day: 'Jue', ventas: 430 },
  { day: 'Vie', ventas: 680 },
  { day: 'Sáb', ventas: 920 },
  { day: 'Dom', ventas: 850 }
];

const topProducts = [
  { nombre: 'Hamburguesa Clásica', cantidad: 45, valor: 562.50 },
  { nombre: 'Pizza Margherita', cantidad: 32, valor: 480.00 },
  { nombre: 'Ensalada César', cantidad: 28, valor: 245.00 },
  { nombre: 'Papas Fritas', cantidad: 67, valor: 201.00 }
];

const orderTypeData = [
  { name: 'En Mesa', value: 65, color: '#8884d8' },
  { name: 'Para Llevar', value: 35, color: '#82ca9d' }
];

const ReportsPage = () => {
  const [period, setPeriod] = useState('week');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
            <SelectItem value="year">Este año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                <p className="text-2xl font-bold text-green-600">$4,287.50</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12.5%</span>
              <span className="text-sm text-gray-500 ml-1">vs semana anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pedidos</p>
                <p className="text-2xl font-bold">147</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8.2%</span>
              <span className="text-sm text-gray-500 ml-1">vs semana anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold">89</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+15.3%</span>
              <span className="text-sm text-gray-500 ml-1">vs semana anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Promedio</p>
                <p className="text-2xl font-bold">$29.17</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+3.8%</span>
              <span className="text-sm text-gray-500 ml-1">vs semana anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventas por Día</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
                <Bar dataKey="ventas" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tipos de Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Porcentaje']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {orderTypeData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Productos Más Vendidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{product.nombre}</p>
                    <p className="text-sm text-gray-600">{product.cantidad} unidades vendidas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${product.valor.toFixed(2)}</p>
                  <p className="text-sm text-gray-600">Total generado</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Export Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline">
          Exportar PDF
        </Button>
        <Button variant="outline">
          Exportar Excel
        </Button>
      </div>
    </div>
  );
};

export default ReportsPage;
