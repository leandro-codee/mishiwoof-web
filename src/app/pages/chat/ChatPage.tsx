/**
 * ChatPage - Hilos de chat y mensajes
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useChatThreads,
  useChatMessages,
  useCreateThread,
  useSendMessage,
} from '@modules/chat/presentation/hooks/useChat';
import { useAuth } from '@modules/auth/presentation/hooks/useAuth';
import { getErrorMessage } from '@shared/infrastructure/http/api.error';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutSucursal } from '@app/components/LayoutSucursal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ChatPage() {
  const { user } = useAuth();
  const { data: threads = [], isLoading: loadingThreads } = useChatThreads();
  const createThreadMutation = useCreateThread();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [openNew, setOpenNew] = useState(false);

  const { data: messages = [], isLoading: loadingMessages } = useChatMessages(selectedThreadId);
  const sendMessageMutation = useSendMessage(selectedThreadId ?? '');

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) {
      toast.error('Escribe un asunto');
      return;
    }
    try {
      const thread = await createThreadMutation.mutateAsync({ subject: newSubject.trim() });
      setNewSubject('');
      setOpenNew(false);
      setSelectedThreadId(thread.id);
      toast.success('Conversación creada');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThreadId || !newMessage.trim()) return;
    try {
      await sendMessageMutation.mutateAsync({ message: newMessage.trim() });
      setNewMessage('');
      toast.success('Mensaje enviado');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <LayoutSucursal title="Chat" subtitle="¿Tienes dudas? Escríbenos">
      <div className="flex flex-col md:flex-row gap-6 min-h-[400px]">
        {/* Lista de hilos */}
        <div className="w-full md:w-72 flex-shrink-0 border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="font-semibold">Conversaciones</span>
            <Dialog open={openNew} onOpenChange={setOpenNew}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white">
                  Nueva
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva conversación</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateThread} className="space-y-4 mt-4">
                  <div>
                    <Label>Asunto</Label>
                    <Input value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Ej: Consulta sobre mi plan" required />
                  </div>
                  <Button type="submit" className="w-full bg-[#FF6F61] text-white" disabled={createThreadMutation.isPending}>
                    {createThreadMutation.isPending ? 'Creando...' : 'Crear'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {loadingThreads ? (
            <Skeleton className="h-12 w-full rounded mb-2" />
          ) : threads.length === 0 ? (
            <p className="text-gray-500 text-sm">Sin conversaciones. Clic en &quot;Nueva&quot; para empezar.</p>
          ) : (
            <ul className="space-y-1">
              {threads.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedThreadId(t.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedThreadId === t.id ? 'bg-[#FF6F61]/20 text-[#FF6F61] font-medium' : 'hover:bg-gray-200'
                    }`}
                  >
                    {t.subject}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mensajes */}
        <div className="flex-1 flex flex-col border border-gray-200 rounded-xl bg-white min-h-0">
          {!selectedThreadId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 p-6">
              Selecciona una conversación o crea una nueva
            </div>
          ) : (
            <>
              <div className="p-4 border-b border-gray-200">
                <p className="font-semibold">{selectedThread?.subject ?? 'Chat'}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
                {loadingMessages ? (
                  <Skeleton className="h-16 w-full rounded" />
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.sender_id === user?.user_id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                          m.sender_id === user?.user_id ? 'bg-[#FF6F61]/20 text-black' : 'bg-gray-100 text-black'
                        }`}
                      >
                        <p>{m.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(m.created_at).toLocaleString('es-CL')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1"
                />
                <Button type="submit" className="bg-[#FF6F61] hover:bg-[#FF6F61]/90 text-white" disabled={sendMessageMutation.isPending || !newMessage.trim()}>
                  Enviar
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </LayoutSucursal>
  );
}
