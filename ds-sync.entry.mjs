// ds-sync.entry.mjs — entrada curada del design system para /design-sync.
// No la usa la app: solo el convertidor de claude.ai/design la consume.
// Excluye deliberadamente módulos pesados (rich-text-editor/jodit, legacy-modal).
export * from './src/components/dovela-ui/index.js';

export * from './src/components/ui/alert-dialog.jsx';
export * from './src/components/ui/avatar.jsx';
export * from './src/components/ui/badge.jsx';
export * from './src/components/ui/button.jsx';
export * from './src/components/ui/card.jsx';
export * from './src/components/ui/checkbox.jsx';
export * from './src/components/ui/collapsible.jsx';
export * from './src/components/ui/command.jsx';
export * from './src/components/ui/dialog.jsx';
export * from './src/components/ui/dropdown-menu.jsx';
export * from './src/components/ui/empty-state.jsx';
export * from './src/components/ui/input.jsx';
export * from './src/components/ui/label.jsx';
export * from './src/components/ui/popover.jsx';
export * from './src/components/ui/radio-group.jsx';
export * from './src/components/ui/scroll-area.jsx';
export * from './src/components/ui/select.jsx';
export * from './src/components/ui/separator.jsx';
export * from './src/components/ui/sheet.jsx';
export * from './src/components/ui/skeleton.jsx';
export * from './src/components/ui/sonner.jsx';
export * from './src/components/ui/switch.jsx';
export * from './src/components/ui/tab-pane.jsx';
export * from './src/components/ui/table.jsx';
export * from './src/components/ui/tabs.jsx';
export * from './src/components/ui/textarea.jsx';
export * from './src/components/ui/tooltip.jsx';

// `toast` acompaña al Toaster de sonner: sin él no hay forma de disparar
// notificaciones desde diseños construidos con el DS.
export { toast } from 'sonner';

export { Icon } from './src/components/icon.jsx';
export { DataTable } from './src/components/data-table.jsx';
export { ThemeProvider } from './src/components/theme-provider.jsx';
