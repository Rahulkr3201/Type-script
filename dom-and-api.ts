// ==========================================
// DOM AND API RESPONSE TYPING
// ==========================================
// These two topics share one theme: DATA FROM OUTSIDE YOUR PROGRAM.
//
// TypeScript can only check code it can SEE. It cannot see your HTML, and it
// cannot see what your server actually returns. At both boundaries TS is
// guessing -- and it deliberately guesses in a way that forces you to check.
//
// This file has one `export` at the bottom, so it is a MODULE (see modules.ts)
// and its names stay local.

// ==========================================
// PART A -- THE DOM
// ==========================================

// ==========================================
// A1. WHY querySelector RETURNS `| null`
// ==========================================
// TS has never read your HTML. The element might not be there, so the type is
// `Element | null` -- it forces you to handle the missing case.

const modalTitle = document.querySelector(".modal-title");
// modalTitle.textContent;              // ❌ 'modalTitle' is possibly 'null'

if (modalTitle !== null) {
    console.log(modalTitle.textContent);    // ✅ narrowed to `Element`
}

// Optional chaining is the short version when "do nothing" is acceptable:
console.log(document.querySelector(".modal-title")?.textContent);

// ==========================================
// A2. THE DOM TYPE HIERARCHY  (why `Element` is not enough)
// ==========================================
// EventTarget          -> can have listeners
//   └ Node             -> is in the tree (also covers text nodes, comments)
//       └ Element      -> a tag; has classList, getAttribute, ...
//           └ HTMLElement        -> adds style, dataset, click(), hidden
//               ├ HTMLInputElement    -> adds .value, .checked, .disabled
//               ├ HTMLFormElement     -> adds .submit(), .elements
//               └ HTMLButtonElement   -> adds .disabled, .type
//
// querySelector gives you the WIDE type `Element`, which has no `.value`:

const genericInput = document.querySelector(".tenant-input");
// genericInput?.value;                 // ❌ 'value' does not exist on type 'Element'

// ==========================================
// A3. THREE WAYS TO GET THE SPECIFIC ELEMENT TYPE
// ==========================================

// (1) The generic parameter -- querySelector<T> takes a type argument.
const tenantInput = document.querySelector<HTMLInputElement>(".tenant-input");
console.log(tenantInput?.value);        // ✅ `.value` exists now

// (2) A type assertion with `as`.
const tenantInput2 = document.querySelector(".tenant-input") as HTMLInputElement;
console.log(tenantInput2.value);
//
// ⚠️ `as` is a PROMISE YOU MAKE TO THE COMPILER, not a check. Note it also
// silently removed `| null` -- if the element is missing this crashes at
// runtime with "Cannot read properties of null". Prefer (1) or (3).

// (3) instanceof -- the only one that VERIFIES at runtime.
const maybeInput = document.querySelector(".tenant-input");
if (maybeInput instanceof HTMLInputElement) {
    console.log(maybeInput.value);      // ✅ narrowed, and actually checked
}
// This handles BOTH problems at once: null is excluded, and so is the case
// where `.tenant-input` turns out to be a <div>. Use it when you are unsure.

// getElementById has NO generic -- it always returns `HTMLElement | null`,
// so you need an assertion or instanceof to reach `.value`:
const byId = document.getElementById("tenant-name");
if (byId instanceof HTMLInputElement) {
    console.log(byId.value);
}

// ==========================================
// A4. THE NON-NULL ASSERTION  ( ! )
// ==========================================
// `!` tells TS "trust me, this is not null". It compiles to nothing.
const title = document.querySelector(".modal-title")!;
console.log(title.textContent);
//
// ⚠️ Use it only when the element is guaranteed by the same code that just
// created it. In app code, a real check is almost always better -- `!` turns
// a clear compile error into a mystery runtime crash.

// ==========================================
// A5. querySelectorAll -> NodeListOf<T>
// ==========================================
// Note: NOT nullable. An empty match gives an EMPTY LIST, not null.

const buttons = document.querySelectorAll<HTMLButtonElement>(".modal-footer button");
console.log(buttons.length);

