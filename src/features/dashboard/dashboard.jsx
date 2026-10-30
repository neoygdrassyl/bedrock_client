import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/shared/ui/button';

import PqrsMainService from '../pqrs/api/pqrs_main.service';
import MailboxService from '../messaging/api/mailbox.service';
import AppointmentsService from '../appointments/api/appointments.service';
import BookmarkService from '../../shared/api/bookmark.service';
import { RECENT_EXPEDIENTES_CHANGED_EVENT, getRecentExpedientes } from '../expediente/fun/fun_forms/utils/expedienteWorkspaceRoute';
import { GROUPS_BY_KEY, WIDGETS_BY_ID } from './dashboardConfig';
import {
  buildTrackedExpedientes,
  deferDashboardWork,
  getFormattedDate,
  getGreeting,
  getUserDisplayName,
  normalizeList,
} from './dashboardData';
import { useDashboardLayout } from './layout/useDashboardLayout';
import WidgetFrame from './layout/WidgetFrame';
import EditToolbar from './layout/EditToolbar';
import KpiStrip from './widgets/KpiStrip';
import FavoritesWidget from './widgets/FavoritesWidget';
import ModuleGroupWidget from './widgets/ModuleGroupWidget';
import RecentWidget from './widgets/RecentWidget';
import TrackedWidget from './widgets/TrackedWidget';
import { WidgetIcon } from './widgets/WidgetCard';

// Guided-tour anchors that live on individual widgets.
const WIDGET_TOUR_IDS = {
  favorites: 'dashboard-quick-actions',
  tracked: 'dashboard-tracking',
};

const FULL_ROW_RATIO = 0.85;

/** Visible position (1-based) a widget will have after being placed next to a target. */
function getPositionAfterDrop(visibleIds, id, targetId, placement) {
  const without = visibleIds.filter((value) => value !== id);
  const targetIndex = without.indexOf(targetId);
  return (placement === 'after' ? targetIndex + 1 : targetIndex) + 1;
}

/**
 * Dashboard — customizable widget grid (order, size, visibility and favorites
 * persisted per user in localStorage) over the operational counters.
 */
