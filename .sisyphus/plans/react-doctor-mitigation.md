# React Doctor Mitigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `subagent-driven-development` or `executing-plans` before implementing this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the React Doctor v0.1.6 audit findings into a reproducible, risk-controlled remediation program that drives errors to zero or explicit waiver without removing critical Dovela functionality.

**Architecture:** Treat React Doctor findings as rule-family evidence, not as a blind autofix queue. Freeze a reproducible baseline, add local audit tooling, inventory test coverage, create characterization tests before touching legal-critical modules, then remediate errors first and warnings only by risk/impact.

**Tech Stack:** React 19, Vite 6, Vitest 4, Testing Library, MSW, Playwright, Bootstrap/RSuite/styled-components, React Doctor `0.1.6`, Node 22+.

---

## TL;DR
> **Summary**: This plan builds a safe React Doctor remediation workflow for 5381 findings across 399 files, prioritizing the 413 errors and preserving legal workflows in FUN, Records, Clocks, PQRS, Expeditions, auth/session, services, and document generation. Success is measured by pinned rule counts and behavioral gates, not by the non-reproducible 38/100 score.
> **Deliverables**:
> - Frozen baseline evidence under `.sisyphus/evidence/react-doctor/2026-05-11-baseline/`
> - Pinned `audit:react-doctor` tooling and diff scripts
> - Exhaustive root-cause report and mitigation matrix
> - Test-option inventory, base characterization test, and functional story validation
> - Error-first remediation batches with per-task QA evidence
> - Warning triage strategy for accessibility, architecture, performance, dead code, and design rules
> - Waiver file for intentionally deferred or unsafe fixes
> **Effort**: XL
> **Parallel**: YES - 5 waves
> **Critical Path**: Task 1 → Task 2 → Task 3 → Task 4 → Tasks 5-8 → Tasks 9-12 → Final Verification Wave

## Context

### Original Request
The user requested an exhaustive React Doctor review for Dovela, including execution details, all causal categories, and a strategic mitigation plan that does **not** solve problems by omitting or removing critical functions.

### Interview Summary
- Success criterion selected: **errors first** — reduce React Doctor errors to zero or create explicit waiver entries, then handle warnings by risk and impact.
- Test strategy selected: first inventory available testing options, instantiate a base test case, then validate a functional/user-story flow can be completed.
- The plan must ask for specific information only when truly needed; defaults are applied for unresolved planning choices.

### Audit Baseline From Current Run
- Command executed during planning: `npx --yes react-doctor@latest . --verbose`
- Detected tool version: React Doctor `0.1.6`
- Framework: Vite
- React: `^19.2.4`
- Language: JavaScript
- Source files: 601
- Files with findings: 399
- Total issues: 5381
- Errors: 413
- Warnings: 4968
- Score: `38 / 100 Critical`, but **not canonical** because scoring fell back locally after `413 Request Entity Too Large`.
- Ephemeral diagnostics source: `/tmp/react-doctor-d233e0c6-a505-4890-903d-1e28eb1e67bb/diagnostics.json`

### Root-Cause Families
| Family | Count / Evidence | Causal Interpretation | Strategy |
|---|---:|---|---|
| Accessibility labels | `jsx-a11y/label-has-associated-control`: 2990 warnings | Forms/custom controls lack a shared `id`/`htmlFor` accessibility contract | Hybrid: in-place fixes for existing forms; shared wrapper only for characterized shared patterns/new code |
| Nested component definitions | `react-doctor/no-nested-component-definition`: 258 errors | Components are defined inside render scopes, causing unstable identity/remount risk | Extract only when behavior can be characterized; no broad refactor in critical modules |
| JSX keys | `react/jsx-key`: 143 errors | Dynamic lists lack stable identity, risking reconciliation bugs | Use domain IDs; array index only for proven static, non-reordered lists |
| State/effects | `rerender-state-only-in-handlers`: 123 warnings; hooks violations: 6 errors; mutable deps: 1 error | Legacy effects/state patterns can cause render loops, stale state, or React 19 incompatibility | Fix via TDD/characterization before implementation |
| Giant components | `no-giant-component`: 143 warnings | Legal workflow orchestrators are too large, but splitting is risky | Triage/waive unless separate refactor is approved |
| Performance lookups | `js-set-map-lookups`: 156 warnings | Repeated `.includes()`/array lookup patterns in loops/hot render paths | Fix only in measured or low-risk helper contexts |
| Dead code | `knip/files`: 108 warnings; `knip/exports`: 83 warnings | Likely false positives from dynamic routes, public templates, and service contracts | Report-only; no deletion without explicit per-file approval |
| Design/copy rules | `design-no-redundant-size-axes`: 182; `design-no-three-period-ellipsis`: 117 | Legacy UI/copy patterns may be intentional or legal | Defer; no legal text/copy churn in this plan |

### Metis Review (gaps addressed)
- Baseline evidence must be copied out of `/tmp` before any remediation.
- React Doctor must be pinned to `0.1.6`; no `latest` in acceptance gates.
- Canonical metrics are rule counts and error/warning counts, not score.
- `knip/files` and `knip/exports` are report-only.
- Characterization tests are mandatory before fixes in high-risk modules.
- `exp._res.component.js` giant-component split is deferred.
- Visual snapshots are used only for accessibility/layout changes; functional E2E is used for critical flows.
- Protected files require explicit per-change approval before an executor modifies them.

## Work Objectives

### Core Objective
Create and execute a reproducible, evidence-driven React Doctor mitigation workflow that reduces all current errors to zero or explicit waiver while preserving Dovela’s legal-domain behavior.

