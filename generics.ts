// ==========================================
// GENERICS
// ==========================================
// A generic is a TYPE PARAMETER -- a placeholder for a type that gets filled in
// at the moment you CALL the function or USE the type.
//
// Think of it like a function parameter, but for types instead of values:
//   function double(x)  -> `x` is a value you pass in
//   function first<T>() -> `T` is a TYPE you pass in
//
// Goal: write code that works with MANY types, without losing type safety.

// ==========================================
// 1. THE PROBLEM GENERICS SOLVE
// ==========================================

// Attempt 1: one function per type -> duplicated code
function firstString(items: string[]): string {
    return items[0];
}
function firstNumber(items: number[]): number {
    return items[0];
}
console.log(firstString(["a", "b"]), firstNumber([1, 2]));

// Attempt 2: use `any` -> works for everything, but throws away ALL type safety
function firstAny(items: any[]): any {
    return items[0];
}
const bad = firstAny(["a", "b"]);   // `bad` is `any`
console.log(bad.whateverIWant);     // 😬 no error, crashes at RUNTIME

// Attempt 3: GENERICS -> one function, and the type is preserved
function first<T>(items: T[]): T {
    return items[0];
}
const s = first(["a", "b"]);        // T inferred as `string` -> `s` is string
const n = first([1, 2, 3]);         // T inferred as `number` -> `n` is number
// s.toFixed(2);                    // ❌ Error: 'toFixed' does not exist on 'string'
console.log(s.toUpperCase(), n.toFixed(2));   // ✅ full autocomplete on both

// `T` is just a conventional name. Common ones:
//   T = Type,  K = Key,  V = Value,  E = Element,  R = Return
// Use a descriptive name when it helps: <TUser>, <TResponse>.

// ==========================================
// 2. INFERENCE vs EXPLICIT TYPE ARGUMENTS
// ==========================================
const inferred = first([true, false]);          // ✅ TS infers T = boolean
const explicit = first<string>(["x", "y"]);     // ✅ you can state it yourself
console.log(inferred, explicit);

// Be explicit when inference cannot see the type, e.g. an empty array:
const empties = first<number>([]);              // T = number (would be `never` otherwise)
console.log(empties);

// ==========================================
// 3. MULTIPLE TYPE PARAMETERS
// ==========================================
function pair<K, V>(key: K, value: V): [K, V] {
    return [key, value];
}
const entry = pair("age", 20);      // [string, number]
console.log(entry);

// A generic can flow through a callback -- `map` is basically this:
function mapArray<T, R>(items: T[], transform: (item: T) => R): R[] {
    return items.map(transform);
}
const lengths = mapArray(["aa", "bbb"], (word) => word.length);   // number[]
console.log(lengths);

// ==========================================
// 4. CONSTRAINTS  ( extends )
// ==========================================
// Inside a generic function, TS knows NOTHING about T -- it could be anything.
// `extends` sets a minimum requirement so you can safely use members of T.

// function logLength<T>(item: T) { console.log(item.length); }   // ❌ 'length' does not exist on 'T'

interface HasLength {
    length: number;
}
function logLength<T extends HasLength>(item: T): T {
    console.log(item.length);       // ✅ safe: every T is guaranteed to have `length`
    return item;                    // and we return the EXACT type, not HasLength
}
logLength("hello");                 // ✅ string has .length
logLength([1, 2, 3]);               // ✅ array has .length
logLength({ length: 10 });          // ✅ object with .length
// logLength(42);                   // ❌ number has no .length

// ==========================================
// 5. keyof  -- CONSTRAINING TO AN OBJECT'S KEYS
// ==========================================
// `keyof T` is the union of T's property names: "id" | "title" | "price"
// This is the classic type-safe property getter.

interface Book {
    id: number;
    title: string;
    price: number;
}

function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];                // T[K] = "the type of the K property of T"
}

const book: Book = { id: 1, title: "TS Handbook", price: 499 };
const bookTitle = getProperty(book, "title");   // ✅ typed as `string`
const bookPrice = getProperty(book, "price");   // ✅ typed as `number`
// getProperty(book, "author");                 // ❌ 'author' is not a key of Book
console.log(bookTitle.toUpperCase(), bookPrice.toFixed(2));

// ==========================================
// 6. GENERIC INTERFACES AND TYPE ALIASES
// ==========================================
// The single most common real-world use: a reusable API response wrapper.

interface ApiResult<T> {
    success: boolean;
    data: T;                        // <-- shape changes per endpoint
    timestamp: number;
}

interface Account {
    id: number;
    email: string;
}

