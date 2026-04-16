/**
 * AdminEnterprisesPage - Listar empresas, crear, contratos, miembros
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
import { useEnterprisesList, useCreateEnterprise, useCreateContract, useMemberships, useAddMembership, useRemoveMembership } from '@modules/enterprises/presentation/hooks/useEnterprises';
import type { CreateEnterpriseRequest, CreateContractRequest, AddMembershipRequest } from '@modules/enterprises/application/dto/EnterpriseDTO';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function AdminEnterprisesPage() {
  const { data: enterprises = [], isLoading } = useEnterprisesList();
  const createMutation = useCreateEnterprise();
  const [openCreate, setOpenCreate] = useState(false);
  const [openContract, setOpenContract] = useState<string | null>(null);
  const [openMembership, setOpenMembership] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [createForm, setCreateForm] = useState<CreateEnterpriseRequest>({
    name: '',
    taxId: '',
    billingEmail: '',
  });
  const [contractForm, setContractForm] = useState<CreateContractRequest>({
    enterpriseId: '',
    name: '',
    enterpriseSharePercent: 0,
    memberSharePercent: 0,
    billingDay: 1,
    effectiveFrom: '',
  });
  const [membershipForm, setMembershipForm] = useState<AddMembershipRequest>({
    userId: '',
    contractId: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(createForm);
      toast.success('Empresa creada');
      setOpenCreate(false);
      setCreateForm({ name: '', taxId: '', billingEmail: '' });
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
        <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white" onClick={() => { setFieldErrors({}); setOpenCreate(true); }}>
          Nueva empresa
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="border rounded-lg overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>RUT</TableHead>
                <TableHead>Email facturación</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enterprises.map((ent) => (
                <EnterpriseRow
                  key={ent.id}
                  enterprise={ent}
                  expandedId={expandedId}
                  setExpandedId={setExpandedId}
                  openContract={openContract}
                  setOpenContract={setOpenContract}
                  openMembership={openMembership}
                  setOpenMembership={setOpenMembership}
                  contractForm={contractForm}
                  setContractForm={setContractForm}
                  membershipForm={membershipForm}
                  setMembershipForm={setMembershipForm}
                  fieldErrors={fieldErrors}
                  setFieldErrors={setFieldErrors}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={openCreate} onOpenChange={(o) => { setOpenCreate(o); if (!o) setFieldErrors({}); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva empresa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Nombre</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} className={fieldErrors.name ? 'border-red-500' : ''} required />
              {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <Label>RUT</Label>
              <Input value={createForm.taxId} onChange={(e) => setCreateForm((f) => ({ ...f, taxId: e.target.value }))} className={fieldErrors.taxId ? 'border-red-500' : ''} required />
              {fieldErrors.taxId && <p className="text-sm text-red-600 mt-1">{fieldErrors.taxId}</p>}
            </div>
            <div>
              <Label>Email facturación</Label>
              <Input type="email" value={createForm.billingEmail} onChange={(e) => setCreateForm((f) => ({ ...f, billingEmail: e.target.value }))} className={fieldErrors.billingEmail ? 'border-red-500' : ''} required />
              {fieldErrors.billingEmail && <p className="text-sm text-red-600 mt-1">{fieldErrors.billingEmail}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={createMutation.isPending}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EnterpriseRow({
  enterprise,
  expandedId,
  setExpandedId,
  openContract,
  setOpenContract,
  openMembership,
  setOpenMembership,
  contractForm,
  setContractForm,
  membershipForm,
  setMembershipForm,
  fieldErrors,
  setFieldErrors,
}: {
  enterprise: { id: string; name: string; taxId: string; billingEmail: string };
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  openContract: string | null;
  setOpenContract: (id: string | null) => void;
  openMembership: string | null;
  setOpenMembership: (id: string | null) => void;
  contractForm: CreateContractRequest;
  setContractForm: (f: CreateContractRequest | ((prev: CreateContractRequest) => CreateContractRequest)) => void;
  membershipForm: AddMembershipRequest;
  setMembershipForm: (f: AddMembershipRequest | ((prev: AddMembershipRequest) => AddMembershipRequest)) => void;
  fieldErrors: Record<string, string>;
  setFieldErrors: (f: Record<string, string>) => void;
}) {
  const isExpanded = expandedId === enterprise.id;
  const { data: memberships = [] } = useMemberships(isExpanded ? enterprise.id : null);
  const createContractMutation = useCreateContract(enterprise.id);
  const addMembershipMutation = useAddMembership(enterprise.id);
  const removeMembershipMutation = useRemoveMembership();

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...contractForm, enterpriseId: enterprise.id };
    try {
      await createContractMutation.mutateAsync(body);
      toast.success('Contrato creado');
      setOpenContract(null);
      setContractForm({ enterpriseId: '', name: '', enterpriseSharePercent: 0, memberSharePercent: 0, billingDay: 1, effectiveFrom: '' });
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

  const handleAddMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMembershipMutation.mutateAsync(membershipForm);
      toast.success('Miembro agregado');
      setOpenMembership(null);
      setMembershipForm({ userId: '', contractId: '' });
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

  const handleRemoveMembership = async (membershipId: string) => {
    if (!confirm('¿Quitar este miembro?')) return;
    try {
      await removeMembershipMutation.mutateAsync(membershipId);
      toast.success('Miembro eliminado');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <>
      <TableRow>
        <TableCell className="w-8">
          <Button variant="ghost" size="icon" onClick={() => setExpandedId(isExpanded ? null : enterprise.id)}>
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </TableCell>
        <TableCell className="font-medium">{enterprise.name}</TableCell>
        <TableCell>{enterprise.taxId}</TableCell>
        <TableCell>{enterprise.billingEmail}</TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={4} className="bg-gray-50 p-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setContractForm((f) => ({ ...f, enterpriseId: enterprise.id, effectiveFrom: new Date().toISOString().slice(0, 10) })); setOpenContract(enterprise.id); setFieldErrors({}); }}>
                  Nuevo contrato
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setMembershipForm({ userId: '', contractId: '' }); setOpenMembership(enterprise.id); setFieldErrors({}); }}>
                  Agregar miembro
                </Button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Miembros ({memberships.length})</p>
                {memberships.length === 0 ? (
                  <p className="text-sm text-gray-500">Sin miembros</p>
                ) : (
                  <ul className="text-sm space-y-1">
                    {memberships.map((m) => (
                      <li key={m.id} className="flex justify-between items-center">
                        <span>User: {m.userId} · Contrato: {m.contractId}</span>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleRemoveMembership(m.id)}>Quitar</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}

      <Dialog open={openContract === enterprise.id} onOpenChange={(o) => { if (!o) setOpenContract(null); setFieldErrors({}); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo contrato</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateContract} className="space-y-4">
            <div>
              <Label>Nombre contrato</Label>
              <Input value={contractForm.name} onChange={(e) => setContractForm((f) => ({ ...f, name: e.target.value }))} className={fieldErrors.name ? 'border-red-500' : ''} required />
              {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>% Empresa</Label>
                <Input type="number" min="0" max="100" value={contractForm.enterpriseSharePercent ?? ''} onChange={(e) => setContractForm((f) => ({ ...f, enterpriseSharePercent: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>% Miembro</Label>
                <Input type="number" min="0" max="100" value={contractForm.memberSharePercent ?? ''} onChange={(e) => setContractForm((f) => ({ ...f, memberSharePercent: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div>
              <Label>Día facturación</Label>
              <Input type="number" min="1" max="28" value={contractForm.billingDay ?? 1} onChange={(e) => setContractForm((f) => ({ ...f, billingDay: parseInt(e.target.value, 10) || 1 }))} />
            </div>
            <div>
              <Label>Vigente desde</Label>
              <Input type="date" value={contractForm.effectiveFrom} onChange={(e) => setContractForm((f) => ({ ...f, effectiveFrom: e.target.value }))} className={fieldErrors.effectiveFrom ? 'border-red-500' : ''} required />
              {fieldErrors.effectiveFrom && <p className="text-sm text-red-600 mt-1">{fieldErrors.effectiveFrom}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenContract(null)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={createContractMutation.isPending}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openMembership === enterprise.id} onOpenChange={(o) => { if (!o) setOpenMembership(null); setFieldErrors({}); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar miembro</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMembership} className="space-y-4">
            <div>
              <Label>ID usuario</Label>
              <Input value={membershipForm.userId} onChange={(e) => setMembershipForm((f) => ({ ...f, userId: e.target.value }))} className={fieldErrors.userId ? 'border-red-500' : ''} required />
              {fieldErrors.userId && <p className="text-sm text-red-600 mt-1">{fieldErrors.userId}</p>}
            </div>
            <div>
              <Label>ID contrato</Label>
              <Input value={membershipForm.contractId} onChange={(e) => setMembershipForm((f) => ({ ...f, contractId: e.target.value }))} className={fieldErrors.contractId ? 'border-red-500' : ''} required />
              {fieldErrors.contractId && <p className="text-sm text-red-600 mt-1">{fieldErrors.contractId}</p>}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenMembership(null)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={addMembershipMutation.isPending}>Agregar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
