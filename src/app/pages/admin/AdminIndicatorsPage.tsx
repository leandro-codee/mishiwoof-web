/**
 * AdminIndicatorsPage - Listar indicadores (UF) y crear
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
import { useIndicatorsList, useIndicatorLatest, useCreateIndicator } from '@modules/indicators/presentation/hooks/useIndicators';
import type { CreateIndicatorRequest } from '@modules/indicators/application/dto/IndicatorDTO';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminIndicatorsPage() {
  const { data: latest } = useIndicatorLatest();
  const { data: list = [], isLoading } = useIndicatorsList();
  const createMutation = useCreateIndicator();
  const [openCreate, setOpenCreate] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<CreateIndicatorRequest>({
    indicator_type: 'UF',
    date: new Date().toISOString().slice(0, 10),
    value: 0,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      date: form.date.includes('T') ? form.date : `${form.date}T00:00:00.000Z`,
    };
    try {
      await createMutation.mutateAsync(payload);
      toast.success('Indicador creado');
      setOpenCreate(false);
      setForm({ indicator_type: 'UF', date: new Date().toISOString().slice(0, 10), value: 0 });
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
        <h1 className="text-3xl font-bold text-gray-900">Indicadores (UF)</h1>
        <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white" onClick={() => { setFieldErrors({}); setOpenCreate(true); }}>
          Nuevo indicador UF
        </Button>
      </div>

      {latest && (
        <div className="mb-6 p-4 bg-[#FFDCE6] rounded-lg">
          <p className="text-sm font-medium text-gray-700">Valor UF actual</p>
          <p className="text-2xl font-bold text-[#FF6F61]">{latest.uf_value?.toLocaleString() ?? latest.value} CLP</p>
          <p className="text-xs text-gray-500">Fecha: {latest.date}</p>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="border rounded-lg overflow-hidden bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>UF (CLP)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.slice(0, 30).map((ind) => (
                <TableRow key={ind.id}>
                  <TableCell className="font-medium">{ind.indicator_type}</TableCell>
                  <TableCell>{ind.date}</TableCell>
                  <TableCell>{ind.value}</TableCell>
                  <TableCell>{ind.uf_value?.toLocaleString() ?? ind.value}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={openCreate} onOpenChange={(o) => { setOpenCreate(o); if (!o) setFieldErrors({}); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo indicador UF</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <Input value={form.indicator_type ?? 'UF'} onChange={(e) => setForm((f) => ({ ...f, indicator_type: e.target.value }))} placeholder="UF" />
            </div>
            <div>
              <Label>Fecha</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className={fieldErrors.date ? 'border-red-500' : ''} required />
              {fieldErrors.date && <p className="text-sm text-red-600 mt-1">{fieldErrors.date}</p>}
            </div>
            <div>
              <Label>Valor (UF en CLP)</Label>
              <Input type="number" min="0" step="0.01" value={form.value || ''} onChange={(e) => setForm((f) => ({ ...f, value: parseFloat(e.target.value) || 0 }))} className={fieldErrors.value ? 'border-red-500' : ''} required />
              {fieldErrors.value && <p className="text-sm text-red-600 mt-1">{fieldErrors.value}</p>}
            </div>
            <div>
              <Label>Fuente (opcional)</Label>
              <Input value={form.source ?? ''} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} />
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
