// ==========================================
// UTILITY TYPES
// ==========================================
// Utility types are GENERIC types that ship with TypeScript. They take an
// existing type and produce a NEW one from it -- optional-ise it, pick a few
// keys, drop a few keys, and so on.
//
// Why they matter: one source of truth. Define `Product` once, then derive
// every variation from it. Change `Product` later and every derived type
// updates automatically. Hand-copying the shape is how types drift apart.
//
// See generics.ts -- these are all just generics under the hood.

interface Product {
    id: number;
    title: string;
    price: number;
    description: string;
    inStock: boolean;
}

// ==========================================
// 1. Partial<T>  -- make every property optional
// ==========================================
// The #1 use: an "update" / PATCH payload where the caller sends only what changed.

type ProductUpdate = Partial<Product>;
// becomes: { id?: number; title?: string; price?: number; ... }

function updateProduct(id: number, changes: Partial<Product>): void {
    console.log(`updating product ${id}`, changes);
}
updateProduct(1, { price: 599 });                    // ✅ only the changed field
updateProduct(1, { price: 599, inStock: false });    // ✅ or several
updateProduct(1, {});                                // ✅ even none
// updateProduct(1, { colour: "red" });              // ❌ unknown key still rejected

const draft: ProductUpdate = { title: "Draft product" };
console.log(draft);

// ⚠️ Partial is SHALLOW -- it does not make nested objects optional.

// ==========================================
// 2. Required<T>  -- the exact opposite
// ==========================================
// Removes `?` from every property. Useful after you fill in defaults.

interface Options {
    host?: string;
    port?: number;
    secure?: boolean;
}

function applyDefaults(options: Options): Required<Options> {
    return {
        host: options.host ?? "localhost",
        port: options.port ?? 3000,
        secure: options.secure ?? false
    };
}
const settings = applyDefaults({ port: 8080 });
console.log(settings.host.toUpperCase());   // ✅ no `| undefined` to check anymore

// ==========================================
// 3. Readonly<T>  -- lock every property
// ==========================================
// Blocks reassignment at COMPILE time (see optional.ts for the readonly rules).

type FrozenProduct = Readonly<Product>;

const frozen: FrozenProduct = {
    id: 1,
    title: "Keyboard",
    price: 2999,
    description: "Mechanical",
    inStock: true
};
// frozen.price = 1999;                     // ❌ Cannot assign to 'price', it is read-only
console.log(frozen.price);

// ⚠️ Also shallow, and gone at runtime. Use Object.freeze() for real protection.

// ==========================================
// 4. Pick<T, Keys>  -- keep only these keys
// ==========================================
// Great for a lightweight "list view" version of a heavy object.

type ProductPreview = Pick<Product, "id" | "title" | "price">;

const preview: ProductPreview = { id: 1, title: "Keyboard", price: 2999 };
// preview.description;                     // ❌ not part of the picked type
console.log(preview);

// ==========================================
// 5. Omit<T, Keys>  -- drop these keys
// ==========================================
// The mirror of Pick. Use whichever produces the SHORTER key list.
// Classic use: the shape you send to the server before an id exists.

type NewProduct = Omit<Product, "id">;

function createProduct(product: NewProduct): Product {
    return { ...product, id: Math.floor(Math.random() * 1000) };
}
const created = createProduct({
    title: "Mouse",
    price: 999,
    description: "Wireless",
    inStock: true
});
console.log(created.id);

// ⚠️ Omit does NOT check that the key exists -- Omit<Product, "colour"> silently
// compiles and changes nothing. Pick DOES error on an unknown key.

// ==========================================
// 6. Record<Keys, Value>  -- build a dictionary/map type
// ==========================================
// Record<K, V> means "an object whose keys are K and whose values are V".

type PriceList = Record<string, number>;        // any string key -> number
const prices: PriceList = { keyboard: 2999, mouse: 999 };
console.log(prices.keyboard);

// Far more useful with a LITERAL union as the key -- TS then forces you to
// cover every case, exactly like exhaustiveness checking in narrowing.ts.
type Role = "admin" | "editor" | "viewer";

const permissions: Record<Role, string[]> = {
    admin: ["read", "write", "delete"],
    editor: ["read", "write"],
    viewer: ["read"]
    // leaving out `viewer` -> ❌ Property 'viewer' is missing
};
console.log(permissions.admin);

// ==========================================
// 7. ReturnType<F>  -- the type a function returns
// ==========================================
// Lets a type follow a function instead of being copy-pasted from it.
// `typeof fn` grabs the function's TYPE, then ReturnType extracts its output.

