// ==========================================
// MODULES AND IMPORTS
// ==========================================
// A module is simply a FILE THAT EXPORTS SOMETHING. Another file imports it.
//
// The working example lives in the src/ folder next to this file:
//
//   src/
//   ├── models/
//   │   ├── user.ts            <- types + a const  (named exports)
//   │   └── product.ts
//   ├── services/
//   │   └── user.service.ts    <- logic, imports the models
//   ├── utils/
//   │   ├── math.ts            <- several named exports
//   │   └── logger.ts          <- a DEFAULT export
//   └── index.ts               <- barrel: re-exports everything
//
// Each file has one clear responsibility. Compare that to dumping User,
// Product, Order, ApiService and every helper into a single app.ts.

// ==========================================
// 1. THE MOST IMPORTANT RULE: SCRIPT vs MODULE
// ==========================================
// A .ts file with NO import and NO export is a SCRIPT -- its top-level names go
// into the GLOBAL scope, where they collide with the DOM and with every other
// script file in the project. (That is exactly the `status` clash noted in
// union_types.ts, and why `interface User` exists in several files here.)
//
// The moment a file has one `import` or `export`, it becomes a MODULE and its
// names become LOCAL to that file. This file is a module, so nothing in it can
// collide with type.ts, optional.ts or generics.ts.

// ==========================================
// 2. NAMED IMPORTS  ( with braces )
// ==========================================
// The name inside { } must MATCH the exported name exactly.

import { add, multiply } from "./src/utils/math";

console.log(add(10, 20));           // 30
console.log(multiply(10, 20));      // 200

// Import only what you need -- unused exports are never pulled in.
import { PI } from "./src/utils/math";
console.log(PI);

// ==========================================
// 3. DEFAULT IMPORT  ( no braces )
// ==========================================
// A default export has no name of its own, so YOU choose the name on import.
// `import Logger` and `import AnyNameYouLike` both work.

import Logger from "./src/utils/logger";

const appLogger = new Logger("app");
appLogger.log("started");

// Named vs default, side by side:
//   export function add() {}          ->  import { add } from "./math"
//   export default function add() {}  ->  import add from "./math"
//
//   Named   -> { name }   (braces, exact name)
//   Default -> name       (no braces, any name)

// Mixing both in one line -- default first, then the named ones:
import DefaultLogger, { type LogLevel } from "./src/utils/logger";
const level: LogLevel = "info";
console.log(new DefaultLogger("mixed"), level);

// ==========================================
// 4. RENAMING WITH `as`
// ==========================================
// Useful when two modules export the same name, or the name is too generic.

import { User as AppUser, DEFAULT_ROLE } from "./src/models/user";

const currentUser: AppUser = {
    id: 1,
    name: "Rahul",
    email: "rahul@gmail.com",
    role: DEFAULT_ROLE
};
console.log(currentUser.name);

// ==========================================
// 5. NAMESPACE IMPORT  ( import * as )
// ==========================================
// Pulls every named export into one object.

import * as MathUtils from "./src/utils/math";

console.log(MathUtils.add(2, 3));
console.log(MathUtils.subtract(10, 4));
console.log(MathUtils.formatNumber(3.14159));   // renamed on the way OUT in math.ts

// ⚠️ Prefer explicit named imports in app code. A namespace import hides which
// members you actually use, so bundlers cannot tree-shake the unused ones.

// ==========================================
// 6. RELATIVE PATHS
// ==========================================
// "./src/utils/math"   ./  = start from THIS file's folder
// "../models/user"         ../ = go UP one folder  (used inside services/)
// "typescript"             no dot = a package from node_modules
//
// Note there is no ".ts" extension in these paths. TypeScript resolves it.
// (In native ESM Node projects you write ".js" even from a .ts file -- a
// separate topic, driven by the "module" setting in tsconfig.json.)

// ==========================================
// 7. IMPORTING A CLASS AND USING IT
// ==========================================

import { UserService } from "./src/services/user.service";

const userService = new UserService();
const fetched = userService.getUser();
console.log(fetched.name);

const promoted = userService.promote(fetched, "admin");
console.log(promoted.role);

// ==========================================
// 8. `import type`  -- TYPE-ONLY IMPORTS
// ==========================================
// Interfaces and type aliases exist ONLY during type checking. They vanish from
// the compiled JavaScript. `import type` says "this is a type, not a value":

import type { Product } from "./src/models/product";
import { formatPrice } from "./src/models/product";

const laptop: Product = { id: 1, name: "Laptop", price: 74999, inStock: true };
console.log(formatPrice(laptop));

// Why bother?
//   1. It documents intent -- a reader sees instantly that nothing runs.
//   2. The import is erased completely, so no accidental runtime dependency
//      (and no circular-import surprises).
//   3. Required if your tsconfig has `isolatedModules` / `verbatimModuleSyntax`.
//
// You can also mark a single member inline:
//   import { formatPrice, type Product } from "./src/models/product";

// ==========================================
// 9. BARREL FILES  ( index.ts )
// ==========================================
// src/index.ts re-exports everything, so one path gives you all of it.
// A folder's index.ts is found automatically -- "./src" means
// "./src/index".

import { describeUser, type UserRole } from "./src";

const roleToShow: UserRole = "editor";
console.log(describeUser({ ...currentUser, role: roleToShow }));

// ==========================================
// 10. EXPORTING FROM THIS FILE
// ==========================================
// Everything above was importing. Here is the export side.

// (a) inline -- `export` in front of the declaration
export interface Session {
    userId: number;
    token: string;
}

export function createSession(userId: number): Session {
    return { userId, token: `tok_${userId}` };
}

// (b) at the bottom -- collect them in one statement
const SESSION_TTL_MINUTES = 30;
function isExpired(minutesElapsed: number): boolean {
    return minutesElapsed > SESSION_TTL_MINUTES;
}
export { SESSION_TTL_MINUTES, isExpired };

// (c) rename on the way out
function endSession(): void {
    console.log("session ended");
}
export { endSession as logout };

// (d) one default per file (this file's "main thing")
export default createSession;

console.log(createSession(1));

// ==========================================
// 11. QUICK SUMMARY
// ==========================================
// export interface X {}                   named export (inline)
// export { a, b }                         named export (at the bottom)
// export { a as b }                       rename on the way out
// export default X                        one per file, no name of its own
// export * from "./x"                     re-export everything (barrel)
// export { default as X } from "./x"       re-export a default under a name
//
// import { a, b } from "./x"              named   -> braces, exact names
// import X from "./x"                     default -> no braces, any name
// import X, { a } from "./x"              both, default first
// import { a as b } from "./x"            rename on the way in
// import * as NS from "./x"               everything as one object
// import type { T } from "./x"            types only, erased from the output
//
// ⚠️ No import and no export -> the file is a SCRIPT and its names are GLOBAL.
//    Add at least one export to make it a module.
