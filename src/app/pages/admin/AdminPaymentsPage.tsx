/**
 * AdminPaymentsPage - Gestión de pagos del sistema
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Mock data
const mockPayments = [
  {
    id: '1',
    userId: 'u1',
    subscriptionId: 's1',
    amountClp: 15000,
    status: 'COMPLETED',
    paymentMethod: 'CARD',
    transactionId: 'TXN123456',
    processorResponse: 'approved',
    createdAt: '2024-01-15T10:30:00Z',
    completedAt: '2024-01-15T10:30:05Z',
  },
];

export function AdminPaymentsPage() {
  const [payments] = useState(mockPayments);
  const [openView, setOpenView] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<typeof mockPayments[0] | null>(null);

  const openViewDialog = (payment: typeof mockPayments[0]) => {
    setSelectedPayment(payment);
    setOpenView(payment.id);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      PENDING: 'secondary',
      COMPLETED: 'default',
      FAILED: 'destructive',
      REFUNDED: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia',
      CASH: 'Efectivo',
    };
    return labels[method] || method;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pagos del Sistema</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border mb-4 flex gap-4">
        <div className="flex-1">
          <Label>Estado</Label>
          <Select defaultValue="ALL">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="COMPLETED">Completado</SelectItem>
              <SelectItem value="FAILED">Fallido</SelectItem>
              <SelectItem value="REFUNDED">Reembolsado</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label>Método de Pago</Label>
          <Select defaultValue="ALL">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="CARD">Tarjeta</SelectItem>
              <SelectItem value="TRANSFER">Transferencia</SelectItem>
              <SelectItem value="CASH">Efectivo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Label>Usuario ID</Label>
          <Input placeholder="Buscar por usuario..." />
        </div>
        <div className="flex items-end">
          <Button variant="outline">Filtrar</Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Transacción</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Suscripción</TableHead>
              <TableHead>Monto</TableHead>
              <TableHead>Método</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-mono text-sm">{payment.transactionId}</TableCell>
                <TableCell>{payment.userId}</TableCell>
                <TableCell>{payment.subscriptionId}</TableCell>
                <TableCell className="font-medium">${payment.amountClp.toLocaleString()}</TableCell>
                <TableCell>{getPaymentMethodLabel(payment.paymentMethod)}</TableCell>
                <TableCell>{getStatusBadge(payment.status)}</TableCell>
                <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openViewDialog(payment)}>
                    Ver detalle
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog View */}
      <Dialog open={openView !== null} onOpenChange={(o) => !o && setOpenView(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalle del Pago</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">ID</Label>
                  <p className="font-medium">{selectedPayment.id}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Estado</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">ID Transacción</Label>
                <p className="font-mono text-sm">{selectedPayment.transactionId}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Usuario ID</Label>
                  <p>{selectedPayment.userId}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Suscripción ID</Label>
                  <p>{selectedPayment.subscriptionId}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Monto</Label>
                  <p className="font-semibold text-lg">${selectedPayment.amountClp.toLocaleString()} CLP</p>
                </div>
                <div>
                  <Label className="text-gray-600">Método de Pago</Label>
                  <p>{getPaymentMethodLabel(selectedPayment.paymentMethod)}</p>
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Respuesta del Procesador</Label>
                <p className="font-mono text-sm bg-gray-50 p-2 rounded">
                  {selectedPayment.processorResponse}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Fecha Creación</Label>
                  <p className="text-sm">
                    {new Date(selectedPayment.createdAt).toLocaleString()}
                  </p>
                </div>
                {selectedPayment.completedAt && (
                  <div>
                    <Label className="text-gray-600">Fecha Completado</Label>
                    <p className="text-sm">
                      {new Date(selectedPayment.completedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenView(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
