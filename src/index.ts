// ==========================================
// src/index.ts  -- BARREL FILE (re-exports)
// ==========================================
// A barrel collects many modules behind ONE import path, so callers write
//   import { User, Product, UserService } from "./modules";
// instead of three separate import lines.

export type { User, UserRole } from "./models/user";
export { DEFAULT_ROLE, describeUser } from "./models/user";

export type { Product } from "./models/product";
export { formatPrice } from "./models/product";

export { UserService } from "./services/user.service";

// `export *` re-exports everything a file exports.
export * from "./utils/math";

// Re-export a default under a name:
export { default as Logger } from "./utils/logger";

// ⚠️ Barrels are convenient but can hurt build times and cause circular
// imports in large projects. Fine for a small app; be deliberate in a big one.
