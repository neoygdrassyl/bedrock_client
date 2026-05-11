# F4 Scope Fidelity Check

## Decision: Blocked

The current working-tree React Doctor mitigation does **not** remove any route, public template, service file, or whole legal module, but the full dirty worktree includes behavior-affecting FUN document workflow changes that exceed the stated narrow scope of React Doctor evidence/tooling, targeted error fixes, characterization tests, and verification-only test updates.

## Scope Reviewed

- Review base: current working tree in `/home/diego/dovela/frontend` against `HEAD`.
- Changed files observed: 22 modified tracked files plus untracked `.sisyphus/`, `src/__tests__/workflows/react-doctor-characterization.workflow.test.js`, and `src/app/pages/user/fun_forms/components/FunDocumentAuditTab.jsx`.
- `git diff --name-status` for the working tree showed no `D` deletions.
- `src/app/App.js` and `public/templates/` are not changed in the working-tree mitigation delta.

## In-Scope Changes

These fit the intended React Doctor mitigation scope:

- React Doctor/evidence tooling:
- `package.json` adds `audit:react-doctor`.
- `.sisyphus/evidence/react-doctor/**` contains audit, diff, test, build, and final evidence artifacts.
- Characterization / verification tests:
- `src/__tests__/workflows/react-doctor-characterization.workflow.test.js`
- Dashboard/FUN/navigation test updates needed to match current UI behavior and service mocks.
- Narrow React Doctor-style fixes:
- `src/app/components/languageSwitcher.js`: adds `alt` text.
- `src/app/components/ui/index.js`: adds `aria-selected` for tab links.
- `src/app/pages/user/fun_forms/components/fun_clocks_events.component.js`: adds stable datalist option key.
- `src/app/pages/user/pqrs/pqrsadmin.js` and `pqrsadmin.functional.js`: extracts nested pending component and adds list keys.
- `src/app/pages/user/records/eng/recprd_eng_mamporteria.js`: replaces fragment shorthand with keyed `Fragment` and keyed options.
- `src/app/pages/user/fun_forms/components/fun_doc_certification.component.js` and `fun_duplicate.component.js`: removes duplicate/conflicting props.

## Blockers / Scope Drift

1. Protected service contract changed:
`src/app/services/fun.service.js` changes `getUnifiedDocumentEntries()` from `/${route}/documents/unified/${fun_id}/${id_related}` to `/${route}/documents/unified/${fun_id}/${id_related}?consolidated=1`. This is not a removal, but it is a service-contract behavior change in a protected file and should require explicit approval/evidence outside a React Doctor lint mitigation.

2. FUN document workflow behavior changed beyond lint/error mitigation:
`src/app/pages/user/fun_forms/fun_6.view.js` adds document/audit tabs, raw submit list state, inline digital-entry save flow, and passes new editing props into the unified table. `src/app/pages/user/shared/UnifiedDocumentEntryModal.jsx`, `UnifiedDocumentTable.jsx`, and `expediente-documental.utils.js` add consolidated document handling, preview/download URL builders, source expansion, folio summaries, and inline edit support. `src/app/pages/user/fun_forms/components/FunDocumentAuditTab.jsx` is a new runtime diagnostic UI module, not just evidence under `.sisyphus/`.

3. Branch-level caveat:
If F4 is interpreted as the entire branch versus `main`, the branch contains broad unrelated product/documentation/tooling changes and many deletions outside React Doctor scope. This report only approves/rejects the current working-tree mitigation delta; the whole branch should not be represented as React Doctor-only.

## Important Context From This Session

The FUN document workflow files and `src/app/services/fun.service.js` were already dirty before this React Doctor implementation began. They were treated as unrelated user/other-agent work and were not reverted or edited by this mitigation effort. They still affect F4 if the final handoff/commit boundary includes the entire dirty worktree.

## Removal Check

No evidence in the current working-tree mitigation delta that legal functionality, a route, a service file, public template, or whole module was removed to satisfy React Doctor.

- No deleted files in current working-tree `git diff --name-status`.
- No `public/templates/` changes in the current working tree.
- No route file change observed in `src/app/App.js` for the current working tree.
- `src/app/services/fun.service.js` was modified, not removed.

## Required Before Approval

1. Either exclude the unrelated FUN document workflow and `fun.service.js` contract changes from the React Doctor handoff, or explicitly justify/approve them as separate non-React-Doctor scope.
2. If kept in the same handoff, add dedicated evidence showing the consolidated document endpoint and inline edit/audit UI preserve existing FUN document behavior.
3. Re-run F4 after the scope decision, using the same diff boundary that will be used for final handoff/commit.
