# Task 11 - Advisory React Doctor Triage

## Baseline Used

- Evidence source: `.sisyphus/evidence/react-doctor/task-8-after/diagnostics.json`
- Scope: advisory warnings that must not trigger deletion-first or broad architectural cleanup.
- Policy: report-only unless a separate, explicitly approved implementation plan exists.

## Advisory Rule Summary

| Rule | Count | Status | Decision |
|---|---:|---|---|
| `knip/files` | 108 | report-only | Do not delete. Many files can be route-linked, dynamically imported, public assets, or test helpers. |
| `knip/exports` | 83 | report-only | Do not remove exports without per-export confirmation and usage proof. |
| `react-doctor/no-giant-component` | 143 | deferred | Do not split components in this mitigation pass. Require separate refactor specs and characterization. |
| `react-doctor/design-no-redundant-size-axes` | 182 | deferred | Do not change layout/CSS only to satisfy the design rule. Apply during future UI work with visual verification. |
| `react-doctor/design-no-three-period-ellipsis` | 117 | deferred | Do not alter legal copy, template strings, loading text, or historic UI copy in this pass. |
| Bundle-size warnings | 18 | advisory | Track as release-readiness/performance work, not as React Doctor error remediation. |

## `knip/files` - Report-Only Hotspots

Representative findings include:

- `e2e/globals.d.ts`
- `public/pdf.worker.min.mjs`
- `src/reportWebVitals.js`
- `e2e/pages/dashboard.page.js`
- `src/__tests__/helpers/mockPages.js`
- `src/__tests__/helpers/mockServices.js`
- `src/app/components/btnChat.js`
- `src/app/components/btnStart.js`
- `src/app/components/footer.js`
- `src/app/components/languageSwitcher.js`

Decision: `knip/files` remains report-only. No file deletion is authorized by this task.

## `knip/exports` - Report-Only Hotspots

Representative findings include:

- `src/app/pages/user/dashboardPreferences.js` - 11
- `src/app/utils/errorReporting.js` - 8
- `src/components/ui/dropdown-menu.jsx` - 8
- `src/app/pages/user/shared/expediente-documental.utils.js` - 5
- `src/components/ui/select.jsx` - 5
- `src/app/components/customClasses/typeParse.js` - 4
- `src/components/ui/dialog.jsx` - 4
- `src/app/components/vars.global.js` - 4
- `src/app/utils/richTextBlockNote.js` - 4
- `src/app/pages/user/fun_forms/utils/expedienteWorkspaceRoute.js` - 3

Decision: `knip/exports` remains report-only. These exports can be public module contracts, dynamic helpers, or pending integration surfaces.

## Giant Component Deferrals

The following high-risk files are explicitly deferred:

- `src/app/pages/user/expeditions/exp._res.component.js`
- `src/app/pages/user/fun_forms/fun_macrotable..js`
- `src/app/pages/user/fun.js`

Decision: `react-doctor/no-giant-component` is real architectural debt, but it is not safe to resolve as incidental audit cleanup. Splitting these components requires a separate implementation plan, module-specific characterization tests, and route/service contract checks.

## Design and Copy Rules

### `react-doctor/design-no-redundant-size-axes`

Decision: deferred. The rule can be useful for design-system cleanup, but layout changes must be reviewed under Dovela redesign standards and should not be mixed into React Doctor correctness work.

### `react-doctor/design-no-three-period-ellipsis`

Decision: deferred. Three-period ellipses may exist in legal copy, loading states, historic texts, or templates. Copy edits require product/domain review.

## Bundle Size

Decision: advisory. Bundle-size findings belong to a separate performance plan with route-level bundle analysis, dynamic import strategy, and build-size evidence.

## Required Future Approval Gates

- File deletion: explicit per-file user approval.
- Export removal: explicit per-export user approval and usage proof.
- Giant component split: separate plan, characterization tests, and no route/service removal.
- Design/copy edits: UI/UX skill path, visual verification if layout changes, and no legal copy changes without approval.

## Decision

This task changes evidence only. It intentionally does not remove files, remove exports, split giant components, alter legal strings, or change CSS/layout for advisory warnings.
