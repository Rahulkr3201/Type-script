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

//Type allias 