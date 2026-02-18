/**
 * AdminCoveragesPage - Gestionar benefits, coverage types y coverages
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import type { 
  Benefit, 
  CreateBenefitRequest, 
  UpdateBenefitRequest,
  CoverageType,
  CreateCoverageTypeRequest,
  UpdateCoverageTypeRequest
} from '@modules/coverages/application/dto/CoverageDTO';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';

export function AdminCoveragesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Cobertura y Beneficios</h1>
      
      <Tabs defaultValue="benefits" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="benefits">Beneficios</TabsTrigger>
          <TabsTrigger value="coverageTypes">Tipos de Cobertura</TabsTrigger>
        </TabsList>
        
        <TabsContent value="benefits">
          <BenefitsSection />
        </TabsContent>
        
        <TabsContent value="coverageTypes">
          <CoverageTypesSection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BenefitsSection() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<Benefit | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Mock data - replace with actual hooks
  const benefits: Benefit[] = [];
  const isLoading = false;

  const [createForm, setCreateForm] = useState<CreateBenefitRequest>({
    name: '',
  });
  const [editForm, setEditForm] = useState<UpdateBenefitRequest>({});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating benefit:', createForm);
      toast.success('Beneficio creado');
      setOpenCreate(false);
      setCreateForm({ name: '' });
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
      console.log('Updating benefit:', editing.id, editForm);
      toast.success('Beneficio actualizado');
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

  const handleDelete = async (item: Benefit) => {
    if (!confirm(`¿Eliminar beneficio ${item.name}?`)) return;
    try {
      console.log('Deleting benefit:', item.id);
      toast.success('Beneficio eliminado');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEditDialog = (item: Benefit) => {
    setEditing(item);
    setEditForm({
      name: item.name,
      description: item.description,
      icon: item.icon,
    });
    setFieldErrors({});
    setOpenEdit(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Beneficios</h2>
        <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white" onClick={() => { setFieldErrors({}); setOpenCreate(true); }}>
          Nuevo beneficio
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
                <TableHead>Descripción</TableHead>
                <TableHead>Icono</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {benefits.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.description || '—'}</TableCell>
                  <TableCell>{item.icon || '—'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item)}>Eliminar</Button>
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
            <DialogTitle>Nuevo beneficio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} className={fieldErrors.name ? 'border-red-500' : ''} required />
              {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={createForm.description ?? ''} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div>
              <Label>Icono (emoji o nombre)</Label>
              <Input value={createForm.icon ?? ''} onChange={(e) => setCreateForm((f) => ({ ...f, icon: e.target.value }))} placeholder="🏥" />
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
            <DialogTitle>Editar beneficio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={editForm.name ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={fieldErrors.name ? 'border-red-500' : ''} required />
              {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={editForm.description ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div>
              <Label>Icono (emoji o nombre)</Label>
              <Input value={editForm.icon ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, icon: e.target.value }))} placeholder="🏥" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CoverageTypesSection() {
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editing, setEditing] = useState<CoverageType | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Mock data - replace with actual hooks
  const coverageTypes: CoverageType[] = [];
  const isLoading = false;

  const [createForm, setCreateForm] = useState<CreateCoverageTypeRequest>({
    name: '',
  });
  const [editForm, setEditForm] = useState<UpdateCoverageTypeRequest>({});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Creating coverage type:', createForm);
      toast.success('Tipo de cobertura creado');
      setOpenCreate(false);
      setCreateForm({ name: '' });
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
      console.log('Updating coverage type:', editing.id, editForm);
      toast.success('Tipo de cobertura actualizado');
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

  const handleDelete = async (item: CoverageType) => {
    if (!confirm(`¿Eliminar tipo de cobertura ${item.name}?`)) return;
    try {
      console.log('Deleting coverage type:', item.id);
      toast.success('Tipo de cobertura eliminado');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEditDialog = (item: CoverageType) => {
    setEditing(item);
    setEditForm({
      name: item.name,
      description: item.description,
      displayOrder: item.displayOrder,
      benefitId: item.benefitId,
    });
    setFieldErrors({});
    setOpenEdit(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Tipos de Cobertura</h2>
        <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white" onClick={() => { setFieldErrors({}); setOpenCreate(true); }}>
          Nuevo tipo
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coverageTypes.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.displayOrder}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.description || '—'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>Editar</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(item)}>Eliminar</Button>
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
            <DialogTitle>Nuevo tipo de cobertura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} className={fieldErrors.name ? 'border-red-500' : ''} required />
              {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={createForm.description ?? ''} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div>
              <Label>Orden de visualización</Label>
              <Input type="number" value={createForm.displayOrder ?? 0} onChange={(e) => setCreateForm((f) => ({ ...f, displayOrder: parseInt(e.target.value, 10) || 0 }))} />
            </div>
            <div>
              <Label>ID Beneficio (opcional)</Label>
              <Input value={createForm.benefitId ?? ''} onChange={(e) => setCreateForm((f) => ({ ...f, benefitId: e.target.value }))} placeholder="ULID del beneficio" />
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
            <DialogTitle>Editar tipo de cobertura</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input value={editForm.name ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className={fieldErrors.name ? 'border-red-500' : ''} required />
              {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={editForm.description ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div>
              <Label>Orden de visualización</Label>
              <Input type="number" value={editForm.displayOrder ?? 0} onChange={(e) => setEditForm((f) => ({ ...f, displayOrder: parseInt(e.target.value, 10) || 0 }))} />
            </div>
            <div>
              <Label>ID Beneficio (opcional)</Label>
              <Input value={editForm.benefitId ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, benefitId: e.target.value }))} placeholder="ULID del beneficio" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white">Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
