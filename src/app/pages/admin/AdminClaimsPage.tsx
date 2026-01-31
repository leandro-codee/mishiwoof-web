/**
 * AdminClaimsPage - Listar reclamos (propios) y revisar/pagar por ID
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
import { useClaimsList, useClaim, useReviewClaim, usePayClaim } from '@modules/claims/presentation/hooks/useClaims';
import type { ReviewClaimRequest, PayClaimRequest } from '@modules/claims/application/dto/ClaimDTO';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  UNDER_REVIEW: 'En revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  PAID: 'Pagado',
};

export function AdminClaimsPage() {
  const { data: claims = [], isLoading } = useClaimsList();
  const [claimIdSearch, setClaimIdSearch] = useState('');
  const [reviewClaimId, setReviewClaimId] = useState<string | null>(null);
  const [payClaimId, setPayClaimId] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { data: claimDetail, isLoading: loadingDetail } = useClaim(claimIdSearch || null);
  const [reviewForm, setReviewForm] = useState<ReviewClaimRequest>({ status: 'APPROVED' });
  const [payForm, setPayForm] = useState<PayClaimRequest>({ payment_method: '' });

  const reviewMutation = reviewClaimId ? useReviewClaim(reviewClaimId) : null;
  const payMutation = payClaimId ? usePayClaim(payClaimId) : null;

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewClaimId || !reviewMutation) return;
    try {
      await reviewMutation.mutateAsync(reviewForm);
      toast.success('Reclamo revisado');
      setReviewClaimId(null);
      setReviewForm({ status: 'APPROVED' });
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

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payClaimId || !payMutation) return;
    try {
      await payMutation.mutateAsync(payForm);
      toast.success('Reclamo marcado como pagado');
      setPayClaimId(null);
      setPayForm({ payment_method: '' });
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Reclamos</h1>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <Label className="text-base font-semibold">Revisar / pagar reclamo por ID</Label>
        <p className="text-sm text-gray-600 mb-2">Ingresa el ID del reclamo para ver detalle y realizar revisión o pago.</p>
        <div className="flex gap-2">
          <Input
            placeholder="ID del reclamo"
            value={claimIdSearch}
            onChange={(e) => setClaimIdSearch(e.target.value)}
            className="max-w-xs"
          />
        </div>
        {claimIdSearch && (
          <div className="mt-4">
            {loadingDetail ? (
              <Skeleton className="h-24 w-full" />
            ) : claimDetail ? (
              <div className="border rounded-lg p-4 bg-white">
                <p><strong>Nº:</strong> {claimDetail.claim_number} · <strong>Estado:</strong> {STATUS_LABELS[claimDetail.status] ?? claimDetail.status}</p>
                <p className="text-sm text-gray-600 mt-1">Monto total: ${claimDetail.total_amount_clp?.toLocaleString()}</p>
                <div className="flex gap-2 mt-2">
                  {claimDetail.status !== 'APPROVED' && claimDetail.status !== 'REJECTED' && (
                    <Button variant="outline" size="sm" onClick={() => { setReviewClaimId(claimDetail.id); setReviewForm({ status: 'APPROVED' }); setFieldErrors({}); }}>
                      Revisar (aprobar/rechazar)
                    </Button>
                  )}
                  {claimDetail.status === 'APPROVED' && !claimDetail.paid_at && (
                    <Button variant="outline" size="sm" onClick={() => { setPayClaimId(claimDetail.id); setPayForm({ payment_method: '' }); setFieldErrors({}); }}>
                      Marcar como pagado
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-600">No se encontró el reclamo o no tienes acceso.</p>
            )}
          </div>
        )}
      </div>

      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mis reclamos</h2>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {claims.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.claim_number}</TableCell>
                  <TableCell>{STATUS_LABELS[c.status] ?? c.status}</TableCell>
                  <TableCell>${c.total_amount_clp?.toLocaleString()}</TableCell>
                  <TableCell>{c.submitted_at?.slice(0, 10)}</TableCell>
                  <TableCell className="font-mono text-xs">{c.id}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={!!reviewClaimId} onOpenChange={(o) => { if (!o) setReviewClaimId(null); setFieldErrors({}); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Revisar reclamo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReview} className="space-y-4">
            <div>
              <Label>Resultado</Label>
              <select
                value={reviewForm.status}
                onChange={(e) => setReviewForm((f) => ({ ...f, status: e.target.value as 'APPROVED' | 'REJECTED' }))}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="APPROVED">Aprobar</option>
                <option value="REJECTED">Rechazar</option>
              </select>
            </div>
            {reviewForm.status === 'APPROVED' && (
              <div>
                <Label>Monto aprobado (CLP)</Label>
                <Input type="number" min="0" value={reviewForm.approved_amount_clp ?? ''} onChange={(e) => setReviewForm((f) => ({ ...f, approved_amount_clp: e.target.value ? parseInt(e.target.value, 10) : undefined }))} />
              </div>
            )}
            {reviewForm.status === 'REJECTED' && (
              <div>
                <Label>Motivo rechazo</Label>
                <Textarea value={reviewForm.rejection_reason ?? ''} onChange={(e) => setReviewForm((f) => ({ ...f, rejection_reason: e.target.value }))} />
              </div>
            )}
            <div>
              <Label>Notas internas</Label>
              <Textarea value={reviewForm.admin_notes ?? ''} onChange={(e) => setReviewForm((f) => ({ ...f, admin_notes: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReviewClaimId(null)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={reviewMutation?.isPending}>Enviar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!payClaimId} onOpenChange={(o) => { if (!o) setPayClaimId(null); setFieldErrors({}); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Marcar como pagado</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <Label>Método de pago</Label>
              <Input value={payForm.payment_method} onChange={(e) => setPayForm((f) => ({ ...f, payment_method: e.target.value }))} placeholder="Ej: Transferencia" className={fieldErrors.payment_method ? 'border-red-500' : ''} required />
              {fieldErrors.payment_method && <p className="text-sm text-red-600 mt-1">{fieldErrors.payment_method}</p>}
            </div>
            <div>
              <Label>Referencia (opcional)</Label>
              <Input value={payForm.payment_reference ?? ''} onChange={(e) => setPayForm((f) => ({ ...f, payment_reference: e.target.value }))} placeholder="Nº operación" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPayClaimId(null)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={payMutation?.isPending}>Confirmar pago</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
