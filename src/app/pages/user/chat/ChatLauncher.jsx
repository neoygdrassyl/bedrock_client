import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/icon';
import ChatService from '../../../services/chat.service';
import InternalChatPanel from './InternalChatPanel';

function normalizeList(payload) {
  return Array.isArray(payload) ? payload : payload?.data ?? [];
}

export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState([]);

  const refreshInbox = useCallback(async () => {
    try {
      const resp = await ChatService.inbox({ skipDovelaErrorCapture: true });
      setConversations(normalizeList(resp.data));
    } catch (_error) {
      setConversations([]);
    }
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
        className="h-7 w-7 p-0 relative text-muted-foreground"
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
            className="flex h-dvh w-full max-w-none flex-col overflow-hidden rounded-none border-border bg-background shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:w-[min(72rem,calc(100vw-2rem))] sm:rounded-xl sm:border"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border/60 bg-background px-4 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon name="MessageCircle" size={16} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-foreground">Chat interno</h2>
                  <p className="text-xs text-muted-foreground">Herramienta rápida de comunicación entre usuarios</p>
                </div>
                <Badge variant="secondary" className="hidden rounded-full text-[10px] sm:inline-flex">
                  {unread} sin leer
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setOpen(false)} aria-label="Cerrar chat interno">
                <Icon name="X" size={16} />
              </Button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
              <InternalChatPanel title="Directorio interno" subtitle="Selecciona un usuario y conversa sin cambiar de módulo" />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
