// Public API of the expediente dock (global quick-view windows).
export {
  DOCK_MAX_ITEMS,
  DOCK_MAX_OPEN,
  DOCK_STORAGE_KEY,
  addToDock,
  closeItem,
  getDockSnapshot,
  minimize,
  setActiveWorkspace,
  setDockSearchOpen,
  toggleWindow,
  useExpedienteDock,
} from './expedienteDockStore';
export { ExpedienteDockMount } from './ExpedienteDockMount';
