import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { CheckCheck, SendHorizontal } from 'lucide-react';
import { Icon } from '@/shared/components/icon';
import { cn } from '@/shared/lib/utils';
import ChatService from '../api/chat.service';

const REFRESH_MS = 30000;
// Consecutive messages from the same sender within this window render as one group.
const GROUP_WINDOW_MS = 5 * 60 * 1000;
const COMPOSER_MAX_HEIGHT = 128;

function normalizeList(payload) {
  return Array.isArray(payload) ? payload : payload?.data ?? [];
}

function sameId(a, b) {
  return a != null && b != null && String(a) === String(b);
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

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const timeFormat = new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' });
const shortDateFormat = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short' });
const longDateFormat = new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });

function formatTime(value) {
  const date = toDate(value);
  return date ? timeFormat.format(date) : '';
}

// Conversation list stamp: hour for today, short date otherwise.
function formatListStamp(value) {
  const date = toDate(value);
  if (!date) return '';
  return isSameDay(date, new Date()) ? timeFormat.format(date) : shortDateFormat.format(date);
}

function formatDayLabel(date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (isSameDay(date, today)) return 'Hoy';
  if (isSameDay(date, yesterday)) return 'Ayer';
  const label = longDateFormat.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

// Flattens messages into day separators and message rows flagged with their position in a group.
function buildTimeline(messages) {
  const rows = [];
  let previous = null;
  messages.forEach((message, index) => {
    const date = toDate(message.createdAt);
    const previousDate = previous ? toDate(previous.createdAt) : null;
    if (date && (!previousDate || !isSameDay(date, previousDate))) {
      rows.push({ type: 'day', key: `day-${date.toDateString()}`, label: formatDayLabel(date) });
    }
    const next = messages[index + 1];
    const nextDate = next ? toDate(next.createdAt) : null;
    const continuesPrevious = previous && sameId(previous.senderId, message.senderId) && date && previousDate
      && isSameDay(date, previousDate) && date - previousDate < GROUP_WINDOW_MS;
    const continuesNext = next && sameId(next.senderId, message.senderId) && date && nextDate
      && isSameDay(date, nextDate) && nextDate - date < GROUP_WINDOW_MS;
    rows.push({ type: 'message', key: message.id, message, first: !continuesPrevious, last: !continuesNext });
    previous = message;
  });
  return rows;
}

function Avatar({ user, size = 'md' }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
        size === 'lg' ? 'size-10 text-sm' : 'size-9 text-xs'
      )}
    >
      {initials(user)}
    </span>
  );
}

