# React Doctor Mitigation Report

- Date: 2026-05-11
- Tool: React Doctor v0.1.6
- Baseline evidence: `.sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json`
- Canonical metric: issue counts by severity, category, rule, and file
- Non-canonical context: score `38 / 100 Critical`, affected by local scoring fallback after `413 Request Entity Too Large`

## Executive Summary

React Doctor reported 5381 issues across the Dovela frontend baseline: 413 errors and 4968 warnings. The remediation strategy is errors-first: drive all current errors to zero or explicit waiver, then handle warnings by legal-domain risk and impact.

The findings are not a single cleanup queue. They cluster around accessibility contracts, React identity stability, React 19 correctness, state/effect discipline, large legal workflow orchestrators, performance patterns, advisory dead-code signals, and design/copy conventions. Fixes must preserve FUN, Records, Clocks, PQRS, Expeditions, auth/session, services, and document generation behavior.

Final verification evidence is available at `.sisyphus/evidence/react-doctor/final/verification-summary.md`. The final React Doctor audit reports 5376 issues: 402 errors and 4974 warnings. The remaining 402 errors are covered by explicit waivers in `.sisyphus/evidence/react-doctor/waivers.md`; full Vitest, preflight, and heap-adjusted production build gates passed.

## KPI Snapshot

| Metric | Value | Interpretation |
|---|---:|---|
| Total issues | 5381 | Full React Doctor baseline |
| Errors | 413 | Primary mitigation target |
| Warnings | 4968 | Triage after errors or by risk |
| Affected files | 399 | Broad codebase surface |
| Source files scanned | 601 | Audit scope from React Doctor |

## Category Counts

| Category | Count | Mitigation posture |
|---|---:|---|
| Accessibility | 3131 | Correct semantics in characterized batches; no mass wrapper rollout |
| Architecture | 682 | Fix identity/remount risks first; large orchestrators require waivers or separate refactors |
| Correctness | 619 | Prioritize after direct error families; verify with tests and build |
| Performance | 557 | Address hot paths and low-risk helpers only after correctness gates |
| Dead Code | 199 | report-only; explicit approval required before any code elimination |
| State & Effects | 143 | Characterize behavior before changing effects, reducers, or setters |
| Server | 32 | Review async sequencing; avoid frontend-backend contract churn |
| Bundle Size | 18 | Triage after functional gates; measure build output before action |

## Severity Counts

| Severity | Count | Strategy |
|---|---:|---|
| error | 413 | Fix or waive with evidence before warning work is considered complete |
| warning | 4968 | Triage by rule family, file risk, and existing coverage |

## Top Rule Hotspots

| Rule | Count | Severity mix | Root cause | Strategy |
|---|---:|---|---|---|
| `jsx-a11y/label-has-associated-control` | 2990 | warning | Labels lack stable association with controls in forms/custom inputs | Hybrid fix: characterize shared form patterns, use stable `id`/`htmlFor`, avoid broad visual churn |
| `react-doctor/no-nested-component-definition` | 258 | error | Components defined inside render scopes have unstable identity | Extract only scoped components with characterization; do not split legal orchestrators as part of this task |
| `react-doctor/design-no-redundant-size-axes` | 182 | warning | Legacy layout declarations repeat size axes | Defer to visual/UI-specific work unless the change is local and covered |
| `react-doctor/js-set-map-lookups` | 156 | warning | Repeated array membership checks in loops/render paths | Use `Set` only for measured hot paths or isolated helpers |
| `react/jsx-key` | 143 | error | Dynamic lists lack stable domain identity | Use record, PQRS, document, phase, or field IDs; array index only for static non-reordered lists |
| `react-doctor/no-giant-component` | 143 | warning | Legal workflow screens aggregate many responsibilities | report-only in this plan; defer broad component splits |
| `react-doctor/rerender-state-only-in-handlers` | 123 | warning | State updates happen outside event/controlled transitions | Characterize render behavior and fix only with regression tests |
| `react-doctor/design-no-three-period-ellipsis` | 117 | warning | Copy uses three periods instead of ellipsis glyph/style | report-only for legal/domain copy; do not alter legal text for lint score |
| `knip/files` | 108 | warning | Static analysis likely misses dynamic routes/assets/contracts | report-only; produce triage evidence only |
| `react-doctor/no-array-index-as-key` | 102 | warning | Lists use index keys | Fix only where list is dynamic or stateful; document safe static cases |
| `knip/exports` | 83 | warning | Static analysis likely misses indirect service/registry consumers | report-only; verify import graph and route usage before action |
| `react-doctor/no-react19-deprecated-apis` | 74 | warning | Legacy APIs conflict with React 19 migration rules | Coordinate with `REFACTOR_TRACKING_REACT19.md`; no `forwardRef` or `defaultProps` in new code |
| `react-doctor/prefer-useReducer` | 73 | warning | Related state variables are managed separately | Defer unless behavior is already covered; avoid reducer rewrites in legal-critical forms without tests |
| `react-doctor/js-combine-iterations` | 62 | warning | Multiple array passes can be combined | Low-priority performance cleanup; avoid readability loss in domain code |
| `react-doctor/design-no-em-dash-in-jsx-text` | 52 | warning | JSX copy contains em dash | report-only unless UI copy owner approves copy change |

