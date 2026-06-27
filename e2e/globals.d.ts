/**
 * Declaraciones de tipos globales para los tests E2E de Dovela.
 *
 * Este archivo extiende interfaces globales del browser (Window) con
 * propiedades custom que la aplicación escribe directamente en el objeto
 * global durante la autenticación y el ciclo de vida de los componentes.
 *
 * Sin esta declaración, TypeScript marca como error cualquier acceso a
 * `window.user` en los archivos E2E que usan `// @ts-check`.
 */
interface Window {
  /**
   * Usuario autenticado activo. Lo escriben los componentes de Dovela
   * vía `window.user = { id, name, roleId, ... }` tras el login,
   * y lo leen los módulos que no tienen acceso al contexto de React.
   */
  user?: Record<string, unknown>;
}
