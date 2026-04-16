/**
 * AdminInvoicesPage - Gestionar facturas empresariales
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import type { EnterpriseInvoice, CreateEnterpriseInvoiceRequest, UpdateEnterpriseInvoiceRequest } from '@modules/invoices/application/dto/InvoiceDTO';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { Badge } from '@/components/ui/badge';

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  ISSUED: 'Emitida',
  PAID: 'Pagada',
  CANCELLED: 'Cancelada',
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ISSUED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export function AdminInvoicesPage() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<EnterpriseInvoice | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Mock data - replace with actual hooks
  const invoices: EnterpriseInvoice[] = [];
  const isLoading = false;

  const [createForm, setCreateForm] = useState<CreateEnterpriseInvoiceRequest>({
    enterpriseId: '',
    periodStart: '',
    periodEnd: '',
  });
  const [editForm, setEditForm] = useState<UpdateEnterpriseInvoiceRequest>({});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating invoice:', createForm);
      toast.success('Factura creada');
      setOpenCreate(false);
      setCreateForm({ enterpriseId: '', periodStart: '', periodEnd: '' });
      setFieldErrors({});
    } catch (err) {
      const details = getValidationDetails(err);
      if (details) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(details)) {
          flat[k] = (v as string[])[0] ?? '';
        }
        setFieldErrors(flat);
        toast.error('Revisa los campos.');
      } else toast.error(getErrorMessage(err));
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      console.log('Updating invoice:', editing.id, editForm);
      toast.success('Factura actualizada');
      setOpenEdit(false);
      setEditing(null);
      setFieldErrors({});
    } catch (err) {
      const details = getValidationDetails(err);
      if (details) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(details)) {
          flat[k] = (v as string[])[0] ?? '';
        }
        setFieldErrors(flat);
        toast.error('Revisa los campos.');
      } else toast.error(getErrorMessage(err));
    }
  };

  const openEditDialog = (invoice: EnterpriseInvoice) => {
    setEditing(invoice);
    setEditForm({
      status: invoice.status,
      issuedAt: invoice.issuedAt,
      dueDate: invoice.dueDate,
      paidAt: invoice.paidAt,
      pdfUrl: invoice.pdfUrl,
      notes: invoice.notes,
    });
    setFieldErrors({});
    setOpenEdit(true);
  };

  const filteredInvoices = filterStatus ? invoices.filter((inv) => inv.status === filterStatus) : invoices;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Facturas Empresariales</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los estados</SelectItem>
              <SelectItem value="DRAFT">Borrador</SelectItem>
              <SelectItem value="ISSUED">Emitida</SelectItem>
              <SelectItem value="PAID">Pagada</SelectItem>
              <SelectItem value="CANCELLED">Cancelada</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white" onClick={() => { setFieldErrors({}); setOpenCreate(true); }}>
            Nueva factura
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="border rounded-lg overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Factura</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Total CLP</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Emitida</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="text-sm">
                    {new Date(invoice.periodStart).toLocaleDateString()} - {new Date(invoice.periodEnd).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold">${invoice.totalClp.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={STATUS_COLORS[invoice.status] || 'bg-gray-100 text-gray-800'}>
                      {STATUS_LABELS[invoice.status] || invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleDateString() : '—'}</TableCell>
                  <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(invoice)}>Editar</Button>
                    {invoice.pdfUrl && (
                      <Button variant="outline" size="sm" onClick={() => window.open(invoice.pdfUrl, '_blank')}>
                        Ver PDF
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={openCreate} onOpenChange={(o) => { setOpenCreate(o); if (!o) setFieldErrors({}); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva factura empresarial</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Empresa ID *</Label>
              <Input value={createForm.enterpriseId} onChange={(e) => setCreateForm((f) => ({ ...f, enterpriseId: e.target.value }))} className={fieldErrors.enterpriseId ? 'border-red-500' : ''} required />
              {fieldErrors.enterpriseId && <p className="text-sm text-red-600 mt-1">{fieldErrors.enterpriseId}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Período inicio *</Label>
                <Input type="date" value={createForm.periodStart} onChange={(e) => setCreateForm((f) => ({ ...f, periodStart: e.target.value }))} className={fieldErrors.periodStart ? 'border-red-500' : ''} required />
                {fieldErrors.periodStart && <p className="text-sm text-red-600 mt-1">{fieldErrors.periodStart}</p>}
              </div>
              <div>
                <Label>Período fin *</Label>
                <Input type="date" value={createForm.periodEnd} onChange={(e) => setCreateForm((f) => ({ ...f, periodEnd: e.target.value }))} className={fieldErrors.periodEnd ? 'border-red-500' : ''} required />
                {fieldErrors.periodEnd && <p className="text-sm text-red-600 mt-1">{fieldErrors.periodEnd}</p>}
              </div>
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={createForm.notes ?? ''} onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Notas adicionales..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white">Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={(o) => { if (!o) setEditing(null); setFieldErrors({}); setOpenEdit(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar factura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Estado</Label>
              <Select value={editForm.status ?? ''} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Borrador</SelectItem>
                  <SelectItem value="ISSUED">Emitida</SelectItem>
                  <SelectItem value="PAID">Pagada</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha emisión</Label>
                <Input type="date" value={editForm.issuedAt ? new Date(editForm.issuedAt).toISOString().slice(0, 10) : ''} onChange={(e) => setEditForm((f) => ({ ...f, issuedAt: e.target.value }))} />
              </div>
              <div>
                <Label>Fecha vencimiento</Label>
                <Input type="date" value={editForm.dueDate ? new Date(editForm.dueDate).toISOString().slice(0, 10) : ''} onChange={(e) => setEditForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Fecha pago</Label>
              <Input type="date" value={editForm.paidAt ? new Date(editForm.paidAt).toISOString().slice(0, 10) : ''} onChange={(e) => setEditForm((f) => ({ ...f, paidAt: e.target.value }))} />
            </div>
            <div>
              <Label>URL PDF</Label>
              <Input value={editForm.pdfUrl ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, pdfUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <Label>Notas</Label>
              <Textarea value={editForm.notes ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} rows={3} placeholder="Notas adicionales..." />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
