import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  BarChart4,
  Settings as SettingsIcon,
  ShoppingCart
} from 'lucide-react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed = false }) => {
  const { user } = useAuth();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const allLinks = [
    { path: '/', label: 'Panel', icon: <LayoutDashboard size={20} />, roles: ['Administrator'] },
    { path: '/orders', label: 'Pedidos', icon: <ShoppingCart size={20} />, roles: ['Administrator', 'Collaborator'] },
    //{ path: '/invoices', label: 'Facturas', icon: <Receipt size={20} />, roles: ['Administrator', 'Collaborator'] },
    { path: '/clients', label: 'Clientes', icon: <Users size={20} />, roles: ['Administrator', 'Collaborator'] },
    { path: '/inventory', label: 'Inventario', icon: <Package size={20} />, roles: ['Administrator'] },
    //{ path: '/users', label: 'Usuarios', icon: <Users size={20} />, roles: ['Administrator'] },
    { path: '/reports', label: 'Informes', icon: <BarChart4 size={20} />, roles: ['Administrator'] },
    //{ path: '/settings', label: 'Configuración', icon: <SettingsIcon size={20} />, roles: ['Administrator'] }
  ];

  const filteredLinks = allLinks.filter(link =>
    user && link.roles.includes(user.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-full flex flex-col pt-6 bg-white border-r shadow-sm dark:bg-slate-900 dark:border-slate-700">
      <div className={`mx-4 mb-8 ${collapsed ? 'text-center' : ''}`}>
        {collapsed ? (
          <div className="flex justify-center">
            <Logo size="small" className="flex-col items-center" />
          </div>
        ) : (
          <Logo />
        )}
      </div>
      {/* Scrollable NavLinks */}
      <div className="flex-grow overflow-y-auto space-y-1 px-3">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md text-sm transition-colors ${collapsed ? 'justify-center' : ''} ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-sky-400'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground dark:hover:bg-slate-700 dark:hover:text-slate-200'
              }`
            }
            end={link.path === '/'}
            title={collapsed ? link.label : undefined}
          >
            <span className={!collapsed ? 'mr-3' : ''}>{link.icon}</span>
            {!collapsed && <span className="truncate">{link.label}</span>}
          </NavLink>
        ))}
      </div>
      {/* Fixed Logout Button at the bottom */}
      <div className={`mt-auto px-3 pt-3 pb-3 ${!collapsed ? 'border-t border-border dark:border-slate-700' : ''}`}>
        <button
          onClick={handleLogout}
          title="Cerrar Sesión"
          className={`flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className={`${!collapsed ? 'mr-3' : ''} h-5 w-5`} />
          {!collapsed && <span className="truncate">Cerrar Sesión</span>}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