### Deliverables
1. `.sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json` and copied per-rule evidence files.
2. `scripts/react-doctor-audit.mjs` for pinned audit execution and JSON normalization.
3. `scripts/react-doctor-diff.mjs` for before/after rule-count and untouched-file regression checks.
4. `package.json` script `audit:react-doctor` using React Doctor `0.1.6`.
5. `.sisyphus/evidence/react-doctor/mitigation-report.md` listing all causal families, top files, risks, mitigation strategy, and waiver candidates.
6. `.sisyphus/evidence/react-doctor/waivers.md` using the required waiver template.
7. At least one base characterization test and one functional story validation before remediating critical modules.
8. Error remediation batches for nested components, keys, hooks, duplicate props, alt text, required ARIA props, and mutable deps.
9. Warning triage batches for accessibility, React 19 warnings, performance, architecture, dead code, and design/copy warnings.

### Definition of Done (verifiable conditions with commands)
- `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/final` exits `0` and writes `diagnostics.json`.
- `node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/final/diagnostics.json --mode errors-zero-or-waived --waivers .sisyphus/evidence/react-doctor/waivers.md` exits `0`.
- `npm run audit:preflight` exits `0`.
- `npm test -- --run` exits `0`.
- `npm run build` exits `0`.
- `npm run test:e2e -- --grep "login|FUN|radic|modal"` exits `0` or records a pre-existing environment failure in `.sisyphus/evidence/react-doctor/final/e2e-environment-note.md` with no source-code masking.

### Must Have
- Pin every React Doctor command to `react-doctor@0.1.6`.
- Record evidence under `.sisyphus/evidence/react-doctor/` for every batch.
- Characterize before modifying high-risk modules.
- Use stable domain IDs for keys and form IDs.
- Keep legal fallback UI visible; do not silence absence of data with `return null`.
- Use `src/__playwright/config.js` conventions for Playwright artifacts.

### Must NOT Have
- No deletion of routes, services, components, templates, or exports to reduce `knip` counts.
- No `React.forwardRef()` or `defaultProps` in new code.
- No `process.env`; use `import.meta.env.VITE_*` if environment access is needed.
- No direct HTTP calls in components.
- No service contract changes without explicit approval.
- No changes to legal copy or public templates for design lint satisfaction.
- No mass `<LabeledField>` rollout across thousands of labels without a separate approved plan.
- No use of React Doctor score as a success gate.

### Protected Files Requiring Explicit Per-Change Approval During Execution
- `src/app/App.js`
- `src/http-common.js`
- `src/app/services/data.service.js`
- `src/app/services/custom.service.js`
- `src/app/services/fun.service.js`
- `src/app/utils/TemplateEngine.js`
- `src/app/pages/user/clocks/hooks/useClocksManager.js`
- `src/app/pages/user/clocks/hooks/useProcessPhases.js`
- `src/app/pages/user/clocks/hooks/useAlarms.js`
- `public/templates/*`

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed, except explicit approval gates for protected-file modification and dead-code deletion.

- Test decision: **TDD/characterization-first** for behavior-affecting changes; tests-after only for static report/tooling changes.
- Frameworks: Vitest 4, Testing Library, MSW, Playwright.
- QA policy: Every task has agent-executed scenarios.
- Evidence root: `.sisyphus/evidence/react-doctor/`
- Canonical metric: error/warning counts by rule and file from `diagnostics.json`.
- Regression rule: no new errors in files untouched by the current batch.
- Waiver format in `.sisyphus/evidence/react-doctor/waivers.md`:
  ```markdown
  ## Waiver: <file> :: <rule>
  - **File:** src/path/file.js
  - **Rule:** react-doctor/rule-id
  - **Count:** 1
  - **Rationale:** Why fixing is unsafe or deferred.
  - **Owner:** user/project owner
  - **Expiry:** 2026-06-10
  - **Evidence:** .sisyphus/evidence/react-doctor/path/to/evidence.md
  ```

## Execution Strategy

### Parallel Execution Waves
> Target: 5-8 tasks per wave where dependencies allow. This plan is intentionally serialized at the start because baseline/tooling/test inventory are shared dependencies.

Wave 1: Task 1, Task 2, Task 3, Task 4 — foundation, evidence, test inventory, base characterization.
Wave 2: Task 5, Task 6, Task 7, Task 8 — React Doctor errors-first remediation.
Wave 3: Task 9, Task 10 — React 19/state/performance warnings and accessibility warning strategy.
Wave 4: Task 11, Task 12 — architecture/dead-code/design triage and final mitigation report.
Wave 5: Final Verification Wave F1-F4.

### Dependency Matrix
| Task | Depends On | Blocks |
|---:|---|---|
| 1 | none | 2, 4, 5-12 |
| 2 | 1 | 3, 4, 5-12 |
| 3 | 1, 2 | 4, 5-12 |
| 4 | 1, 2, 3 | 5-12 |
| 5 | 4 | 9, 12 |
| 6 | 4 | 9, 12 |
| 7 | 4 | 9, 10, 12 |
| 8 | 4 | 9, 10, 12 |
| 9 | 5, 6, 7, 8 | 12 |
| 10 | 5, 6, 7, 8 | 12 |
| 11 | 2, 3 | 12 |
| 12 | 1-11 | F1-F4 |

### Agent Dispatch Summary
| Wave | Task Count | Categories |
|---|---:|---|
| 1 | 4 | `deep`, `quick`, `unspecified-high` |
| 2 | 4 | `deep`, `unspecified-high`, `quick` |
| 3 | 2 | `deep`, `visual-engineering` |
| 4 | 2 | `writing`, `deep` |
| 5 | 4 | `oracle`, `unspecified-high`, `deep` |

## TODOs
> Implementation + Test = ONE task. Never separate. EVERY task includes agent profile, parallelization, references, acceptance criteria, QA scenarios, and commit strategy.

