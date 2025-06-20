import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer, FileText, Mail } from 'lucide-react';
import { invoices } from '@/lib/sample-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

const InvoiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Find the invoice by ID
  const invoice = invoices.find(inv => inv.id === id);
  
  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-bold">Factura No Encontrada</h2>
        <p className="text-muted-foreground mt-2">La factura que estás buscando no existe.</p>
        <Button onClick={() => navigate('/invoices')} className="mt-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Volver a Facturas
        </Button>
      </div>
    );
  }
  
  const getStatusBadge = (status: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Pagada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Vencida</Badge>;
    }
  };
  
  // Calculate totals
  const subtotal = invoice.items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.1; // Assuming 10% tax rate
  const total = subtotal + tax;
  
  // Format dates
  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM dd, yyyy');
    } catch (e) {
      return dateStr;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => navigate('/invoices')}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Factura {invoice.id}</h1>
          {getStatusBadge(invoice.status)}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Correo
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Descargar PDF
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-1">DE</h3>
            <p className="text-muted-foreground">Nombre De Tu Empresa</p>
            <p className="text-muted-foreground">123 Calle Empresarial</p>
            <p className="text-muted-foreground">Nueva York, NY 10001</p>
            <p className="text-muted-foreground">contacto@tuempresa.com</p>
          </div>
          
          <div className="mt-6 md:mt-0">
            <h3 className="text-lg font-semibold mb-1">PARA</h3>
            <p>{invoice.client}</p>
            <p className="text-muted-foreground">Dirección del Cliente</p>
            <p className="text-muted-foreground">Ciudad, Estado C.P.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <h4 className="font-semibold text-muted-foreground text-sm mb-1">Número de Factura</h4>
            <p>{invoice.id}</p>
          </div>
          <div>
            <h4 className="font-semibold text-muted-foreground text-sm mb-1">Fecha de Emisión</h4>
            <p>{formatDate(invoice.date)}</p>
          </div>
          <div>
            <h4 className="font-semibold text-muted-foreground text-sm mb-1">Fecha de Vencimiento</h4>
            <p>{formatDate(invoice.dueDate)}</p>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <table className="w-full mb-6">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 font-medium text-muted-foreground">Descripción</th>
              <th className="text-center py-3 font-medium text-muted-foreground">Cantidad</th>
              <th className="text-right py-3 font-medium text-muted-foreground">Tarifa</th>
              <th className="text-right py-3 font-medium text-muted-foreground">Importe</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (              <tr key={index} className="border-b">
                <td className="py-3 text-left">{item.description}</td>
                <td className="py-3 text-center">{item.quantity}</td>
                <td className="py-3 text-right">{formatCurrency(item.rate)}</td>
                <td className="py-3 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="flex justify-end">          <div className="w-full md:w-72">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Impuesto (10%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between py-2 font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="text-center text-muted-foreground">
          <p>¡Gracias por su negocio!</p>
          <p>El pago vence el {formatDate(invoice.dueDate)}</p>
        </div>
      </Card>
    </div>
  );
};

export default InvoiceDetail;
