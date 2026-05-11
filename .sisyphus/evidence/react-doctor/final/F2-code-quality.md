# F2 Code Quality Review

## Decision: Blocked

F2 cannot approve the full current mitigation delta as-is because the dirty worktree mixes narrow React Doctor fixes with behavior-affecting FUN document workflow and service-contract changes. The targeted React Doctor fixes themselves look technically safe, and no newly introduced `React.forwardRef`, `defaultProps`, or `process.env` usage was identified in the mitigation changes.

## Verification Reviewed

- `npm run audit:preflight`: passed in final verification.
- React Doctor errors-zero-or-waived diff: passed in final verification.
- Full Vitest suite: passed in final verification (`102` files, `551` tests).
- Build with heap: passed in final verification.

## Targeted React Doctor Fix Quality

- `src/app/components/languageSwitcher.js`: adds meaningful `alt` text.
- `src/app/components/ui/index.js`: adds `aria-selected` for tab links.
- PQRS pending-list extraction removes nested component definitions and preserves pending-list behavior.
- `src/app/pages/user/records/eng/recprd_eng_mamporteria.js`: adds stable keyed fragments/options.
- FUN duplicate prop fixes preserve the intended final prop values.
- Dashboard/test isolation changes were required to restore full-suite verification and expose count-failure fallback instead of silent zeroes.

## Blockers

1. Protected service-contract drift:
`src/app/services/fun.service.js` changes `getUnifiedDocumentEntries()` to append `?consolidated=1`. This is outside narrow React Doctor mitigation unless separately approved and tested.

2. FUN document workflow drift:
`src/app/pages/user/fun_forms/fun_6.view.js`, `src/app/pages/user/shared/UnifiedDocumentEntryModal.jsx`, `src/app/pages/user/shared/UnifiedDocumentTable.jsx`, `src/app/pages/user/shared/expediente-documental.utils.js`, and `src/app/pages/user/fun_forms/components/FunDocumentAuditTab.jsx` add runtime document/audit behavior beyond React Doctor cleanup scope.

3. Undeclared transitive dependency risk:
`src/app/pages/user/fun_forms/components/FunDocumentAuditTab.jsx` imports `prop-types`. If that unrelated component remains in the handoff, `prop-types` should be declared intentionally or the runtime dependency should be removed.

## Approval Conditions

1. Exclude the unrelated FUN document workflow and `fun.service.js` changes from the React Doctor handoff, or approve them as a separate product change with dedicated evidence.
2. Keep the React Doctor handoff limited to evidence/tooling/tests and narrow fixes listed above.
3. Resolve the `prop-types` dependency issue if `FunDocumentAuditTab.jsx` is included in the same delivery boundary.
