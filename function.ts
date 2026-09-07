function add(a:number,b:number):number{
    return a+b;
}

// function functionName(
//   parameter: type
// ): returnType {
//   // code
// }

function showMessage(message: string): void {
  console.log(message);
}

//optional parameter we can give its type or it will be udefined
// create a template string.
// Inside a template string, you can put normal text and variables together.

function greet(name: string, title?: string): string {
  if (title) {
    return `Hello ${title} ${name}`;
  }

  return `Hello ${name}`;
}

console.log(greet("Rahul"));
console.log(greet("Rahul", "Mr."));



console.log(`My name is ${name} and I am ${age} years old`);

//default parameter
function calculatePrice(
  price: number,
  quantity: number = 1
): number {
  return price * quantity;
}
console.log(calculatePrice(500));    // 500
console.log(calculatePrice(500, 3)); // 1500


//function accepting object as parameter
function displayUser(user: {
  name: string;
  age: number;
}): string {
  return `${user.name} is ${user.age} years old`;
}

const message = displayUser({
  name: "Rahul",
  age: 25
});

//It is called a rest parameter.
