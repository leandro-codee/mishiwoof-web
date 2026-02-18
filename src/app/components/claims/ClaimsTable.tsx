import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { Eye, Info, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Checkbox } from '@components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { Input } from '@components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { LoadingSpinner } from '@app/components/LoadingSpinner';
import { ErrorMessage } from '@app/components/ErrorMessage';
import { claimsService, type ClaimResponse } from '@shared/api/claimsService';

interface ClaimsTableProps {
  isAdmin?: boolean;
}

export const ClaimsTable = ({ isAdmin = false }: ClaimsTableProps) => {
  const navigate = useNavigate();
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters] = useState<ColumnFiltersState>([]);
  const [currentPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['claims', currentPage],
    queryFn: () => claimsService.getClaims({
      page: currentPage,
      limit: 20,
    }),
  });

  const getStatusBadge = (status: ClaimResponse['status']) => {
    const config: Record<ClaimResponse['status'], { variant: any; label: string }> = {
      PENDING: { variant: 'warning' as const, label: 'Pendiente' },
      UNDER_REVIEW: { variant: 'default' as const, label: 'En Revisión' },
      APPROVED: { variant: 'success' as const, label: 'Aprobado' },
      REJECTED: { variant: 'destructive' as const, label: 'Rechazado' },
      PAID: { variant: 'success' as const, label: 'Pagado' },
    };
    const { variant, label } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const columns: ColumnDef<ClaimResponse>[] = [
    // Checkbox column (solo admin)
    ...(isAdmin
      ? [
          {
            id: 'select',
            header: ({ table }: any) => (
              <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Seleccionar todos"
              />
            ),
            cell: ({ row }: any) => (
              <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Seleccionar fila"
              />
            ),
            enableSorting: false,
            enableHiding: false,
          },
        ]
      : []),
    {
      accessorKey: 'claimNumber',
      header: 'Nº Solicitud',
      cell: ({ row }) => <div className="font-medium">{row.getValue('claimNumber')}</div>,
    },
    {
      accessorKey: 'beneficiaryName',
      header: 'Beneficiario',
      cell: ({ row }) => <div>{row.getValue('beneficiaryName')}</div>,
    },
    {
      accessorKey: 'totalAmountClp',
      header: 'Monto Total',
      cell: ({ row }) => {
        const amount = row.getValue('totalAmountClp') as number;
        return <div className="font-medium">${amount.toLocaleString('es-CL')}</div>;
      },
    },
    {
      id: 'approvedBonifications',
      header: 'Bonificaciones Aprobadas',
      cell: ({ row }) => {
        const approved = row.original.approvedAmountClp;
        const items = row.original.items || [];
        
        if (!approved && items.length === 0) {
          return <div className="text-gray-400">-</div>;
        }

        return (
          <div className="space-y-1">
            {items.map((item, idx) => (
              <div key={idx} className="text-sm">
                <span className="text-gray-600">{item.coverageTypeName}:</span>{' '}
                <span className="font-medium text-green-600">
                  {item.approvedAmountClp 
                    ? `$${item.approvedAmountClp.toLocaleString('es-CL')}`
                    : 'Pendiente'}
                </span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }) => getStatusBadge(row.getValue('status')),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: 'submittedAt',
      header: 'Fecha de Solicitud',
      cell: ({ row }) => <div>{row.getValue('submittedAt')}</div>,
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/bonificaciones/${row.original.id}`)}
            title="Ver Solicitud"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              // TODO: Abrir modal de información
            }}
            title="Ver Información"
          >
            <Info className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: data?.claims || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: () => {},
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const canApproveOrReject = selectedRows.some(
    (row) => row.original.status === 'PENDING' || row.original.status === 'UNDER_REVIEW'
  );
  const canPay = selectedRows.some((row) => row.original.status === 'APPROVED');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message="Error al cargar las bonificaciones" />;
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Buscar por Nº solicitud..."
          value={(table.getColumn('claimNumber')?.getFilterValue() as string) ?? ''}
          onChange={(event) => table.getColumn('claimNumber')?.setFilterValue(event.target.value)}
          className="max-w-sm"
        />
        <Select
          value={(table.getColumn('status')?.getFilterValue() as string) ?? 'all'}
          onValueChange={(value) =>
            table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
          }
        >
          <SelectTrigger className="max-w-[200px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="PENDING">Pendiente</SelectItem>
            <SelectItem value="UNDER_REVIEW">En Revisión</SelectItem>
            <SelectItem value="APPROVED">Aprobado</SelectItem>
            <SelectItem value="REJECTED">Rechazado</SelectItem>
            <SelectItem value="PAID">Pagado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Acciones en lote (solo admin) */}
      {isAdmin && selectedRows.length > 0 && (
        <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">
            {selectedRows.length} seleccionada(s)
          </span>
          <div className="flex gap-2 ml-auto">
            {canApproveOrReject && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    // TODO: Abrir modal de aprobar
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Aprobar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    // TODO: Abrir modal de rechazar
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Rechazar
                </Button>
              </>
            )}
            {canPay && (
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  // TODO: Abrir modal de liquidar
                }}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Liquidar
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span className="mr-4">
              {table.getFilteredSelectedRowModel().rows.length} de{' '}
              {table.getFilteredRowModel().rows.length} fila(s) seleccionada(s)
            </span>
          )}
          <span>
            {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              data?.total || 0
            )}{' '}
            de {data?.total || 0}
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};
