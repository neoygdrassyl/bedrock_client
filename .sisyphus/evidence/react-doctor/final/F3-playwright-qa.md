# F3 Playwright QA Report

- Date: 2026-05-11
- Command: `npm run test:e2e -- --grep 'login|FUN|radic|modal'`
- Evidence log: `.sisyphus/evidence/react-doctor/final/e2e-smoke.log`
- Status: BLOCKED

## Result

The Playwright smoke command did not pass.

| Outcome | Count |
|---|---:|
| Passed | 20 |
| Skipped | 2 |
| Failed | 9 |

## Passing Coverage Observed

- Login redirect/access/logout coverage passed.
- Ventanilla modal smoke coverage passed.
- Radicación page-load and tab/search coverage partially passed.
- Modal overlay smoke coverage passed.

## Failing Areas

| Spec | Failure Pattern | Notes |
|---|---|---|
| `e2e/flows/funmanage-table-compact.spec.js` | `getByTestId('funmanage-table')` not found | The current `/licencias/gestion-nueva` runtime did not expose the compact table expected by the spec. |
| `e2e/flows/radicar-proyecto.e2e.spec.js` | `GENERAR LIC` button and action-menu `Detalles` not found | The current FUN/radicación UI did not match the expected selectors/menu labels. |
| `e2e/flows/relojes.e2e.spec.js` | `.ReactModal__Content:visible` / `Detalles` menu not found | The current Clocks/FUN modal flow did not expose the legacy modal selectors expected by the spec. |

## Interpretation

This F3 gate is not approved. The failures are concentrated in existing E2E expectations for FUN/radicación/relojes runtime flows rather than in the narrow React Doctor fixes already verified by Vitest, preflight, React Doctor diff, and build. The result still blocks marking the final verification wave as fully complete until the user approves either targeted E2E remediation or accepts this as a known E2E baseline gap.

## Required Decision

- Investigate and repair the failing Playwright specs/runtime flows in a follow-up E2E-focused task, or
- Accept F3 as a documented residual blocker for this React Doctor mitigation package.
