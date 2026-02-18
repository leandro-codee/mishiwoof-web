/**
 * AdminBankAccountsPage - Gestión de cuentas bancarias para pagos
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Mock data
const mockBankAccounts = [
  {
    id: '1',
    bankName: 'Banco de Chile',
    accountType: 'CUENTA_CORRIENTE',
    accountNumber: '1234567890',
    accountHolder: 'Mishiwoof SpA',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

type AccountType = 'CUENTA_CORRIENTE' | 'CUENTA_VISTA' | 'CUENTA_AHORRO';

export function AdminBankAccountsPage() {
  const [accounts] = useState(mockBankAccounts);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState<string | null>(null);

  const [form, setForm] = useState({
    bankName: '',
    accountType: 'CUENTA_CORRIENTE' as AccountType,
    accountNumber: '',
    accountHolder: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useCreateBankAccount
      toast.success('Cuenta bancaria creada');
      setOpenCreate(false);
      resetForm();
    } catch (err) {
      toast.error('Error al crear cuenta bancaria');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // TODO: Implementar con useUpdateBankAccount
      toast.success('Cuenta bancaria actualizada');
      setOpenEdit(null);
      resetForm();
    } catch (err) {
      toast.error('Error al actualizar cuenta bancaria');
    }
  };

  const resetForm = () => {
    setForm({
      bankName: '',
      accountType: 'CUENTA_CORRIENTE',
      accountNumber: '',
      accountHolder: '',
    });
  };

  const openEditDialog = (account: typeof mockBankAccounts[0]) => {
    setForm({
      bankName: account.bankName,
      accountType: account.accountType as AccountType,
      accountNumber: account.accountNumber,
      accountHolder: account.accountHolder,
    });
    setOpenEdit(account.id);
  };

  const getAccountTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CUENTA_CORRIENTE: 'Cuenta Corriente',
      CUENTA_VISTA: 'Cuenta Vista',
      CUENTA_AHORRO: 'Cuenta de Ahorro',
    };
    return labels[type] || type;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Cuentas Bancarias</h1>
        <Button
          className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white"
          onClick={() => {
            resetForm();
            setOpenCreate(true);
          }}
        >
          Nueva cuenta bancaria
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Banco</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Número de Cuenta</TableHead>
              <TableHead>Titular</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.bankName}</TableCell>
                <TableCell>{getAccountTypeLabel(account.accountType)}</TableCell>
                <TableCell className="font-mono">{account.accountNumber}</TableCell>
                <TableCell>{account.accountHolder}</TableCell>
                <TableCell>
                  <Badge variant={account.isActive ? 'default' : 'secondary'}>
                    {account.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => openEditDialog(account)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Create */}
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Cuenta Bancaria</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Banco</Label>
              <Input
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                placeholder="Nombre del banco"
                required
              />
            </div>
            <div>
              <Label>Tipo de Cuenta</Label>
              <Select
                value={form.accountType}
                onValueChange={(v) => setForm((f) => ({ ...f, accountType: v as AccountType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUENTA_CORRIENTE">Cuenta Corriente</SelectItem>
                  <SelectItem value="CUENTA_VISTA">Cuenta Vista</SelectItem>
                  <SelectItem value="CUENTA_AHORRO">Cuenta de Ahorro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Número de Cuenta</Label>
              <Input
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                placeholder="1234567890"
                required
              />
            </div>
            <div>
              <Label>Titular</Label>
              <Input
                value={form.accountHolder}
                onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))}
                placeholder="Nombre del titular"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#FF6F61] text-white">
                Crear
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={openEdit !== null} onOpenChange={(o) => !o && setOpenEdit(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cuenta Bancaria</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Banco</Label>
              <Input
                value={form.bankName}
                onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Tipo de Cuenta</Label>
              <Select
                value={form.accountType}
                onValueChange={(v) => setForm((f) => ({ ...f, accountType: v as AccountType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUENTA_CORRIENTE">Cuenta Corriente</SelectItem>
                  <SelectItem value="CUENTA_VISTA">Cuenta Vista</SelectItem>
                  <SelectItem value="CUENTA_AHORRO">Cuenta de Ahorro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Número de Cuenta</Label>
              <Input
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label>Titular</Label>
              <Input
                value={form.accountHolder}
                onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(null)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#FF6F61] text-white">
                Guardar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
