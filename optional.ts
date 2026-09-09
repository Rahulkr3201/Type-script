// ==========================================
// OPTIONAL, READONLY, AND NULLABLE VALUES
// ==========================================

interface User {
    readonly id: number;              // readonly -> can be set once, never reassigned
    name: string;                     // required -> must always be present
    email: string;                    // required
    age?: number;                     // optional  -> the key may be missing entirely
    profilePicture: string | null;    // nullable  -> the key MUST exist, value can be null
}

const user: User = {
    id: 101,
    name: "Rahul",
    email: "rahul@gmail.com",
    profilePicture: null
    // `age` is skipped -> allowed, because it is optional (age?)
    // `profilePicture` cannot be skipped -> it is required, only its VALUE can be null
};

// ==========================================
// 1. OPTIONAL PROPERTIES  ( ? )
// ==========================================
// `age?: number` is really `age: number | undefined`, PLUS permission to omit the key.
// So reading it gives `number | undefined`, never a plain `number`.

// console.log(user.age * 2);        // ❌ Error: 'user.age' is possibly 'undefined'

if (user.age !== undefined) {
    console.log(user.age * 2);       // ✅ inside the check TS narrows it to `number`
}

// Optional function PARAMETERS work the same way.
// Rule: optional params must come AFTER all required ones.
function greet(userName: string, title?: string): string {
    // `title` is `string | undefined` here
    return title ? `Hello ${title} ${userName}` : `Hello ${userName}`;
}
console.log(greet("Rahul"));            // "Hello Rahul"
console.log(greet("Rahul", "Mr."));     // "Hello Mr. Rahul"

// A DEFAULT value is often better than `?` -- the param is never undefined inside.
function greetLoud(userName: string, punctuation: string = "!"): string {
    return `HELLO ${userName.toUpperCase()}${punctuation}`;
}
console.log(greetLoud("Rahul"));        // "HELLO RAHUL!"

// Optional METHODS on an interface
interface Logger {
    log(message: string): void;
    warn?(message: string): void;       // may or may not exist
}

const simpleLogger: Logger = {
    log: (message) => console.log(message)
};
simpleLogger.warn?.("careful");         // ✅ safe: does nothing if `warn` is missing

// ==========================================
// 2. READONLY PROPERTIES
// ==========================================
// `readonly` blocks REASSIGNMENT of the property at compile time.

// user.id = 202;                       // ❌ Error: Cannot assign to 'id', it is read-only
user.name = "Rahul Kumar";              // ✅ `name` is not readonly

// ⚠️ readonly is SHALLOW: it protects the property, not the object inside it.
interface Config {
    readonly db: { host: string };
}
const config: Config = { db: { host: "localhost" } };
// config.db = { host: "prod" };        // ❌ cannot replace the object
config.db.host = "prod";                // ✅ but you CAN mutate inside it

// ⚠️ readonly is COMPILE-TIME only. It disappears in the compiled JavaScript.
// For true runtime protection you need Object.freeze().

// readonly ARRAYS -- mutating methods are removed from the type
const scores: readonly number[] = [90, 85, 70];
// scores.push(100);                    // ❌ Error: 'push' does not exist on 'readonly number[]'
const moreScores = [...scores, 100];    // ✅ create a NEW array instead
console.log(moreScores);

// `Readonly<T>` utility type makes EVERY property readonly at once
type FrozenUser = Readonly<User>;
const frozenUser: FrozenUser = { ...user };
// frozenUser.name = "Someone";         // ❌ every field is locked now
console.log(frozenUser.email);

// ==========================================
// 3. NULLABLE VALUES  ( | null )
// ==========================================
// `string | null` means: the key is REQUIRED, but the value can intentionally be null.
// Use null to say "we know there is no value here" (e.g. user never uploaded a picture).
// Use undefined / `?` to say "this value was never provided".

// console.log(user.profilePicture.length);   // ❌ 'user.profilePicture' is possibly 'null'

// Narrow it with a plain if-check
if (user.profilePicture !== null) {
    console.log(user.profilePicture.length);  // ✅ narrowed to `string`
}

// Optional chaining `?.` -> short-circuits to `undefined` on null/undefined
console.log(user.profilePicture?.toUpperCase());   // undefined, no crash

// Nullish coalescing `??` -> fallback only for null/undefined
const picture: string = user.profilePicture ?? "default-avatar.png";
console.log(picture);                              // "default-avatar.png"

// ⚠️ `??` vs `||` -- this is the classic bug.
// `||` also falls back on "", 0 and false, which are usually VALID values.
const rating: number | null = 0;
console.log(rating ?? 5);       // 0  ✅ correct: 0 is a real rating
console.log(rating || 5);       // 5  ❌ wrong: 0 got treated as "empty"

// A function that can legitimately return "nothing found"
function findUserById(id: number): User | null {
    return id === user.id ? user : null;
}

const found = findUserById(999);
if (found) {
    console.log(found.email);   // ✅ truthy check narrows away `null`
} else {
    console.log("User not found");
}

// ==========================================
// 4. QUICK SUMMARY
// ==========================================
// age?: number            -> key can be MISSING;  type is `number | undefined`
// age: number | undefined -> key is REQUIRED;     you must write `age: undefined`
// pic: string | null      -> key is REQUIRED;     value can be explicitly null
// readonly id: number     -> set once at creation, no reassignment afterwards
//
// Safe access tools:
//   value?.prop     optional chaining   -> undefined instead of a crash
//   value ?? "def"  nullish coalescing  -> fallback ONLY on null/undefined
//   if (value)      truthy narrowing    -> careful, also filters "" and 0
