# Setup local — Frontend Dovela

Guía paso a paso para levantar el frontend (React 19 + Vite) en una máquina nueva.

**Requisito:** el backend debe estar corriendo en `http://localhost:3001`. Ver `SETUP.md` en `backend_dovela`.

Resultado esperado al terminar: frontend en `http://localhost:3000`.

> El frontend **no** necesita Dovela Central ni el FrontOffice para arrancar ni para trabajar en local.

---

## 1. Requisitos previos

| Herramienta | Versión | Verificar con |
|-------------|---------|---------------|
| Git | 2.40+ | `git --version` |
| Node.js | 22.x+ | `node --version` |
| npm | 10.x+ | `npm --version` |

## 2. Clonar e instalar

```bash
git clone git@github.com:DiegoGomez21/frontend_dovela.git frontend
cd frontend
npm install
```

## 3. Configurar el `.env`

```bash
cp .env.example .env
```

Los valores de ejemplo ya sirven para local:

| Variable | Valor local | Para qué |
|----------|-------------|----------|
| `VITE_APP_URL` | `http://localhost:3000` | Puerto del servidor de Vite |
| `VITE_API_URL` | `"/api"` | Ruta relativa: Vite hace proxy al backend |
| `BACKOFFICE_GATE_URL` | `http://127.0.0.1:3001` | Destino del proxy (el backend) y de la espera previa de `npm run dev` |
| `VITE_DOVELA_CENTRAL_URL` | vacío | Opcional; no se necesita en local |
| `VITE_ALLOWED_HOSTS` | vacío | Solo para túneles temporales |

- Todo lo que empieza con `VITE_` termina en el bundle del navegador: nunca poner secretos ahí.
- `.env` nunca se versiona.

## 4. Levantar el frontend

```bash
npm run dev
```

Antes de arrancar Vite, `predev` (`scripts/wait-for-backend.mjs`) espera hasta 120 s a que responda `<BACKOFFICE_GATE_URL>/health/ready`; si `BACKOFFICE_GATE_URL` falta o es inválida usa `http://127.0.0.1:3001`. `DOVELA_BACKEND_READY_URL` sobreescribe la URL completa.

Abre `http://localhost:3000`. El puerto es fijo (`strictPort`): si el 3000 está ocupado, Vite falla en vez de cambiar de puerto. En ese caso, detener el proceso que lo usa en vez de levantar otra instancia.

## 5. Iniciar sesión

Usar el usuario de test que trae el dump de desarrollo del backend:

| Campo | Valor |
|-------|-------|
| Email | `dev.test@dovela.local` |
| Contraseña | `DovelaDev2026!` |
| Rol | Programador (`Prog.`) |

## 6. Comandos útiles

```bash
# Servidor de desarrollo
npm run dev

# Build de producción (sale en build/)
npm run build

# Build con variables de desarrollo / reporte de chunks en build/stats.html
npm run build:dev
npm run build:analyze

# Previsualizar el build
npm run preview
```

## Problemas comunes

| Síntoma | Causa | Solución |
|---------|-------|----------|
| `Port 3000 is already in use` | Otra instancia de Vite | Detener la otra instancia |
| Login responde error de red / `502` | Backend apagado | Revisar `curl http://127.0.0.1:3001/health/ready` |
| `Credenciales inválidas` | Dump del backend no restaurado | Ver paso 4 del `SETUP.md` del backend |
| `BACKOFFICE_GATE_URL must be an absolute HTTP(S) origin` | `.env` sin `BACKOFFICE_GATE_URL` | Copiar de nuevo `.env.example` |
