# React Doctor Test Inventory

## Available Test Options

| Layer | Available | Evidence | Use in this mitigation |
|---|---|---|---|
| Vitest | Yes | `package.json` script `test`, `vitest.config.mjs` | Primary unit, integration, and workflow runner |
| Testing Library | Yes | `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` in `package.json` | Render and interaction tests for UI changes |
| MSW | Yes | `src/__tests__/mocks/server.js`, `src/__tests__/mocks/handlers/` | Network-level workflow tests without backend dependency |
| Unit tests | Yes | `src/__tests__/*unit.test.*` | Hooks, services, utilities, focused logic |
| Integration tests | Yes | `src/__tests__/*integration.test.js` | Render and service-contract checks for pages/modules |
| Workflow tests | Yes | `src/__tests__/workflows/submit-fun-records-expedition.workflow.test.js` | Cross-module legal flow characterization |
| Playwright | Yes | `package.json` script `test:e2e`, `playwright.config.js`, `e2e/` | Browser smoke for login, FUN/radicacion, modal overlays, and UI-sensitive a11y fixes |
| Playwright standards | Yes | `src/__playwright/config.js`, `.github/instructions/playwright-standards.md` | Required artifact and temp-path conventions |
| Static audit | Yes | `audit:ast`, `audit:arrays`, `audit:preflight` | Syntax/array safety guard before and after remediation |
| Build gate | Yes | `package.json` script `build` | Production bundle verification |
| Coverage script | No | No `test:coverage` script found | Not required for this mitigation plan |
| React Doctor script | Yes | `package.json` script `audit:react-doctor` | Pinned audit evidence after Task 2 |
| CI workflow | No | No CI workflow is assumed by this plan | Do not add CI silently |

## Base Characterization Strategy

The base characterization test uses the existing MSW workflow server and real frontend services to prove that a submitted entry can become a FUN license, then remain traceable through a technical record and expedition.

This is the minimum functional story required before React Doctor remediation touches high-risk legal modules:

1. Create a submit entry.
2. Create a FUN license linked to the submit entry.
3. Link the submit entry back to the FUN id.
4. Create a LAW record and expedition using the same FUN id.
5. Read back all records and assert the same FUN id remains the traceability key.

## Required Commands

```bash
npm test -- src/__tests__/workflows --run
npm run audit:preflight
npm run build
```

## Notes

- Tests must use `vi.*`, not `jest.*`.
- Unit and integration tests must not call the real backend.
- Any protected module touched by React Doctor remediation needs a characterization test before the fix.
- Playwright is reserved for browser-level functional flows and UI-sensitive accessibility/layout changes.
