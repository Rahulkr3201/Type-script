let id:number|string;
id=10;
id="10";

function printUserId(id: string | number) {
    console.log(`User ID: ${id}`);
}

printUserId(101);
printUserId("USR-101");

//Literal Types
type Status = "loading" | "success" | "error";
// NOTE: renamed from `status` -- this file has no import/export, so it is a
// script and its top-level names sit in the GLOBAL scope, where `status`
// already exists (the DOM's window.status). Real project files are modules,
// so their names stay local and this clash does not happen.
let currentStatus: Status;
currentStatus = "loading"; // ✅
currentStatus = "success"; // ✅
currentStatus = "error";   // ✅
// The directive below tells TS "the next line MUST error" -- it keeps this
// demo in the file without breaking the build, and warns you if the line
// ever stops erroring (e.g. if you later add "failed" to Status).
// @ts-expect-error
currentStatus = "failed";  // ❌ Type '"failed"' is not assignable to type 'Status'.

//and 
type Person = {
    name: string;
    age: number;
};
type Employee = {
    employeeId: number;
    department: string;
};
type EmployeePerson = Person & Employee;
const employee: EmployeePerson = {
    name: "Rahul",
    age: 22,
    employeeId: 101,
    department: "Engineering"
};

// Practical rule: interface for object/class shapes, type for unions, primitives, functions, and tuples.