const accountResult: ApiResult<Account> = {
    success: true,
    data: { id: 1, email: "rahul@gmail.com" },
    timestamp: Date.now()
};
const accountListResult: ApiResult<Account[]> = {
    success: true,
    data: [{ id: 1, email: "rahul@gmail.com" }],
    timestamp: Date.now()
};
console.log(accountResult.data.email);          // ✅ knows it is one Account
console.log(accountListResult.data.length);     // ✅ knows it is an array

// Generic type alias -- a union that carries either a value or an error.
type Result<T, E = string> =
    | { ok: true; value: T }
    | { ok: false; error: E };

function parseAge(input: string): Result<number> {
    const parsedAge = Number(input);
    return Number.isNaN(parsedAge)
        ? { ok: false, error: "not a number" }
        : { ok: true, value: parsedAge };
}

const parsedResult = parseAge("20");
if (parsedResult.ok) {
    console.log(parsedResult.value * 2);    // ✅ narrowed -> `value` exists
} else {
    console.log(parsedResult.error);        // ✅ narrowed -> `error` exists
}

// ==========================================
// 7. GENERIC FUNCTIONS THAT RETURN PROMISES
// ==========================================
async function fetchData<T>(url: string): Promise<ApiResult<T>> {
    // pretend this is a real fetch
    return { success: true, data: {} as T, timestamp: Date.now() };
}

async function loadAccount(): Promise<void> {
    const response = await fetchData<Account>("/api/account");
    console.log(response.data.email);       // ✅ typed all the way through
}
void loadAccount();

// ==========================================
// 8. GENERIC CLASSES
// ==========================================
class Stack<T> {
    private items: T[] = [];

    push(item: T): void {
        this.items.push(item);
    }

    pop(): T | undefined {          // undefined when the stack is empty
        return this.items.pop();
    }

    peek(): T | undefined {
        return this.items[this.items.length - 1];
    }

    get size(): number {
        return this.items.length;
    }
}

const numberStack = new Stack<number>();
numberStack.push(1);
numberStack.push(2);
console.log(numberStack.pop()?.toFixed(0));     // ✅ knows it is number | undefined
// numberStack.push("three");                   // ❌ blocked at compile time

const accountStack = new Stack<Account>();      // same class, different type
accountStack.push({ id: 1, email: "rahul@gmail.com" });
console.log(accountStack.size);

// ==========================================
// 9. DEFAULT TYPE PARAMETERS
// ==========================================
// `= string` is used when the caller does not supply the type argument.
interface Container<T = string> {
    value: T;
}
const textContainer: Container = { value: "hello" };        // T defaults to string
const countContainer: Container<number> = { value: 42 };    // T explicitly number
console.log(textContainer.value, countContainer.value);

// ==========================================
// 10. BUILT-IN UTILITY TYPES
// ==========================================
// TypeScript ships a set of ready-made generics -- Partial, Pick, Omit,
// Record, ReturnType and friends. You are already using generics every time
// you use one of them.
//
// They have a file of their own: see utility-types.ts

// ==========================================
// 11. COMMON MISTAKES
// ==========================================

// ⚠️ MISTAKE 1: a generic used only ONCE is pointless -- it is just `any` in disguise.
// function log<T>(value: T): void { console.log(value); }   // T adds nothing
// A generic earns its place only when it LINKS two spots: input->output,
// or one parameter to another.

// ⚠️ MISTAKE 2: returning the constraint instead of T loses the specific type.
function badIdentity<T extends HasLength>(item: T): HasLength {
    return item;
}
const backAsHasLength = badIdentity("hello");
// backAsHasLength.toUpperCase();   // ❌ we only know it has `.length` now
console.log(backAsHasLength.length);

// ✅ return `T` (like logLength above) to keep the exact input type.

// ⚠️ MISTAKE 3: `<T>` in a .tsx file is read as a JSX tag.
// Use `<T,>` or `<T extends unknown>` in .tsx. In plain .ts, `<T>` is fine.

// ==========================================
// 12. QUICK SUMMARY
// ==========================================
// function f<T>(x: T): T          -> basic generic, links input to output
// f<string>(x)  /  f(x)           -> explicit type argument vs inference
// <T extends HasLength>           -> constraint: T must have these members
// <K extends keyof T>  +  T[K]    -> type-safe property access
// interface ApiResult<T>          -> reusable shape with a swappable part
// class Stack<T>                  -> one class, many element types
// <T = string>                    -> default type argument
// Partial / Pick / Omit / Record  -> built-in generics (see utility-types.ts)
//
// Rule of thumb: reach for a generic when the SAME logic must work for many
// types AND the caller's type must survive the round trip. If it does not
// survive, you probably wanted `unknown` (safe) rather than `any` (unsafe).