buttons.forEach((button) => {
    button.disabled = false;            // ✅ typed as HTMLButtonElement
});

// A NodeList is not a real array -- no .map, .filter, .reduce. Convert it:
const labels = Array.from(buttons).map((button) => button.textContent);
console.log(labels);

// ==========================================
// A6. EVENTS -- addEventListener IS TYPED PER EVENT NAME
// ==========================================
// TS maps the event NAME to the right event type automatically.

const updateButton = document.querySelector<HTMLButtonElement>("#update-btn");

updateButton?.addEventListener("click", (event) => {
    // `event` is inferred as MouseEvent -- because the name is "click"
    console.log(event.clientX, event.clientY);
});

document.addEventListener("keydown", (event) => {
    // `event` is KeyboardEvent here
    if (event.key === "Escape") {
        console.log("close the modal");
    }
});

// ==========================================
// A7. event.target vs event.currentTarget  (the classic trap)
// ==========================================
// currentTarget = the element the listener is ON        -> well typed
// target        = whatever was actually clicked, which  -> `EventTarget | null`
//                 may be a child element
//
// `EventTarget` has no .value, no .dataset, nothing useful. So `event.target`
// always needs narrowing:

const tenantForm = document.querySelector<HTMLFormElement>("#tenant-form");

tenantForm?.addEventListener("input", (event) => {
    // event.target.value;              // ❌ 'value' does not exist on 'EventTarget'
    if (event.target instanceof HTMLInputElement) {
        console.log("typing:", event.target.value);     // ✅
    }
});

// With an arrow function, `this` is not the element, so currentTarget is the
// reliable one -- but note it is typed `EventTarget | null` too on the Event
// base type, so instanceof is still the safe route.

// ==========================================
// A8. FORMS -- READING VALUES SAFELY
// ==========================================

interface TenantAttributePayload {
    connectorName: string;
    attributeValue: string;
}

function readTenantForm(form: HTMLFormElement): TenantAttributePayload | null {
    // form.elements is typed, but indexing it gives `Element` -- narrow it.
    const nameField = form.elements.namedItem("connectorName");
    const valueField = form.elements.namedItem("attributeValue");

    if (
        !(nameField instanceof HTMLInputElement) ||
        !(valueField instanceof HTMLInputElement)
    ) {
        return null;                    // the form is not shaped as expected
    }

    return {
        connectorName: nameField.value,
        attributeValue: valueField.value.trim()
    };
}

tenantForm?.addEventListener("submit", (event) => {
    event.preventDefault();             // `event` is SubmitEvent
    const payload = readTenantForm(event.currentTarget as HTMLFormElement);
    if (payload === null) {
        console.warn("unexpected form shape");
        return;
    }
    console.log("submitting", payload);
});

// FormData is the other route. ⚠️ Its .get() returns `FormDataEntryValue | null`
// -- that is `string | File`, because a file input lives in the same form.
function readWithFormData(form: HTMLFormElement): string {
    const raw = new FormData(form).get("attributeValue");
    return typeof raw === "string" ? raw : "";      // ✅ narrow away File and null
}
void readWithFormData;

// ==========================================
// A9. dataset AND classList
// ==========================================
const card = document.querySelector<HTMLElement>(".connector-card");

// dataset is `DOMStringMap` -> every value is `string | undefined`.
// HTML attributes are ALWAYS strings; there are no numbers in the DOM.
const connectorId = card?.dataset.connectorId;      // data-connector-id="..."
if (connectorId !== undefined) {
    const numericId = Number(connectorId);          // convert explicitly
    console.log(numericId);
}

card?.classList.add("is-active");
console.log(card?.classList.contains("is-active"));

// ==========================================
// PART B -- API RESPONSE TYPING
// ==========================================

// ==========================================
// B1. THE CORE PROBLEM: .json() RETURNS `any`
// ==========================================
// `fetch` returns Promise<Response>. `response.json()` is typed Promise<any>,
// because TypeScript cannot possibly know what your server sends.
//
// `any` is contagious: it switches OFF every check downstream. This is the
// single biggest source of runtime crashes in typed frontends.

