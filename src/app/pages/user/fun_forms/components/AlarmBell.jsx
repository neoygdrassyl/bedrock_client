import { useMemo, useState } from 'react';
import { Bell, Mail, Archive, Inbox, ExternalLink } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAlarmsBell } from '../hooks/useAlarmsV2';

export function AlarmBell() {
  const { alarms: openAlarms, unread, loading, markRead, archive, attend, refetch } = useAlarmsBell({
    pollMs: 60000,
    includeRead: true,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState('current');

  const currentAlarms = useMemo(
    () => (openAlarms || []).filter((a) => !a.archivedAt),
    [openAlarms]
  );
  const count = currentAlarms.length;
  const unreadCount = Number(unread) || currentAlarms.filter((a) => !a.readAt).length;
  const critical = useMemo(
    () => currentAlarms.some((a) => Number(a.level) >= 2 || /critical|expired/i.test(a.severity || '')),
    [currentAlarms]
  );

  const handleOpenExpediente = (a) => {
    const rad = a.radicado || a.fun0Id;
    if (!rad) return;
    window.open(`/funmanage/expediente/${rad}`, '_blank', 'noopener,noreferrer');
  };

  const handleOpenModal = () => {
    setModalOpen(true);
    setTab('current');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 relative text-muted-foreground"
            aria-label={`Notificaciones${unreadCount ? `: ${unreadCount} sin leer` : ''}`}
            data-testid="alarm-bell"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span
                className={`absolute -top-0.5 -right-0.5 min-w-[14px] h-[14px] rounded-full text-[9px] font-bold flex items-center justify-center px-1 ${
                  critical ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                }`}
                data-testid="alarm-badge"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Alarmas</span>
            <span className="text-xs text-muted-foreground font-normal">
              {loading ? 'Actualizando…' : `${unreadCount} sin leer / ${count} activas`}
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {count === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              Sin alarmas pendientes.
            </div>
          ) : (
            currentAlarms.slice(0, 10).map((a) => (
              <AlarmDropdownItem
                key={a.id}
                alarm={a}
                onOpen={() => handleOpenExpediente(a)}
                onMarkRead={() => markRead(a.id)}
                onAttend={() => attend(a.id)}
              />
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleOpenModal} data-testid="alarm-bell-view-all">
            <Inbox className="h-3.5 w-3.5 mr-2" />
            Ver todas las alarmas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {modalOpen && (
        <AlarmsModal
          onClose={() => setModalOpen(false)}
          tab={tab}
          setTab={setTab}
          currentAlarms={currentAlarms}
          refetch={refetch}
          markRead={markRead}
          archive={archive}
          attend={attend}
          onOpenExpediente={handleOpenExpediente}
        />
      )}
    </>
  );
}

function AlarmDropdownItem({ alarm, onOpen, onMarkRead, onAttend }) {
  const sev = String(alarm.severity || '').toLowerCase();
  const dotCls =
    sev === 'expired' ? 'bg-red-800' :
    sev === 'critical' ? 'bg-red-600' :
    sev === 'warning' ? 'bg-amber-500' : 'bg-slate-400';
  const isUnread = !alarm.readAt;

  return (
    <DropdownMenuItem
      className={`flex flex-col items-start gap-1 py-2 ${isUnread ? 'bg-slate-50 dark:bg-slate-900/30' : ''}`}
      onSelect={(e) => e.preventDefault()}
      data-testid={`alarm-item-${alarm.id}`}
    >
      <div className="flex items-center gap-2 w-full">
        <span className={`w-2 h-2 rounded-full ${dotCls} shrink-0`} />
        <span className="text-xs font-medium truncate flex-1">
          {alarm.radicado || `Expediente #${alarm.fun0Id}`}
        </span>
        <span className="text-[10px] text-muted-foreground">{alarm.phaseCode}</span>
      </div>
      {alarm.message && (
        <span className="text-[11px] text-muted-foreground line-clamp-2 w-full">
          {alarm.message}
        </span>
      )}
      <div className="flex gap-3 mt-1 ml-4 text-[11px]">
        <button type="button" className="text-primary hover:underline flex items-center gap-1" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          <ExternalLink className="h-3 w-3" /> Abrir
        </button>
        {isUnread && (
          <button type="button" className="text-muted-foreground hover:underline" onClick={(e) => { e.stopPropagation(); onMarkRead(); }}>
            Marcar leída
          </button>
        )}
        <button type="button" className="text-emerald-600 hover:underline" onClick={(e) => { e.stopPropagation(); onAttend(); }}>
          Atender
        </button>
      </div>
    </DropdownMenuItem>
  );
}

function AlarmsModal({ onClose, tab, setTab, currentAlarms, refetch, markRead, archive, attend, onOpenExpediente }) {
  const [archived, setArchived] = useState([]);
  const [loadingArchived, setLoadingArchived] = useState(false);

  const loadArchived = async () => {
    setLoadingArchived(true);
    try {
      const svc = (await import('../../../../services/alarm.service')).default;
      const resp = await svc.bell({ includeRead: true, includeArchived: true, limit: 200 });
      const list = resp.data?.data ?? resp.data ?? [];
      setArchived(Array.isArray(list) ? list.filter((a) => a.archivedAt) : []);
    } finally {
      setLoadingArchived(false);
    }
  };

  const handleTabChange = (next) => {
    setTab(next);
    if (next === 'archived' && archived.length === 0) loadArchived();
  };

  const activeList = tab === 'current' ? currentAlarms : archived;

  return (
    <div
      className="fixed inset-0 z-[1060] bg-black/50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      data-testid="alarms-modal"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Todas las alarmas</h3>
          <button type="button" className="btn-close" aria-label="Cerrar" onClick={onClose} />
        </div>
        <div className="px-4 pt-3">
          <ul className="nav nav-tabs">
            <li className="nav-item">
              <button
                className={`nav-link ${tab === 'current' ? 'active' : ''}`}
                onClick={() => handleTabChange('current')}
                data-testid="alarms-modal-tab-current"
              >
                Actuales ({currentAlarms.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${tab === 'archived' ? 'active' : ''}`}
                onClick={() => handleTabChange('archived')}
                data-testid="alarms-modal-tab-archived"
              >
                Archivadas{archived.length ? ` (${archived.length})` : ''}
              </button>
            </li>
          </ul>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {loadingArchived && tab === 'archived' ? (
            <div className="text-center text-muted-foreground py-8">Cargando archivadas…</div>
          ) : activeList.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No hay alarmas.</div>
          ) : (
            <table className="table table-sm align-middle">
              <thead>
                <tr>
                  <th></th>
                  <th>Expediente</th>
                  <th>Fase</th>
                  <th>Nivel</th>
                  <th>Uso</th>
                  <th>Mensaje</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {activeList.map((a) => {
                  const sev = String(a.severity || '').toLowerCase();
                  const dotCls =
                    sev === 'expired' ? 'bg-red-800' :
                    sev === 'critical' ? 'bg-red-600' :
                    sev === 'warning' ? 'bg-amber-500' : 'bg-slate-400';
                  return (
                    <tr key={a.id} data-testid={`alarms-modal-row-${a.id}`}>
                      <td><span className={`inline-block w-2 h-2 rounded-full ${dotCls}`} /></td>
                      <td>{a.radicado || `#${a.fun0Id}`}</td>
                      <td><code>{a.phaseCode}</code></td>
                      <td>Nivel {a.level || '-'}</td>
                      <td>{a.daysUsed}/{a.daysTotal} ({a.percentUsed}%)</td>
                      <td className="small text-muted">{a.message}</td>
                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button type="button" className="btn btn-outline-primary" onClick={() => onOpenExpediente(a)} title="Abrir expediente en nueva pestaña">
                            <ExternalLink className="h-3 w-3" />
                          </button>
                          {tab === 'current' && !a.readAt && (
                            <button type="button" className="btn btn-outline-secondary" onClick={async () => { await markRead(a.id); }} title="Marcar leída">
                              <Mail className="h-3 w-3" />
                            </button>
                          )}
                          {tab === 'current' && (
                            <>
                              <button type="button" className="btn btn-outline-success" onClick={async () => { await attend(a.id); }}>
                                Atender
                              </button>
                              <button type="button" className="btn btn-outline-danger" onClick={async () => { await archive(a.id); loadArchived(); }} title="Archivar">
                                <Archive className="h-3 w-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="px-4 py-3 border-t d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-link btn-sm" onClick={refetch}>
            Refrescar
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