function buildUser(id: number, email: string) {
    return { id, email, createdAt: new Date() };     // return type is inferred
}

type BuiltUser = ReturnType<typeof buildUser>;
// -> { id: number; email: string; createdAt: Date }

function logUser(user: BuiltUser): void {
    console.log(user.email, user.createdAt.getFullYear());
}
logUser(buildUser(1, "rahul@gmail.com"));
// Add a field to buildUser's return and BuiltUser updates on its own. ✅

// `Parameters<F>` does the same for the arguments, as a tuple.
type BuildUserArgs = Parameters<typeof buildUser>;    // [number, string]
const args: BuildUserArgs = [2, "test@gmail.com"];
console.log(buildUser(...args));

// ==========================================
// 8. Awaited<T>  -- unwrap a Promise
// ==========================================
// Pulls the value type out of a Promise (and out of nested Promises).

async function fetchProduct(): Promise<Product> {
    return { id: 1, title: "Keyboard", price: 2999, description: "", inStock: true };
}

type FetchedProduct = Awaited<ReturnType<typeof fetchProduct>>;   // -> Product
// Without Awaited you would get `Promise<Product>`, not `Product`.

function handleProduct(product: FetchedProduct): void {
    console.log(product.title);
}
void fetchProduct().then(handleProduct);

// ==========================================
// 9. NonNullable<T>  -- strip null and undefined
// ==========================================
type MaybeName = string | null | undefined;
type DefiniteName = NonNullable<MaybeName>;      // -> string

function shout(text: DefiniteName): string {
    return text.toUpperCase();                   // ✅ no null check needed
}
console.log(shout("rahul"));

// ==========================================
// 10. Exclude<T, U>  and  Extract<T, U>  -- filter a UNION
// ==========================================
// Pick / Omit filter object KEYS. Exclude / Extract filter UNION MEMBERS.

type NonAdminRole = Exclude<Role, "admin">;      // -> "editor" | "viewer"
type OnlyAdmin = Extract<Role, "admin">;         // -> "admin"

const editorRole: NonAdminRole = "editor";
// const wrong: NonAdminRole = "admin";          // ❌ excluded from the union
const adminRole: OnlyAdmin = "admin";
console.log(editorRole, adminRole);

// ==========================================
// 11. COMBINING THEM  (where the real power is)
// ==========================================
// Utility types compose -- read them inside-out.

// "Product without id, and everything optional" -> a form draft
type ProductDraft = Partial<Omit<Product, "id">>;
const formDraft: ProductDraft = { title: "Half-filled form" };
console.log(formDraft);

// "Just the display fields, locked" -> safe to pass into a render function
type LockedPreview = Readonly<Pick<Product, "title" | "price">>;
function renderCard(product: LockedPreview): string {
    return `${product.title} - ₹${product.price}`;
}
console.log(renderCard({ title: "Mouse", price: 999 }));

// A generic helper of your own, built from utility types:
// "make only THESE keys optional, leave the rest required"
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type ProductWithOptionalStock = PartialBy<Product, "inStock" | "description">;
const item: ProductWithOptionalStock = {
    id: 1,
    title: "Monitor",
    price: 12999
    // description and inStock may be skipped, the rest may not
};
console.log(item);

// ==========================================
// 12. QUICK SUMMARY
// ==========================================
// -- reshaping an OBJECT type --
// Partial<T>            every property optional        -> update / PATCH payloads
// Required<T>           every property required        -> after applying defaults
// Readonly<T>           every property readonly        -> immutable data
// Pick<T, K>            keep only these keys           -> list / preview shapes
// Omit<T, K>            drop these keys                -> "create" payload (no id)
// Record<K, V>          key type -> value type         -> dictionaries, lookup maps
//
// -- filtering a UNION --
// Exclude<T, U>         remove members assignable to U
// Extract<T, U>         keep members assignable to U
// NonNullable<T>        remove null and undefined
//
// -- following a FUNCTION or PROMISE --
// ReturnType<typeof f>  what f returns
// Parameters<typeof f>  what f takes, as a tuple
// Awaited<T>            the value inside a Promise
//
// ⚠️ Partial, Required and Readonly are all SHALLOW -- nested objects are untouched.
// ⚠️ Omit accepts keys that do not exist; Pick rejects them.
//
// Rule of thumb: never hand-write a type that is "X but slightly different".
// Derive it, so the two can never drift apart.
