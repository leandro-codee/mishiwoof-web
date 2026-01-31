/**
 * ReclamosPage - Listar reclamos y crear nuevo
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useClaimsList, useCreateClaim } from '@modules/claims/presentation/hooks/useClaims';
import { usePetsList } from '@modules/pets/presentation/hooks/usePets';
import { useSubscriptions } from '@modules/billing/presentation/hooks/useBilling';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutSucursal } from '@app/components/LayoutSucursal';
import { COVERAGE_TYPES } from '@shared/constants/coverage-types';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  UNDER_REVIEW: 'En revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  PAID: 'Pagado',
};

export function ReclamosPage() {
  const { data: claims = [], isLoading } = useClaimsList();
  const { data: pets = [] } = usePetsList();
  const { data: subscriptions = [] } = useSubscriptions();
  const createMutation = useCreateClaim();
  const [open, setOpen] = useState(false);
  const [petId, setPetId] = useState('');
  const [subscriptionId, setSubscriptionId] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetClinic, setVetClinic] = useState('');
  const [attentionDate, setAttentionDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentDescription, setTreatmentDescription] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [coverageTypeId, setCoverageTypeId] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!petId || !subscriptionId || !vetName.trim() || !attentionDate || !diagnosis.trim() || !coverageTypeId || !itemDescription.trim() || !itemAmount) {
      toast.error('Completa todos los campos obligatorios, incluido el tipo de cobertura.');
      return;
    }
    const amount = parseFloat(itemAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('El monto debe ser un número mayor a 0.');
      return;
    }
    try {
      await createMutation.mutateAsync({
        pet_id: petId,
        subscription_id: subscriptionId,
        vet_name: vetName.trim(),
        vet_clinic: vetClinic.trim() || undefined,
        attention_date: attentionDate,
        diagnosis: diagnosis.trim(),
        treatment_description: treatmentDescription.trim() || undefined,
        items: [
          {
            coverage_type_id: coverageTypeId,
            description: itemDescription.trim(),
            amount_clp: amount,
          },
        ],
      });
      toast.success('Reclamo enviado correctamente');
      setOpen(false);
      setPetId('');
      setSubscriptionId('');
      setVetName('');
      setVetClinic('');
      setAttentionDate('');
      setDiagnosis('');
      setTreatmentDescription('');
      setItemDescription('');
      setItemAmount('');
      setCoverageTypeId('');
      setFieldErrors({});
    } catch (err) {
      const details = getValidationDetails(err);
      if (details) {
        const flat: Record<string, string> = {};
        for (const [k, v] of Object.entries(details)) {
          const msg = (v as string[])[0] ?? '';
          const key = k.replace(/^items\.\d+\./, 'item_').replace(/\./g, '_');
          if (key === 'item_coverage_type_id') flat.coverageTypeId = msg;
          else if (key === 'item_description') flat.itemDescription = msg;
          else if (key === 'item_amount_clp') flat.itemAmount = msg;
          else flat[k] = msg;
        }
        setFieldErrors(flat);
        toast.error('Revisa los campos marcados.');
      } else {
        setFieldErrors({});
        toast.error(getErrorMessage(err));
      }
    }
  };

  return (
    <LayoutSucursal
      title="Mis reclamos"
      subtitle="Realizar bonificación y ver estado"
    >
      <div className="flex justify-end mb-6">
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) setFieldErrors({}); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white">
              Nuevo reclamo (bonificación)
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nuevo reclamo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div>
                <Label>Mascota</Label>
                <Select value={petId} onValueChange={(v) => { setPetId(v); clearFieldError('pet_id'); }} required>
                  <SelectTrigger className={fieldErrors.pet_id ? 'border-red-500' : ''}><SelectValue placeholder="Selecciona mascota" /></SelectTrigger>
                  <SelectContent>
                    {pets.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.species})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.pet_id && <p className="text-sm text-red-600 mt-1">{fieldErrors.pet_id}</p>}
              </div>
              <div>
                <Label>Suscripción</Label>
                <Select value={subscriptionId} onValueChange={(v) => { setSubscriptionId(v); clearFieldError('subscription_id'); }} required>
                  <SelectTrigger className={fieldErrors.subscription_id ? 'border-red-500' : ''}><SelectValue placeholder="Selecciona suscripción" /></SelectTrigger>
                  <SelectContent>
                    {subscriptions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.plan_name ?? s.plan_id} · {s.status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldErrors.subscription_id && <p className="text-sm text-red-600 mt-1">{fieldErrors.subscription_id}</p>}
              </div>
              <div>
                <Label>Nombre veterinario</Label>
                <Input value={vetName} onChange={(e) => { setVetName(e.target.value); clearFieldError('vet_name'); }} placeholder="Dr. Juan Pérez" className={fieldErrors.vet_name ? 'border-red-500' : ''} required />
                {fieldErrors.vet_name && <p className="text-sm text-red-600 mt-1">{fieldErrors.vet_name}</p>}
              </div>
              <div>
                <Label>Clínica (opcional)</Label>
                <Input value={vetClinic} onChange={(e) => setVetClinic(e.target.value)} placeholder="Clínica Veterinaria" />
              </div>
              <div>
                <Label>Fecha de atención</Label>
                <Input type="date" value={attentionDate} onChange={(e) => { setAttentionDate(e.target.value); clearFieldError('attention_date'); }} className={fieldErrors.attention_date ? 'border-red-500' : ''} required />
                {fieldErrors.attention_date && <p className="text-sm text-red-600 mt-1">{fieldErrors.attention_date}</p>}
              </div>
              <div>
                <Label>Diagnóstico</Label>
                <Input value={diagnosis} onChange={(e) => { setDiagnosis(e.target.value); clearFieldError('diagnosis'); }} placeholder="Diagnóstico" className={fieldErrors.diagnosis ? 'border-red-500' : ''} required />
                {fieldErrors.diagnosis && <p className="text-sm text-red-600 mt-1">{fieldErrors.diagnosis}</p>}
              </div>
              <div>
                <Label>Tratamiento (opcional)</Label>
                <Input value={treatmentDescription} onChange={(e) => setTreatmentDescription(e.target.value)} placeholder="Descripción del tratamiento" />
              </div>
              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label>Tipo de cobertura</Label>
                  <Select value={coverageTypeId} onValueChange={(v) => { setCoverageTypeId(v); clearFieldError('coverageTypeId'); }} required>
                    <SelectTrigger className={fieldErrors.coverageTypeId ? 'border-red-500' : ''}><SelectValue placeholder="Selecciona tipo de cobertura" /></SelectTrigger>
                    <SelectContent>
                      {COVERAGE_TYPES.map((ct) => (
                        <SelectItem key={ct.id} value={ct.id}>
                          {ct.name}{ct.description ? ` — ${ct.description}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldErrors.coverageTypeId && <p className="text-sm text-red-600 mt-1">{fieldErrors.coverageTypeId}</p>}
                </div>
                <div>
                  <Label>Descripción del gasto</Label>
                  <Input value={itemDescription} onChange={(e) => { setItemDescription(e.target.value); clearFieldError('itemDescription'); }} placeholder="Ej: Consulta + radiografía" className={fieldErrors.itemDescription ? 'border-red-500' : ''} required />
                  {fieldErrors.itemDescription && <p className="text-sm text-red-600 mt-1">{fieldErrors.itemDescription}</p>}
                </div>
                <div>
                  <Label>Monto (CLP)</Label>
                  <Input type="number" min="1" step="1" value={itemAmount} onChange={(e) => { setItemAmount(e.target.value); clearFieldError('itemAmount'); }} placeholder="Ej: 45000" className={fieldErrors.itemAmount ? 'border-red-500' : ''} required />
                  {fieldErrors.itemAmount && <p className="text-sm text-red-600 mt-1">{fieldErrors.itemAmount}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#FF6F61] text-white" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Enviando...' : 'Enviar reclamo'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full rounded-lg" />
      ) : claims.length === 0 ? (
        <p className="text-gray-600">No tienes reclamos. Clic en &quot;Nuevo reclamo&quot; para solicitar una bonificación.</p>
      ) : (
        <ul className="space-y-3">
          {claims.map((c) => (
            <li key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-black">{c.claim_number}</p>
                  <p className="text-sm text-gray-600">{c.vet_name} · {c.diagnosis}</p>
                  <p className="text-sm text-gray-500">{new Date(c.attention_date).toLocaleDateString('es-CL')} · Total: ${c.total_amount_clp.toLocaleString('es-CL')}</p>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded ${
                  c.status === 'APPROVED' || c.status === 'PAID' ? 'bg-green-100 text-green-800' :
                  c.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-amber-100 text-amber-800'
                }`}>
                  {STATUS_LABELS[c.status] ?? c.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </LayoutSucursal>
  );
}
