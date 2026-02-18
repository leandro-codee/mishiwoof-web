/**
 * AdminEnterpriseInvoicesPage - Gestión de facturas empresariales
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';

// Mock data
const mockInvoices = [
  {
    id: '1',
    enterpriseId: 'e1',
    periodStart: '2024-01-01',
    periodEnd: '2024-01-31',
    totalMembersCount: 50,
    totalPremiumAmountClp: 5000000,
    totalClaimsAmountClp: 2000000,
    enterpriseShareAmountClp: 1500000,
    status: 'PAID',
    issuedAt: '2024-02-01',
    dueDate: '2024-02-15',
    paidAt: '2024-02-10',
    pdfUrl: null,
    notes: null,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-10',
  },
];

type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export function AdminEnterpriseInvoicesPage() {
  const [invoices] = useState(mockInvoices);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    enterpriseId: '',
    periodStart: '',
    periodEnd: '',
    totalMembersCount: 0,
    totalPremiumAmountClp: 0,
    totalClaimsAmountClp: 0,
    enterpriseShareAmountClp: 0,
    status: 'DRAFT' as InvoiceStatus,
    issuedAt: '',
    dueDate: '',
    notes: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useCreateEnterpriseInvoice
      toast.success('Factura creada');
      setOpenCreate(false);
      resetForm();
    } catch (err) {
      toast.error('Error al crear factura');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useUpdateEnterpriseInvoice
      toast.success('Factura actualizada');
      setOpenEdit(null);
      resetForm();
    } catch (err) {
      toast.error('Error al actualizar factura');
    }
  };

  const resetForm = () => {
    setForm({
      enterpriseId: '',
      periodStart: '',
      periodEnd: '',
      totalMembersCount: 0,
      totalPremiumAmountClp: 0,
      totalClaimsAmountClp: 0,
      enterpriseShareAmountClp: 0,
      status: 'DRAFT',
      issuedAt: '',
      dueDate: '',
      notes: '',
    });
    setFieldErrors({});
  };

  const openEditDialog = (invoice: typeof mockInvoices[0]) => {
    setForm({
      enterpriseId: invoice.enterpriseId,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      totalMembersCount: invoice.totalMembersCount,
      totalPremiumAmountClp: invoice.totalPremiumAmountClp,
      totalClaimsAmountClp: invoice.totalClaimsAmountClp,
      enterpriseShareAmountClp: invoice.enterpriseShareAmountClp,
      status: invoice.status as InvoiceStatus,
      issuedAt: invoice.issuedAt,
      dueDate: invoice.dueDate,
      notes: invoice.notes || '',
    });
    setOpenEdit(invoice.id);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      DRAFT: 'secondary',
      ISSUED: 'default',
      PAID: 'default',
      OVERDUE: 'destructive',
      CANCELLED: 'secondary',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Facturas Empresariales</h1>
        <Button
          className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
        >
          Nueva factura
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID Empresa</TableHead>
              <TableHead>Período</TableHead>
              <TableHead>Miembros</TableHead>
              <TableHead>Total Primas</TableHead>
              <TableHead>Total Reclamos</TableHead>
              <TableHead>Monto Empresa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.enterpriseId}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {new Date(invoice.periodStart).toLocaleDateString()} -{' '}
                    {new Date(invoice.periodEnd).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>{invoice.totalMembersCount}</TableCell>
                <TableCell>${invoice.totalPremiumAmountClp.toLocaleString()}</TableCell>
                <TableCell>${invoice.totalClaimsAmountClp.toLocaleString()}</TableCell>
                <TableCell>${invoice.enterpriseShareAmountClp.toLocaleString()}</TableCell>
                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(invoice)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Create */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Factura Empresarial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>ID Empresa</Label>
              <Input
                value={form.enterpriseId}
                onChange={(e) => setForm((f) => ({ ...f, enterpriseId: e.target.value }))}
                className={fieldErrors.enterpriseId ? 'border-red-500' : ''}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Inicio Período</Label>
                <Input
                  type="date"
                  value={form.periodStart}
                  onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Fin Período</Label>
                <Input
                  type="date"
                  value={form.periodEnd}
                  onChange={(e) => setForm((f) => ({ ...f, periodEnd: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Total Miembros</Label>
              <Input
                type="number"
                min="0"
                value={form.totalMembersCount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, totalMembersCount: parseInt(e.target.value, 10) || 0 }))
                }
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Total Primas (CLP)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.totalPremiumAmountClp}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      totalPremiumAmountClp: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Total Reclamos (CLP)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.totalClaimsAmountClp}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      totalClaimsAmountClp: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Monto Empresa (CLP)</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.enterpriseShareAmountClp}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      enterpriseShareAmountClp: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label>Estado</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as InvoiceStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="ISSUED">Emitida</SelectItem>
                  <SelectItem value="PAID">Pagada</SelectItem>
                  <SelectItem value="OVERDUE">Vencida</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha Emisión</Label>
                <Input
                  type="date"
                  value={form.issuedAt}
                  onChange={(e) => setForm((f) => ({ ...f, issuedAt: e.target.value }))}
                />
              </div>
              <div>
                <Label>Fecha Vencimiento</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#FF6F61] text-white">
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit - similar structure */}
      <Dialog open={openEdit !== null} onOpenChange={(o) => !o && setOpenEdit(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Factura Empresarial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            {/* Same form fields as create */}
            <div>
              <Label>Estado</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((f) => ({ ...f, status: v as InvoiceStatus }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="ISSUED">Emitida</SelectItem>
                  <SelectItem value="PAID">Pagada</SelectItem>
                  <SelectItem value="OVERDUE">Vencida</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#FF6F61] text-white">
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
