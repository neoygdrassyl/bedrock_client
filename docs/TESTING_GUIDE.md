# Guía Integral de Testing - Frontend Dovela

## 1. Resumen Ejecutivo

| Categoría | Suites | Tests | Estado |
|-----------|---------|-------|--------|
| Unitarios e Integración | 53 suites | 361 tests | ✅ Todos pasan |
| Smoke Tests | 3 suites | ~15 tests | ⚠️ Falla por import faltante |
| E2E (Mock) | 5 archivos | 31 tests | ✅ Todos pasan |
| E2E (Backend) | 1 archivo | ~5 tests | 🔧 Requiere backend activo |
| E2E Skipped | N/A | 4 tests | ⏭️ 2 fixme + 2 condicionales |

## 2. Cómo Ejecutar Tests

### Tests Unitarios (Vitest)

| Comando | Descripción |
|---------|-------------|
| `npm test` | Ejecutar todos los tests unitarios/integración |
| `npm run test:watch` | Modo watch (re-ejecuta al guardar) |
| `npx vitest run FILE` | Ejecutar un archivo específico |
| `npx vitest run --reporter=verbose` | Salida detallada |
| `npx vitest run --coverage` | Con reporte de cobertura |

### Tests E2E (Playwright)

| Comando | Descripción |
|---------|-------------|
| `npm run test:e2e` | Ejecutar todos los E2E |
| `npm run test:e2e:headed` | Con navegador visible |
| `npm run test:e2e:ui` | UI interactiva de Playwright |
| `npx playwright test FILE` | Archivo específico |
| `npx playwright test --grep "pattern"` | Filtrar por nombre |
| `npx playwright test --debug` | Modo debug paso a paso |
| `npx playwright show-report` | Ver reporte HTML |
| `npm run test:all` | Unitarios + E2E secuencial |

### Auditorías

| Comando | Descripción |
|---------|-------------|
| `npm run audit:preflight` | Auditoría completa (AST + arrays) |
| `npm run audit:ast` | Análisis AST del código |
| `npm run audit:arrays` | Verificación de arrays |
| `npm run audit:arrays:strict` | Arrays modo estricto |

## 3. Parámetros Útiles de Playwright

| Parámetro | Ejemplo | Efecto |
|-----------|---------|--------|
| `--headed` | `npx playwright test --headed` | Muestra el navegador durante la ejecución |
| `--debug` | `npx playwright test --debug` | Modo debug con Inspector de Playwright |
| `--ui` | `npx playwright test --ui` | Interfaz gráfica interactiva |
| `--grep` | `--grep "login"` | Filtra tests por nombre (regex) |
| `--grep-invert` | `--grep-invert "intermediate"` | Excluye tests por nombre |
| `--project` | `--project=chromium` | Ejecuta solo en un navegador |
| `--retries=N` | `--retries=0` | Número de reintentos (0 = sin reintentos) |
| `--timeout=N` | `--timeout=120000` | Timeout global en ms |
| `--reporter=html` | N/A | Genera reporte HTML navegable |
| `--reporter=list` | N/A | Salida en formato lista |
| `--workers=N` | `--workers=1` | Paralelismo (1 = secuencial) |
| `--trace=on` | N/A | Graba traza para diagnóstico |
| `--update-snapshots` | N/A | Actualiza snapshots existentes |

## 4. Distribución de Tests

```
src/__tests__/                          # Tests unitarios e integración (Vitest)
├── App.smoke.test.js                   # ⚠️ Smoke - falla por import
├── Login.smoke.test.js                 # ⚠️ Smoke - falla por import  
├── Navigation.smoke.test.js            # ⚠️ Smoke - falla por import
├── Dashboard.integration.test.js       # ✅ Integración - dashboard widgets
├── clock*.test.js (varios)             # ✅ Unit - lógica de relojes legales
├── fun*.test.js (varios)               # ✅ Unit/Integration - módulo FUN
├── submit*.test.js (varios)            # ✅ Unit - módulo ventanilla
└── ...más archivos                     # ✅ Unit/Integration diversos

e2e/                                    # Tests E2E (Playwright)
├── fixtures/
│   └── auth.fixture.js                 # Fixture de autenticación + mocks API
├── flows/
│   ├── login.e2e.spec.js               # ✅ Login y sesión (7 pass, 2 fixme)
│   ├── ventanilla.e2e.spec.js          # ✅ Ventanilla única (7 pass)
│   ├── archivo.e2e.spec.js             # ✅ Archivo documental (6 pass, 2 skip)
│   ├── radicar-proyecto.e2e.spec.js    # ✅ Radicación FUN (6 pass)
│   ├── relojes.e2e.spec.js             # ✅ Relojes legales (5 pass)
│   └── expedition-modules.intermediate.e2e.spec.js  # 🔧 Requiere backend
└── pages/                              # Page Object Models
    ├── login.page.js
    ├── dashboard.page.js
    ├── submit.page.js
    ├── fun.page.js
    ├── archive.page.js
    └── clocks.page.js
```

## 5. Convenciones de Nombrado

| Sufijo | Tipo | Herramientas | Propósito |
|--------|------|--------------|-----------|
| `.smoke.test.js` | Smoke | Vitest + RTL | Verifica que componentes montan sin crash |
| `.unit.test.js` | Unitario | Vitest | Lógica pura (cálculos, transformaciones) |
| `.integration.test.js` | Integración | Vitest + RTL | Interacción entre componentes |
| `.render.test.js` | Render | Vitest + RTL | Verifica estructura DOM |
| `.loading.test.js` | Loading | Vitest + RTL | Estados de carga |
| `.workflow.test.js` | Workflow | Vitest + RTL | Flujos multi-paso |
| `.e2e.spec.js` | E2E | Playwright | Flujos completos en navegador |

