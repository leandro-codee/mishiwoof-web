/**
 * AdminPlansPage - CRUD planes, publicar/despublicar
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
import { usePlansList, useCreatePlan, useUpdatePlan, useDeletePlan, useTogglePublishPlan } from '@modules/plans/presentation/hooks/usePlans';
import type { CreatePlanRequest, UpdatePlanRequest, PlanResponse } from '@modules/plans/application/dto/PlanDTO';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

function TogglePublishButton({ planId, isPublished }: { planId: string; isPublished: boolean }) {
  const toggleMutation = useTogglePublishPlan(planId);
  return (
    <Button variant="outline" size="sm" onClick={() => toggleMutation.mutateAsync()} disabled={toggleMutation.isPending}>
      {isPublished ? 'Ocultar' : 'Publicar'}
    </Button>
  );
}

export function AdminPlansPage() {
  const { data: plans = [], isLoading } = usePlansList();
  const createMutation = useCreatePlan();
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CreatePlanRequest>({
    name: '',
    description: '',
    base_price_uf: 0,
    has_dental: false,
    has_preventive: false,
    deductible_uf: 0,
  });

  const updateMutation = editingPlan ? useUpdatePlan(editingPlan.id) : null;
  const deleteMutation = useDeletePlan();

  const resetForm = () => {
    setForm({
      name: '',
      description: '',
      base_price_uf: 0,
      has_dental: false,
      has_preventive: false,
      deductible_uf: 0,
    });
    setFieldErrors({});
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      toast.success('Plan creado');
      setOpenCreate(false);
      resetForm();
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
    if (!editingPlan || !updateMutation) return;
    const body: UpdatePlanRequest = {
      name: form.name || undefined,
      description: form.description || undefined,
      base_price_uf: form.base_price_uf > 0 ? form.base_price_uf : undefined,
      has_dental: form.has_dental,
      has_preventive: form.has_preventive,
      deductible_uf: form.deductible_uf,
    };
    try {
      await updateMutation.mutateAsync(body);
      toast.success('Plan actualizado');
      setOpenEdit(false);
      setEditingPlan(null);
      resetForm();
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

  const handleDelete = async (plan: PlanResponse) => {
    if (!confirm(`¿Eliminar plan "${plan.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(plan.id);
      toast.success('Plan eliminado');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEditDialog = (plan: PlanResponse) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name,
      description: plan.description ?? '',
      base_price_uf: plan.base_price_uf,
      has_dental: plan.has_dental,
      has_preventive: plan.has_preventive,
      deductible_uf: plan.deductible_uf,
    });
    setFieldErrors({});
    setOpenEdit(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Planes</h1>
        <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white" onClick={() => { resetForm(); setOpenCreate(true); }}>
          Nuevo plan
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Precio UF</TableHead>
                <TableHead>Publicado</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.base_price_uf} UF</TableCell>
                  <TableCell>{plan.is_published ? 'Sí' : 'No'}</TableCell>
                  <TableCell>{plan.is_active ? 'Sí' : 'No'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(plan)}>Editar</Button>
                    <TogglePublishButton planId={plan.id} isPublished={plan.is_published} />
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(plan)}>Eliminar</Button>
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
            <DialogTitle>Nuevo plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={fieldErrors.name ? 'border-red-500' : ''} required />
              {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <Label>Descripción</Label>
              <Input value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Precio base (UF)</Label>
              <Input type="number" step="0.01" min="0" value={form.base_price_uf || ''} onChange={(e) => setForm((f) => ({ ...f, base_price_uf: parseFloat(e.target.value) || 0 }))} className={fieldErrors.base_price_uf ? 'border-red-500' : ''} required />
              {fieldErrors.base_price_uf && <p className="text-sm text-red-600 mt-1">{fieldErrors.base_price_uf}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="has_dental" checked={form.has_dental} onCheckedChange={(c) => setForm((f) => ({ ...f, has_dental: !!c }))} />
              <Label htmlFor="has_dental">Incluye dental</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="has_preventive" checked={form.has_preventive} onCheckedChange={(c) => setForm((f) => ({ ...f, has_preventive: !!c }))} />
              <Label htmlFor="has_preventive">Preventivo</Label>
            </div>
            <div>
              <Label>Deducible (UF)</Label>
              <Input type="number" step="0.01" min="0" value={form.deductible_uf ?? 0} onChange={(e) => setForm((f) => ({ ...f, deductible_uf: parseFloat(e.target.value) || 0 }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={createMutation.isPending}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={(o) => { if (!o) { setEditingPlan(null); setFieldErrors({}); } setOpenEdit(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar plan</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={fieldErrors.name ? 'border-red-500' : ''} required />
              {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <Label>Descripción</Label>
              <Input value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Precio base (UF)</Label>
              <Input type="number" step="0.01" min="0" value={form.base_price_uf || ''} onChange={(e) => setForm((f) => ({ ...f, base_price_uf: parseFloat(e.target.value) || 0 }))} className={fieldErrors.base_price_uf ? 'border-red-500' : ''} required />
              {fieldErrors.base_price_uf && <p className="text-sm text-red-600 mt-1">{fieldErrors.base_price_uf}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="edit_has_dental" checked={form.has_dental} onCheckedChange={(c) => setForm((f) => ({ ...f, has_dental: !!c }))} />
              <Label htmlFor="edit_has_dental">Incluye dental</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="edit_has_preventive" checked={form.has_preventive} onCheckedChange={(c) => setForm((f) => ({ ...f, has_preventive: !!c }))} />
              <Label htmlFor="edit_has_preventive">Preventivo</Label>
            </div>
            <div>
              <Label>Deducible (UF)</Label>
              <Input type="number" step="0.01" min="0" value={form.deductible_uf ?? 0} onChange={(e) => setForm((f) => ({ ...f, deductible_uf: parseFloat(e.target.value) || 0 }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={updateMutation?.isPending}>Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
