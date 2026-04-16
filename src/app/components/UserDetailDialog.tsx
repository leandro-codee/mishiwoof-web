/**
 * UserDetailDialog - Vista agregada de todo lo asociado a un usuario (admin).
 * Se abre desde AdminUsersPage con el botón "Ver".
 */

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUserDetail } from '@modules/users/presentation/hooks/useUsers';
import type { UserDetailResponse } from '@modules/users/application/dto/UserDTO';
import { formatDate, formatCurrency, formatNumber } from '@shared/utils/formatters';
import { getErrorMessage } from '@shared/infrastructure/http/api.error';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  FileText,
  Landmark,
  Mail,
  PawPrint,
  ReceiptText,
  ShieldCheck,
  Ticket,
  XCircle,
} from 'lucide-react';

interface UserDetailDialogProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetailDialog({ userId, open, onOpenChange }: UserDetailDialogProps) {
  const { data, isLoading, error } = useUserDetail(open ? userId : null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="sticky top-0 z-10 border-b bg-white px-6 py-4">
          <DialogTitle className="text-xl">Detalle de usuario</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          {isLoading && <DetailSkeleton />}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mr-2 inline h-4 w-4" />
              {getErrorMessage(error)}
            </div>
          )}
          {data && <DetailBody data={data} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function DetailBody({ data }: { data: UserDetailResponse }) {
  const { user, isActive, stats } = data;
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || '(sin nombre)';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-gray-900">{fullName}</h2>
          <p className="flex items-center gap-1.5 text-sm text-gray-600">
            <Mail className="h-3.5 w-3.5" /> {user.email}
          </p>
          {user.dni && <p className="text-xs text-gray-500">DNI/RUT: {user.dni}</p>}
          {user.phone && <p className="text-xs text-gray-500">Tel: {user.phone}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={isActive ? 'default' : 'destructive'}>
            {isActive ? 'Activo' : 'Inactivo'}
          </Badge>
          <Badge variant="secondary">{user.role}</Badge>
          <Badge variant={user.emailVerified ? 'default' : 'outline'}>
            {user.emailVerified ? (
              <>
                <CheckCircle2 className="mr-1 h-3 w-3" /> Email verificado
              </>
            ) : (
              <>
                <XCircle className="mr-1 h-3 w-3" /> Email sin verificar
              </>
            )}
          </Badge>
          {data.seller && (
            <Badge variant="secondary">
              <ShieldCheck className="mr-1 h-3 w-3" /> Vendedor
            </Badge>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          icon={<PawPrint className="h-4 w-4 text-[#FF6F61]" />}
          label="Mascotas"
          value={stats.petsCount}
        />
        <StatCard
          icon={<FileText className="h-4 w-4 text-blue-600" />}
          label="Suscripciones activas"
          value={stats.activeSubscriptions}
        />
        <StatCard
          icon={<CreditCard className="h-4 w-4 text-emerald-600" />}
          label="Total pagado"
          value={formatCurrency(stats.totalPaidCLP, 'CLP')}
        />
        <StatCard
          icon={<ReceiptText className="h-4 w-4 text-amber-600" />}
          label="Reclamos pendientes"
          value={stats.pendingClaims}
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="resumen">
        <TabsList className="flex w-full flex-wrap gap-1 h-auto justify-start">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="mascotas">Mascotas ({data.pets.length})</TabsTrigger>
          <TabsTrigger value="subs">Suscripciones ({data.subscriptions.length})</TabsTrigger>
          <TabsTrigger value="pagos">Pagos ({data.paymentAttempts.length})</TabsTrigger>
          <TabsTrigger value="reclamos">Reclamos ({data.claims.length})</TabsTrigger>
          <TabsTrigger value="cuentas">
            Medios ({data.paymentMethods.length + data.bankAccounts.length})
          </TabsTrigger>
          <TabsTrigger value="empresa">Empresa / Otros</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="mt-4">
          <ResumenTab data={data} />
        </TabsContent>

        <TabsContent value="mascotas" className="mt-4">
          <PetsTab data={data} />
        </TabsContent>

        <TabsContent value="subs" className="mt-4">
          <SubscriptionsTab data={data} />
        </TabsContent>

        <TabsContent value="pagos" className="mt-4">
          <PaymentAttemptsTab data={data} />
        </TabsContent>

        <TabsContent value="reclamos" className="mt-4">
          <ClaimsTab data={data} />
        </TabsContent>

        <TabsContent value="cuentas" className="mt-4 space-y-4">
          <PaymentMethodsTab data={data} />
          <BankAccountsTab data={data} />
        </TabsContent>

        <TabsContent value="empresa" className="mt-4 space-y-4">
          <EnterpriseTab data={data} />
          <SellerTab data={data} />
          <CouponRedemptionsTab data={data} />
          <OtherCountsTab data={data} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {icon}
          <span>{label}</span>
        </div>
        <p className="mt-1 text-xl font-semibold text-gray-900">{value}</p>
      </CardContent>
    </Card>
  );
}

function EmptyRow({ text, colSpan }: { text: string; colSpan: number }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-6 text-center text-sm text-gray-500">
        {text}
      </TableCell>
    </TableRow>
  );
}

function ResumenTab({ data }: { data: UserDetailResponse }) {
  const { user } = data;
  return (
    <div className="space-y-3">
      <InfoRow label="ID" value={user.id} mono />
      <InfoRow label="Registrado" value={formatDate(user.createdAt, 'dd/MM/yyyy HH:mm')} />
      <InfoRow label="Última actualización" value={formatDate(user.updatedAt, 'dd/MM/yyyy HH:mm')} />
      {user.birthDate && <InfoRow label="Nacimiento" value={formatDate(user.birthDate)} />}
      {user.gender && <InfoRow label="Género" value={user.gender} />}
      {user.address && <InfoRow label="Dirección" value={user.address} />}
      {user.stateId && <InfoRow label="Región" value={user.stateId} />}
      <InfoRow label="Notificaciones no leídas" value={String(data.notificationsUnread)} />
      <InfoRow label="Conversaciones de chat" value={String(data.chatThreadsCount)} />
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b pb-2 sm:flex-row sm:gap-4">
      <span className="w-56 shrink-0 text-xs font-medium text-gray-500">{label}</span>
      <span
        className={`text-sm text-gray-800 ${mono ? 'font-mono text-xs break-all' : ''}`}
      >
        {value || '—'}
      </span>
    </div>
  );
}

function PetsTab({ data }: { data: UserDetailResponse }) {
  return (
    <div className="border rounded-lg overflow-x-auto bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Especie</TableHead>
            <TableHead>Raza</TableHead>
            <TableHead>Nacimiento</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.pets.length === 0 && <EmptyRow text="Sin mascotas." colSpan={5} />}
          {data.pets.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell>{p.species}</TableCell>
              <TableCell>{p.breed ?? '—'}</TableCell>
              <TableCell>{formatDate(p.birthDate)}</TableCell>
              <TableCell>
                {p.deletedAt ? (
                  <Badge variant="destructive">Eliminada</Badge>
                ) : (
                  <Badge variant="default">Activa</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SubscriptionsTab({ data }: { data: UserDetailResponse }) {
  return (
    <div className="border rounded-lg overflow-x-auto bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead>Mascota</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Próximo cobro</TableHead>
            <TableHead className="text-right">Precio UF</TableHead>
            <TableHead>Proveedor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.subscriptions.length === 0 && (
            <EmptyRow text="Sin suscripciones." colSpan={6} />
          )}
          {data.subscriptions.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-xs">{s.planId.slice(0, 8)}…</TableCell>
              <TableCell className="font-mono text-xs">{s.petId.slice(0, 8)}…</TableCell>
              <TableCell>
                <SubscriptionStatusBadge status={s.status} />
              </TableCell>
              <TableCell>{formatDate(s.nextBillingDate)}</TableCell>
              <TableCell className="text-right">{formatNumber(s.finalPriceUF, 4)}</TableCell>
              <TableCell>{s.paymentProvider}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentAttemptsTab({ data }: { data: UserDetailResponse }) {
  return (
    <div className="border rounded-lg overflow-x-auto bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Monto CLP</TableHead>
            <TableHead className="text-right">Monto UF</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.paymentAttempts.length === 0 && (
            <EmptyRow text="Sin intentos de pago." colSpan={6} />
          )}
          {data.paymentAttempts.map((pa) => (
            <TableRow key={pa.id}>
              <TableCell>
                {formatDate(pa.attemptedAt ?? pa.createdAt, 'dd/MM/yyyy HH:mm')}
              </TableCell>
              <TableCell>
                <PaymentAttemptStatusBadge status={pa.status} />
              </TableCell>
              <TableCell className="text-right">{formatCurrency(pa.amountCLP, 'CLP')}</TableCell>
              <TableCell className="text-right">{formatNumber(pa.amountUF, 4)}</TableCell>
              <TableCell>{pa.provider}</TableCell>
              <TableCell className="max-w-[200px] truncate text-xs text-red-600">
                {pa.errorMessage ?? ''}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function ClaimsTab({ data }: { data: UserDetailResponse }) {
  return (
    <div className="border rounded-lg overflow-x-auto bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N°</TableHead>
            <TableHead>Veterinario</TableHead>
            <TableHead>Atención</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-right">Reembolsado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.claims.length === 0 && <EmptyRow text="Sin reclamos." colSpan={6} />}
          {data.claims.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono text-xs">{c.claimNumber}</TableCell>
              <TableCell>{c.vetName}</TableCell>
              <TableCell>{formatDate(c.attentionDate)}</TableCell>
              <TableCell>
                <ClaimStatusBadge status={c.status} />
              </TableCell>
              <TableCell className="text-right">{formatCurrency(c.totalAmountCLP, 'CLP')}</TableCell>
              <TableCell className="text-right">
                {c.reimbursedAmountCLP != null ? formatCurrency(c.reimbursedAmountCLP, 'CLP') : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function PaymentMethodsTab({ data }: { data: UserDetailResponse }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
        <CreditCard className="h-4 w-4" /> Métodos de pago
      </h3>
      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Marca</TableHead>
              <TableHead>Últ. 4</TableHead>
              <TableHead>Vence</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.paymentMethods.length === 0 && (
              <EmptyRow text="Sin métodos de pago." colSpan={5} />
            )}
            {data.paymentMethods.map((pm) => (
              <TableRow key={pm.id}>
                <TableCell>{pm.cardBrand ?? '—'}</TableCell>
                <TableCell className="font-mono">•••• {pm.last4 ?? '—'}</TableCell>
                <TableCell>
                  {pm.expMonth && pm.expYear ? `${pm.expMonth}/${pm.expYear}` : '—'}
                </TableCell>
                <TableCell>{pm.provider}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {pm.isPrimary && <Badge variant="default">Principal</Badge>}
                    {pm.isBackup && <Badge variant="secondary">Respaldo</Badge>}
                    <Badge variant="outline">{pm.status}</Badge>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function BankAccountsTab({ data }: { data: UserDetailResponse }) {
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
        <Landmark className="h-4 w-4" /> Cuentas bancarias
      </h3>
      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banco</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>N° Cuenta</TableHead>
              <TableHead>Titular</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.bankAccounts.length === 0 && (
              <EmptyRow text="Sin cuentas bancarias." colSpan={5} />
            )}
            {data.bankAccounts.map((ba) => (
              <TableRow key={ba.id}>
                <TableCell className="font-medium">{ba.bankName}</TableCell>
                <TableCell>{ba.accountType ?? '—'}</TableCell>
                <TableCell className="font-mono text-xs">{ba.accountNumber}</TableCell>
                <TableCell>{ba.accountHolder ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {ba.isDefault && <Badge variant="default">Default</Badge>}
                    {ba.isVerified && <Badge variant="secondary">Verificada</Badge>}
                    {!ba.status && <Badge variant="destructive">Inactiva</Badge>}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function EnterpriseTab({ data }: { data: UserDetailResponse }) {
  if (data.enterpriseMemberships.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-4 text-sm text-gray-500">
        Sin membresías empresariales.
      </div>
    );
  }
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-800">Membresías empresariales</h3>
      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Empresa</TableHead>
              <TableHead>Contrato</TableHead>
              <TableHead>Employee ID</TableHead>
              <TableHead>Ingreso</TableHead>
              <TableHead>Salida</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.enterpriseMemberships.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-xs">{m.enterpriseId.slice(0, 8)}…</TableCell>
                <TableCell className="font-mono text-xs">{m.contractId.slice(0, 8)}…</TableCell>
                <TableCell>{m.employeeId ?? '—'}</TableCell>
                <TableCell>{formatDate(m.joinedAt)}</TableCell>
                <TableCell>{m.leftAt ? formatDate(m.leftAt) : '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function SellerTab({ data }: { data: UserDetailResponse }) {
  if (!data.seller) return null;
  const s = data.seller;
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-gray-800">Perfil de vendedor</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <InfoRow label="Código de referido" value={s.referralCode} mono />
        <InfoRow label="Comisión" value={`${s.commissionRate}%`} />
        <InfoRow label="Total referidos" value={String(s.totalReferrals)} />
        <InfoRow label="Activo" value={s.isActive ? 'Sí' : 'No'} />
      </div>
    </div>
  );
}

function CouponRedemptionsTab({ data }: { data: UserDetailResponse }) {
  if (data.couponRedemptions.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-gray-800">
        <Ticket className="h-4 w-4" /> Cupones canjeados
      </h3>
      <div className="border rounded-lg overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cupón</TableHead>
              <TableHead>Suscripción</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.couponRedemptions.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs">{r.couponId.slice(0, 8)}…</TableCell>
                <TableCell className="font-mono text-xs">
                  {r.subscriptionId ? `${r.subscriptionId.slice(0, 8)}…` : '—'}
                </TableCell>
                <TableCell>{formatDate(r.redeemedAt, 'dd/MM/yyyy HH:mm')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function OtherCountsTab({ data }: { data: UserDetailResponse }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <InfoRow label="Notificaciones no leídas" value={String(data.notificationsUnread)} />
      <InfoRow label="Conversaciones de chat" value={String(data.chatThreadsCount)} />
    </div>
  );
}

function SubscriptionStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    ACTIVE: { variant: 'default', label: 'Activa' },
    PENDING: { variant: 'secondary', label: 'Pendiente' },
    PAST_DUE: { variant: 'destructive', label: 'Atrasada' },
    CANCELED: { variant: 'outline', label: 'Cancelada' },
    SUSPENDED: { variant: 'destructive', label: 'Suspendida' },
  };
  const cfg = map[status] ?? { variant: 'outline' as const, label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

function PaymentAttemptStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    SUCCESS: { variant: 'default', label: 'Exitoso' },
    PENDING: { variant: 'secondary', label: 'Pendiente' },
    FAILED: { variant: 'destructive', label: 'Falló' },
    REFUNDED: { variant: 'outline', label: 'Reembolsado' },
  };
  const cfg = map[status] ?? { variant: 'outline' as const, label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

function ClaimStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    PENDING: { variant: 'secondary', label: 'Pendiente' },
    UNDER_REVIEW: { variant: 'secondary', label: 'En revisión' },
    APPROVED: { variant: 'default', label: 'Aprobado' },
    REJECTED: { variant: 'destructive', label: 'Rechazado' },
    PAID: { variant: 'default', label: 'Pagado' },
  };
  const cfg = map[status] ?? { variant: 'outline' as const, label: status };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
