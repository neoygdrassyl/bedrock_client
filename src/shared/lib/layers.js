/**
 * Stacking scale for fixed and portaled UI (single source of truth).
 *
 * Most of these surfaces are portaled to <body>, so they compete in the root
 * stacking context and need absolute values. Local stacking (sticky table
 * headers, in-card overlays) keeps using small Tailwind values (z-10, z-20).
 *
 *   pageModal    1050   LegacyModal and Bootstrap-era modals outside the workspace (1040-1080)
 *   launcher     1200   floating launchers: AlarmBell (1200), ChatLauncher (1210)
 *   workspace    9999   expediente fullscreen workspace (FunExpedienteFullscreen)
 *   modal       10080   portaled modal surfaces: Dialog, AlertDialog, Sheet, CommandDialog
 *                       and LegacyModal while the workspace is open. Overlay and content
 *                       share the value: the surface opened last is appended last to
 *                       <body> and therefore stacks on top (nested modals just work).
 *   floating    10100   Popover, Select, DropdownMenu and Tooltip content: always above
 *                       the modal or workspace they are opened from.
 *   systemAlert 30000   SweetAlert2 (src/shared/styles/swal-theme.css)
 *
 * Intentional local exceptions above the workspace stay between `workspace` and
 * `modal`: workspace header dialogs (10000/10010, FunExpedienteFullscreen) and the
 * expanded alarms dialog (10040/10050, AlarmsWidget).
 */
export const Z_INDEX = Object.freeze({
  pageModal: 1050,
  launcher: 1200,
  workspace: 9999,
  modal: 10080,
  floating: 10100,
  systemAlert: 30000,
});

// Literal class names (not built from Z_INDEX) so Tailwind's JIT compiler emits them.
export const Z_CLASS = Object.freeze({
  workspace: 'z-[9999]',
  modal: 'z-[10080]',
  floating: 'z-[10100]',
});
