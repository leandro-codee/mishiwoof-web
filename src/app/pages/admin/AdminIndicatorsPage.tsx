/**
 * AdminIndicatorsPage - Listar indicadores (UF) y sincronizar desde CMF
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useIndicatorsList, useIndicatorLatest, useSyncFromCMF } from '@modules/indicators/presentation/hooks/useIndicators';
import { getErrorMessage } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

const PAGE_SIZE = 10;

/** Muestra solo la fecha (YYYY-MM-DD), sin hora ni timezone. */
function formatDateOnly(isoOrDate: string): string {
  if (!isoOrDate) return '';
  return isoOrDate.includes('T') ? isoOrDate.slice(0, 10) : isoOrDate;
}

/** Formato del valor UF: máximo 4 decimales, con separador de miles. */
function formatUFValue(value: number): string {
  if (value == null || Number.isNaN(value)) return '—';
  return Number(value).toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  });
}

export function AdminIndicatorsPage() {
  const [page, setPage] = useState(0);
  const { data: latest } = useIndicatorLatest();
  const { data: list = [], isLoading } = useIndicatorsList(PAGE_SIZE, page * PAGE_SIZE);
  const syncMutation = useSyncFromCMF();

  const hasNext = list.length >= PAGE_SIZE;
  const hasPrev = page > 0;

  const handleSyncFromCMF = () => {
    const now = new Date();
    syncMutation.mutate(
      { year: now.getFullYear(), month: now.getMonth() + 1 },
      {
        onSuccess: (result) => {
          toast.success(`Sincronizado: ${result.created} nuevos, ${result.skipped} ya existían`);
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Indicadores (UF)</h1>
        <Button
          className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
          onClick={handleSyncFromCMF}
          disabled={syncMutation.isPending}
        >
          {syncMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando…
            </>
          ) : (
            'Obtener desde CMF'
          )}
        </Button>
      </div>

      {latest && (
        <div className="mb-6 p-4 bg-[#b6f5b1] rounded-lg">
          <p className="text-sm font-medium text-gray-700">Valor UF actual</p>
          <p className="text-2xl font-bold text-[#525252]">{formatUFValue(latest.uf_value ?? latest.value)} CLP</p>
          <p className="text-xs text-[#8b8b8b]">Fecha: {formatDateOnly(latest.date)}</p>
        </div>
      )}

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>UF (CLP)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((ind) => (
                  <TableRow key={ind.id}>
                    <TableCell className="font-medium">{ind.source}</TableCell>
                    <TableCell>{formatDateOnly(ind.date)}</TableCell>
                    <TableCell>{formatUFValue(ind.uf_value ?? ind.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p - 1)}
              disabled={!hasPrev}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">Página {page + 1}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasNext}
              aria-label="Página siguiente"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
