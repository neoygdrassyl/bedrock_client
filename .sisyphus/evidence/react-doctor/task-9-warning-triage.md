# Task 9 - React 19, State, and Performance Warning Triage

## Baseline Used

- Evidence source: `.sisyphus/evidence/react-doctor/task-8-after/diagnostics.json`
- Scope: warnings only after the errors-first target was proven with waivers.
- Policy: no blind refactor in Clocks, FUN, Records, PQRS, Expeditions, auth/session, routing, services, or template code.

## Target Rule Summary

| Rule | Count | Fixed | Waived | Deferred | Strategy |
|---|---:|---:|---:|---:|---|
| `react-doctor/no-react19-deprecated-apis` | 74 | 0 | 0 | 74 | Defer as a coordinated React 19 component primitive migration. Most findings are in `src/components/ui/*` wrappers and should be handled as one compatibility pass with focused render tests. |
| `react-doctor/rerender-state-only-in-handlers` | 123 | 0 | 0 | 123 | Defer until each affected module has characterization for async state transitions. Several findings are in legal workflows and admin screens where moving setters can alter loading or form state timing. |
| `react-doctor/js-set-map-lookups` | 156 | 0 | 0 | 156 | Defer except for future low-risk helper-only edits. Hotspots are FUN/Records code paths where identity, ordering, and legal table semantics must be preserved. |

## Top Hotspots

### `react-doctor/no-react19-deprecated-apis`

- `src/components/ui/table.jsx` - 8
- `src/components/ui/dropdown-menu.jsx` - 8
- `src/components/ui/select.jsx` - 7
- `src/components/ui/command.jsx` - 7
- `src/components/ui/card.jsx` - 6
- `src/components/ui/alert-dialog.jsx` - 6
- `src/components/ui/sheet.jsx` - 4
- `src/components/ui/dialog.jsx` - 4
- `src/components/ui/avatar.jsx` - 3
- `src/components/ui/tabs.jsx` - 3

Mitigation: create a separate React 19 primitive migration batch coordinated with `REFACTOR_TRACKING_REACT19.md`. The current plan must not rewrite all primitives while also handling React Doctor errors because the primitive wrappers affect a large part of the UI surface.

### `react-doctor/rerender-state-only-in-handlers`

- `src/app/pages/user/funmanage.page.js` - 12
- `src/app/pages/user/publish.js` - 10
- `src/app/pages/user/pqrs/pqrsadmin.functional.js` - 9
- `src/app/pages/user/pqrs/pqrsadmin.js` - 9
- `src/app/pages/user/records/ph/record_ph_floor.component.js` - 4
- `src/app/pages/user/norms/norm_geeral.component.js` - 4
- `src/app/pages/user/fun_forms/components/func_clock_chart.js` - 3
- `src/app/pages/user/nomenclature/nomenclature.js` - 2
- `src/app/pages/user/fun_forms/components/charts_components.js/chart_time.component.js` - 2
- `src/app/pages/user/fun_forms/fun_clock.js` - 2

Mitigation: require module-level characterization first. PQRS already has integration coverage, but state movement still changes timing and should be executed as a focused follow-up with before/after tests.

### `react-doctor/js-set-map-lookups`

- `src/app/pages/user/fun_forms/fun_macrotable..js` - 54
- `src/app/pages/user/fun_forms/components/fun_pdf.js` - 31
- `src/app/pages/user/records/ph/record_ph_gen_arc_review.component.js` - 20
- `src/app/pages/user/fun_forms/fun_n_3.js` - 8
- `src/app/pages/user/fun_forms/components/fun_3_g_view.js` - 8
- `src/app/pages/user/fun_forms/components/charts_components.js/chart_negative.component.js` - 7
- `src/app/pages/user/fun_forms/components/charts_components.js/chart_worker.component.js` - 4
- `src/app/pages/user/records/eng/record_eng_sismic.component.js` - 4
- `src/app/pages/user/records/eng/record_eng_profesionals.component.js` - 2
- `src/app/pages/user/records/eng/record_eng_433.component.js` - 2

Mitigation: convert repeated lookups to `Set` only inside scoped helpers or pure derived computations after proving that ordering and object identity are preserved. Do not touch `fun_macrotable..js` as a broad cleanup in this pass.

## Deferred Risk Register

| Area | Risk | Required Before Fix |
|---|---|---|
| UI primitives under `src/components/ui/*` | App-wide rendering, focus, and accessibility behavior can change if `forwardRef` wrappers are rewritten mechanically. | Targeted primitive render tests plus representative app shell/dashboard tests. |
| FUN macrotable and PDF generation | Set/Map conversion can alter ordering or equality assumptions in legal form tables and generated document data. | Characterization around the exact FUN table or PDF output being touched. |
| PQRS state transitions | Moving state updates may affect modal open/close timing and pending-item visibility. | PQRS integration tests before and after the change. |
| Records PH/ENG warnings | These screens encode discipline-specific legal logic. | Discipline-specific render/integration tests and stable fixture data. |

## Decision

No source-code remediation was done in Task 9. The warning families are documented, bounded, and deferred to smaller future batches because the highest-count items touch shared primitives or legal-critical workflows. Acceptance for this task is non-regression of the target warning counts and a green `audit:preflight` gate.
