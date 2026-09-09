// ==========================================
// TYPE NARROWING
// ==========================================
// Narrowing = TypeScript shrinking a WIDE type (like `string | number`)
// down to a SPECIFIC one (`string`) by reading your normal JS checks.
//
// You do not write special syntax for this -- TS follows the control flow of
// if / else / switch / return and tracks what each branch can still be.
// This is called "control flow analysis".

// ==========================================
// 1. typeof NARROWING  (for primitives)
// ==========================================
function printId(id: string | number): void {
    // Here `id` is `string | number` -- only members COMMON to both are allowed.
    // id.toUpperCase();            // ❌ 'toUpperCase' does not exist on type 'number'

    if (typeof id === "string") {
        console.log(id.toUpperCase());   // ✅ narrowed to `string`
    } else {
        console.log(id.toFixed(2));      // ✅ narrowed to `number` (the only option left)
    }
}
printId("usr-101");
printId(101);

// ⚠️ typeof GOTCHA: `typeof null` is "object" -- a famous JavaScript bug.
function printLength(value: string[] | null): void {
    // if (typeof value === "object") { ... }   // ❌ null also passes this check!
    if (value !== null) {
        console.log(value.length);       // ✅ narrowed to `string[]`
    }
}
printLength(["a", "b"]);
printLength(null);

// typeof only returns: "string" | "number" | "bigint" | "boolean"
//                    | "symbol" | "undefined" | "object" | "function"
// So it CANNOT tell an array from an object, or one interface from another.

// ==========================================
// 2. TRUTHINESS NARROWING
// ==========================================
function printAll(values: string[] | null | undefined): void {
    if (values) {
        // null and undefined are both filtered out here
        values.forEach((v) => console.log(v));
    }
}
printAll(["x"]);
printAll(null);

// ⚠️ TRUTHINESS GOTCHA: "" , 0 , NaN and false are also falsy.
function describeCount(count: number | undefined): string {
    if (!count) {
        return "no count";      // ❌ BUG: count === 0 lands here too
    }
    return `count is ${count}`;
}
console.log(describeCount(0));          // "no count"  -- wrong!

function describeCountFixed(count: number | undefined): string {
    if (count === undefined) {
        return "no count";      // ✅ check for undefined explicitly
    }
    return `count is ${count}`;
}
console.log(describeCountFixed(0));     // "count is 0" -- correct

// ==========================================
// 3. EQUALITY NARROWING
// ==========================================
function compare(a: string | number, b: string | boolean): void {
    if (a === b) {
        // If they are strictly equal, the only type they can BOTH be is `string`.
        console.log(a.toUpperCase(), b.toUpperCase());   // ✅ both are `string`
    }
}
compare("hi", "hi");

// `!= null` (loose !=) removes BOTH null and undefined in one check -- handy shortcut.
function trim(text: string | null | undefined): string {
    if (text != null) {
        return text.trim();     // ✅ narrowed to `string`
    }
    return "";
}
console.log(trim("  hello  "));

// ==========================================
// 4. THE `in` OPERATOR  (narrow by property name)
// ==========================================
interface Bird {
    fly(): void;
    layEggs(): void;
}
interface Fish {
    swim(): void;
    layEggs(): void;
}

function move(animal: Bird | Fish): void {
    if ("fly" in animal) {
        animal.fly();           // ✅ narrowed to `Bird`
    } else {
        animal.swim();          // ✅ narrowed to `Fish`
    }
}
move({ fly: () => console.log("flying"), layEggs: () => {} });
move({ swim: () => console.log("swimming"), layEggs: () => {} });

// ==========================================
// 5. instanceof NARROWING  (for classes)
// ==========================================
function logDate(value: Date | string): void {
    if (value instanceof Date) {
        console.log(value.toISOString());   // ✅ narrowed to `Date`
    } else {
        console.log(value.toUpperCase());   // ✅ narrowed to `string`
    }
}
logDate(new Date());
logDate("2026-09-09");

// Very common with errors, since `catch` gives you `unknown`
function handleError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;               // ✅ narrowed to `Error`
    }
    return String(error);
}
console.log(handleError(new Error("boom")));
console.log(handleError("just a string"));

// ==========================================
// 6. DISCRIMINATED UNIONS  (the most useful pattern)
// ==========================================
// Give every member of the union a shared LITERAL field (the "discriminant"/"tag").
// Checking that one field narrows the whole object.

interface LoadingState {
    kind: "loading";                    // <-- the discriminant
}
interface SuccessState {
    kind: "success";
    data: string[];
}
interface ErrorState {
    kind: "error";
    message: string;
}
type RequestState = LoadingState | SuccessState | ErrorState;

