# F3 Playwright QA Report

- Date: 2026-05-11
- Command: `npm run test:e2e -- --grep 'login|FUN|radic|modal'`
- Evidence log: `.sisyphus/evidence/react-doctor/final/e2e-smoke-after-fixes.log`
- Status: PASSED

## Result

The Playwright smoke command passed after updating stale E2E expectations to match the current runtime contracts.

| Outcome | Count |
|---|---:|
| Passed | 25 |
| Skipped | 2 |
| Failed | 0 |

## Passing Coverage Observed

- Login redirect/access/logout coverage passed.
- Ventanilla modal smoke coverage passed.
- Radicación page-load, ID generation, tab/search, and action-menu coverage passed.
- Gestión Licencias Nuevo closed-state smoke passed in light and dark mode.
- Relojes/FUN action-menu workspace coverage passed.
- Modal overlay smoke coverage passed.

## Remediated Areas

| Spec | Previous Failure Pattern | Resolution |
|---|---|---|
| `e2e/flows/funmanage-table-compact.spec.js` | `getByTestId('funmanage-table')` not found | Updated the spec to assert the intentional `gestion-nueva-development-state` closed surface. |
| `e2e/flows/radicar-proyecto.e2e.spec.js` | `GENERAR LIC` button and action-menu `Detalles` not found | Updated page object/spec to current `GENERAR` button and `Abrir solicitud` menu label. |
| `e2e/flows/relojes.e2e.spec.js` | `.ReactModal__Content:visible` / `Detalles` menu not found | Updated expectations to current workspace navigation via `/funmanage/expediente/<radicado>?section=tiempos`. |

## Interpretation

This F3 gate is approved. The root cause was stale Playwright expectations for intentionally changed FUN/radicación/relojes UI contracts, not React Doctor runtime regressions.

## Follow-up Note

- The skipped authenticated navigation specs remain unchanged and are already annotated in the test output as backend-data-dependent timeouts.
