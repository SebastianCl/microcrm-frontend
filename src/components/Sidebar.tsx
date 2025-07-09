import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  BarChart4,
  Settings as SettingsIcon,
  ShoppingCart,
  User,
  ChevronUp,
  ChevronDown,
  CreditCard
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
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const allLinks = [
    { path: '/', label: 'Panel', icon: <LayoutDashboard size={20} />, roles: ['Administrator', 'Collaborator'] },
    { path: '/orders', label: 'Ordenes', icon: <ShoppingCart size={20} />, roles: ['Administrator', 'Collaborator'] },
    //{ path: '/invoices', label: 'Facturas', icon: <Receipt size={20} />, roles: ['Administrator', 'Collaborator'] },
    { path: '/gastos', label: 'Gastos', icon: <CreditCard size={20} />, roles: ['Administrator', 'Collaborator'] },
    { path: '/inventory', label: 'Inventario', icon: <Package size={20} />, roles: ['Administrator', 'Collaborator'] },
    //{ path: '/users', label: 'Usuarios', icon: <Users size={20} />, roles: ['Administrator'] },
    { path: '/clients', label: 'Clientes', icon: <Users size={20} />, roles: ['Administrator', 'Collaborator'] },
    { path: '/reports', label: 'Informes', icon: <BarChart4 size={20} />, roles: ['Administrator'] },
    //{ path: '/settings', label: 'Configuración', icon: <SettingsIcon size={20} />, roles: ['Administrator'] }
  ];

  const filteredLinks = allLinks.filter(link =>
    user && link.roles.includes(user.role)
  );

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    setShowUserMenu(false);
    logout();
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
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
              `flex items-center px-3 py-2 rounded-md text-sm transition-colors ${collapsed ? 'justify-center' : ''} ${isActive
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
      {/* Fixed User Menu at the bottom */}
      <div className={`mt-auto px-3 pt-3 pb-3 ${!collapsed ? 'border-t border-border dark:border-slate-700' : ''}`}>
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center w-full px-3 py-2 rounded-md text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 ${collapsed ? 'justify-center' : ''}`}
          >
            <User className={`${!collapsed ? 'mr-3' : ''} h-5 w-5`} />
            {!collapsed && (
              <>
                <span className="truncate flex-1 text-left">{user?.email?.split('@')[0] || 'Usuario'}</span>
                {showUserMenu ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </>
            )}
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className={`absolute ${collapsed ? 'left-full ml-2 bottom-0' : 'bottom-full mb-2'} bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-md shadow-lg py-1 ${collapsed ? 'w-48' : 'w-full'}`}>
              <div className="px-3 py-2 text-sm text-muted-foreground border-b border-border dark:border-slate-700">
                <div className="font-medium text-foreground">{user?.email?.split('@')[0] || 'Usuario'}</div>
                <div className="text-xs">{user?.email}</div>
                <div className="text-xs capitalize">{user?.role}</div>
              </div>
              <button
                onClick={handleLogoutClick}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}

          {/* Logout Confirmation Modal */}
          {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm mx-4">
                <h3 className="text-lg font-medium text-foreground mb-2">Confirmar cierre de sesión</h3>
                <p className="text-muted-foreground mb-6">¿Estás seguro de que quieres cerrar sesión?</p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={cancelLogout}
                    className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;
