/**
 * AdminVeterinariesPage - Gestión de veterinarias
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
import { toast } from 'sonner';

// Mock data
const mockVeterinaries = [
  {
    id: '1',
    name: 'Clínica Veterinaria San Francisco',
    dni: '12.345.678-9',
    institutionDni: '76.543.210-K',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export function AdminVeterinariesPage() {
  const [veterinaries] = useState(mockVeterinaries);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    dni: '',
    institutionDni: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useCreateVeterinary
      toast.success('Veterinaria creada');
      setOpenCreate(false);
      resetForm();
    } catch (err) {
      toast.error('Error al crear veterinaria');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useUpdateVeterinary
      toast.success('Veterinaria actualizada');
      setOpenEdit(null);
      resetForm();
    } catch (err) {
      toast.error('Error al actualizar veterinaria');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      dni: '',
      institutionDni: '',
    });
  };

  const openEditDialog = (vet: typeof mockVeterinaries[0]) => {
    setForm({
      name: vet.name,
      dni: vet.dni,
      institutionDni: vet.institutionDni,
    });
    setOpenEdit(vet.id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Veterinarias</h1>
        <Button
          className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
        >
          Nueva veterinaria
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>DNI Responsable</TableHead>
              <TableHead>RUT Institución</TableHead>
              <TableHead>Creado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {veterinaries.map((vet) => (
              <TableRow key={vet.id}>
                <TableCell className="font-medium">{vet.name}</TableCell>
                <TableCell>{vet.dni}</TableCell>
                <TableCell>{vet.institutionDni}</TableCell>
                <TableCell>{new Date(vet.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(vet)}>
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
            <DialogTitle>Nueva Veterinaria</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Nombre de la clínica veterinaria"
                required
              />
            </div>
            <div>
              <Label>DNI Responsable</Label>
              <Input
                value={form.dni}
                onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                placeholder="12.345.678-9"
                required
              />
            </div>
            <div>
              <Label>RUT Institución</Label>
              <Input
                value={form.institutionDni}
                onChange={(e) => setForm((f) => ({ ...f, institutionDni: e.target.value }))}
                placeholder="76.543.210-K"
                required
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
            <DialogTitle>Editar Veterinaria</DialogTitle>
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
            <div>
              <Label>DNI Responsable</Label>
              <Input
                value={form.dni}
                onChange={(e) => setForm((f) => ({ ...f, dni: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>RUT Institución</Label>
              <Input
                value={form.institutionDni}
                onChange={(e) => setForm((f) => ({ ...f, institutionDni: e.target.value }))}
                required
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