## Top File Hotspots

| File | Count | Domain risk | Strategy |
|---|---:|---|---|
| `src/app/pages/user/expeditions/exp._res.component.js` | 172 | High: Expeditions legal workflow | Do not split for `no-giant-component` in this plan; characterize before any targeted fix |
| `src/app/pages/user/expeditions/exp_docs.component.js` | 156 | High: Expeditions documents | Fix only rule-targeted items with document workflow tests |
| `src/app/pages/user/fun_forms/fun_g_checklist.js` | 117 | High: FUN form checklist | Accessibility/keys require stable domain IDs and FUN tests |
| `src/app/pages/user/records/eng/record_eng_4323.component.js` | 116 | High: Engineering Records | Keys/labels must preserve record state and discipline-specific behavior |
| `src/app/pages/user/fun_forms/fun_macrotable..js` | 110 | High: FUN orchestrator | Avoid broad refactor; fix only isolated findings with workflow tests |
| `src/app/pages/user/fun_forms/fun_g.js` | 93 | High: FUN form | Accessibility and state changes require form characterization |
| `src/app/pages/user/records/eng/record_eng_s_432.component.js` | 80 | High: Engineering Records | Prioritize correctness errors before visual warnings |
| `src/app/pages/user/fun_forms/fun_anex.js` | 70 | High: FUN attachments | Verify attachment/document behavior before changes |
| `src/app/pages/user/records/arc/record_arc_34.js` | 69 | High: Architecture Records | Use discipline-specific Records integration tests |
| `src/app/pages/user/records/law/record_law_gen2_11.js` | 60 | High: Legal Records | Avoid copy/semantic churn without legal-flow verification |

## Protected-File Impacts

| Protected path | Count | Risk | Handling |
|---|---:|---|---|
| `src/app/App.js` | 6 | Auth, routing, session, layout | Requires explicit per-change approval before editing |
| `src/app/services/data.service.js` | 2 | Frontend-backend service contract | Requires contract review before editing |
| `src/app/pages/user/clocks/hooks/useClocksManager.js` | 1 | Legal time and process phases | Requires Clocks-specific characterization first |
| `public/templates/resolution/considerate/style_part_cons.css` | 1 | Public document template styling | Requires explicit approval and template rendering evidence |

Protected impacts are not automatic fixes. They become approval-gated work items because these paths encode auth/session, service contracts, legal clocks, or public document output.

## Root-Cause Families and Mitigation

### Accessibility

Main evidence: `jsx-a11y/label-has-associated-control` with 2990 warnings, plus smaller ARIA and interaction rules.

Likely cause: forms and custom field patterns render visual labels without a stable control association. Bootstrap/RSuite wrappers and domain-specific form components likely repeat this pattern across FUN, Records, PQRS, Expeditions, and user management screens.

Mitigation:

- Characterize representative form flows before editing high-risk files.
- Prefer stable `id` values derived from domain field names or React `useId` inside stable components.
- Use in-place fixes for existing legal forms in small batches.
- Introduce shared field primitives only after proving the shared pattern and obtaining separate approval for broad migration.
- Use Playwright screenshots only when a semantic fix changes layout or component structure.

### Correctness

Main evidence: `react/jsx-key` with 143 errors, `react/jsx-no-duplicate-props`, `jsx-a11y/alt-text`, `role-has-required-aria-props`, and React property warnings.

Likely cause: dynamic lists and UI fragments were built before strict identity/accessibility checks were enforced.

Mitigation:

- Start with `react/jsx-key` because incorrect keys can mix state between legal records, documents, phases, or PQRS items.
- Use stable domain identifiers; avoid random IDs generated per render.
- Fix duplicate props by preserving the intended prop and proving output through render/integration tests.
- Fix image alt and required ARIA with semantic values that describe the visible function, not decorative guesswork.

### State & Effects

Main evidence: 143 State & Effects issues, including `react-hooks/rules-of-hooks`, `react-doctor/no-mutable-in-deps`, and render-time state update patterns.

Likely cause: legacy components mix imperative state, refs, effect dependencies, and render-time derivation.

Mitigation:

- Inspect exact React Doctor lines before changing hook order.
- Add a failing or characterization test before moving hooks or dependency values.
- Treat `src/app/App.js` as approval-gated because it controls routing/session behavior.
- Prefer local fixes over broad reducer rewrites unless a reducer is proven necessary by test complexity.

### Architecture

Main evidence: `react-doctor/no-nested-component-definition` with 258 errors and `react-doctor/no-giant-component` with 143 warnings.

Likely cause: legacy screens define helper components inside render scopes and large orchestrators combine legal workflows, forms, service calls, and document actions.

Mitigation:

- Extract nested component definitions to module scope when the extraction does not alter props or service behavior.
- Keep extracted components in the same file unless reused by at least two files.
- Do not split `src/app/pages/user/expeditions/exp._res.component.js` under this plan.
- Treat giant components as report-only unless a separate refactor is approved with dedicated tests.

