import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/icon';
import { cn } from '@/lib/utils';
import ChatService from '../../../services/chat.service';

function normalizeList(payload) {
  return Array.isArray(payload) ? payload : payload?.data ?? [];
}


function userName(user) {
  return [user?.name, user?.name_2, user?.surname, user?.surname_2]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim() || 'Usuario Dovela';
}

function initials(user) {
  const first = user?.name?.[0] || '';
  const last = user?.surname?.[0] || '';
  return `${first}${last}`.toUpperCase() || 'U';
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export default function InternalChatPanel({ compact = false, title = 'Chat interno', subtitle = 'Mensajes rápidos entre usuarios' }) {
  const currentUserId = window.user?.id;
  const [users, setUsers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const loadDirectory = useCallback(async () => {
    setError(null);
    try {
      const [usersResp, inboxResp] = await Promise.all([
        ChatService.users(),
        ChatService.inbox(),
      ]);
      const nextUsers = normalizeList(usersResp.data);
      const nextInbox = normalizeList(inboxResp.data);
      setUsers(nextUsers);
      setInbox(nextInbox);
      setSelectedUserId((current) => {
        if (current) return current;
        return nextInbox?.[0]?.user?.id || nextUsers?.[0]?.id || null;
      });
    } catch (err) {
      setError(err?.response?.data?.message || 'No fue posible cargar el chat interno.');
    } finally {
      setLoadingDirectory(false);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    setError(null);
    try {
      const resp = await ChatService.messages(selectedUserId, { limit: 100 });
      setMessages(normalizeList(resp.data));
      ChatService.markThreadRead(selectedUserId).catch(() => {});
    } catch (err) {
      setError(err?.response?.data?.message || 'No fue posible cargar la conversación.');
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    loadDirectory();
    const timer = setInterval(loadDirectory, 30000);
    return () => clearInterval(timer);
  }, [loadDirectory]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  const conversations = useMemo(() => {
    const byId = new Map();
    users.forEach((user) => {
      if (user?.id) byId.set(user.id, { user, unread: 0, lastMessage: null });
    });
    inbox.forEach((conversation) => {
      const user = conversation?.user;
      if (!user?.id) return;
      const existing = byId.get(user.id) || { user, unread: 0, lastMessage: null };
      byId.set(user.id, {
        user: existing.user || user,
        unread: Number(conversation.unread) || 0,
        lastMessage: conversation.lastMessage || existing.lastMessage,
      });
    });
    return Array.from(byId.values()).sort((a, b) => {
      if (b.unread !== a.unread) return b.unread - a.unread;
      const aDate = new Date(a.lastMessage?.createdAt || 0).getTime();
      const bDate = new Date(b.lastMessage?.createdAt || 0).getTime();
      if (bDate !== aDate) return bDate - aDate;
      return userName(a.user).localeCompare(userName(b.user));
    });
  }, [users, inbox]);

  const selectedUser = useMemo(
    () => conversations.find((conversation) => conversation.user?.id === selectedUserId)?.user || null,
    [conversations, selectedUserId]
  );

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conversation) => {
      const haystack = [
        userName(conversation.user),
        conversation.user?.roleName,
        conversation.lastMessage?.body,
      ].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [conversations, search]);

  const handleSend = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!selectedUserId || !body || sending) return;

    setSending(true);
    setError(null);
    try {
      await ChatService.send(selectedUserId, body);
      setDraft('');
      await loadMessages();
      await loadDirectory();
    } catch (err) {
      setError(err?.response?.data?.message || 'No fue posible enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardContent className="p-0">
        <div className={cn(
          'grid grid-cols-1',
          compact ? 'min-h-[38rem]' : 'min-h-[34rem] lg:grid-cols-[18rem_minmax(0,1fr)]'
        )}>
          <aside className={cn(
            'border-border/60 bg-muted/20',
            compact ? 'border-b' : 'border-b lg:border-b-0 lg:border-r'
          )}>
            <div className="border-b border-border/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-foreground">{title}</h2>
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <Badge variant="secondary" className="rounded-full text-[10px]">
                  Beta
                </Badge>
              </div>
              <div className="relative mt-3">
                <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar usuario o conversación"
                  className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
            <div className={cn('overflow-y-auto p-2', compact ? 'max-h-48' : 'max-h-[30rem]')}>
              {loadingDirectory ? (
                <div className="space-y-2 p-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Skeleton key={index} className="h-12 rounded-lg" />
                  ))}
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
                  {search ? 'No encontramos usuarios con ese filtro.' : 'No hay usuarios disponibles para iniciar conversación.'}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredConversations.map((conversation) => {
                    const active = conversation.user.id === selectedUserId;
                    return (
                      <button
                        key={conversation.user.id}
                        type="button"
                        onClick={() => setSelectedUserId(conversation.user.id)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left transition-colors',
                          active ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                        )}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                          {initials(conversation.user)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-medium">{userName(conversation.user)}</span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {conversation.lastMessage?.body || conversation.user.roleName || 'Usuario activo'}
                          </span>
                        </span>
                        {conversation.unread > 0 && (
                          <Badge className="h-5 min-w-5 rounded-full px-1.5 text-[10px]">
                            {conversation.unread > 99 ? '99+' : conversation.unread}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <section className={cn('flex flex-col bg-card', compact ? 'min-h-[25rem]' : 'min-h-[34rem]')}>
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
              {selectedUser ? (
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {initials(selectedUser)}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">{userName(selectedUser)}</h3>
                    <p className="truncate text-xs text-muted-foreground">{selectedUser.roleName || 'Usuario interno'}</p>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Selecciona un usuario</h3>
                  <p className="text-xs text-muted-foreground">Elige una conversación para comenzar.</p>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => { loadDirectory(); loadMessages(); }}>
                <Icon name="RefreshCw" size={14} className="mr-1" />
                Actualizar
              </Button>
            </div>

            {error && (
              <div className="mx-4 mt-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {!selectedUser ? (
                <div className="flex h-full items-center justify-center text-center text-sm text-muted-foreground">
                  Selecciona un usuario para iniciar el chat interno.
                </div>
              ) : loadingMessages ? (
                <div className="space-y-3">
                  <Skeleton className="h-10 w-2/3 rounded-2xl" />
                  <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
                  <Skeleton className="h-10 w-3/5 rounded-2xl" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div className="max-w-sm rounded-xl border border-dashed border-border/70 p-6">
                    <Icon name="MessageCircle" size={28} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Sin mensajes todavía</p>
                    <p className="mt-1 text-xs text-muted-foreground">Envía el primer mensaje para coordinar el expediente o una tarea interna.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const mine = message.senderId === currentUserId;
                    return (
                      <div key={message.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                        <div
                          className={cn(
                            'max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                            mine
                              ? 'rounded-br-sm bg-primary text-primary-foreground'
                              : 'rounded-bl-sm bg-muted text-foreground'
                          )}
                        >
                          <p className="whitespace-pre-wrap break-words leading-relaxed">{message.body}</p>
                          <p className={cn('mt-1 text-[10px]', mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                            {formatTime(message.createdAt)}{mine && message.readAt ? ' · leído' : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-border/60 p-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      handleSend(event);
                    }
                  }}
                  disabled={!selectedUser || sending}
                  placeholder={selectedUser ? 'Escribe un mensaje interno…' : 'Selecciona un usuario para escribir'}
                  className="min-h-[44px] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  maxLength={2000}
                />
                <Button type="submit" disabled={!selectedUser || !draft.trim() || sending} className="sm:self-end">
                  <Icon name={sending ? 'Loader2' : 'Send'} size={14} className={cn('mr-1', sending && 'animate-spin')} />
                  Enviar
                </Button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {compact ? 'Enter envía · Shift+Enter crea una línea.' : 'Versión preliminar: mensajes directos, lectura y actualización manual/automática cada 30 segundos.'}
              </p>
            </form>
          </section>
        </div>
      </CardContent>
    </Card>
  );
}