async function fetchUnsafe(): Promise<void> {
    const response = await fetch("/api/connectors/1");
    const data = await response.json();      // `data` is `any`
    console.log(data.nmae);                  // 😬 typo, no error, undefined at runtime
    // console.log(data.a.b.c.d);            // also compiles. also crashes.
}
void fetchUnsafe;

// ==========================================
// B2. THE COMMON FIX: A TYPE ARGUMENT  (an assumption, not a check)
// ==========================================

interface Connector {
    readonly id: string;
    name: string;
    status: "active" | "failed" | "pending";
    lastValidatedAt: string;             // APIs send dates as STRINGS, not Date
}

async function fetchConnector(id: string): Promise<Connector> {
    const response = await fetch(`/api/connectors/${id}`);

    // ⚠️ ALWAYS check ok -- fetch does NOT reject on 404 or 500. It only
    // rejects on a network failure. A 500 with an HTML error page will happily
    // reach .json() and throw a confusing parse error instead.
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as Connector;
}
void fetchConnector;

// This gives you autocomplete and catches typos, which is already a big win.
// But be honest about what it is: `as Connector` is a CLAIM. If the API renames
// a field tomorrow, TS still believes you and the crash happens at runtime,
// far away from the fetch. That is fine for an internal API you control.
// It is not fine for data you cannot trust.

// ==========================================
// B3. A REUSABLE GENERIC CLIENT
// ==========================================
// One place that handles ok-checking and JSON parsing, generic over the shape.
// (See generics.ts -- T links the call site to the return type.)

async function apiGet<T>(url: string): Promise<T> {
    const response = await fetch(url, {
        headers: { Accept: "application/json" }
    });
    if (!response.ok) {
        throw new Error(`GET ${url} failed with ${response.status}`);
    }
    return (await response.json()) as T;
}

async function apiPost<TBody, TResponse>(url: string, body: TBody): Promise<TResponse> {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });
    if (!response.ok) {
        throw new Error(`POST ${url} failed with ${response.status}`);
    }
    return (await response.json()) as TResponse;
}

// Envelope shapes are extremely common -- make the wrapper generic once:
interface ApiEnvelope<T> {
    data: T;
    error: string | null;
}

async function loadConnectors(): Promise<Connector[]> {
    const envelope = await apiGet<ApiEnvelope<Connector[]>>("/api/connectors");
    return envelope.data;                // ✅ typed as Connector[] all the way
}
void loadConnectors;

// ==========================================
// B4. THE HONEST VERSION: `unknown` + A RUNTIME GUARD
// ==========================================
// `unknown` is `any` with the safety on: you can hold it, but you cannot USE it
// until you prove what it is. That proof is a type predicate (see narrowing.ts).

function isConnector(value: unknown): value is Connector {
    if (typeof value !== "object" || value === null) {
        return false;                    // remember: typeof null === "object"
    }
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate.id === "string" &&
        typeof candidate.name === "string" &&
        (candidate.status === "active" ||
            candidate.status === "failed" ||
            candidate.status === "pending") &&
        typeof candidate.lastValidatedAt === "string"
    );
}

async function fetchConnectorChecked(id: string): Promise<Connector> {
    const response = await fetch(`/api/connectors/${id}`);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    const parsed: unknown = await response.json();      // ✅ start from unknown
    if (!isConnector(parsed)) {
        // Fails HERE, at the boundary, with a clear message -- not three
        // components later with "cannot read property of undefined".
        throw new Error("Unexpected response shape from /api/connectors");
    }
    return parsed;                                      // ✅ now truly a Connector
}
void fetchConnectorChecked;

// In a real project you would not hand-write these guards -- a schema library
// (zod, valibot, io-ts) generates both the validator AND the type from one
// schema. The principle is identical: VALIDATE AT THE BOUNDARY, then trust.

// ==========================================
// B5. MODELLING THE REQUEST ITSELF
// ==========================================
// A request is not just its data -- it is also loading and error states.
// A discriminated union makes the impossible states unrepresentable:
// you can never have `loading: true` and `data` at the same time.

type RequestState<T> =
    | { status: "idle" }
    | { status: "loading" }
    | { status: "success"; data: T }
    | { status: "error"; message: string };

