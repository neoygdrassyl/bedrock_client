# Task 10 - Accessibility Label Warning Triage

## Baseline Used

- Evidence source: `.sisyphus/evidence/react-doctor/task-8-after/diagnostics.json`
- Main rule: `jsx-a11y/label-has-associated-control`
- Count: 2990 warnings
- Strategy: hybrid, in-place fixes for low-risk screens and future wrappers only after one characterized screen proves the pattern.

## Top Files

| File | Count | Risk | Decision |
|---|---:|---|---|
| `src/app/pages/user/expeditions/exp._res.component.js` | 164 | High | Deferred. Resolution/expedition UI is legal-critical and the file is also a giant-component hotspot. |
| `src/app/pages/user/expeditions/exp_docs.component.js` | 146 | High | Deferred. Document expedition flows require characterization before label edits. |
| `src/app/pages/user/fun_forms/fun_g_checklist.js` | 116 | High | Deferred. FUN checklist changes can affect required document/legal validation UX. |
| `src/app/pages/user/records/eng/record_eng_4323.component.js` | 100 | High | Deferred. Engineering record discipline requires field-level characterization. |
| `src/app/pages/user/fun_forms/fun_anex.js` | 69 | High | Deferred. FUN anex forms should be remediated in a dedicated FUN accessibility batch. |
| `src/app/pages/user/records/eng/record_eng_s_432.component.js` | 65 | High | Deferred. Discipline-specific record form. |
| `src/app/pages/user/fun_forms/fun_g.js` | 65 | High | Deferred. FUN general form. |
| `src/app/pages/user/records/law/record_law_gen2_11.js` | 54 | High | Deferred. Legal review fields. |
| `src/app/pages/user/fun_forms/components/fun_checklist_n.js` | 53 | Medium/High | Candidate for an in-place first batch once a focused checklist test exists. |
| `src/app/pages/user/records/arc/record_arc_34.js` | 51 | High | Deferred. Architecture record discipline. |

## Low-Risk Fix Candidates

- `src/app/pages/user/profesionals/manage.component.js`: single label pattern; suitable for an in-place `id`/`htmlFor` follow-up with a professional-management smoke test.
- Small shared inputs or local datalists already touched by error remediation can be handled opportunistically only when the control identity is obvious and existing IDs are preserved.
- Generic UI wrappers can be introduced only if they do not alter Bootstrap/RSuite layout or legal copy.

## Wrapper Candidates

- A local labeled field wrapper may reduce repeated form warnings, but it must not be mass-applied in this plan.
- First candidate scope: a low-risk, non-legal support/admin screen with one characterized render test.
- Required properties: stable `id`, explicit `htmlFor`, visible label, no random IDs per render, no hidden fake controls, and no copy/layout change.

## Deferred Legal-Critical Items

- Expeditions resolution and document screens.
- FUN checklist, anex, macrotable, and general forms.
- Records LAW/ARC/ENG/PH discipline forms.
- PQRS admin forms except for separately characterized local fixes.

## Mitigation Strategy

1. Preserve semantic behavior first. A label fix is not acceptable if it changes the legal field, copy, focus order, or submission shape.
2. Prefer in-place `id`/`htmlFor` changes for existing screens where the input-control relationship is explicit.
3. Use a wrapper only after a one-screen proof with tests and visual review if layout changes.
4. Keep `useId` limited to component-local generated IDs; do not replace domain IDs or backend-linked field identifiers.
5. Each batch must run representative form tests and React Doctor diff for `jsx-a11y/label-has-associated-control`.

## Decision

No mass source-code remediation was performed in Task 10. The remaining 2990 label warnings are causal evidence of a systemic form-accessibility gap, but the safe mitigation requires smaller, characterized batches to avoid breaking legal workflows.