export default function InternalChatPanel({ className }) {
  const currentUserId = window.user?.id;
  const [users, setUsers] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const composerRef = useRef(null);

  const loadDirectory = useCallback(async () => {
    try {
      const [usersResp, inboxResp] = await Promise.all([
        ChatService.users(),
        ChatService.inbox(),
      ]);
      setUsers(normalizeList(usersResp.data));
      setInbox(normalizeList(inboxResp.data));
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || 'No fue posible cargar el chat interno.');
    } finally {
      setLoadingDirectory(false);
    }
  }, []);

  const loadMessages = useCallback(async ({ silent = false } = {}) => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }
    if (!silent) setLoadingMessages(true);
    try {
      const resp = await ChatService.messages(selectedUserId, { limit: 100 });
      setMessages(normalizeList(resp.data));
      ChatService.markThreadRead(selectedUserId).catch(() => {});
    } catch (err) {
      setError(err?.response?.data?.message || 'No fue posible cargar la conversación.');
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    loadDirectory();
    const timer = setInterval(loadDirectory, REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadDirectory]);

  useEffect(() => {
    loadMessages();
    if (!selectedUserId) return undefined;
    const timer = setInterval(() => loadMessages({ silent: true }), REFRESH_MS);
    return () => clearInterval(timer);
  }, [loadMessages, selectedUserId]);

  useEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, loadingMessages]);

  useLayoutEffect(() => {
    const node = composerRef.current;
    if (!node) return;
    node.style.height = 'auto';
    node.style.height = `${Math.min(node.scrollHeight, COMPOSER_MAX_HEIGHT)}px`;
  }, [draft]);

  // Only active users (the /users directory) are listed; the inbox just adds unread counts
  // and the last message, so threads with deactivated users never show up.
  const conversations = useMemo(() => {
    const inboxById = new Map();
    inbox.forEach((conversation) => {
      if (conversation?.user?.id != null) inboxById.set(String(conversation.user.id), conversation);
    });
    return users
      .filter((user) => user?.id != null && user.active !== false && user.active !== 0)
      .map((user) => {
        const conversation = inboxById.get(String(user.id));
        return { user, unread: Number(conversation?.unread) || 0, lastMessage: conversation?.lastMessage || null };
      })
      .sort((a, b) => {
        if (b.unread !== a.unread) return b.unread - a.unread;
        const aDate = toDate(a.lastMessage?.createdAt)?.getTime() || 0;
        const bDate = toDate(b.lastMessage?.createdAt)?.getTime() || 0;
        if (bDate !== aDate) return bDate - aDate;
        return userName(a.user).localeCompare(userName(b.user));
      });
  }, [users, inbox]);

  useEffect(() => {
    if (selectedUserId != null || conversations.length === 0) return;
    setSelectedUserId(conversations[0].user.id);
  }, [conversations, selectedUserId]);

  const selectedUser = useMemo(
    () => conversations.find((conversation) => sameId(conversation.user.id, selectedUserId))?.user || null,
    [conversations, selectedUserId]
  );

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conversation) => [
      userName(conversation.user),
      conversation.user?.roleName,
      conversation.lastMessage?.body,
    ].filter(Boolean).join(' ').toLowerCase().includes(term));
  }, [conversations, search]);

  const timeline = useMemo(() => buildTimeline(messages), [messages]);

  const selectConversation = (userId) => {
    setSelectedUserId(userId);
    setMobileThreadOpen(true);
    setError(null);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const body = draft.trim();
    if (!selectedUserId || !body || sending) return;

    setSending(true);
    setError(null);
    try {
      await ChatService.send(selectedUserId, body);
      setDraft('');
      await Promise.all([loadMessages({ silent: true }), loadDirectory()]);
      composerRef.current?.focus();
    } catch (err) {
      setError(err?.response?.data?.message || 'No fue posible enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={cn('flex h-[min(40rem,calc(100dvh-12rem))] min-h-[24rem] overflow-hidden rounded-2xl border border-border/70 bg-card', className)}>
      <aside
        className={cn(
          'min-h-0 w-full flex-col border-border/60 bg-muted/20 md:flex md:w-72 md:shrink-0 md:border-r',
          mobileThreadOpen ? 'hidden' : 'flex'
        )}
        aria-label="Conversaciones"
      >
        <div className="space-y-3 border-b border-border/60 p-3">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="m-0 text-sm font-semibold text-foreground">Conversaciones</h2>
            {!loadingDirectory && (
              <span className="text-xs text-muted-foreground">{conversations.length} activos</span>
            )}
          </div>
          <label className="relative block">
            <span className="sr-only">Buscar usuario o conversación</span>
            <Icon name="Search" size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar"
              className="m-0 h-9 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {loadingDirectory ? (
            <div className="space-y-1 p-1">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3 px-2 py-2">
                  <Skeleton className="size-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <p className="m-0 p-6 text-center text-sm text-muted-foreground">
              {search ? 'Sin resultados para esa búsqueda.' : 'No hay otros usuarios activos.'}
            </p>
          ) : (
            <ul className="m-0 list-none space-y-0.5 p-0">
              {filteredConversations.map(({ user, unread, lastMessage }) => {
                const selected = sameId(user.id, selectedUserId);
                const preview = lastMessage?.body
                  ? `${sameId(lastMessage.senderId, currentUserId) ? 'Tú: ' : ''}${lastMessage.body}`
                  : user.roleName || 'Sin mensajes';
                return (
                  <li key={user.id}>
                    <button
                      type="button"
                      onClick={() => selectConversation(user.id)}
                      aria-current={selected ? 'true' : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        selected ? 'bg-primary/10' : 'hover:bg-muted'
                      )}
                    >
                      <Avatar user={user} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-baseline justify-between gap-2">
                          <span className={cn('truncate text-sm text-foreground', unread > 0 ? 'font-semibold' : 'font-medium')}>
                            {userName(user)}
                          </span>
                          {lastMessage && (
                            <span className={cn('shrink-0 text-xs', unread > 0 ? 'font-medium text-primary' : 'text-muted-foreground')}>
                              {formatListStamp(lastMessage.createdAt)}
                            </span>
                          )}
                        </span>
                        <span className="mt-0.5 flex items-center justify-between gap-2">
                          <span className={cn('truncate text-xs', unread > 0 ? 'text-foreground' : 'text-muted-foreground')}>
                            {preview}
                          </span>
                          {unread > 0 && (
                            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                              <span className="sr-only">Sin leer: </span>
                              {unread > 99 ? '99+' : unread}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section
        className={cn('min-h-0 min-w-0 flex-1 flex-col md:flex', mobileThreadOpen ? 'flex' : 'hidden')}
        aria-label={selectedUser ? `Conversación con ${userName(selectedUser)}` : 'Conversación'}
      >
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/60 px-3 md:px-4">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-xl md:hidden"
            onClick={() => setMobileThreadOpen(false)}
            aria-label="Volver a conversaciones"
          >
            <Icon name="ArrowLeft" size={16} />
          </Button>
          {selectedUser ? (
            <>
              <Avatar user={selectedUser} size="lg" />
              <div className="min-w-0 flex-1">
                <h3 className="m-0 truncate text-sm font-semibold text-foreground">{userName(selectedUser)}</h3>
                <p className="m-0 truncate text-xs text-muted-foreground">{selectedUser.roleName || 'Usuario interno'}</p>
              </div>
            </>
          ) : (
            <p className="m-0 flex-1 text-sm text-muted-foreground">Elige una conversación</p>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-xl text-muted-foreground"
            onClick={() => { loadDirectory(); loadMessages({ silent: true }); }}
            aria-label="Actualizar conversación"
            title="Actualizar"
          >
            <Icon name="RefreshCw" size={15} />
          </Button>
        </header>

        {error && (
          <div role="alert" className="mx-3 mt-3 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive md:mx-4">
            {error}
          </div>
        )}

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 md:px-5" aria-live="polite">
          {!selectedUser ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Selecciona un usuario para empezar.
            </div>
          ) : loadingMessages ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-2/3 rounded-2xl" />
              <Skeleton className="ml-auto h-10 w-1/2 rounded-2xl" />
              <Skeleton className="h-10 w-3/5 rounded-2xl" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                <Icon name="MessageCircle" size={22} />
              </span>
              <p className="m-0 text-sm font-medium text-foreground">Sin mensajes todavía</p>
              <p className="m-0 max-w-xs text-sm text-muted-foreground">Escribe el primer mensaje para coordinar un expediente o una tarea.</p>
            </div>
          ) : (
            <ol className="m-0 flex list-none flex-col p-0">
              {timeline.map((row) => {
                if (row.type === 'day') {
                  return (
                    <li key={row.key} className="my-3 flex justify-center first:mt-0">
                      <span className="rounded-full bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">{row.label}</span>
                    </li>
                  );
                }
                const { message, first, last } = row;
                const mine = sameId(message.senderId, currentUserId);
                return (
                  <li
                    key={row.key}
                    className={cn('flex', mine ? 'justify-end' : 'justify-start', first ? 'mt-3' : 'mt-0.5')}
                  >
                    <div
                      className={cn(
                        'max-w-[min(70%,36rem)] rounded-2xl px-3.5 py-2 text-sm',
                        mine ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground',
                        mine && !first && 'rounded-tr-md',
                        mine && !last && 'rounded-br-md',
                        !mine && !first && 'rounded-tl-md',
                        !mine && !last && 'rounded-bl-md'
                      )}
                    >
                      <p className="m-0 whitespace-pre-wrap break-words leading-relaxed">{message.body}</p>
                      {last && (
                        <p className={cn('m-0 mt-1 text-right text-xs', mine ? 'text-primary-foreground/75' : 'text-muted-foreground')}>
                          {formatTime(message.createdAt)}
                          {mine && message.readAt && (
                            <CheckCheck size={13} className="ml-1 inline-block align-[-2px]" aria-label="Leído" />
                          )}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <form onSubmit={handleSend} className="shrink-0 border-t border-border/60 p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-input bg-background p-1.5 pl-3 focus-within:ring-2 focus-within:ring-ring">
            <label htmlFor="internal-chat-composer" className="sr-only">Mensaje</label>
            <textarea
              id="internal-chat-composer"
              ref={composerRef}
              rows={1}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  handleSend(event);
                }
              }}
              disabled={!selectedUser || sending}
              placeholder={selectedUser ? 'Escribe un mensaje…' : 'Selecciona un usuario'}
              className="m-0 max-h-32 min-h-8 flex-1 resize-none border-0 bg-transparent py-1.5 text-sm leading-normal text-foreground placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              maxLength={2000}
            />
            <Button
              type="submit"
              size="icon"
              className="size-8 shrink-0 rounded-xl"
              disabled={!selectedUser || !draft.trim() || sending}
              aria-label="Enviar mensaje"
            >
              {sending ? <Icon name="Loader2" size={15} className="animate-spin" /> : <SendHorizontal size={15} />}
            </Button>
          </div>
          <p className="m-0 mt-1.5 hidden text-xs text-muted-foreground sm:block">Enter envía · Shift + Enter agrega una línea</p>
        </form>
      </section>
    </div>
  );
}
