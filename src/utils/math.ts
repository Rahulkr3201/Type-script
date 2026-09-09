// ==========================================
// src/utils/math.ts  -- several named exports
// ==========================================

export function add(a: number, b: number): number {
    return a + b;
}

export function multiply(a: number, b: number): number {
    return a * b;
}

export const PI = 3.14159;

// You can also declare first and export at the BOTTOM in one statement.
// Some teams prefer this -- all exports visible in one place.
function subtract(a: number, b: number): number {
    return a - b;
}
function divide(a: number, b: number): number {
    return b === 0 ? 0 : a / b;
}

export { subtract, divide };

// You can rename ON THE WAY OUT too:
function toFixedTwo(value: number): string {
    return value.toFixed(2);
}
export { toFixedTwo as formatNumber };

// One important point

// Don't create a utils folder and dump everything into it. That's a common bad practice.

// If a function is specifically related to authentication, put it in an auth-related service/module. If it's specifically related to users, put it with the user functionality.

// Utils should contain genuinely generic operations.