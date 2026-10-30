import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Icon } from '@/shared/components/icon';
import ChatService from '../api/chat.service';
import InternalChatPanel from './InternalChatPanel';

function normalizeList(payload) {
  return Array.isArray(payload) ? payload : payload?.data ?? [];
}

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);

  const refreshInbox = useCallback(async () => {
    try {
      const resp = await ChatService.inbox({ skipErrorLog: true });
      setConversations(normalizeList(resp.data));
    } catch (_error) {
      setConversations([]);
    }
  }, []);

  // Other shell surfaces (e.g. the command palette) open the chat without importing it.
  useEffect(() => {
    const handleOpenRequest = () => setOpen(true);
    window.addEventListener('dovela:open-chat', handleOpenRequest);
    return () => window.removeEventListener('dovela:open-chat', handleOpenRequest);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    refreshInbox();
    const timer = setInterval(refreshInbox, 60000);
    return () => clearInterval(timer);
  }, [open, refreshInbox]);

  useEffect(() => {
    if (!open) return undefined;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const unread = useMemo(
    () => conversations.reduce((acc, conversation) => acc + (Number(conversation.unread) || 0), 0),
    [conversations]
  );

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="relative h-8 w-8 shrink-0 rounded-xl p-0 text-muted-foreground touch:h-11 touch:w-11"
        aria-label={unread ? `Chat interno: ${unread} mensajes sin leer` : 'Abrir chat interno'}
        title="Abrir chat interno"
        onClick={() => setOpen(true)}
      >
        <Icon name="MessageCircle" size={15} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-[14px] min-w-[14px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </Button>

      {open && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[1210] flex items-stretch justify-center overflow-y-auto bg-black/55 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Chat interno"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-dvh w-full max-w-none flex-col overflow-hidden rounded-none border-border bg-background shadow-2xl sm:h-[min(46rem,calc(100dvh-2rem))] sm:w-[min(68rem,calc(100vw-2rem))] sm:rounded-2xl sm:border"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/60 bg-background px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon name="MessageCircle" size={16} />
                </span>
                <div className="min-w-0">
                  <h2 className="m-0 text-sm font-semibold text-foreground">Chat interno</h2>
                  <p className="m-0 text-xs text-muted-foreground">Mensajes directos entre usuarios activos</p>
                </div>
                {unread > 0 && (
                  <Badge variant="secondary" className="hidden rounded-full text-xs sm:inline-flex">
                    {unread} sin leer
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOpen(false)} aria-label="Cerrar chat interno">
                <Icon name="X" size={16} />
              </Button>
            </div>
            <InternalChatPanel className="h-auto min-h-0 flex-1 rounded-none border-0" />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
