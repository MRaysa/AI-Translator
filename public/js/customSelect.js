/**
 * Deprecated. The domain-context picker now uses `createSearchableSelect`
 * (see searchableSelect.js) with a custom `renderIcon`, so its behaviour is
 * identical to the language pickers (opens, filters, and closes on select).
 * Kept only to avoid a dangling import; safe to delete.
 */
export { createSearchableSelect as createCustomSelect } from "./searchableSelect.js";
