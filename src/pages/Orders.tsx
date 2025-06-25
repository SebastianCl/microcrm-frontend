
import OrderList from '@/components/OrderList';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pedidos</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona todas tus pedidos de clientes.
          </p>
        </div>
        <Button
          onClick={() => navigate('/orders/new')}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Crear orden</span>
        </Button>
      </div>
      <OrderList showCreateButton={false} />
    </div>
  );
};

export default Orders;
