// @ts-nocheck
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@components/ui/select';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { Label } from '@components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@components/ui/form';
import { Card } from '@components/ui/card';

// ==================== APROBAR BONIFICACIÓN ====================

const approveClaimSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      description: z.string(),
      requestedAmount: z.number(),
      approvedAmountClp: z.number().min(0, 'Debe ser mayor o igual a 0'),
    })
  ),
  adminNotes: z.string().optional(),
});

type ApproveClaimValues = z.infer<typeof approveClaimSchema>;

interface ClaimItem {
  id: string;
  description: string;
  amountClp: number;
}

interface ApproveClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: {
    id: string;
    claimNumber: string;
    items: ClaimItem[];
  };
  onApprove: (data: ApproveClaimValues) => void | Promise<void>;
  isLoading?: boolean;
}

export const ApproveClaimModal = ({
  open,
  onOpenChange,
  claim,
  onApprove,
  isLoading = false,
}: ApproveClaimModalProps) => {
  const form = useForm<ApproveClaimValues>({
    resolver: zodResolver(approveClaimSchema),
    defaultValues: {
      items: claim.items.map((item) => ({
        id: item.id,
        description: item.description,
        requestedAmount: item.amountClp,
        approvedAmountClp: item.amountClp, // Default: aprobar monto completo
      })),
      adminNotes: '',
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const totalRequested = claim.items.reduce((sum, item) => sum + item.amountClp, 0);
  const totalApproved = form.watch('items').reduce((sum, item) => sum + (item.approvedAmountClp || 0), 0);

  const handleSubmit = async (data: ApproveClaimValues) => {
    await onApprove(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aprobar Bonificación #{claim.claimNumber}</DialogTitle>
          <DialogDescription>
            Revisa y ajusta los montos aprobados para cada item
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Lista de items */}
            <div className="space-y-3">
              {fields.map((field, index) => (
                <Card key={field.id} className="p-4 space-y-3">
                  <div>
                    <Label className="text-sm font-semibold">Item #{index + 1}</Label>
                    <p className="text-sm text-gray-600">{field.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-gray-500">Monto Solicitado</Label>
                      <Input
                        value={`$${field.requestedAmount.toLocaleString('es-CL')}`}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name={`items.${index}.approvedAmountClp`}
                      render={({ field: formField }) => (
                        <FormItem>
                          <Label>Monto Aprobado *</Label>
                          <FormControl>
                            <Input
                              type="number"
                              step="1"
                              max={field.requestedAmount}
                              placeholder="0"
                              {...formField}
                              onChange={(e) => formField.onChange(e.target.valueAsNumber || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>
              ))}
            </div>

            {/* Totales */}
            <Card className="p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Solicitado:</span>
                  <span className="font-medium">${totalRequested.toLocaleString('es-CL')}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Aprobado:</span>
                  <span className="text-green-600">${totalApproved.toLocaleString('es-CL')}</span>
                </div>
              </div>
            </Card>

            {/* Notas del administrador */}
            <FormField
              control={form.control}
              name="adminNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas del Administrador</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comentarios adicionales (opcional)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Estas notas serán visibles internamente</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Aprobando...' : 'Aprobar Bonificación'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// ==================== RECHAZAR BONIFICACIÓN ====================

const rejectClaimSchema = z.object({
  rejectionReason: z.string().min(1, 'Selecciona un motivo'),
  rejectionDetails: z.string().min(20, 'Debe tener al menos 20 caracteres'),
  adminNotes: z.string().optional(),
});

type RejectClaimValues = z.infer<typeof rejectClaimSchema>;

interface RejectClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: {
    id: string;
    claimNumber: string;
  };
  onReject: (data: RejectClaimValues) => void | Promise<void>;
  isLoading?: boolean;
}

const rejectionReasons = [
  { value: 'INCOMPLETE_DOCS', label: 'Documentación incompleta' },
  { value: 'NOT_COVERED', label: 'Servicio no cubierto por el plan' },
  { value: 'OUT_OF_PERIOD', label: 'Fuera del periodo de cobertura' },
  { value: 'INCONSISTENT_INFO', label: 'Información inconsistente' },
  { value: 'DUPLICATE', label: 'Solicitud duplicada' },
  { value: 'OTHER', label: 'Otro (especificar)' },
];

export const RejectClaimModal = ({
  open,
  onOpenChange,
  claim,
  onReject,
  isLoading = false,
}: RejectClaimModalProps) => {
  const form = useForm<RejectClaimValues>({
    resolver: zodResolver(rejectClaimSchema),
    defaultValues: {
      rejectionReason: '',
      rejectionDetails: '',
      adminNotes: '',
    },
  });

  const handleSubmit = async (data: RejectClaimValues) => {
    await onReject(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-red-600">
            Rechazar Bonificación #{claim.claimNumber}
          </DialogTitle>
          <DialogDescription>
            Especifica el motivo del rechazo. Esta información será enviada al usuario.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Motivo de rechazo */}
            <FormField
              control={form.control}
              name="rejectionReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo de Rechazo *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un motivo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {rejectionReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Detalle del rechazo */}
            <FormField
              control={form.control}
              name="rejectionDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalle del Rechazo *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Explica detalladamente el motivo del rechazo..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo 20 caracteres. Este mensaje será visible para el usuario.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notas adicionales (interno) */}
            <FormField
              control={form.control}
              name="adminNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Adicionales (Internas)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comentarios internos (opcional)"
                      className="min-h-[60px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Solo visible para administradores</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" variant="destructive" disabled={isLoading}>
                {isLoading ? 'Rechazando...' : 'Rechazar Bonificación'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// ==================== LIQUIDAR BONIFICACIÓN ====================

const payClaimSchema = z.object({
  paymentMethod: z.enum(['BANK_TRANSFER', 'CHECK'], {
    errorMap: () => ({ message: 'Selecciona un método de pago' }),
  }),
  paymentReference: z.string().min(1, 'La referencia de pago es requerida'),
  reimbursedAmountClp: z.number().positive('El monto debe ser mayor a 0'),
  paymentDate: z.string().min(1, 'La fecha de pago es requerida'),
});

type PayClaimValues = z.infer<typeof payClaimSchema>;

interface PayClaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claim: {
    id: string;
    claimNumber: string;
    approvedAmountClp: number;
    bankAccount: {
      bankName: string;
      accountType: string;
      accountNumber: string;
      accountHolder: string;
      dni: string;
    };
  };
  onPay: (data: PayClaimValues) => void | Promise<void>;
  isLoading?: boolean;
}

export const PayClaimModal = ({
  open,
  onOpenChange,
  claim,
  onPay,
  isLoading = false,
}: PayClaimModalProps) => {
  const form = useForm<PayClaimValues>({
    resolver: zodResolver(payClaimSchema),
    defaultValues: {
      paymentMethod: 'BANK_TRANSFER',
      paymentReference: '',
      reimbursedAmountClp: claim.approvedAmountClp,
      paymentDate: new Date().toISOString().split('T')[0], // Hoy
    },
  });

  const watchPaymentMethod = form.watch('paymentMethod');

  const handleSubmit = async (data: PayClaimValues) => {
    await onPay(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-blue-600">
            Liquidar Bonificación #{claim.claimNumber}
          </DialogTitle>
          <DialogDescription>
            Registra los detalles del pago realizado
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Resumen de cuenta bancaria */}
            <Card className="p-4 bg-gray-50 space-y-2 text-sm">
              <h4 className="font-semibold">Cuenta Bancaria del Beneficiario</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-600">Titular:</span>
                  <p className="font-medium">{claim.bankAccount.accountHolder}</p>
                </div>
                <div>
                  <span className="text-gray-600">RUT:</span>
                  <p className="font-medium">{claim.bankAccount.dni}</p>
                </div>
                <div>
                  <span className="text-gray-600">Banco:</span>
                  <p className="font-medium">{claim.bankAccount.bankName}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <p className="font-medium">
                    {claim.bankAccount.accountType === 'CHECKING' ? 'Cuenta Corriente' : 'Cuenta de Ahorro'}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Nº Cuenta:</span>
                  <p className="font-medium">{claim.bankAccount.accountNumber}</p>
                </div>
              </div>
            </Card>

            {/* Método de pago */}
              <FormField
                name="paymentMethod"
                control={form.control}
                render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="BANK_TRANSFER">Transferencia Bancaria</SelectItem>
                      <SelectItem value="CHECK">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Referencia de pago */}
            <FormField
              control={form.control}
              name="paymentReference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referencia de Pago *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        watchPaymentMethod === 'BANK_TRANSFER'
                          ? 'Número de operación/transferencia'
                          : 'Número de cheque'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {watchPaymentMethod === 'BANK_TRANSFER'
                      ? 'Ingresa el número de operación bancaria'
                      : 'Ingresa el número del cheque emitido'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Monto reembolsado */}
              <FormField
                control={form.control}
                name="reimbursedAmountClp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monto Reembolsado (CLP) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Fecha de pago */}
              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Pago *</FormLabel>
                    <FormControl>
                      <Input type="date" max={new Date().toISOString().split('T')[0]} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Marcar como Pagado'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