## 6. Clasificación E2E: Mock vs Backend

| Archivo | Tipo | Dependencia | Notas |
|---------|------|-------------|-------|
| `login.e2e.spec.js` | MOCK | auth.fixture.js | Login page + sesión autenticada |
| `ventanilla.e2e.spec.js` | MOCK | auth.fixture.js | Ventanilla única con 1 entrada mock |
| `archivo.e2e.spec.js` | MOCK | auth.fixture.js | Archivo con datos vacíos (tests condicionales) |
| `radicar-proyecto.e2e.spec.js` | MOCK | auth.fixture.js | FUN con 2 registros mock (state 5, 70) |
| `relojes.e2e.spec.js` | MOCK | auth.fixture.js | Relojes legales desde FUN mock |
| `expedition-modules.intermediate` | BACKEND | Backend Express activo | Flujo completo de expedición |

## 7. Cobertura Actual por Módulo

| Módulo | Smoke | Unit | Integration | E2E | Estado |
|--------|-------|------|-------------|-----|---------|
| Dashboard | ❌ | ❌ | ✅ | ❌ | Parcial |
| Login/Auth | ⚠️ | ❌ | ❌ | ✅ | Bueno |
| FUN/Radicar | ⚠️ | ✅ | ✅ | ✅ | Bueno |
| Ventanilla | ⚠️ | ✅ | ✅ | ✅ | Bueno |
| Archivo | ⚠️ | ❌ | ❌ | ✅ | Parcial (datos vacíos) |
| Relojes/Clocks | ❌ | ✅ | ✅ | ✅ | Bueno |
| PQRS | ❌ | ❌ | ❌ | ❌ | Sin cobertura |
| Expediciones | ❌ | ❌ | ❌ | ✅ | Solo E2E (backend) |
| Records | ❌ | ❌ | ❌ | ❌ | Sin cobertura |
| Nomenclatura | ❌ | ❌ | ❌ | ❌ | Sin cobertura |
| Usos del suelo | ❌ | ❌ | ❌ | ❌ | Sin cobertura |
| TemplateEngine | ❌ | ❌ | ❌ | ❌ | Sin cobertura |
| Usuarios/Admin | ❌ | ❌ | ❌ | ❌ | Sin cobertura |

## 8. Problemas Conocidos

1. **3 smoke tests rotos** — `App.smoke.test.js`, `Login.smoke.test.js`, `Navigation.smoke.test.js` fallan porque `funmanage_new.page.js` importa `@/components/ui/select` que no existe. Fix: crear el componente o actualizar el import.

2. **Console warnings preexistentes** — Hay warnings de React y dependencias en runtime que NO son causados por los tests.

3. **expedition-modules requiere backend** — El test `expedition-modules.intermediate.e2e.spec.js` necesita el backend Express corriendo en localhost para funcionar. Excluir con `--grep-invert="intermediate"`.

4. **2 tests fixme en login** — Navegación a `/fun` y `/archive` desde sesión autenticada hace timeout. Posiblemente necesitan datos del backend para cargar.

5. **2 tests skip en archivo** — Los tests de búsqueda y expansión de filas se saltan porque `E2E_ARCHIVE_BOXES` está vacío en el fixture mock.

6. **Tab mapping en FUN** — Los registros mock tienen state 5 y 70, que no aparecen en el tab "Radicación" por defecto. Los tests usan `ensureTabWithData()` para navegar al tab correcto.

## 9. Cómo Agregar Nuevos Tests

### Tests unitarios/integración:
1. Crear archivo en `src/__tests__/` con el sufijo apropiado (`.unit.test.js`, `.integration.test.js`, etc.)
2. Importar el componente o función a testear
3. Usar `describe` y `it`/`test` para organizar
4. Ejecutar: `npx vitest run src/__tests__/NuevoTest.test.js`

### Tests E2E:
1. Crear archivo en `e2e/flows/` con sufijo `.e2e.spec.js`
2. Si usa mocks: importar fixture de `e2e/fixtures/auth.fixture.js`
3. Crear Page Object Model en `e2e/pages/` si es módulo nuevo
4. Seguir patrones del test de referencia (`expedition-modules`):
   - Usar `expect.poll()` en lugar de `waitForTimeout()` para esperas
   - Agregar `dismissAnySwal()` si el módulo usa SweetAlert2
   - Agregar detección de pantalla blanca con `detectWhiteScreenCrash()`
   - Agregar colección de errores con `page.on('pageerror', ...)`
5. Ejecutar: `npx playwright test e2e/flows/NuevoTest.e2e.spec.js --headed --retries=0`

## 10. Referencias

- `.github/instructions/testing.instructions.md` — Instrucciones detalladas de testing
- `.github/instructions/playwright-standards.md` — Estándares de Playwright
- `ai/testing-runbook.md` — Runbook de validación
- `TESTING_EXECUTION_PLAN.md` — Plan de ejecución de tests
- `e2e/fixtures/auth.fixture.js` — Fixture de auth y mock data
- `e2e/flows/expedition-modules.intermediate.e2e.spec.js` — Test de referencia con mejores prácticas