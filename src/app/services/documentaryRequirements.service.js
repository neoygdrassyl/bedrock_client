import { refreshDocumentaryRequirements } from './documentaryOperations.service';

/** Base body of a documentary command: optimistic revision, idempotency key and a human reason. */
export function buildDocumentaryCommand(expectedInputRevision, reason) {
  return { expectedInputRevision: expectedInputRevision ?? 0, idempotencyKey: crypto.randomUUID(), reason };
}

/**
 * "Actualizar requisitos": re-evaluates the requirements of an expediente against its current inputs.
 * Callers keep their own `reason` text (it is recorded in the documentary audit trail).
 */
export function refreshRequirementsFor(fun0Id, expectedInputRevision, reason) {
  return refreshDocumentaryRequirements(fun0Id, buildDocumentaryCommand(expectedInputRevision, reason));
}
