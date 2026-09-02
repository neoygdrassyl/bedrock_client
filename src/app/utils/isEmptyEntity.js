// Backend serializes an absent Sequelize association as `{}` (single) or
// `[]` (multi), never `null` — this is the official contract (see
// ai/system-map.md in both repos). Plain truthy checks (`if (x.field)`)
// pass on `{}`, so use this instead of ad-hoc checks when deciding whether
// an association actually has data.
export function isEmptyEntity(value) {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}
