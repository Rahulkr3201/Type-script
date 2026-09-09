//without interface we used to do
let user:{
    name:string;
    age:number;
    rollNo:number;
    drink:boolean;
}={
    name:"rahul",
    age:22,
    rollNo:123,
    drink:true
}
// for just decalration of interface we can use interface keyword
interface User{
    name:string;
    age:number;
}
// Extending Interfaces
// This is where interfaces become useful.

interface User {
    id: number;
    name: string;
}

interface Admin extends User {
    permissions: string[];
}
const admin:Admin={
    id:1,
    name:"Rahul",
    permissions:["read","write"]
}


//You can declare the same interface twice: typescript combines them into a single interface. This is called declaration merging.
interface User {
    id: number;
}
interface User {
    name: string;
}
//output of above code will be
interface User {
    id: number;
    name: string;
}
//but we cant do this with type aliases. If you try to declare the same type alias twice, TypeScript will throw an error.
//use type for the unions eg type Status = "loading" | "success" | "error";
//use interface for the Use interface for object contracts