function render(state: RequestState): string {
    switch (state.kind) {
        case "loading":
            return "Loading...";
        case "success":
            return state.data.join(", ");    // ✅ `data` only exists on SuccessState
        case "error":
            return `Error: ${state.message}`; // ✅ `message` only exists on ErrorState
    }
}
console.log(render({ kind: "loading" }));
console.log(render({ kind: "success", data: ["a", "b"] }));
console.log(render({ kind: "error", message: "404" }));

// Shapes -- the classic example
type Shape =
    | { kind: "circle"; radius: number }
    | { kind: "square"; side: number };

function getArea(shape: Shape): number {
    if (shape.kind === "circle") {
        return Math.PI * shape.radius ** 2;
    }
    return shape.side ** 2;
}
console.log(getArea({ kind: "circle", radius: 2 }));
console.log(getArea({ kind: "square", side: 3 }));

// ==========================================
// 7. EXHAUSTIVENESS CHECKING WITH `never`
// ==========================================
// `never` = a type with NO possible value. If every case is handled, the
// remaining type in `default` is `never`. Assigning anything else fails.
// This turns "I forgot a case" into a COMPILE error instead of a runtime bug.

function renderSafe(state: RequestState): string {
    switch (state.kind) {
        case "loading":
            return "Loading...";
        case "success":
            return state.data.join(", ");
        case "error":
            return `Error: ${state.message}`;
        default: {
            const exhaustive: never = state;    // ✅ compiles only if all cases handled
            return exhaustive;
        }
    }
}
console.log(renderSafe({ kind: "success", data: ["ok"] }));
// If you later add `{ kind: "idle" }` to RequestState and forget a case here,
// TS errors: Type 'IdleState' is not assignable to type 'never'.

// ==========================================
// 8. TYPE PREDICATES  (your own reusable guard)
// ==========================================
// A normal boolean function does NOT narrow. `value is Fish` tells TS
// "if this returns true, treat the argument as Fish from here on".

function isFish(animal: Bird | Fish): animal is Fish {
    return (animal as Fish).swim !== undefined;
}

const pets: (Bird | Fish)[] = [
    { swim: () => {}, layEggs: () => {} },
    { fly: () => {}, layEggs: () => {} }
];

const fishes: Fish[] = pets.filter(isFish);   // ✅ filter() narrows the array type
console.log(fishes.length);

// Handy guard for `unknown` data (API responses, JSON.parse, etc.)
function isStringArray(value: unknown): value is string[] {
    return Array.isArray(value) && value.every((item) => typeof item === "string");
}

const parsed: unknown = ["a", "b"];
if (isStringArray(parsed)) {
    console.log(parsed.map((s) => s.toUpperCase()));   // ✅ narrowed to `string[]`
}

// ==========================================
// 9. ASSERTION FUNCTIONS  ( asserts ... )
// ==========================================
// Instead of returning a boolean, it THROWS. After the call, TS treats the
// value as narrowed for the rest of the scope -- no `if` block needed.
function assertIsNumber(value: unknown): asserts value is number {
    if (typeof value !== "number") {
        throw new Error("Not a number");
    }
}

function double(value: unknown): number {
    assertIsNumber(value);
    return value * 2;           // ✅ `value` is `number` from here down
}
console.log(double(21));

// ==========================================
// 10. WHEN NARROWING GETS LOST
// ==========================================
// ⚠️ A `let` can be reassigned, so TS discards narrowing inside callbacks.
interface Box {
    contents: string | null;
}

function printContents(box: Box): void {
    if (box.contents !== null) {
        // ❌ TS drops this narrowing inside a callback, because some other code
        //    could set box.contents = null before the callback runs.
        // setTimeout(() => console.log(box.contents.length), 0);

        // ✅ Copy into a const first -- a const can never change, so narrowing sticks.
        const contents = box.contents;
        setTimeout(() => console.log(contents.length), 0);
    }
}
printContents({ contents: "hello" });

// ⚠️ Reassigning inside a branch WIDENS the type again.
function process(input: string | number): void {
    if (typeof input === "string") {
        console.log(input.toUpperCase());   // ✅ string
        input = 42;                         // reassigned...
        console.log(input.toFixed(0));      // ✅ now TS tracks it as `number`
    }
}
process("abc");

// ==========================================
// 11. QUICK SUMMARY
// ==========================================
// typeof x === "string"     -> primitives only  (careful: typeof null === "object")
// if (x)                    -> truthiness       (careful: "" , 0 , NaN , false)
// x === y  /  x != null     -> equality         (`!= null` kills null AND undefined)
// "prop" in obj             -> object shapes by property name
// x instanceof Date         -> classes / Error
// switch (x.kind)           -> discriminated unions  <-- prefer this for objects
// const c: never = x        -> exhaustiveness check in `default`
// function f(x): x is T     -> custom reusable guard (works with .filter())
// function f(x): asserts x is T -> throws, then narrows the rest of the scope
