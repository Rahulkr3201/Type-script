// Create a product containing:
// id: number
// name: string
// price: number
// inStock: boolean

// Create an array containing three product names.

// Write a function that accepts:
// price: number
// quantity: number
// and returns the total as a number.

const product:{
    id:number;
    name:string;
    price:number;
    inStock:boolean;
}

const productNames:Array<string> = ["Laptop", "Phone", "Tablet"];

function calculateTotal(price:number, quantity:number):number{
    return price*quantity;
}