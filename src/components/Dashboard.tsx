
import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ProductsPage from '@/components/pages/ProductsPage';
import OrdersPage from '@/components/pages/OrdersPage';
import CustomersPage from '@/components/pages/CustomersPage';
import EmployeesPage from '@/components/pages/EmployeesPage';
import ReportsPage from '@/components/pages/ReportsPage';
import TablesPage from '@/components/pages/TablesPage';
import { useAuth } from '@/contexts/AuthContext';

export type PageType = 'orders' | 'products' | 'customers' | 'employees' | 'reports' | 'tables';

const Dashboard = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('orders');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();

  const renderPage = () => {
    switch (currentPage) {
      case 'orders':
        return <OrdersPage />;
      case 'products':
        return <ProductsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'tables':
        return <TablesPage />;
      default:
        return <OrdersPage />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentPage={currentPage}
        />
        
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
