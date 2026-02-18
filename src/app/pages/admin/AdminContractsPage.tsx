/**
 * AdminContractsPage - Gestión de contratos empresariales
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Mock data mientras se implementan los hooks
const mockContracts = [
  {
    id: '1',
    enterpriseId: 'e1',
    name: 'Contrato Falabella 2024',
    enterpriseSharePercent: 60,
    memberSharePercent: 40,
    billingDay: 15,
    effectiveFrom: '2024-01-01',
    effectiveTo: null,
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export function AdminContractsPage() {
  const [contracts] = useState(mockContracts);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const [form, setForm] = useState({
    enterpriseId: '',
    name: '',
    enterpriseSharePercent: 50,
    memberSharePercent: 50,
    billingDay: 1,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useCreateContract
      toast.success('Contrato creado');
      setOpenCreate(false);
      resetForm();
    } catch (err) {
      toast.error('Error al crear contrato');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useUpdateContract
      toast.success('Contrato actualizado');
      setOpenEdit(null);
      resetForm();
    } catch (err) {
      toast.error('Error al actualizar contrato');
    }
  };

  const resetForm = () => {
    setForm({
      enterpriseId: '',
      name: '',
      enterpriseSharePercent: 50,
      memberSharePercent: 50,
      billingDay: 1,
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
    });
    setFieldErrors({});
  };

  const openEditDialog = (contract: typeof mockContracts[0]) => {
    setForm({
      enterpriseId: contract.enterpriseId,
      name: contract.name,
      enterpriseSharePercent: contract.enterpriseSharePercent,
      memberSharePercent: contract.memberSharePercent,
      billingDay: contract.billingDay,
      effectiveFrom: contract.effectiveFrom,
      effectiveTo: contract.effectiveTo || '',
    });
    setOpenEdit(contract.id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contratos Empresariales</h1>
        <Button
          className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
        >
          Nuevo contrato
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Empresa ID</TableHead>
              <TableHead>% Empresa</TableHead>
              <TableHead>% Miembro</TableHead>
              <TableHead>Día Facturación</TableHead>
              <TableHead>Vigencia</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract) => (
              <TableRow key={contract.id}>
                <TableCell className="font-medium">{contract.name}</TableCell>
                <TableCell className="text-sm text-gray-600">{contract.enterpriseId}</TableCell>
                <TableCell>{contract.enterpriseSharePercent}%</TableCell>
                <TableCell>{contract.memberSharePercent}%</TableCell>
                <TableCell>{contract.billingDay}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>Desde: {new Date(contract.effectiveFrom).toLocaleDateString()}</div>
                    {contract.effectiveTo && (
                      <div>Hasta: {new Date(contract.effectiveTo).toLocaleDateString()}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={contract.isActive ? 'default' : 'secondary'}>
                    {contract.isActive ? 'Activo' : 'Inactivo'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(contract)}
                  >
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo Contrato</DialogTitle>
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
              {fieldErrors.enterpriseId && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.enterpriseId}</p>
              )}
            </div>
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className={fieldErrors.name ? 'border-red-500' : ''}
                required
              />
              {fieldErrors.name && (
                <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>% Empresa</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.enterpriseSharePercent}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      enterpriseSharePercent: parseFloat(e.target.value) || 0,
                      memberSharePercent: 100 - (parseFloat(e.target.value) || 0),
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label>% Miembro</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.memberSharePercent}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      memberSharePercent: parseFloat(e.target.value) || 0,
                      enterpriseSharePercent: 100 - (parseFloat(e.target.value) || 0),
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label>Día de Facturación (1-28)</Label>
              <Input
                type="number"
                min="1"
                max="28"
                value={form.billingDay}
                onChange={(e) =>
                  setForm((f) => ({ ...f, billingDay: parseInt(e.target.value, 10) || 1 }))
                }
                required
              />
            </div>
            <div>
              <Label>Vigente desde</Label>
              <Input
                type="date"
                value={form.effectiveFrom}
                onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Vigente hasta (opcional)</Label>
              <Input
                type="date"
                value={form.effectiveTo}
                onChange={(e) => setForm((f) => ({ ...f, effectiveTo: e.target.value }))}
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

      {/* Dialog Edit */}
      <Dialog open={openEdit !== null} onOpenChange={(o) => !o && setOpenEdit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Contrato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>% Empresa</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.enterpriseSharePercent}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      enterpriseSharePercent: parseFloat(e.target.value) || 0,
                      memberSharePercent: 100 - (parseFloat(e.target.value) || 0),
                    }))
                  }
                  required
                />
              </div>
              <div>
                <Label>% Miembro</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={form.memberSharePercent}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      memberSharePercent: parseFloat(e.target.value) || 0,
                      enterpriseSharePercent: 100 - (parseFloat(e.target.value) || 0),
                    }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label>Día de Facturación (1-28)</Label>
              <Input
                type="number"
                min="1"
                max="28"
                value={form.billingDay}
                onChange={(e) =>
                  setForm((f) => ({ ...f, billingDay: parseInt(e.target.value, 10) || 1 }))
                }
                required
              />
            </div>
            <div>
              <Label>Vigente desde</Label>
              <Input
                type="date"
                value={form.effectiveFrom}
                onChange={(e) => setForm((f) => ({ ...f, effectiveFrom: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Vigente hasta (opcional)</Label>
              <Input
                type="date"
                value={form.effectiveTo}
                onChange={(e) => setForm((f) => ({ ...f, effectiveTo: e.target.value }))}
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
