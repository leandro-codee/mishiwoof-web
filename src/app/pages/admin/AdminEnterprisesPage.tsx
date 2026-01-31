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
    user_id: '',
    name: '',
    tax_id: '',
    billing_email: '',
  });
  const [contractForm, setContractForm] = useState<CreateContractRequest>({
    enterprise_id: '',
    name: '',
    enterprise_share_percent: 0,
    member_share_percent: 0,
    billing_day: 1,
    effective_from: '',
  });
  const [membershipForm, setMembershipForm] = useState<AddMembershipRequest>({
    user_id: '',
    contract_id: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(createForm);
      toast.success('Empresa creada');
      setOpenCreate(false);
      setCreateForm({ user_id: '', name: '', tax_id: '', billing_email: '' });
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
        <div className="border rounded-lg overflow-hidden bg-white">
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
              <Label>ID usuario (propietario)</Label>
              <Input value={createForm.user_id} onChange={(e) => setCreateForm((f) => ({ ...f, user_id: e.target.value }))} className={fieldErrors.user_id ? 'border-red-500' : ''} required />
              {fieldErrors.user_id && <p className="text-sm text-red-600 mt-1">{fieldErrors.user_id}</p>}
            </div>
            <div>
              <Label>Nombre</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} className={fieldErrors.name ? 'border-red-500' : ''} required />
              {fieldErrors.name && <p className="text-sm text-red-600 mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <Label>RUT</Label>
              <Input value={createForm.tax_id} onChange={(e) => setCreateForm((f) => ({ ...f, tax_id: e.target.value }))} className={fieldErrors.tax_id ? 'border-red-500' : ''} required />
              {fieldErrors.tax_id && <p className="text-sm text-red-600 mt-1">{fieldErrors.tax_id}</p>}
            </div>
            <div>
              <Label>Email facturación</Label>
              <Input type="email" value={createForm.billing_email} onChange={(e) => setCreateForm((f) => ({ ...f, billing_email: e.target.value }))} className={fieldErrors.billing_email ? 'border-red-500' : ''} required />
              {fieldErrors.billing_email && <p className="text-sm text-red-600 mt-1">{fieldErrors.billing_email}</p>}
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
  enterprise: { id: string; name: string; tax_id: string; billing_email: string };
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
    const body = { ...contractForm, enterprise_id: enterprise.id };
    try {
      await createContractMutation.mutateAsync(body);
      toast.success('Contrato creado');
      setOpenContract(null);
      setContractForm({ enterprise_id: '', name: '', enterprise_share_percent: 0, member_share_percent: 0, billing_day: 1, effective_from: '' });
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
      setMembershipForm({ user_id: '', contract_id: '' });
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
        <TableCell>{enterprise.tax_id}</TableCell>
        <TableCell>{enterprise.billing_email}</TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={4} className="bg-gray-50 p-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => { setContractForm((f) => ({ ...f, enterprise_id: enterprise.id, effective_from: new Date().toISOString().slice(0, 10) })); setOpenContract(enterprise.id); setFieldErrors({}); }}>
                  Nuevo contrato
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setMembershipForm({ user_id: '', contract_id: '' }); setOpenMembership(enterprise.id); setFieldErrors({}); }}>
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
                        <span>User: {m.user_id} · Contrato: {m.contract_id}</span>
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
                <Input type="number" min="0" max="100" value={contractForm.enterprise_share_percent ?? ''} onChange={(e) => setContractForm((f) => ({ ...f, enterprise_share_percent: parseFloat(e.target.value) || 0 }))} />
              </div>
              <div>
                <Label>% Miembro</Label>
                <Input type="number" min="0" max="100" value={contractForm.member_share_percent ?? ''} onChange={(e) => setContractForm((f) => ({ ...f, member_share_percent: parseFloat(e.target.value) || 0 }))} />
              </div>
            </div>
            <div>
              <Label>Día facturación</Label>
              <Input type="number" min="1" max="28" value={contractForm.billing_day ?? 1} onChange={(e) => setContractForm((f) => ({ ...f, billing_day: parseInt(e.target.value, 10) || 1 }))} />
            </div>
            <div>
              <Label>Vigente desde</Label>
              <Input type="date" value={contractForm.effective_from} onChange={(e) => setContractForm((f) => ({ ...f, effective_from: e.target.value }))} className={fieldErrors.effective_from ? 'border-red-500' : ''} required />
              {fieldErrors.effective_from && <p className="text-sm text-red-600 mt-1">{fieldErrors.effective_from}</p>}
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
              <Input value={membershipForm.user_id} onChange={(e) => setMembershipForm((f) => ({ ...f, user_id: e.target.value }))} className={fieldErrors.user_id ? 'border-red-500' : ''} required />
              {fieldErrors.user_id && <p className="text-sm text-red-600 mt-1">{fieldErrors.user_id}</p>}
            </div>
            <div>
              <Label>ID contrato</Label>
              <Input value={membershipForm.contract_id} onChange={(e) => setMembershipForm((f) => ({ ...f, contract_id: e.target.value }))} className={fieldErrors.contract_id ? 'border-red-500' : ''} required />
              {fieldErrors.contract_id && <p className="text-sm text-red-600 mt-1">{fieldErrors.contract_id}</p>}
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
