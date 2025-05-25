
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { PageType } from '@/components/Dashboard';

interface HeaderProps {
  toggleSidebar: () => void;
  currentPage: PageType;
}

const pageLabels: Record<PageType, string> = {
  orders: 'Gestión de Pedidos',
  products: 'Gestión de Productos',
  customers: 'Gestión de Clientes',
  employees: 'Gestión de Empleados',
  reports: 'Reportes y Análisis',
  tables: 'Gestión de Mesas',
};

const Header = ({ toggleSidebar, currentPage }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden mr-3"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="text-xl font-semibold text-gray-800">
            {pageLabels[currentPage]}
          </h2>
        </div>
        
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
