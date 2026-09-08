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
let status: Status;
status = "loading"; // ✅
status = "success"; // ✅
status = "error";   // ✅
status = "failed";  // ❌

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