- [ ] 1. Freeze React Doctor Baseline Evidence

  **What to do**: Copy `/tmp/react-doctor-d233e0c6-a505-4890-903d-1e28eb1e67bb/` into `.sisyphus/evidence/react-doctor/2026-05-11-baseline/`. Create `.sisyphus/evidence/react-doctor/2026-05-11-baseline/summary.md` with canonical counts: 5381 total, 413 errors, 4968 warnings, 399 affected files, and category/rule counts from `diagnostics.json`. Do not modify application source.
  **Must NOT do**: Do not rerun with `latest` as the canonical baseline. Do not edit `diagnostics.json`. Do not commit `/tmp` paths as the only source of evidence.

  **Recommended Agent Profile**:
  - Category: `quick` - Evidence file copying and summary generation are bounded.
  - Skills: [] - No implementation skill needed beyond plan execution.
  - Omitted: `ui-ux-pro-max` - No UI work.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 2, 4, 5, 6, 7, 8, 9, 10, 11, 12 | Blocked By: none

  **References**:
  - Baseline source: `/tmp/react-doctor-d233e0c6-a505-4890-903d-1e28eb1e67bb/diagnostics.json` - current audit evidence.
  - Policy: `AGENTS.md` - protected modules and no route/module deletion.

  **Acceptance Criteria**:
  - [ ] `test -f .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json` exits `0`.
  - [ ] `node -e "const d=require('./.sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json'); const issues=Array.isArray(d)?d:(d.issues||d.diagnostics||[]); if(!Array.isArray(issues)||issues.length!==5381){process.exit(1)}"` exits `0`.
  - [ ] `test -f .sisyphus/evidence/react-doctor/2026-05-11-baseline/summary.md` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Baseline is preserved outside /tmp
    Tool: Bash
    Steps: test -f .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json && test -f .sisyphus/evidence/react-doctor/2026-05-11-baseline/summary.md
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-1-baseline-freeze.log

  Scenario: Baseline issue count matches planning evidence
    Tool: Bash
    Steps: node -e "const d=require('./.sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json'); const issues=Array.isArray(d)?d:(d.issues||d.diagnostics||[]); console.log(issues.length); if(issues.length!==5381) process.exit(1)"
    Expected: Prints 5381 and exits 0.
    Evidence: .sisyphus/evidence/react-doctor/task-1-baseline-count.log
  ```

  **Commit**: YES | Message: `chore(audit): freeze react doctor baseline` | Files: `.sisyphus/evidence/react-doctor/2026-05-11-baseline/*`

- [ ] 2. Add Pinned React Doctor Audit and Diff Tooling

  **What to do**: Add `scripts/react-doctor-audit.mjs` that runs `npx --yes react-doctor@0.1.6 . --verbose --json`, writes raw stdout/stderr and normalized `diagnostics.json` to a caller-provided output directory, and exits non-zero only on tool execution failure, not on found issues. Add `scripts/react-doctor-diff.mjs` that compares baseline vs after JSON by rule, severity, file, and untouched-file errors. Add `package.json` script `audit:react-doctor` with `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/latest`.
  **Must NOT do**: Do not introduce CI workflows. Do not install React Doctor as a permanent dependency unless `npx --yes react-doctor@0.1.6` fails in this repo. Do not use `latest`.

  **Recommended Agent Profile**:
  - Category: `deep` - Tooling needs robust JSON handling.
  - Skills: [] - Node script implementation only.
  - Omitted: `frontend-ui-ux` - No UI.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 3, 4, 5-12 | Blocked By: 1

  **References**:
  - External: https://github.com/millionco/react-doctor/blob/5ed8d4459055d39ec6800eb190bd0122538fcd70/README.md - React Doctor CLI options.
  - Existing scripts: `package.json` - add script next to audit scripts.
  - Test env: `vitest.config.mjs`, `src/__tests__/setup.js` - no CI dependency.

  **Acceptance Criteria**:
  - [ ] `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/tooling-smoke` exits `0` and writes `diagnostics.json`.
  - [ ] `npm run audit:react-doctor` exits `0` and writes `.sisyphus/evidence/react-doctor/latest/diagnostics.json`.
  - [ ] `node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/latest/diagnostics.json --mode report-only` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Pinned audit command creates JSON evidence
    Tool: Bash
    Steps: node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/task-2-smoke
    Expected: Exit code 0; diagnostics.json exists in task-2-smoke.
    Evidence: .sisyphus/evidence/react-doctor/task-2-audit-tool.log

  Scenario: Diff tool reports without mutating source
    Tool: Bash
    Steps: node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/task-2-smoke/diagnostics.json --mode report-only
    Expected: Exit code 0 and printed per-rule summary.
    Evidence: .sisyphus/evidence/react-doctor/task-2-diff-tool.log
  ```

  **Commit**: YES | Message: `chore(audit): add pinned react doctor tooling` | Files: `scripts/react-doctor-audit.mjs`, `scripts/react-doctor-diff.mjs`, `package.json`

- [ ] 3. Inventory Test Options and Establish Base Characterization Pattern

  **What to do**: Create `.sisyphus/evidence/react-doctor/test-inventory.md` listing available Vitest, Testing Library, MSW, Playwright, audit, build, and preflight options discovered in the repo. Add one base characterization test that follows existing patterns and is safe for a critical workflow: prefer `src/__tests__/workflows/react-doctor-characterization.workflow.test.js` based on `src/__tests__/workflows/submit-fun-records-expedition.workflow.test.js`, validating a FUN-to-records-to-expedition story with mocked services and visible UI assertions. If that workflow cannot mount in current fixtures, add the base case to the nearest existing workflow test file and document why in evidence.
  **Must NOT do**: Do not rewrite existing tests to pass. Do not require backend availability. Do not add a coverage script.

  **Recommended Agent Profile**:
  - Category: `deep` - Requires understanding test patterns and critical flows.
  - Skills: [`test-driven-development`] - Characterization must precede runtime changes.
  - Omitted: `visual-inspector` - Functional test inventory first; no visual UI change yet.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 4, 5-12 | Blocked By: 1, 2

  **References**:
  - Test config: `vitest.config.mjs`, `src/__tests__/setup.js`
  - Workflow pattern: `src/__tests__/workflows/submit-fun-records-expedition.workflow.test.js`
  - MSW setup: `src/__tests__/mocks/server.js`, `src/__tests__/mocks/handlers/`
  - Helpers: `src/__tests__/utils/renderHelpers.js`, `src/__tests__/utils/mockServices.js`
  - Playwright config: `playwright.config.js`, `src/__playwright/config.js`

  **Acceptance Criteria**:
  - [ ] `test -f .sisyphus/evidence/react-doctor/test-inventory.md` exits `0`.
  - [ ] `npm test -- src/__tests__/workflows --run` exits `0` after the base characterization test is added.
  - [ ] `npm run build` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Test inventory exists and names all available verification layers
    Tool: Bash
    Steps: node -e "const fs=require('fs'); const s=fs.readFileSync('.sisyphus/evidence/react-doctor/test-inventory.md','utf8'); for (const token of ['Vitest','Testing Library','MSW','Playwright','audit:preflight','build']) if(!s.includes(token)) process.exit(1);"
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-3-test-inventory.log

  Scenario: Base functional story test runs without backend
    Tool: Bash
    Steps: npm test -- src/__tests__/workflows --run
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-3-base-characterization.log
  ```

  **Commit**: YES | Message: `test(audit): add react doctor characterization baseline` | Files: `.sisyphus/evidence/react-doctor/test-inventory.md`, `src/__tests__/workflows/*`

- [ ] 4. Produce Hotspot and Rule-Family Mitigation Report

  **What to do**: Generate `.sisyphus/evidence/react-doctor/mitigation-report.md` from baseline JSON. Include top rules, top files, category counts, severity counts, root-cause families, protected-file impacts, false-positive risks, and explicit mitigation strategy. Include report-only sections for `knip/files`, `knip/exports`, `no-giant-component`, and design/copy rules.
  **Must NOT do**: Do not mark warnings as safe because they are warnings. Do not recommend deletion. Do not claim a rule is fixed.

  **Recommended Agent Profile**:
  - Category: `writing` - Structured technical report.
  - Skills: [`generate-report`, `report-standards`] - Formal Dovela audit report style.
  - Omitted: `ckm-design` - No visual asset generation.

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: 5-12 | Blocked By: 1, 2, 3

  **References**:
  - Baseline: `.sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json`
  - Risk docs: `AGENTS.md`, `ai/system-map.md`, `ai/testing-runbook.md`, `.github/instructions/clocks.instructions.md`

  **Acceptance Criteria**:
  - [ ] `test -f .sisyphus/evidence/react-doctor/mitigation-report.md` exits `0`.
  - [ ] `node -e "const fs=require('fs'); const s=fs.readFileSync('.sisyphus/evidence/react-doctor/mitigation-report.md','utf8'); for (const token of ['5381','413','4968','label-has-associated-control','no-nested-component-definition','react/jsx-key','knip/files','report-only']) if(!s.includes(token)) process.exit(1);"` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Mitigation report covers all major causal families
    Tool: Bash
    Steps: node -e "const fs=require('fs'); const s=fs.readFileSync('.sisyphus/evidence/react-doctor/mitigation-report.md','utf8'); ['Accessibility','Correctness','State','Architecture','Performance','Dead Code','Bundle Size'].forEach(t=>{ if(!s.includes(t)) process.exit(1); });"
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-4-report-coverage.log

  Scenario: Report does not authorize deletion-first cleanup
    Tool: Bash
    Steps: node -e "const s=require('fs').readFileSync('.sisyphus/evidence/react-doctor/mitigation-report.md','utf8'); if(/delete.*route|delete.*service|remove.*module/i.test(s)) process.exit(1);"
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-4-no-deletion-first.log
  ```

  **Commit**: YES | Message: `docs(audit): document react doctor mitigation strategy` | Files: `.sisyphus/evidence/react-doctor/mitigation-report.md`

- [ ] 5. Remediate JSX Key Errors With Domain Identity

  **What to do**: Fix `react/jsx-key` errors in batches, starting with representative files identified during planning: `src/app/pages/user/records/eng/recprd_eng_mamporteria.js`, `src/app/pages/user/pqrs/pqrsadmin.functional.js`, `src/app/pages/user/pqrs/pqrsadmin.js`, and `src/app/pages/user/fun_forms/components/fun_clocks_events.component.js`. Use domain identifiers such as record IDs, PQRS IDs, document IDs, phase IDs, or stable field IDs. Use array indices only when the list is static, non-filtered, non-reordered, and documented inline with a comment.
  **Must NOT do**: Do not use random UUIDs per render. Do not use array index for dynamic legal records. Do not reorder arrays to make keys easier.

  **Recommended Agent Profile**:
  - Category: `deep` - Key choice can alter legal UI state.
  - Skills: [`test-driven-development`] - Characterization before behavior-affecting fixes.
  - Omitted: `ckm-ui-styling` - No styling.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9, 12 | Blocked By: 4

  **References**:
  - Error examples: `src/app/pages/user/records/eng/recprd_eng_mamporteria.js:365-372`, `src/app/pages/user/pqrs/pqrsadmin.functional.js:519-524`, `src/app/pages/user/pqrs/pqrsadmin.js:502`, `src/app/pages/user/fun_forms/components/fun_clocks_events.component.js:143`
  - React docs: https://react.dev/learn/rendering-lists#keeping-list-items-in-order-with-key
  - Tests: `src/__tests__/Records.integration.test.js`, `src/__tests__/PQRS.integration.test.js`, `src/__tests__/workflows/submit-fun-records-expedition.workflow.test.js`

  **Acceptance Criteria**:
  - [ ] `npm test -- src/__tests__/Records.integration.test.js src/__tests__/PQRS.integration.test.js --run` exits `0`.
  - [ ] `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/task-5-after` exits `0`.
  - [ ] `node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/task-5-after/diagnostics.json --target-rule react/jsx-key --require-decrease --no-new-errors-untouched` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Records and PQRS list rendering remains stable
    Tool: Bash
    Steps: npm test -- src/__tests__/Records.integration.test.js src/__tests__/PQRS.integration.test.js --run
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-5-records-pqrs-tests.log

  Scenario: JSX key errors decrease without unrelated new errors
    Tool: Bash
    Steps: node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/task-5-after/diagnostics.json --target-rule react/jsx-key --require-decrease --no-new-errors-untouched
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-5-react-doctor-diff.log
  ```

  **Commit**: YES | Message: `fix(audit): add stable keys to dynamic lists` | Files: `src/app/pages/user/records/eng/recprd_eng_mamporteria.js`, `src/app/pages/user/pqrs/pqrsadmin.functional.js`, `src/app/pages/user/pqrs/pqrsadmin.js`, `src/app/pages/user/fun_forms/components/fun_clocks_events.component.js`, relevant tests

- [ ] 6. Remediate Nested Component Definition Errors Safely

  **What to do**: Fix `react-doctor/no-nested-component-definition` errors in low-to-medium risk files first, including `src/app/pages/user/fun_forms/components/fun_clocks_events.component.js`, `src/app/pages/user/pqrs/pqrsadmin.functional.js`, `src/app/pages/user/pqrs/pqrsadmin.js`, and only the local nested component in `src/app/pages/user/fun_forms/fun_macrotable..js:1010` if existing characterization passes. Extract nested components to module scope in the same file unless the extracted component is reused by at least two files; then create a local sibling component file.
  **Must NOT do**: Do not split `exp._res.component.js`. Do not refactor large orchestrator state. Do not move HTTP/service calls. Do not change props semantics.

  **Recommended Agent Profile**:
  - Category: `deep` - Identity/remount behavior can change.
  - Skills: [`test-driven-development`] - Characterization required before extraction.
  - Omitted: `ui-ux-pro-max` - No visual redesign.

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: 9, 12 | Blocked By: 4

  **References**:
  - Examples: `src/app/pages/user/fun_forms/components/fun_clocks_events.component.js:132-160`, `src/app/pages/user/pqrs/pqrsadmin.functional.js:505-530`, `src/app/pages/user/pqrs/pqrsadmin.js:484`, `src/app/pages/user/fun_forms/fun_macrotable..js:1010`
  - Risk policy: `AGENTS.md`, `ai/system-map.md`
  - Tests: `src/__tests__/PQRS.integration.test.js`, `src/__tests__/workflows/submit-fun-records-expedition.workflow.test.js`

  **Acceptance Criteria**:
  - [ ] `npm test -- src/__tests__/PQRS.integration.test.js src/__tests__/workflows --run` exits `0`.
  - [ ] `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/task-6-after` exits `0`.
  - [ ] `node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/task-6-after/diagnostics.json --target-rule react-doctor/no-nested-component-definition --require-decrease --no-new-errors-untouched` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Extracted components preserve PQRS and FUN rendering behavior
    Tool: Bash
    Steps: npm test -- src/__tests__/PQRS.integration.test.js src/__tests__/workflows --run
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-6-characterization-tests.log

  Scenario: Nested component errors decrease
    Tool: Bash
    Steps: node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/task-6-after/diagnostics.json --target-rule react-doctor/no-nested-component-definition --require-decrease --no-new-errors-untouched
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-6-react-doctor-diff.log
  ```

  **Commit**: YES | Message: `fix(audit): extract nested render components safely` | Files: targeted component files and tests

- [ ] 7. Remediate Hooks, Duplicate Props, Required ARIA, Alt Text, and Mutable Dependency Errors

  **What to do**: Resolve the remaining non-structural errors: `react-hooks/rules-of-hooks` (6), `react/jsx-no-duplicate-props` (2), `jsx-a11y/alt-text` (2), `jsx-a11y/role-has-required-aria-props` (1), and `react-doctor/no-mutable-in-deps` (1). For the protected `src/app/App.js` mutable dependency issue, pause for explicit per-change approval before editing. For hooks violations, inspect the exact React Doctor file/line evidence and create a failing/characterization test before moving hooks.
  **Must NOT do**: Do not suppress ESLint/React Doctor. Do not move hooks without proving call order. Do not alter auth/session behavior in `App.js` without approval.

  **Recommended Agent Profile**:
  - Category: `deep` - Hooks and App.js changes are correctness-critical.
  - Skills: [`systematic-debugging`, `test-driven-development`] - Root cause and failing/characterization tests first.
  - Omitted: `ckm-ui-styling` - Accessibility semantics only, no visual styling.

  **Parallelization**: Can Parallel: YES for non-`App.js` files | Wave 2 | Blocks: 9, 10, 12 | Blocked By: 4

  **References**:
  - Alt examples: `src/app/components/languageSwitcher.js:20-21`, `src/app/components/carousel.component.js:54-61`
  - ARIA examples: `src/app/components/Collapsible.js:27-32`, `src/app/pages/user/pqrs/pqrsadmin.functional.js:899`, `src/app/pages/user/dictionary.page.js:168-183`
  - Protected mutable dep: `src/app/App.js:346`
  - React docs: https://react.dev/reference/rules/rules-of-hooks, https://react.dev/reference/react-dom/components/common#applying-aria-attributes

  **Acceptance Criteria**:
  - [ ] `npm test -- src/__tests__/PQRS.integration.test.js src/__tests__/Dashboard.integration.test.js --run` exits `0`.
  - [ ] `npm run build` exits `0`.
  - [ ] `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/task-7-after` exits `0`.
  - [ ] `node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json --target-severity error --require-decrease --no-new-errors-untouched` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Hooks and ARIA fixes do not break render tests
    Tool: Bash
    Steps: npm test -- src/__tests__/PQRS.integration.test.js src/__tests__/Dashboard.integration.test.js --run
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-7-render-tests.log

  Scenario: Remaining error count decreases without untouched-file regressions
    Tool: Bash
    Steps: node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/task-7-after/diagnostics.json --target-severity error --require-decrease --no-new-errors-untouched
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-7-error-diff.log
  ```

  **Commit**: YES | Message: `fix(audit): resolve hooks and accessibility errors` | Files: exact files from React Doctor error evidence, tests

- [ ] 8. Create Waivers for Unsafe Remaining Errors and Prove Error Target

  **What to do**: After Tasks 5-7, rerun React Doctor and handle remaining errors. If an error remains only because it touches a protected file or requires a broad refactor, add a waiver entry in `.sisyphus/evidence/react-doctor/waivers.md` with file, rule, count, rationale, owner, expiry `2026-06-10`, and evidence link. Otherwise fix it with characterization first. The target is zero unwaived errors.
  **Must NOT do**: Do not waive errors to avoid work. Do not use waivers for warnings that have not been triaged. Do not edit protected files without explicit approval.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Requires judgment and evidence discipline.
  - Skills: [`verification-before-completion`] - Evidence before success claims.
  - Omitted: `frontend-ui-ux` - No UI design.

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: 9, 10, 12 | Blocked By: 5, 6, 7

  **References**:
  - Waiver template: this plan, Verification Strategy.
  - Protected files: this plan, Protected Files section.
  - Diff script: `scripts/react-doctor-diff.mjs`

  **Acceptance Criteria**:
  - [ ] `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/task-8-after` exits `0`.
  - [ ] `node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/task-8-after/diagnostics.json --mode errors-zero-or-waived --waivers .sisyphus/evidence/react-doctor/waivers.md` exits `0`.
  - [ ] `npm test -- --run` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: No unwaived React Doctor errors remain
    Tool: Bash
    Steps: node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/task-8-after/diagnostics.json --mode errors-zero-or-waived --waivers .sisyphus/evidence/react-doctor/waivers.md
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-8-errors-zero-or-waived.log

  Scenario: Full Vitest suite remains green after error remediation
    Tool: Bash
    Steps: npm test -- --run
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-8-vitest-full.log
  ```

  **Commit**: YES | Message: `chore(audit): document remaining react doctor waivers` | Files: `.sisyphus/evidence/react-doctor/waivers.md`, final error fixes, tests

- [ ] 9. Triage and Remediate React 19, State, and Performance Warnings by Risk

  **What to do**: After zero unwaived errors, triage warnings for `react-doctor/no-react19-deprecated-apis` (74), `react-doctor/rerender-state-only-in-handlers` (123), and `react-doctor/js-set-map-lookups` (156). Coordinate deprecated API items with `REFACTOR_TRACKING_REACT19.md`. Fix low-risk helper/component cases first. For high-risk modules, create characterization tests or waiver entries instead of blind changes.
  **Must NOT do**: Do not introduce `forwardRef` or `defaultProps`. Do not convert array lookups in a way that changes object identity or ordering. Do not touch Clocks/FUN/Records/PQRS/Expeditions without test coverage.

  **Recommended Agent Profile**:
  - Category: `deep` - Risk analysis plus targeted fixes.
  - Skills: [`systematic-debugging`, `test-driven-development`] - Root-cause and test gates.
  - Omitted: `visual-inspector` - Visual verification not required unless UI layout changes.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 12 | Blocked By: 8

  **References**:
  - Migration tracker: `REFACTOR_TRACKING_REACT19.md`
  - Performance examples: `src/app/pages/user/fun_forms/fun_macrotable..js:605`, `src/app/pages/user/fun_forms/fun_macrotable..js:961-974`, `src/app/pages/user/fun_forms/components/charts_components.js/chart_workerReport.component.js:51-63`
  - State examples: `src/app/pages/user/fun_forms/components/charts_components.js/chart_time.component.js:198-240`, `src/app/pages/user/funmanage.page.js:209`

  **Acceptance Criteria**:
  - [ ] `.sisyphus/evidence/react-doctor/task-9-warning-triage.md` exists and lists each target rule count, fixed count, waived count, and deferred count.
  - [ ] `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/task-9-after` exits `0`.
  - [ ] `node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/task-8-after/diagnostics.json --after .sisyphus/evidence/react-doctor/task-9-after/diagnostics.json --target-rules react-doctor/no-react19-deprecated-apis,react-doctor/rerender-state-only-in-handlers,react-doctor/js-set-map-lookups --require-nonincrease --no-new-errors-untouched` exits `0`.
  - [ ] `npm run audit:preflight` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Target warning families do not regress and errors remain controlled
    Tool: Bash
    Steps: node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/task-8-after/diagnostics.json --after .sisyphus/evidence/react-doctor/task-9-after/diagnostics.json --target-rules react-doctor/no-react19-deprecated-apis,react-doctor/rerender-state-only-in-handlers,react-doctor/js-set-map-lookups --require-nonincrease --no-new-errors-untouched
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-9-warning-diff.log

  Scenario: Static preflight remains green
    Tool: Bash
    Steps: npm run audit:preflight
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-9-preflight.log
  ```

  **Commit**: YES | Message: `fix(audit): triage react19 state and performance warnings` | Files: warning fixes, tests, `.sisyphus/evidence/react-doctor/task-9-warning-triage.md`

- [ ] 10. Triage Accessibility Label Warnings With Hybrid Strategy

  **What to do**: Triage `jsx-a11y/label-has-associated-control` (2990) and related accessibility warnings. Use in-place `id`/`htmlFor` fixes for existing low-risk forms. For repeated shared patterns, propose but do not mass-roll out a local field wrapper unless the wrapper is proven in one characterized screen. Use `useId` only where it remains stable for hydration/render semantics and does not replace existing domain IDs.
  **Must NOT do**: Do not add fake hidden inputs just to satisfy the rule. Do not change legal copy. Do not perform global wrapper migration. Do not break Bootstrap/RSuite layout.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Accessibility can affect rendered forms.
  - Skills: [`ui-ux-pro-max`, `dovela-redesign-standards`, `visual-inspector`] - Required for UI/layout-sensitive changes in this repo.
  - Omitted: `ckm-banner-design` - Not a marketing asset.

  **Parallelization**: Can Parallel: YES | Wave 3 | Blocks: 12 | Blocked By: 8

  **References**:
  - Label examples: `src/app/pages/user/fun_forms/components/fun_clocks_events.component.js:136-154`, `src/app/pages/user/profesionals/manage.component.js:47`
  - Accessibility docs: https://react.dev/reference/react-dom/components/input, https://react.dev/reference/react/useId
  - UI redesign docs if layout changes occur: `implementacion-rediseno/README.md`, `implementacion-rediseno/02-principios-inquebrantables.md`, `implementacion-rediseno/04-antipatrones.md`

  **Acceptance Criteria**:
  - [ ] `.sisyphus/evidence/react-doctor/task-10-accessibility-triage.md` exists and lists top files, low-risk fixes, wrapper candidates, and deferred legal-critical items.
  - [ ] `npm test -- src/__tests__/FunLicenses.smoke.test.js src/__tests__/PQRS.integration.test.js --run` exits `0`.
  - [ ] `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/task-10-after` exits `0`.
  - [ ] `node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/task-8-after/diagnostics.json --after .sisyphus/evidence/react-doctor/task-10-after/diagnostics.json --target-rule jsx-a11y/label-has-associated-control --require-nonincrease --no-new-errors-untouched` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Accessibility label fixes preserve representative form flows
    Tool: Bash
    Steps: npm test -- src/__tests__/FunLicenses.smoke.test.js src/__tests__/PQRS.integration.test.js --run
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-10-form-tests.log

  Scenario: Label warning count does not increase and no errors return
    Tool: Bash
    Steps: node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/task-8-after/diagnostics.json --after .sisyphus/evidence/react-doctor/task-10-after/diagnostics.json --target-rule jsx-a11y/label-has-associated-control --require-nonincrease --no-new-errors-untouched
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-10-label-diff.log
  ```

  **Commit**: YES | Message: `fix(a11y): triage form label associations safely` | Files: low-risk form fixes, tests, `.sisyphus/evidence/react-doctor/task-10-accessibility-triage.md`

- [ ] 11. Keep Dead Code, Giant Component, and Design Rules as Explicit Triage

  **What to do**: Create `.sisyphus/evidence/react-doctor/task-11-advisory-triage.md` for `knip/files`, `knip/exports`, `react-doctor/no-giant-component`, `react-doctor/design-no-redundant-size-axes`, `react-doctor/design-no-three-period-ellipsis`, and bundle-size warnings. Mark `knip` as report-only. Add waivers/deferred items for `src/app/pages/user/expeditions/exp._res.component.js`, `src/app/pages/user/fun_forms/fun_macrotable..js`, and `src/app/pages/user/fun.js` giant-component warnings unless separately approved. Do not change source for this task except evidence files.
  **Must NOT do**: Do not delete files. Do not split giant components. Do not alter legal strings or templates. Do not change CSS/layout for design warnings.

  **Recommended Agent Profile**:
  - Category: `writing` - Evidence triage and policy.
  - Skills: [`project-management`] - Prioritization and risk tracking.
  - Omitted: `ai-slop-remover` - No code cleanup should occur.

  **Parallelization**: Can Parallel: YES | Wave 4 | Blocks: 12 | Blocked By: 4

  **References**:
  - Giant files: `src/app/pages/user/expeditions/exp._res.component.js`, `src/app/pages/user/fun_forms/fun_macrotable..js`, `src/app/pages/user/fun.js`
  - No deletion policy: `AGENTS.md`
  - System risk: `ai/system-map.md`

  **Acceptance Criteria**:
  - [ ] `test -f .sisyphus/evidence/react-doctor/task-11-advisory-triage.md` exits `0`.
  - [ ] `node -e "const s=require('fs').readFileSync('.sisyphus/evidence/react-doctor/task-11-advisory-triage.md','utf8'); for (const token of ['knip/files','knip/exports','report-only','no-giant-component','exp._res.component.js','design-no-three-period-ellipsis']) if(!s.includes(token)) process.exit(1);"` exits `0`.
  - [ ] `git diff --name-only | node -e "const fs=require('fs'); const input=fs.readFileSync(0,'utf8').trim().split(/\n/).filter(Boolean); const illegal=input.filter(p=>!p.startsWith('.sisyphus/evidence/react-doctor/') && p!=='.sisyphus/plans/react-doctor-mitigation.md'); if(illegal.length){console.error(illegal.join('\n')); process.exit(1)}"` exits `0` for this task branch/checkpoint.

  **QA Scenarios**:
  ```
  Scenario: Advisory triage explicitly prevents deletion-first cleanup
    Tool: Bash
    Steps: node -e "const s=require('fs').readFileSync('.sisyphus/evidence/react-doctor/task-11-advisory-triage.md','utf8'); if(!s.includes('report-only')) process.exit(1); if(/delete without|remove without/i.test(s)) process.exit(1);"
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-11-report-only.log

  Scenario: No source code is changed by advisory triage
    Tool: Bash
    Steps: git diff --name-only | node -e "const fs=require('fs'); const files=fs.readFileSync(0,'utf8').trim().split(/\n/).filter(Boolean); const bad=files.filter(p=>p.startsWith('src/')||p.startsWith('public/templates/')); if(bad.length){console.error(bad.join('\n')); process.exit(1)}"
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/task-11-no-source-change.log
  ```

  **Commit**: YES | Message: `docs(audit): triage advisory react doctor warnings` | Files: `.sisyphus/evidence/react-doctor/task-11-advisory-triage.md`, `.sisyphus/evidence/react-doctor/waivers.md`

- [ ] 12. Finalize Mitigation Report and Full Verification Package

  **What to do**: Run the full verification suite, update `.sisyphus/evidence/react-doctor/mitigation-report.md` with final counts, fixed counts, waived counts, deferred counts, and residual risk. Add `.sisyphus/evidence/react-doctor/final/verification-summary.md` with command outputs and artifact paths. Ensure the plan’s required report explains why issues are causal, what mitigates them, and what must not be removed.
  **Must NOT do**: Do not claim completion if any command fails. Do not hide failures by updating tests. Do not push or merge.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Cross-cutting verification and evidence.
  - Skills: [`verification-before-completion`, `project-management`] - Evidence and executive summary.
  - Omitted: `git-master` - No git history operation beyond normal commits unless explicitly requested.

  **Parallelization**: Can Parallel: NO | Wave 4 | Blocks: F1-F4 | Blocked By: 1-11

  **References**:
  - Runbook: `ai/testing-runbook.md`
  - Release validation: `ai/release-runbook.md`
  - Evidence from tasks 1-11.

  **Acceptance Criteria**:
  - [ ] `node scripts/react-doctor-audit.mjs --out .sisyphus/evidence/react-doctor/final` exits `0`.
  - [ ] `node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/final/diagnostics.json --mode errors-zero-or-waived --waivers .sisyphus/evidence/react-doctor/waivers.md` exits `0`.
  - [ ] `npm run audit:preflight` exits `0`.
  - [ ] `npm test -- --run` exits `0`.
  - [ ] `npm run build` exits `0`.
  - [ ] `test -f .sisyphus/evidence/react-doctor/final/verification-summary.md` exits `0`.

  **QA Scenarios**:
  ```
  Scenario: Full static and test verification passes
    Tool: Bash
    Steps: npm run audit:preflight && npm test -- --run && npm run build
    Expected: Exit code 0 for all commands.
    Evidence: .sisyphus/evidence/react-doctor/final/static-test-build.log

  Scenario: Final React Doctor status meets errors-first policy
    Tool: Bash
    Steps: node scripts/react-doctor-diff.mjs --before .sisyphus/evidence/react-doctor/2026-05-11-baseline/diagnostics.json --after .sisyphus/evidence/react-doctor/final/diagnostics.json --mode errors-zero-or-waived --waivers .sisyphus/evidence/react-doctor/waivers.md
    Expected: Exit code 0.
    Evidence: .sisyphus/evidence/react-doctor/final/react-doctor-errors-zero-or-waived.log
  ```

  **Commit**: YES | Message: `docs(audit): finalize react doctor mitigation evidence` | Files: `.sisyphus/evidence/react-doctor/*`, final fixes/tests

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [ ] F1. Plan Compliance Audit — oracle
  - Verify every task in this plan has evidence.
  - Verify protected-file approvals are recorded before protected file edits.
  - Verify no deletion-first `knip` cleanup occurred.
  - Evidence: `.sisyphus/evidence/react-doctor/final/F1-plan-compliance.md`

- [ ] F2. Code Quality Review — unspecified-high
  - Review React 19 correctness, hooks, keys, props, and state/effects changes.
  - Verify no `forwardRef`, `defaultProps`, or `process.env` were introduced.
  - Evidence: `.sisyphus/evidence/react-doctor/final/F2-code-quality.md`

- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
  - Execute agent-driven Playwright smoke for login, FUN/radicación, modal overlay, and any accessibility-touched forms using existing configs.
  - Command: `npm run test:e2e -- --grep "login|FUN|radic|modal"`
  - Evidence: `.sisyphus/evidence/react-doctor/final/F3-playwright-qa.md`

- [ ] F4. Scope Fidelity Check — deep
  - Compare final changed files against scope boundaries.
  - Confirm no legal functionality, route, service, or template was removed to satisfy React Doctor.
  - Evidence: `.sisyphus/evidence/react-doctor/final/F4-scope-fidelity.md`

## Commit Strategy
- Commit after each completed task when its acceptance criteria pass.
- Use conventional messages listed per task.
- Do not push or merge.
- Do not amend commits after hooks fail; fix and create a new commit according to repository git safety rules.
- Do not include secrets or environment files.

## Success Criteria
- Baseline diagnostics are preserved outside `/tmp`.
- `audit:react-doctor` uses React Doctor `0.1.6` reproducibly.
- All original React Doctor errors are fixed or explicitly waived with owner, rationale, expiry, and evidence.
- No new React Doctor errors appear in untouched files.
- `knip` dead-code findings remain report-only unless separately approved per file.
- Critical Dovela workflows remain verified by Vitest/Playwright/build/preflight evidence.
- Final report explains all causal families and mitigation strategy without recommending removal of critical functionality.

## Defaults Applied
- Waiver owner defaults to `user/project owner`; expiry defaults to `2026-06-10`.
- Dead-code rules are advisory/report-only.
- Accessibility uses hybrid remediation: in-place fixes first, wrapper only for characterized shared patterns/new code.
- `exp._res.component.js` giant-component splitting is deferred to a separate future refactor.
- Visual snapshots are required only if label/accessibility work changes visible layout.

## Decisions Needed During Execution
- Before modifying any protected file listed in this plan, the executor must request explicit approval with the exact file, rule, intended change, and verification command.
- Before deleting any file/export flagged by `knip`, the executor must request explicit per-file approval; default is no deletion.
