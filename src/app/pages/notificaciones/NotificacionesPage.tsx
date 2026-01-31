/**
 * NotificacionesPage - Listar notificaciones y marcar como leídas
 */

import { Button } from '@/components/ui/button';
import { useNotificationsList, useMarkAsRead, useMarkAllAsRead } from '@modules/notifications/presentation/hooks/useNotifications';
import { LayoutSucursal } from '@app/components/LayoutSucursal';
import { Skeleton } from '@/components/ui/skeleton';
import { getErrorMessage } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';

export function NotificacionesPage() {
  const { data: notifications = [], isLoading } = useNotificationsList();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
      toast.success('Marcada como leída');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      toast.success('Todas marcadas como leídas');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <LayoutSucursal title="Notificaciones" subtitle={unreadCount > 0 ? `${unreadCount} sin leer` : undefined}>
      {unreadCount > 0 && (
        <div className="mb-4">
          <Button variant="outline" size="sm" onClick={() => handleMarkAllAsRead()} disabled={markAllAsReadMutation.isPending}>
            Marcar todas como leídas
          </Button>
        </div>
      )}
      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-lg mb-2" />
      ) : notifications.length === 0 ? (
        <p className="text-gray-600">No tienes notificaciones.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border p-4 ${n.is_read ? 'bg-white border-gray-200' : 'bg-[#FF6F61]/5 border-[#FF6F61]/30'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-black">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(n.created_at).toLocaleString('es-CL')}</p>
                </div>
                {!n.is_read && (
                  <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(n.id)} disabled={markAsReadMutation.isPending}>
                    Marcar leída
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </LayoutSucursal>
  );
}
