import { createContext, useContext } from 'react';

/**
 * True for everything rendered inside the expediente workspace
 * (FunExpedienteFullscreen). Legacy modules also render in the old modal flows
 * (fun.jsx, funmanage.page.jsx); this lets shared pieces tell the two apart
 * without threading a prop through every module root.
 */
export const ExpedienteWorkspaceContext = createContext(false);

export function useIsInsideExpedienteWorkspace() {
  return useContext(ExpedienteWorkspaceContext);
}