### Performance

Main evidence: `react-doctor/js-set-map-lookups`, `react-doctor/js-combine-iterations`, `react-doctor/js-batch-dom-css`, and bundle-size warnings.

Likely cause: repeated array scans, iterative transformations, and legacy DOM/CSS access patterns in UI-heavy screens.

Mitigation:

- Prioritize only hot paths or isolated helpers after correctness errors are handled.
- Use `Set` conversion only when repeated lookups are clear and the input collection is stable within the operation.
- Preserve readability where data transformations encode legal-domain decisions.
- Use build output size and task-local tests as evidence before accepting performance changes.

### Dead Code

Main evidence: `knip/files` with 108 warnings and `knip/exports` with 83 warnings.

Likely cause: static analysis cannot fully infer dynamic routes, service registries, public templates, JSON-driven behavior, or indirect imports.

Mitigation:

- Treat all Dead Code findings as report-only in this plan.
- Produce a triage list with import graph, route reference, service reference, and runtime smoke evidence before proposing any code elimination.
- Escalate every candidate in critical domain areas for explicit approval.
- Do not count advisory `knip` reductions as part of the errors-first target.

### Bundle Size

Main evidence: 18 Bundle Size findings.

Likely cause: large legal workflow screens, document generation libraries, PDFs, charts, and existing Vite chunks.

Mitigation:

- Defer until correctness and behavior gates are green.
- Measure `dist/` before and after any bundle-oriented work.
- Avoid changing route boundaries or lazy-loading behavior without navigation smoke tests.

### Design and Copy Rules

Main evidence: `react-doctor/design-no-redundant-size-axes`, `react-doctor/design-no-three-period-ellipsis`, and `react-doctor/design-no-em-dash-in-jsx-text`.

Likely cause: legacy UI/CSS patterns and copy conventions predate current design lint expectations.

Mitigation:

- Treat legal-domain copy as report-only unless a UX/content approval exists.
- Do not alter public templates or legal messages for lint score.
- If a design warning is fixed in runtime UI, use `ui-ux-pro-max` and visual inspection rules from the redesign standards.

## Report-Only Rule Families

| Rule family | Reason | Required next evidence |
|---|---|---|
| `knip/files` | High false-positive risk from dynamic imports, routes, registries, and templates | Import graph, route map, runtime smoke, explicit approval |
| `knip/exports` | Exports may serve services, tests, templates, registries, or indirect consumers | Reference search, service-contract review, explicit approval |
| `react-doctor/no-giant-component` | Large files encode legal orchestration and are risky to split mechanically | Separate refactor plan, characterization tests, module owner approval |
| Design/copy rules | Copy/layout may be intentional, legal, or redesign-sensitive | UX/design approval and visual evidence |

## Error-First Execution Strategy

1. Fix `react/jsx-key` with stable domain identity in small batches.
2. Fix `react-doctor/no-nested-component-definition` only where component extraction is local and tested.
3. Fix hooks, duplicate props, alt text, ARIA, and mutable dependency errors with targeted characterization.
4. Create waiver entries only when a fix is blocked by protected-file approval or a broad refactor boundary.
5. Re-run `scripts/react-doctor-audit.mjs` after every batch and compare with `scripts/react-doctor-diff.mjs`.
6. Enforce no new errors in untouched files for every batch.

## Warning Triage Strategy

1. Accessibility warnings: prioritize shared form patterns and high-use screens; avoid thousands of unreviewable edits.
2. React 19 warnings: coordinate with `REFACTOR_TRACKING_REACT19.md` and AGENTS restrictions.
3. State/performance warnings: handle only when covered by tests or isolated enough to verify.
4. Dead Code warnings: report-only with approval gates.
5. Design/copy warnings: defer to UI redesign workflow and visual inspection.

## Verification Matrix

| Gate | Command | Expected result | Evidence path |
|---|---|---|---|
| Pinned audit | `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/<task>` | Exit 0, writes `diagnostics.json` | `.sisyphus/evidence/react-doctor/<task>/` |
| Diff by rule | `node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/<task>/diagnostics.json --target-rule <rule> --require-decrease --no-new-errors-untouched` | Exit 0 | Task-specific log |
| Unit/integration tests | `npm test -- <paths> --run` | Exit 0 | Task-specific log |
| Full tests | `npm test -- --run` | Exit 0 | Final evidence |
| Preflight | `npm run audit:preflight` | Exit 0 | Final evidence |
| Build | `npm run build` | Exit 0 | Final evidence |

## Waiver Policy

Waivers are allowed only for unsafe or approval-gated errors, not as a shortcut. Each waiver must include file, rule, count, rationale, owner, expiry, and evidence link. Default owner is `user/project owner`; default expiry is `2026-06-10` unless a legal-critical deferral requires a separate date.

## Conclusion

The React Doctor result is critical because it reveals broad systemic debt, but the safe path is not a blind cleanup. The actionable strategy is to freeze evidence, keep React Doctor pinned to v0.1.6, protect legal-domain behavior with characterization tests, fix 413 errors first, and keep advisory categories as triage evidence until the relevant owner approves deeper refactors.
