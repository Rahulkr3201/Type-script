// ==========================================
// src/models/user.ts  -- NAMED EXPORTS
// ==========================================
// A "model" file describes a SHAPE. It holds types, not logic.
// `export` is what makes each name visible to other files.

export interface User {
    readonly id: number;
    name: string;
    email: string;
    role: UserRole;
}

export type UserRole = "admin" | "editor" | "viewer";

// You can export a value (a const) from the same file as your types.
export const DEFAULT_ROLE: UserRole = "viewer";

// Not exported -> PRIVATE to this file. Nobody outside can see or import it.
const INTERNAL_VERSION = 1;

export function describeUser(user: User): string {
    return `${user.name} <${user.email}> [${user.role}] v${INTERNAL_VERSION}`;
}