function Dashboard() {
  const [counts, setCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [trackedExpedientes, setTrackedExpedientes] = useState({ personal: [], team: [] });
  const [recentExpedientes, setRecentExpedientes] = useState(() => getRecentExpedientes());
  const [loadingTracked, setLoadingTracked] = useState(true);
  const [trackedError, setTrackedError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let cancelTrackedWork = () => {};

    // Bookmarks already embed their fun_0 + fun_1 rows, so no FUN list is needed.
    async function fetchTrackedExpedientes() {
      try {
        const results = await Promise.allSettled([
          BookmarkService.list({ scope: 'personal' }),
          BookmarkService.list({ scope: 'team' }),
        ]);
        if (cancelled) return;

        const personalBookmarks = results[0].status === 'fulfilled' ? normalizeList(results[0].value?.data) : [];
        const teamBookmarks = results[1].status === 'fulfilled' ? normalizeList(results[1].value?.data) : [];
        setTrackedExpedientes({
          personal: buildTrackedExpedientes(personalBookmarks),
          team: buildTrackedExpedientes(teamBookmarks),
        });
        setTrackedError(results[0].status === 'rejected' || results[1].status === 'rejected' ? 'No se pudieron cargar todos los marcados.' : null);
      } catch {
        if (!cancelled) setTrackedError('No se pudieron cargar todos los marcados.');
      } finally {
        if (!cancelled) setLoadingTracked(false);
      }
    }

    async function fetchCounts() {
      try {
        // Only lightweight `/count` endpoints: the full FUN list used to be
        // downloaded here just to count states, which dominated dashboard load.
        // Licencias cards therefore show no counter, and Ventanilla Única is not
        // queried at all (its count scans the whole submissions table).
        const results = await Promise.allSettled([
          PqrsMainService.count(),
          MailboxService.count(),
          AppointmentsService.count(),
        ]);
        if (cancelled) return;
        const len = (r) => (r.status === 'fulfilled' && Number.isFinite(r.value?.data?.count)
          ? r.value.data.count
          : null);
        setCounts({
          '/peticiones': len(results[0]),
          '/mensajes': len(results[1]),
          '/calendario': len(results[2]),
        });

        cancelTrackedWork = deferDashboardWork(fetchTrackedExpedientes);
      } catch {
        // Counts are optional enhancement
        if (!cancelled) setLoadingTracked(false);
      } finally {
        if (!cancelled) setLoadingCounts(false);
      }
    }
    fetchCounts();
    return () => {
      cancelled = true;
      cancelTrackedWork();
    };
  }, []);

  useEffect(() => {
    const refreshRecentExpedientes = () => setRecentExpedientes(getRecentExpedientes());

    refreshRecentExpedientes();
    window.addEventListener('storage', refreshRecentExpedientes);
    window.addEventListener(RECENT_EXPEDIENTES_CHANGED_EVENT, refreshRecentExpedientes);

    return () => {
      window.removeEventListener('storage', refreshRecentExpedientes);
      window.removeEventListener(RECENT_EXPEDIENTES_CHANGED_EVENT, refreshRecentExpedientes);
    };
  }, []);

  const userName = useMemo(() => getUserDisplayName(), []);
  const userId = useMemo(() => window.user?.id ?? 'anon', []);
  const { layout, moveRelative, moveBy, setSize, hide, show, toggleFavorite, reset } = useDashboardLayout(userId);

  const [editing, setEditing] = useState(false);
  const [draggingId, setDraggingId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [liveMessage, setLiveMessage] = useState('');
  const dragIdRef = useRef(null);
  const dropTargetRef = useRef(null);
  const gridRef = useRef(null);

  const visibleIds = useMemo(() => {
    const hidden = new Set(layout.hidden);
    return layout.order.filter((id) => !hidden.has(id) && WIDGETS_BY_ID[id]);
  }, [layout.order, layout.hidden]);

  const favoriteSet = useMemo(() => new Set(layout.favorites), [layout.favorites]);

  // Widget bodies are built once per data change so drag-over re-renders of the
  // frames reuse the same elements and React skips the widget subtrees.
  // Bookmarks arrive after the counts; `undefined` keeps that tile in its skeleton.
  const kpiCounts = useMemo(() => ({
    ...counts,
    tracked: loadingTracked ? undefined : trackedExpedientes.personal.length + trackedExpedientes.team.length,
  }), [counts, loadingTracked, trackedExpedientes]);

  const widgetBodies = useMemo(() => {
    const bodies = {};
    visibleIds.forEach((id) => {
      const size = layout.sizes[id];
      if (id === 'kpis') bodies[id] = <KpiStrip counts={kpiCounts} loading={loadingCounts} size={size} />;
      else if (id === 'favorites') bodies[id] = <FavoritesWidget favorites={layout.favorites} onToggleFavorite={toggleFavorite} />;
      else if (id === 'recent') bodies[id] = <RecentWidget items={recentExpedientes} />;
      else if (id === 'tracked') {
        bodies[id] = (
          <TrackedWidget
            personal={trackedExpedientes.personal}
            team={trackedExpedientes.team}
            loading={loadingTracked}
            error={trackedError}
          />
        );
      } else if (GROUPS_BY_KEY[id]) {
        bodies[id] = (
          <ModuleGroupWidget
            group={GROUPS_BY_KEY[id]}
            counts={counts}
            loadingCounts={loadingCounts}
            favoriteSet={favoriteSet}
            onToggleFavorite={toggleFavorite}
            size={size}
          />
        );
      }
    });
    return bodies;
  }, [kpiCounts, visibleIds, layout.sizes, layout.favorites, favoriteSet, toggleFavorite, counts, loadingCounts, recentExpedientes, trackedExpedientes, loadingTracked, trackedError]);

  const clearDrag = useCallback(() => {
    dragIdRef.current = null;
    dropTargetRef.current = null;
    setDraggingId(null);
    setDropTarget(null);
  }, []);

  const announcePosition = useCallback((id, position) => {
    const title = WIDGETS_BY_ID[id]?.title || id;
    setLiveMessage(`${title} movida a la posición ${position} de ${visibleIds.length}`);
  }, [visibleIds.length]);

  const exitEditing = useCallback(() => {
    clearDrag();
    setEditing(false);
  }, [clearDrag]);

  useEffect(() => {
    if (!editing) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !dragIdRef.current) exitEditing();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editing, exitEditing]);

  const handleMoveBy = useCallback((id, delta) => {
    const index = visibleIds.indexOf(id);
    const nextIndex = index + delta;
    if (index === -1 || nextIndex < 0 || nextIndex >= visibleIds.length) return;
    moveBy(id, delta);
    announcePosition(id, nextIndex + 1);
  }, [visibleIds, moveBy, announcePosition]);

  const handleHandleKeyDown = useCallback((event, id) => {
    const deltaByKey = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };
    const delta = deltaByKey[event.key];
    if (!delta) return;
    event.preventDefault();
    handleMoveBy(id, delta);
    // Reordering moves DOM nodes, which can drop focus; restore it on the handle.
    window.requestAnimationFrame(() => {
      gridRef.current?.querySelector(`[data-widget-handle="${id}"]`)?.focus();
    });
  }, [handleMoveBy]);

  const handleDragStart = useCallback((event, id) => {
    dragIdRef.current = id;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', id);
    // Defer the style change so the browser captures the drag image first.
    window.requestAnimationFrame(() => setDraggingId(id));
  }, []);

  const handleDragOver = useCallback((event, targetId) => {
    const dragId = dragIdRef.current;
    if (!dragId) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (targetId === dragId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const gridWidth = gridRef.current?.clientWidth || rect.width;
    const axis = rect.width >= gridWidth * FULL_ROW_RATIO ? 'y' : 'x';
    const before = axis === 'x'
      ? event.clientX < rect.left + rect.width / 2
      : event.clientY < rect.top + rect.height / 2;
    const placement = before ? 'before' : 'after';

    const current = dropTargetRef.current;
    if (current && current.id === targetId && current.placement === placement && current.axis === axis) return;
    const next = { id: targetId, placement, axis };
    dropTargetRef.current = next;
    setDropTarget(next);
  }, []);

  const handleGridDragOver = useCallback((event) => {
    // Allow dropping in the gaps between cards; the last hovered target wins.
    if (dragIdRef.current) event.preventDefault();
  }, []);

  const handleGridDrop = useCallback((event) => {
    const dragId = dragIdRef.current;
    const target = dropTargetRef.current;
    if (!dragId) return;
    event.preventDefault();
    if (target && target.id !== dragId) {
      moveRelative(dragId, target.id, target.placement);
      announcePosition(dragId, getPositionAfterDrop(visibleIds, dragId, target.id, target.placement));
    }
    clearDrag();
  }, [moveRelative, announcePosition, visibleIds, clearDrag]);

  const handleReset = useCallback(() => {
    if (window.confirm('Se restablecerá el orden, el tamaño y la visibilidad de las tarjetas. Tus accesos rápidos se conservan. ¿Deseas continuar?')) {
      reset();
      setLiveMessage('Panel restablecido');
    }
  }, [reset]);

  const handleHide = useCallback((id) => {
    hide(id);
    setLiveMessage(`${WIDGETS_BY_ID[id]?.title || id} oculta`);
  }, [hide]);

  return (
    <div className="w-full space-y-5 animate-fade-in-up" data-dovela-tour-id="dashboard-main">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" data-dovela-tour-id="dashboard-hero">
        <div className="flex flex-col gap-0.5">
          <h1 className="m-0 !text-2xl !font-semibold !leading-tight tracking-tight text-foreground">
            {getGreeting()}, {userName}
          </h1>
          <p className="m-0 text-xs text-muted-foreground">{getFormattedDate()} · Resumen operativo personal</p>
        </div>
        {!editing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 gap-2 self-start rounded-xl border-border/70 bg-card px-3.5 text-xs font-medium shadow-sm sm:self-auto"
            onClick={() => setEditing(true)}
          >
            <WidgetIcon name="SlidersHorizontal" size={14} />
            Personalizar
          </Button>
        )}
      </div>

      {editing && (
        <EditToolbar hidden={layout.hidden} onShow={show} onReset={handleReset} onDone={exitEditing} />
      )}

      <div
        ref={gridRef}
        className="grid grid-cols-12 gap-4"
        data-dovela-tour-id="dashboard-operations"
        onDragOver={editing ? handleGridDragOver : undefined}
        onDrop={editing ? handleGridDrop : undefined}
      >
        {visibleIds.map((id, index) => (
          <WidgetFrame
            key={id}
            widget={WIDGETS_BY_ID[id]}
            size={layout.sizes[id]}
            editing={editing}
            index={index}
            total={visibleIds.length}
            isDragging={draggingId === id}
            dropPlacement={dropTarget?.id === id ? dropTarget.placement : null}
            dropAxis={dropTarget?.id === id ? dropTarget.axis : null}
            tourId={WIDGET_TOUR_IDS[id]}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={clearDrag}
            onSizeChange={setSize}
            onMoveBy={handleMoveBy}
            onHide={handleHide}
            onHandleKeyDown={handleHandleKeyDown}
          >
            {widgetBodies[id]}
          </WidgetFrame>
        ))}
        {visibleIds.length === 0 && (
          <div className="col-span-12 rounded-2xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted-foreground">
            Todas las tarjetas están ocultas. Usa <strong className="font-semibold text-foreground">Personalizar</strong> para mostrarlas de nuevo.
          </div>
        )}
      </div>

      <div className="sr-only" aria-live="polite" role="status">{liveMessage}</div>
    </div>
  );
}

export default Dashboard;
