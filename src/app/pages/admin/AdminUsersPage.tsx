/**
 * AdminUsersPage - Listar, buscar, crear, editar, eliminar usuarios
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
import { useUsersList, useUsersSearch, useCreateUser, useUpdateUser, useDeleteUser } from '@modules/users/presentation/hooks/useUsers';
import type { CreateUserRequest, UpdateUserRequest, UserResponse } from '@modules/users/application/dto/UserDTO';
import { getErrorMessage, getValidationDetails } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { UserDetailDialog } from '@app/components/UserDetailDialog';

const ROLES = ['CUSTOMER', 'ADMIN', 'SELLER', 'ENTERPRISE'];

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [searchQ, setSearchQ] = useState('');
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);

  const limit = 10;
  const { data: listData, isLoading: listLoading } = useUsersList({ page, limit });
  const { data: searchData, isLoading: searchLoading } = useUsersSearch(searchQ, { page, limit });
  const useSearch = searchQ.length >= 2;
  const listDataResolved = useSearch ? searchData : listData;
  const isLoading = useSearch ? searchLoading : listLoading;
  const users = listDataResolved?.users ?? [];
  const total = listDataResolved?.total ?? 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(editingUser?.id ?? '');
  const deleteMutation = useDeleteUser();

  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    email: '',
    password: '',
    role: 'CUSTOMER',
  });
  const [editForm, setEditForm] = useState<UpdateUserRequest>({});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(createForm);
      toast.success('Usuario creado');
      setOpenCreate(false);
      setCreateForm({ email: '', password: '', role: 'CUSTOMER' });
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

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id) return;
    try {
      await updateMutation.mutateAsync(editForm);
      toast.success('Usuario actualizado');
      setOpenEdit(false);
      setEditingUser(null);
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

  const handleDelete = async (user: UserResponse) => {
    if (!confirm(`¿Eliminar usuario ${user.email}?`)) return;
    try {
      await deleteMutation.mutateAsync(user.id);
      toast.success('Usuario eliminado');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const openEditDialog = (user: UserResponse) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      dni: user.dni,
      birthDate: user.birthDate,
      address: user.address,
      stateId: user.stateId,
      gender: user.gender,
    });
    setFieldErrors({});
    setOpenEdit(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <Input
            placeholder="Buscar por email o DNI (mín. 2 caracteres)"
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); setPage(1); }}
            className="max-w-xs"
          />
          <Button className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white shrink-0" onClick={() => { setFieldErrors({}); setOpenCreate(true); }}>
            Nuevo usuario
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          <div className="border rounded-lg overflow-x-auto bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingUserId(user.id)}>Ver</Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>Editar</Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(user)}>Eliminar</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Anterior
              </Button>
              <span className="flex items-center px-2 text-sm text-gray-600">
                Página {page} de {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Siguiente
              </Button>
            </div>
          )}
        </>
      )}

      <Dialog open={openCreate} onOpenChange={(o) => { setOpenCreate(o); if (!o) setFieldErrors({}); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuevo usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} className={fieldErrors.email ? 'border-red-500' : ''} required />
              {fieldErrors.email && <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <Label>Contraseña</Label>
              <Input type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} className={fieldErrors.password ? 'border-red-500' : ''} required />
              {fieldErrors.password && <p className="text-sm text-red-600 mt-1">{fieldErrors.password}</p>}
            </div>
            <div>
              <Label>Rol</Label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenCreate(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={createMutation.isPending}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={(o) => { if (!o) setEditingUser(null); setFieldErrors({}); setOpenEdit(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input type="email" value={editForm.email ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} className={fieldErrors.email ? 'border-red-500' : ''} required />
              {fieldErrors.email && <p className="text-sm text-red-600 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <Label>Rol</Label>
              <Select value={editForm.role ?? 'CUSTOMER'} onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre</Label>
                <Input value={editForm.firstName ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))} placeholder="Nombre" />
              </div>
              <div>
                <Label>Apellido</Label>
                <Input value={editForm.lastName ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))} placeholder="Apellido" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>DNI/RUT</Label>
                <Input value={editForm.dni ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, dni: e.target.value }))} placeholder="12.345.678-9" />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input value={editForm.phone ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+56912345678" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Nacimiento</Label>
                <Input type="date" value={editForm.birthDate ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, birthDate: e.target.value }))} />
              </div>
              <div>
                <Label>Género</Label>
                <Select value={editForm.gender ?? ''} onValueChange={(v) => setEditForm((f) => ({ ...f, gender: v }))}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Masculino</SelectItem>
                    <SelectItem value="FEMALE">Femenino</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Dirección</Label>
              <Input value={editForm.address ?? ''} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} placeholder="Dirección completa" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Cancelar</Button>
              <Button type="submit" className="bg-[#FF6F61] text-white" disabled={updateMutation.isPending || !editingUser?.id}>Guardar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UserDetailDialog
        userId={viewingUserId}
        open={viewingUserId !== null}
        onOpenChange={(open) => {
          if (!open) setViewingUserId(null);
        }}
      />
    </div>
  );
}