function renderConnectors(state: RequestState<Connector[]>): string {
    switch (state.status) {
        case "idle":
            return "Nothing loaded yet";
        case "loading":
            return "Loading...";
        case "success":
            return `${state.data.length} connectors`;   // ✅ only here does data exist
        case "error":
            return `Error: ${state.message}`;
        default: {
            const exhaustive: never = state;            // ✅ compile-time completeness
            return exhaustive;
        }
    }
}
console.log(renderConnectors({ status: "loading" }));

// Compare with the shape people usually reach for first:
//   { loading: boolean; data: Connector[] | null; error: string | null }
// That allows 8 combinations, most of them nonsense, and every read of `data`
// needs a null check. The union allows exactly 4, all of them meaningful.

// ==========================================
// B6. ERRORS ARE `unknown` IN catch
// ==========================================
// JavaScript lets you `throw` anything -- a string, a number, an object. So TS
// types the catch variable as `unknown` and makes you narrow it.

async function loadSafely(id: string): Promise<RequestState<Connector>> {
    try {
        const connector = await fetchConnectorChecked(id);
        return { status: "success", data: connector };
    } catch (error) {
        // error.message;                   // ❌ 'error' is of type 'unknown'
        const message =
            error instanceof Error ? error.message : "Unknown error";
        return { status: "error", message };
    }
}
void loadSafely;

// ==========================================
// B7. DATES, IDs AND OTHER LIES THE TYPE CAN TELL
// ==========================================
// JSON has no Date type. `lastValidatedAt: string` above is correct for the
// wire, but your UI wants a Date. Convert at the boundary and keep two types:

interface ConnectorDto {                 // exactly what the wire sends
    id: string;
    name: string;
    status: "active" | "failed" | "pending";
    lastValidatedAt: string;
}

interface ConnectorModel {               // what the rest of your app uses
    id: string;
    name: string;
    status: "active" | "failed" | "pending";
    lastValidatedAt: Date;
}

function toModel(dto: ConnectorDto): ConnectorModel {
    return { ...dto, lastValidatedAt: new Date(dto.lastValidatedAt) };
}

const model = toModel({
    id: "3e7c6c8b",
    name: "entra_lakshmi [v21]",
    status: "failed",
    lastValidatedAt: "2026-09-09T13:03:00Z"
});
console.log(model.lastValidatedAt.getFullYear());   // ✅ a real Date

// ⚠️ If you had typed the response as ConnectorModel directly, TS would let you
// call .getFullYear() on what is actually a string. It compiles; it crashes.
// This is the most common "the types lied to me" bug in frontend code.

// ==========================================
// B8. QUICK SUMMARY
// ==========================================
// -- DOM --
// querySelector(sel)              -> Element | null      (always handle null)
// querySelector<HTMLInputElement> -> the specific type, still nullable
// as HTMLInputElement             -> a promise, not a check; also drops null
// x instanceof HTMLInputElement   -> the only form that VERIFIES at runtime
// querySelectorAll<T>             -> NodeListOf<T>, never null, not an array
// addEventListener("click", ...)  -> event type inferred from the NAME
// event.currentTarget             -> the listener's element
// event.target                    -> EventTarget | null; narrow before use
// dataset / attributes            -> always string | undefined; convert yourself
//
// -- API --
// response.json()                 -> any    ⚠️ turns off all checking
// as T                            -> an assumption; fine for APIs you control
// unknown + a type guard          -> verified; fails loudly at the boundary
// if (!response.ok) throw         -> fetch does NOT reject on 404/500
// catch (error)                   -> unknown; use `error instanceof Error`
// RequestState<T> union           -> makes impossible states unrepresentable
// Dto vs Model                    -> convert dates/ids once, at the edge
//
// The rule for both halves: TypeScript protects you INSIDE your program.
// At every boundary you either verify, or you are trusting on faith --
// so at least know which one you chose.

export { readTenantForm, apiGet, apiPost, isConnector, toModel };
export type { Connector, ConnectorDto, ConnectorModel, RequestState, ApiEnvelope };
