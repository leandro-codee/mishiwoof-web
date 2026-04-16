/**
 * AdminBenefitsPage - Gestión de beneficios y tipos de cobertura
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { toast } from 'sonner';

// Mock data
const mockBenefits = [
  {
    id: '5e15c6fd-49e8-400c-92be-d453928f8de4',
    name: 'Cobertura 50%',
    description: 'Reembolso del 50% del gasto incurrido',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

const mockCoverageTypes = [
  {
    id: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    name: 'Consultas Veterinarias',
    description: 'Consultas médicas generales y especializadas',
    displayOrder: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export function AdminBenefitsPage() {
  const [benefits] = useState(mockBenefits);
  const [coverageTypes] = useState(mockCoverageTypes);
  
  const [openBenefit, setOpenBenefit] = useState<'create' | 'edit' | null>(null);
  const [openCoverage, setOpenCoverage] = useState<'create' | 'edit' | null>(null);
  
  const [benefitForm, setBenefitForm] = useState({
    name: '',
    description: '',
  });
  
  const [coverageForm, setCoverageForm] = useState({
    name: '',
    description: '',
    displayOrder: 1,
  });

  const handleCreateBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useCreateBenefit
      toast.success('Beneficio creado');
      setOpenBenefit(null);
      setBenefitForm({ name: '', description: '' });
    } catch (err) {
      toast.error('Error al crear beneficio');
    }
  };

  const handleCreateCoverage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useCreateCoverageType
      toast.success('Tipo de cobertura creado');
      setOpenCoverage(null);
      setCoverageForm({ name: '', description: '', displayOrder: 1 });
    } catch (err) {
      toast.error('Error al crear tipo de cobertura');
    }
  };

  const openEditBenefit = (benefit: typeof mockBenefits[0]) => {
    setBenefitForm({
      name: benefit.name,
      description: benefit.description,
    });
    setOpenBenefit('edit');
  };

  const openEditCoverage = (coverage: typeof mockCoverageTypes[0]) => {
    setCoverageForm({
      name: coverage.name,
      description: coverage.description,
      displayOrder: coverage.displayOrder,
    });
    setOpenCoverage('edit');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Beneficios y Coberturas</h1>
      </div>

      <Tabs defaultValue="benefits" className="w-full">
        <TabsList>
          <TabsTrigger value="benefits">Beneficios</TabsTrigger>
          <TabsTrigger value="coverage-types">Tipos de Cobertura</TabsTrigger>
        </TabsList>

        {/* BENEFITS TAB */}
        <TabsContent value="benefits" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button
              className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
              onClick={() => {
                setBenefitForm({ name: '', description: '' });
                setOpenBenefit('create');
              }}
            >
              Nuevo beneficio
            </Button>
          </div>

          <div className="border rounded-lg overflow-x-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {benefits.map((benefit) => (
                  <TableRow key={benefit.id}>
                    <TableCell className="font-medium">{benefit.name}</TableCell>
                    <TableCell>{benefit.description}</TableCell>
                    <TableCell>{new Date(benefit.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEditBenefit(benefit)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* COVERAGE TYPES TAB */}
        <TabsContent value="coverage-types" className="mt-4">
          <div className="flex justify-end mb-4">
            <Button
              className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
              onClick={() => {
                setCoverageForm({ name: '', description: '', displayOrder: 1 });
                setOpenCoverage('create');
              }}
            >
              Nuevo tipo de cobertura
            </Button>
          </div>

          <div className="border rounded-lg overflow-x-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coverageTypes.map((coverage) => (
                  <TableRow key={coverage.id}>
                    <TableCell>{coverage.displayOrder}</TableCell>
                    <TableCell className="font-medium">{coverage.name}</TableCell>
                    <TableCell>{coverage.description}</TableCell>
                    <TableCell>{new Date(coverage.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => openEditCoverage(coverage)}>
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog Benefit */}
      <Dialog open={openBenefit !== null} onOpenChange={(o) => !o && setOpenBenefit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{openBenefit === 'create' ? 'Nuevo Beneficio' : 'Editar Beneficio'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateBenefit} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={benefitForm.name}
                onChange={(e) => setBenefitForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="ej: Cobertura 80%"
                required
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={benefitForm.description}
                onChange={(e) => setBenefitForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del beneficio..."
                rows={3}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenBenefit(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#FF6F61] text-white">
                {openBenefit === 'create' ? 'Crear' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Coverage Type */}
      <Dialog open={openCoverage !== null} onOpenChange={(o) => !o && setOpenCoverage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {openCoverage === 'create' ? 'Nuevo Tipo de Cobertura' : 'Editar Tipo de Cobertura'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCoverage} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input
                value={coverageForm.name}
                onChange={(e) => setCoverageForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="ej: Consultas Veterinarias"
                required
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={coverageForm.description}
                onChange={(e) => setCoverageForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del tipo de cobertura..."
                rows={3}
                required
              />
            </div>
            <div>
              <Label>Orden de visualización</Label>
              <Input
                type="number"
                min="1"
                value={coverageForm.displayOrder}
                onChange={(e) =>
                  setCoverageForm((f) => ({ ...f, displayOrder: parseInt(e.target.value, 10) || 1 }))
                }
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCoverage(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#FF6F61] text-white">
                {openCoverage === 'create' ? 'Crear' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
