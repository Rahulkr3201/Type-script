//this is Type inference ->TypeScript determines the type from the value
const name="rahul";
const age=20;
const isLoading=true;
console.log(name);
console.log(age);
console.log(isLoading);

//this is Explicit type annotation-> You tell TypeScript the type:
const userName:string ="rahul kunar";
const roll:number=3200
const isLoad:boolean=false;
console.log(userName);
console.log(roll);
console.log(isLoad);

//prefer Use explicit types for:
// Function parameters
// Function return types
// Empty arrays
// Complex objects
// Public APIs
// Class properties when inference is unclear
// ==========================================
// 1. FUNCTION PARAMETERS
// ==========================================
// Explicitly define the type of every parameter
function calculateTotal(price: number, quantity: number): number {
  return price * quantity;
}

const total: number = calculateTotal(500, 2);
console.log(total); // 1000
// ==========================================
// 2. FUNCTION RETURN TYPES
// ==========================================

// Explicit return type helps prevent accidental returns
function getGreeting(name: string): string {
  return `Hello, ${name}`;
}

// A function that does not return anything uses void
function displayMessage(message: string): void {
  console.log(message);
}
// An asynchronous function returns Promise<Type>
async function getUserName(): Promise<string> {
  return "Rahul";
}
// ==========================================
// 3. EMPTY ARRAYS
// ==========================================

// Mention the expected element type for an empty array
const productNames: string[] = [];//one way to define array type
let names:Array<string> = [];
let namess:string[] = [];

productNames.push("Laptop");
productNames.push("Phone");
// productNames.push(100); // Error: number is not assignable to string
interface Product {
  id: number;
  name: string;
  price: number;
}

const products: Product[] = [];

products.push({
  id: 1,
  name: "Laptop",
  price: 50000,
});

// ==========================================
// 4. COMPLEX OBJECTS
// ==========================================

interface Address {
  city: string;
  state: string;
  pinCode: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  address: Address;
  skills: string[];
}

const user: User = {
  id: 1,
  name: "Rahul",
  email: "rahul@example.com",
  isActive: true,
  address: {
    city: "Bengaluru",
    state: "Karnataka",
    pinCode: 560001,
  },
  skills: ["JavaScript", "TypeScript", "Angular"],
};


// ==========================================
// 5. PUBLIC APIs / EXPORTED FUNCTIONS
// ==========================================

// Public functions should clearly specify their input
// and output types.

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Order {
  orderId: string;
  amount: number;
  status: "pending" | "completed" | "failed";
}

export async function getOrder(
  orderId: string
): Promise<ApiResponse<Order>> {
  const order: Order = {
    orderId,
    amount: 1500,
    status: "completed",
  };

  return {
    success: true,
    message: "Order fetched successfully",
    data: order,
  };
}


// ==========================================
// 6. CLASS PROPERTIES
// ==========================================
class Employee {
  // Explicit property types
  public id: number;
  public name: string;
  private salary: number;
  public skills: string[];
  public manager?: Employee; // Optional property

  constructor(id: number, name: string, salary: number) {
    this.id = id;
    this.name = name;
    this.salary = salary;
    this.skills = [];
  }

  public addSkill(skill: string): void {
    this.skills.push(skill);
  }

  public getSalary(): number {
    return this.salary;
  }
}

const employee: Employee = new Employee(1, "Rahul", 50000);

employee.addSkill("TypeScript");
employee.addSkill("Angular");

console.log(employee.skills); // ["TypeScript", "Angular"]

// ==========================================
// 7. TYPE ALIAS  ( type  vs  interface )
// ==========================================

// `type` creates a NAME for a shape. Unlike let/const it holds no value --
// it exists only during type checking and disappears from the compiled .js.

// ------------------------------------------
// 7.1 Object shapes: both work, interchangeable
// ------------------------------------------

type StudentType = {
  name: string;
  rollNo: number;
};

interface StudentInterface {
  name: string;
  rollNo: number;
}

const s1: StudentType = { name: "Rahul", rollNo: 123 };
const s2: StudentInterface = { name: "Amit", rollNo: 124 };

// ------------------------------------------
// 7.2 Unions: ONLY type can do this
// ------------------------------------------

type PaymentStatus = "pending" | "completed" | "failed";
type StudentId = string | number;

// interface PaymentStatus = "pending" | "completed"; // Error: impossible, an
// interface always describes exactly one object shape

function findStudent(id: StudentId): void {
  console.log(`Searching for ${id}`);
}

findStudent(101);
findStudent("STU-101");

// ------------------------------------------
// 7.3 Declaration merging: ONLY interface can do this
// ------------------------------------------

// Declaring the same interface twice MERGES the two declarations
interface AppConfig {
  apiUrl: string;
}

interface AppConfig {
  timeout: number;
}

// AppConfig is now { apiUrl: string; timeout: number } -- both are required
const config: AppConfig = {
  apiUrl: "https://api.example.com",
  timeout: 5000,
};

// type AppConfig = { apiUrl: string };
// type AppConfig = { timeout: number }; // Error: Duplicate identifier 'AppConfig'

// This is why libraries use interface for public APIs: consumers can add fields
// from their own file. In app code it is a footgun -- two accidental
// `interface User` declarations merge silently instead of warning you.

// ------------------------------------------
// 7.4 Combining: extends  vs  &
// ------------------------------------------

interface Animal {
  name: string;
}

// interface uses extends
interface Dog extends Animal {
  breed: string;
}

// type uses an intersection (&)
type Cat = Animal & {
  livesLeft: number;
};

const dog: Dog = { name: "Bruno", breed: "Labrador" };
const cat: Cat = { name: "Kitty", livesLeft: 9 };

// Difference on CONFLICTING fields:

// interface Broken extends Animal { name: number; }
// Error: Interface 'Broken' incorrectly extends 'Animal' -- caught immediately

type Silent = Animal & { name: number };
// No error here, but `name` is now `never` (nothing is both string and number),
// so the type is unusable and you only find out at the assignment site:
// const bad: Silent = { name: "x" }; // Error: string is not assignable to never

// ------------------------------------------
// 7.5 Non-object types: ONLY type
// ------------------------------------------

type Email = string;                         // primitive alias, for readability
type Coordinates = [number, number];         // tuple
type ClickHandler = (event: string) => void; // function signature
type StudentKeys = keyof StudentType;        // "name" | "rollNo"
type PartialStudent = { [K in StudentKeys]?: StudentType[K] }; // mapped type

const email: Email = "rahul@example.com";
const coords: Coordinates = [12.97, 77.59];
const onClick: ClickHandler = (event) => console.log(event);
const draft: PartialStudent = { name: "Rahul" }; // rollNo is optional here

// ------------------------------------------
// 7.6 Summary
// ------------------------------------------

// FEATURE                        type    interface
// object shapes                   yes       yes
// unions (|)                      yes       NO
// primitives / tuples / fns       yes       NO
// mapped & conditional types      yes       NO
// declaration merging             NO        yes
// combine with                    &         extends
// catches conflicting fields      NO        yes
// implements on a class           yes       yes

// RULE OF THUMB: interface for object and class shapes, type for unions,
// primitives, functions and tuples. For a plain object shape they are
// interchangeable -- what matters is picking one and being consistent.
