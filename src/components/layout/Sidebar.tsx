
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Package, 
  Users, 
  UserCheck, 
  BarChart, 
  Table,
  LogOut,
  X
} from 'lucide-react';
import { PageType } from '@/components/Dashboard';

interface SidebarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ currentPage, setCurrentPage, isOpen, setIsOpen }: SidebarProps) => {
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { id: 'orders' as PageType, label: 'Pedidos', icon: Home },
    { id: 'products' as PageType, label: 'Productos', icon: Package },
    { id: 'customers' as PageType, label: 'Clientes', icon: Users },
    { id: 'employees' as PageType, label: 'Empleados', icon: UserCheck },
    { id: 'tables' as PageType, label: 'Mesas', icon: Table },
    { id: 'reports' as PageType, label: 'Reportes', icon: BarChart },
  ];

  const employeeMenuItems = [
    { id: 'orders' as PageType, label: 'Pedidos', icon: Home },
    { id: 'customers' as PageType, label: 'Clientes', icon: Users },
  ];

  const menuItems = user?.rol === 'admin' ? adminMenuItems : employeeMenuItems;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">Sistema POS</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* User info */}
          <div className="p-4 border-b border-gray-200">
            <div className="text-sm font-medium text-gray-800">{user?.nombre_usuario}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.rol}</div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentPage === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left",
                    currentPage === item.id && "bg-blue-600 text-white hover:bg-blue-700"
                  )}
                  onClick={() => {
                    setCurrentPage(item.id);
                    setIsOpen(false); // Close sidebar on mobile after selection
                  }}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={logout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
