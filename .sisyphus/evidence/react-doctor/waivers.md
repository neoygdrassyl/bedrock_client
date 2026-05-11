# React Doctor Error Waivers

- Date: 2026-05-11
- Source: `.sisyphus/evidence/react-doctor/task-7-after/diagnostics.json`
- Scope: remaining React Doctor errors after Tasks 5-7
- Policy: waiver is not suppression; each entry is a tracked deferral with owner, expiry, and evidence.

## Waiver: e2e/fixtures/auth.fixture.js :: react-hooks/rules-of-hooks
- **File:** e2e/fixtures/auth.fixture.js
- **Rule:** react-hooks/rules-of-hooks
- **Count:** 1
- **Rationale:** Hook-order correction touches component identity or test/e2e fixture structure. Deferred until a focused characterization task can prove behavior.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/__tests__/ExpeditionResolutionEditor.unit.test.jsx :: react-hooks/rules-of-hooks
- **File:** src/__tests__/ExpeditionResolutionEditor.unit.test.jsx
- **Rule:** react-hooks/rules-of-hooks
- **Count:** 1
- **Rationale:** Hook-order correction touches component identity or test/e2e fixture structure. Deferred until a focused characterization task can prove behavior.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/App.js :: react-doctor/no-mutable-in-deps
- **File:** src/app/App.js
- **Rule:** react-doctor/no-mutable-in-deps
- **Count:** 1
- **Rationale:** Protected routing/session file. Fix requires explicit approval and auth/session characterization before modifying mutable location dependencies.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/components/emails.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/components/emails.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 4
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/components/emails.component.js :: react/jsx-key
- **File:** src/app/components/emails.component.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/components/jsons/vars.js :: react/jsx-key
- **File:** src/app/components/jsons/vars.js
- **Rule:** react/jsx-key
- **Count:** 3
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/home.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/home.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/liquidator/liquidator.js :: react/jsx-key
- **File:** src/app/pages/liquidator/liquidator.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/appointments.js :: react/jsx-key
- **File:** src/app/pages/user/appointments.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/archive/archive_x_fun.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/archive/archive_x_fun.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/archive/archive.page.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/archive/archive.page.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/archive/archive.page.js :: react/jsx-key
- **File:** src/app/pages/user/archive/archive.page.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/certifications/certification.page.js :: react/jsx-key
- **File:** src/app/pages/user/certifications/certification.page.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/dev_guide/dev_guide.page.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/dev_guide/dev_guide.page.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/dictionary.page.js :: react-hooks/rules-of-hooks
- **File:** src/app/pages/user/dictionary.page.js
- **Rule:** react-hooks/rules-of-hooks
- **Count:** 1
- **Rationale:** Hook-order correction touches component identity or test/e2e fixture structure. Deferred until a focused characterization task can prove behavior.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_1.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/expeditions/exp_1.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_2.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/expeditions/exp_2.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_act_desist.component.js :: react/jsx-key
- **File:** src/app/pages/user/expeditions/exp_act_desist.component.js
- **Rule:** react/jsx-key
- **Count:** 3
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_calc.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/expeditions/exp_calc.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 5
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_calc.component.js :: react/jsx-key
- **File:** src/app/pages/user/expeditions/exp_calc.component.js
- **Rule:** react/jsx-key
- **Count:** 3
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_clocks_diagram.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/expeditions/exp_clocks_diagram.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_clocks.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/expeditions/exp_clocks.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_docs.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/expeditions/exp_docs.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_eje.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/expeditions/exp_eje.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_eje.component.js :: react-hooks/rules-of-hooks
- **File:** src/app/pages/user/expeditions/exp_eje.component.js
- **Rule:** react-hooks/rules-of-hooks
- **Count:** 3
- **Rationale:** Hook-order correction touches component identity or test/e2e fixture structure. Deferred until a focused characterization task can prove behavior.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp_eje.component.js :: react/jsx-key
- **File:** src/app/pages/user/expeditions/exp_eje.component.js
- **Rule:** react/jsx-key
- **Count:** 3
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp._res.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/expeditions/exp._res.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/expeditions/exp._res.component.js :: react/jsx-key
- **File:** src/app/pages/user/expeditions/exp._res.component.js
- **Rule:** react/jsx-key
- **Count:** 3
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_arcR.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_arcR.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_category.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_category.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_engR.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_engR.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_lawR.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_lawR.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_macroGant.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_macroGant.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_negative.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_negative.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_payment.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_payment.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_record1.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_record1.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_record2.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_record2.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_state.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_state.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_time.component.js :: react/jsx-key
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_time.component.js
- **Rule:** react/jsx-key
- **Count:** 6
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_type.compoennt.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_type.compoennt.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_worker.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_worker.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/charts_components.js/chart_workerReport.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/charts_components.js/chart_workerReport.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_6_history.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_6_history.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_asign_history.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_asign_history.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 4
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_asign.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_asign.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 7
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_asign.component.js :: react/jsx-key
- **File:** src/app/pages/user/fun_forms/components/fun_asign.component.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_d_control.component_2.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_d_control.component_2.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 16
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_daily.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_daily.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 7
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_doc_certification.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_doc_certification.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_duplicate.component.js :: react/jsx-key
- **File:** src/app/pages/user/fun_forms/components/fun_duplicate.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_macro_clocks.compnent.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_macro_clocks.compnent.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_macro_clocks.compnent.js :: react/jsx-key
- **File:** src/app/pages/user/fun_forms/components/fun_macro_clocks.compnent.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_macro_filterList.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_macro_filterList.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_pdf_check.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_pdf_check.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_pdf.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_pdf.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_report_data_jodit.compoent.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_report_data_jodit.compoent.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_sign_pdf.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/fun_sign_pdf.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/fun_worker_asign.component.js :: react/jsx-key
- **File:** src/app/pages/user/fun_forms/components/fun_worker_asign.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/func_clock_chart.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/func_clock_chart.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/table_components/table.component_expanded.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/components/table_components/table.component_expanded.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 7
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/components/table_components/table.component_expanded.js :: react/jsx-key
- **File:** src/app/pages/user/fun_forms/components/table_components/table.component_expanded.js
- **Rule:** react/jsx-key
- **Count:** 4
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/fun_alertn.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/fun_alertn.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/fun_c.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/fun_c.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/fun_macrotable..js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun_forms/fun_macrotable..js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 3
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun_forms/fun_reports/fun_gen.report.js :: react/jsx-key
- **File:** src/app/pages/user/fun_forms/fun_reports/fun_gen.report.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/fun.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/fun.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 3
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/guide_user/guide_user.page.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/guide_user/guide_user.page.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/guide_user/guide_user.page.js :: react/jsx-key
- **File:** src/app/pages/user/guide_user/guide_user.page.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/nomenclature/new_nomenclature.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/nomenclature/new_nomenclature.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/norms/norm_element.component.js :: react/jsx-key
- **File:** src/app/pages/user/norms/norm_element.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/norms/norm_geeral.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/norms/norm_geeral.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/norms/norm_geeral.component.js :: react/jsx-key
- **File:** src/app/pages/user/norms/norm_geeral.component.js
- **Rule:** react/jsx-key
- **Count:** 9
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/norms/norm_perfil.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/norms/norm_perfil.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/norms/norm_perfil.component.js :: react/jsx-key
- **File:** src/app/pages/user/norms/norm_perfil.component.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/norms/norm_predio.component.js :: react/jsx-key
- **File:** src/app/pages/user/norms/norm_predio.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/norms/norm_resume.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/norms/norm_resume.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 3
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/osha.js :: react/jsx-key
- **File:** src/app/pages/user/osha.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/pqrs/asignpqrs.js :: react/jsx-key
- **File:** src/app/pages/user/pqrs/asignpqrs.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/pqrs/components/pqrs_clock.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/pqrs/components/pqrs_clock.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/pqrs/components/pqrs_emails.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/pqrs/components/pqrs_emails.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/pqrs/components/pqrs_id_confitm.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/pqrs/components/pqrs_id_confitm.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/pqrs/components/pqrs_reviewAction.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/pqrs/components/pqrs_reviewAction.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 12
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/pqrs/components/pqrs_worker_feedback.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/pqrs/components/pqrs_worker_feedback.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/pqrs/newpqrs.js :: react/jsx-key
- **File:** src/app/pages/user/pqrs/newpqrs.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/pqrs/pqrs_manage.view.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/pqrs/pqrs_manage.view.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/profesionals/manage.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/profesionals/manage.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/publish.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/publish.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 7
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/publish.js :: react/jsx-key
- **File:** src/app/pages/user/publish.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_31.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_31.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_33.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_33.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_33.js :: react/jsx-key
- **File:** src/app/pages/user/records/arc/record_arc_33.js
- **Rule:** react/jsx-key
- **Count:** 3
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_34.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_34.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_34.js :: react/jsx-key
- **File:** src/app/pages/user/records/arc/record_arc_34.js
- **Rule:** react/jsx-key
- **Count:** 14
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_35.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_35.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_35.js :: react/jsx-key
- **File:** src/app/pages/user/records/arc/record_arc_35.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_36.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_36.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_36.js :: react/jsx-key
- **File:** src/app/pages/user/records/arc/record_arc_36.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_36.table.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_36.table.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_36.table.js :: react/jsx-key
- **File:** src/app/pages/user/records/arc/record_arc_36.table.js
- **Rule:** react/jsx-key
- **Count:** 8
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_37.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_37.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_37.js :: react/jsx-key
- **File:** src/app/pages/user/records/arc/record_arc_37.js
- **Rule:** react/jsx-key
- **Count:** 12
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_38.js :: react/jsx-key
- **File:** src/app/pages/user/records/arc/record_arc_38.js
- **Rule:** react/jsx-key
- **Count:** 4
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_areas_2.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_areas_2.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_areas_resumen.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_areas_resumen.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_areas.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_areas.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_control.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_control.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_control.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/arc/record_arc_control.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_desc.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_desc.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_extra_1.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_extra_1.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_extra_2.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_extra_2.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_gem2_review.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_gem2_review.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_gen_review.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/arc/record_arc_gen_review.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/arc/record_arc_gen_review.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/arc/record_arc_gen_review.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_43.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_43.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_430.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_430.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_430.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/eng/record_eng_430.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_4323.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_4323.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 7
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_4323.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/eng/record_eng_4323.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_433.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_433.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 6
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_433.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/eng/record_eng_433.component.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_4333p.componen.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_4333p.componen.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_44.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_44.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_desc.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_desc.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 3
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_docs_check.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_docs_check.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_docsDetail.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_docsDetail.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_fuego.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_fuego.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 7
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_fuego.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/eng/record_eng_fuego.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_profesionals.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_profesionals.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_review.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_review.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 6
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_review.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/eng/record_eng_review.component.js
- **Rule:** react/jsx-key
- **Count:** 4
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_s_431.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_s_431.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 6
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_s_431.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/eng/record_eng_s_431.component.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_s_432.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_s_432.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 10
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_s_432.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/eng/record_eng_s_432.component.js
- **Rule:** react/jsx-key
- **Count:** 4
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/record_eng_sismic.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/record_eng_sismic.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 5
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/eng/recprd_eng_mamporteria.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/eng/recprd_eng_mamporteria.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 11
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_docs_check.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_docs_check.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_fun_1.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_fun_1.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_fun_2.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_fun_2.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_fun_51.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_fun_51.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_fun_52.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_fun_52.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_fun_53.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_fun_53.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_fun_53.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/law/record_law_fun_53.component.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_fun_law.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_fun_law.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_gen2_11.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_gen2_11.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_gen2_11.js :: react/jsx-key
- **File:** src/app/pages/user/records/law/record_law_gen2_11.js
- **Rule:** react/jsx-key
- **Count:** 2
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_pdf.js :: react/jsx-key
- **File:** src/app/pages/user/records/law/record_law_pdf.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_profesionals.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_profesionals.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_review.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_review.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_review.js :: react/jsx-key
- **File:** src/app/pages/user/records/law/record_law_review.js
- **Rule:** react/jsx-key
- **Count:** 3
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/law/record_law_step1.cmponent.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/law/record_law_step1.cmponent.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/ph/record_ph_check_list.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/ph/record_ph_check_list.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/ph/record_ph_check_list.component.js :: react/jsx-key
- **File:** src/app/pages/user/records/ph/record_ph_check_list.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/ph/record_ph_floor.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/ph/record_ph_floor.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/ph/record_ph_gen_arc_review.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/ph/record_ph_gen_arc_review.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 1
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/record_docVersion.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/record_docVersion.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/record_eng.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/records/record_eng.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/record_eng.js :: react/jsx-key
- **File:** src/app/pages/user/records/record_eng.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/records/record_review.js :: react/jsx-key
- **File:** src/app/pages/user/records/record_review.js
- **Rule:** react/jsx-key
- **Count:** 4
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/submit/submit_manage.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/submit/submit_manage.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 2
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/submit/submit_x_fun.component.js :: react/jsx-key
- **File:** src/app/pages/user/submit/submit_x_fun.component.js
- **Rule:** react/jsx-key
- **Count:** 1
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/zone_use/zone_use.component.js :: react-doctor/no-nested-component-definition
- **File:** src/app/pages/user/zone_use/zone_use.component.js
- **Rule:** react-doctor/no-nested-component-definition
- **Count:** 3
- **Rationale:** Broad component extraction can alter render identity and local state in legal-domain screens. Deferred to targeted refactors with characterization tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

## Waiver: src/app/pages/user/zone_use/zone_use.component.js :: react/jsx-key
- **File:** src/app/pages/user/zone_use/zone_use.component.js
- **Rule:** react/jsx-key
- **Count:** 3
- **Rationale:** Remaining list identity fixes span many legal-domain tables/forms. Deferred to file-by-file batches using stable domain IDs and regression tests.
- **Owner:** user/project owner
- **Expiry:** 2026-06-10
- **Evidence:** .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json

