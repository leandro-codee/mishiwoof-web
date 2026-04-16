/**
 * AdminPricingRulesPage - Gestión de reglas de precio
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
import { toast } from 'sonner';

// Mock data
const mockPricingRules = [
  {
    id: '1',
    planId: 'plan-1',
    species: 'DOG',
    breed: 'Golden Retriever',
    ageMin: 0,
    ageMax: 7,
    regionId: null,
    priceMultiplier: 1.0,
    isSeniorDiscount: false,
    isLegacyCustomer: false,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

type Species = 'DOG' | 'CAT';

export function AdminPricingRulesPage() {
  const [rules] = useState(mockPricingRules);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<string | null>(null);

  const [form, setForm] = useState({
    planId: '',
    species: 'DOG' as Species,
    breed: '',
    ageMin: 0,
    ageMax: 15,
    regionId: '',
    priceMultiplier: 1.0,
    isSeniorDiscount: false,
    isLegacyCustomer: false,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useCreatePricingRule
      toast.success('Regla de precio creada');
      setOpenCreate(false);
      resetForm();
    } catch (err) {
      toast.error('Error al crear regla de precio');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useUpdatePricingRule
      toast.success('Regla de precio actualizada');
      setOpenEdit(null);
      resetForm();
    } catch (err) {
      toast.error('Error al actualizar regla de precio');
    }
  };

  const resetForm = () => {
    setForm({
      planId: '',
      species: 'DOG',
      breed: '',
      ageMin: 0,
      ageMax: 15,
      regionId: '',
      priceMultiplier: 1.0,
      isSeniorDiscount: false,
      isLegacyCustomer: false,
    });
  };

  const openEditDialog = (rule: typeof mockPricingRules[0]) => {
    setForm({
      planId: rule.planId,
      species: rule.species as Species,
      breed: rule.breed || '',
      ageMin: rule.ageMin,
      ageMax: rule.ageMax,
      regionId: rule.regionId || '',
      priceMultiplier: rule.priceMultiplier,
      isSeniorDiscount: rule.isSeniorDiscount,
      isLegacyCustomer: rule.isLegacyCustomer,
    });
    setOpenEdit(rule.id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Reglas de Precio</h1>
        <Button
          className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
        >
          Nueva regla
        </Button>
      </div>

      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Plan ID</TableHead>
              <TableHead>Especie</TableHead>
              <TableHead>Raza</TableHead>
              <TableHead>Edad Min-Max</TableHead>
              <TableHead>Región</TableHead>
              <TableHead>Multiplicador</TableHead>
              <TableHead>Descuentos</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell className="font-mono text-sm">{rule.planId}</TableCell>
                <TableCell>{rule.species}</TableCell>
                <TableCell>{rule.breed || 'Todas'}</TableCell>
                <TableCell>
                  {rule.ageMin} - {rule.ageMax} años
                </TableCell>
                <TableCell>{rule.regionId || 'Todas'}</TableCell>
                <TableCell className="font-medium">{rule.priceMultiplier}x</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {rule.isSeniorDiscount && (
                      <Badge variant="secondary" className="text-xs">
                        Senior
                      </Badge>
                    )}
                    {rule.isLegacyCustomer && (
                      <Badge variant="secondary" className="text-xs">
                        Legacy
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(rule)}>
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
            <DialogTitle>Nueva Regla de Precio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>ID del Plan</Label>
              <Input
                value={form.planId}
                onChange={(e) => setForm((f) => ({ ...f, planId: e.target.value }))}
                placeholder="UUID del plan"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Especie</Label>
                <Select
                  value={form.species}
                  onValueChange={(v) => setForm((f) => ({ ...f, species: v as Species }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DOG">Perro</SelectItem>
                    <SelectItem value="CAT">Gato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Raza (opcional)</Label>
                <Input
                  value={form.breed}
                  onChange={(e) => setForm((f) => ({ ...f, breed: e.target.value }))}
                  placeholder="ej: Golden Retriever"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Edad Mínima</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.ageMin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ageMin: parseInt(e.target.value, 10) || 0 }))
                  }
                  required
                />
              </div>
              <div>
                <Label>Edad Máxima</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.ageMax}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ageMax: parseInt(e.target.value, 10) || 15 }))
                  }
                  required
                />
              </div>
            </div>
            <div>
              <Label>ID Región (opcional)</Label>
              <Input
                value={form.regionId}
                onChange={(e) => setForm((f) => ({ ...f, regionId: e.target.value }))}
                placeholder="Dejar vacío para todas las regiones"
              />
            </div>
            <div>
              <Label>Multiplicador de Precio</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.priceMultiplier}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceMultiplier: parseFloat(e.target.value) || 1.0 }))
                }
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                1.0 = precio base, 1.5 = 50% más caro, 0.8 = 20% descuento
              </p>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isSeniorDiscount}
                  onChange={(e) => setForm((f) => ({ ...f, isSeniorDiscount: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Descuento Senior</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isLegacyCustomer}
                  onChange={(e) => setForm((f) => ({ ...f, isLegacyCustomer: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Cliente Legacy</span>
              </label>
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

      {/* Dialog Edit (similar structure) */}
      <Dialog open={openEdit !== null} onOpenChange={(o) => !o && setOpenEdit(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Regla de Precio</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            {/* Similar form fields */}
            <div>
              <Label>Multiplicador de Precio</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={form.priceMultiplier}
                onChange={(e) =>
                  setForm((f) => ({ ...f, priceMultiplier: parseFloat(e.target.value) || 1.0 }))
                }
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
