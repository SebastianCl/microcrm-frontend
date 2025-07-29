import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Table, TrendingDownIcon, Plus, Tag, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

// Import components
import UsersManager from '@/components/configuration/UsersManager';
import TablesManager from '@/components/configuration/TablesManager';
import TiposGastoManager from '@/components/TiposGastoManager';
import CategoriesManager from '@/components/configuration/CategoriesManager';
import ProductAdditionsManager from '@/components/configuration/ProductAdditionsManager';

const Configuration: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // Solo los administradores pueden ver este módulo
  if (!user || user.role !== 'Administrator') {
    return <Navigate to="/" replace />;
  }

  const tabs = [
    {
      id: 'users',
      label: 'Usuarios',
      icon: <Users size={16} />,
      description: 'Gestionar usuarios del sistema',
      component: <UsersManager />
    },
    {
      id: 'tables',
      label: 'Mesas',
      icon: <Table size={16} />,
      description: 'Configurar mesas',
      component: <TablesManager />
    },
    {
      id: 'gastos',
      label: 'Tipos de gastos',
      icon: <TrendingDownIcon size={16} />,
      description: 'Definir tipos de gastos',
      component: <TiposGastoManager />
    },
    {
      id: 'categories',
      label: 'Categorías',
      icon: <Tag size={16} />,
      description: 'Gestionar categorías de productos',
      component: <CategoriesManager />
    },
    {
      id: 'additions',
      label: 'Adiciones',
      icon: <Plus size={16} />,
      description: 'Configurar adiciones para productos',
      component: <ProductAdditionsManager />
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Panel de configuración del sistema</CardTitle>
          <CardDescription>
            Gestiona todos los aspectos configurables del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                <div className="text-center py-4 border-b">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    {tab.icon}
                    <h2 className="text-xl font-semibold">{tab.label}</h2>
                  </div>
                  <p className="text-muted-foreground">{tab.description}</p>
                </div>
                {tab.component}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuration;
