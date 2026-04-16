/**
 * AdminCouponsPage - Listar, crear, editar, eliminar cupones
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
import { useCouponsList, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from '@modules/coupons/presentation/hooks/useCoupons';
import type { CouponResponse, CreateCouponRequest, UpdateCouponRequest } from '@modules/coupons/application/dto/CouponDTO';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT', 'FIXED_UF'] as const;

export function AdminCouponsPage() {
  const { data: coupons = [], isLoading } = useCouponsList();
  const createMutation = useCreateCoupon();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [createForm, setCreateForm] = useState<CreateCouponRequest>({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    validFrom: '',
    validTo: '',
  });

  const [editForm, setEditForm] = useState<UpdateCouponRequest>({});
  const updateMutation = useUpdateCoupon(editingCoupon?.id ?? '');
  const deleteMutation = useDeleteCoupon();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...createForm,
      validFrom: createForm.validFrom.includes('T') ? createForm.validFrom : `${createForm.validFrom}T00:00:00.000Z`,
      validTo: createForm.validTo.includes('T') ? createForm.validTo : `${createForm.validTo}T00:00:00.000Z`,
    };
    try {
      await createMutation.mutateAsync(payload);
      toast.success('Cupón creado');
      setOpenCreate(false);
      setCreateForm({ code: '', discountType: 'PERCENTAGE', discountValue: 0, validFrom: '', validTo: '' });
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
    if (!editingCoupon) return;
    try {
      await updateMutation.mutateAsync(editForm);
      toast.success('Cupón actualizado');
      setOpenEdit(false);
      setEditingCoupon(null);
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

  const handleDelete = async (coupon: CouponResponse) => {
    if (!confirm(`¿Eliminar cupón ${coupon.code}?`)) return;
    try {
      await deleteMutation.mutateAsync(coupon.id);
      toast.success('Cupón eliminado');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEditDialog = (coupon: CouponResponse) => {
    setEditingCoupon(coupon);
    setEditForm({
      description: coupon.description,
      validFrom: coupon.validFrom?.slice(0, 10),
      validTo: coupon.validTo?.slice(0, 10),
      maxUses: coupon.maxUses,
      isActive: coupon.isActive,
    });
    setFieldErrors({});
    setOpenEdit(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cupones</h1>
        <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white" onClick={() => { setFieldErrors({}); setOpenCreate(true); }}>
          Nuevo cupón
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="border rounded-lg overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo / Valor</TableHead>
                <TableHead>Válido</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.code}</TableCell>
                  <TableCell>{c.discountType} / {c.discountValue}</TableCell>
                  <TableCell>{c.validFrom?.slice(0, 10)} — {c.validTo?.slice(0, 10)}</TableCell>
                  <TableCell>{c.currentUses} / {c.maxUses ?? '∞'}</TableCell>
                  <TableCell>{c.isActive ? 'Sí' : 'No'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(c)}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(c)}>Eliminar</Button>
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
            <DialogTitle>Nuevo cupón</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Código</Label>
              <Input value={createForm.code} onChange={(e) => setCreateForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} className={fieldErrors.code ? 'border-red-500' : ''} required />
              {fieldErrors.code && <p className="text-sm text-red-600 mt-1">{fieldErrors.code}</p>}
            </div>
            <div>
              <Label>Descripción</Label>
              <Input value={createForm.description ?? ''} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Tipo descuento</Label>
                <Select value={createForm.discountType} onValueChange={(v) => setCreateForm((f) => ({ ...f, discountType: v as CreateCouponRequest['discountType'] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor</Label>
                <Input type="number" step="0.01" value={createForm.discountValue || ''} onChange={(e) => setCreateForm((f) => ({ ...f, discountValue: parseFloat(e.target.value) || 0 }))} className={fieldErrors.discountValue ? 'border-red-500' : ''} required />
                {fieldErrors.discountValue && <p className="text-sm text-red-600 mt-1">{fieldErrors.discountValue}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Válido desde</Label>
                <Input type="date" value={createForm.validFrom} onChange={(e) => setCreateForm((f) => ({ ...f, validFrom: e.target.value }))} className={fieldErrors.validFrom ? 'border-red-500' : ''} required />
                {fieldErrors.validFrom && <p className="text-sm text-red-600 mt-1">{fieldErrors.validFrom}</p>}
              </div>
              <div>
                <Label>Válido hasta</Label>
                <Input type="date" value={createForm.validTo} onChange={(e) => setCreateForm((f) => ({ ...f, validTo: e.target.value }))} className={fieldErrors.validTo ? 'border-red-500' : ''} required />
                {fieldErrors.validTo && <p className="text-sm text-red-600 mt-1">{fieldErrors.validTo}</p>}
              </div>
            </div>
            <div>
              <Label>Máx. usos (opcional)</Label>
              <Input type="number" min="0" value={createForm.maxUses ?? ''} onChange={(e) => setCreateForm((f) => ({ ...f, maxUses: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={createMutation.isPending}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={(o) => { if (!o) setEditingCoupon(null); setFieldErrors({}); setOpenEdit(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar cupón</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Descripción</Label>
              <Input value={editForm.description ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Válido desde</Label>
                <Input type="date" value={editForm.validFrom ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, validFrom: e.target.value }))} />
              </div>
              <div>
                <Label>Válido hasta</Label>
                <Input type="date" value={editForm.validTo ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, validTo: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>Máx. usos</Label>
              <Input type="number" min="0" value={editForm.maxUses ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, maxUses: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="edit_is_active" checked={editForm.isActive ?? true} onCheckedChange={(c) => setEditForm((f) => ({ ...f, isActive: !!c }))} />
              <Label htmlFor="edit_is_active">Activo</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={updateMutation.isPending || !editingCoupon}>Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
