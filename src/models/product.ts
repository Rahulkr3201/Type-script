// ==========================================
// src/models/product.ts
// ==========================================
// Notice: this file also declares a `name` property and a `DEFAULT_ROLE`-style
// const could live here too, with no clash against user.ts.
// That is the whole point of modules -- names are LOCAL to their file.

export interface Product {
    readonly id: number;
    name: string;
    price: number;
    inStock: boolean;
}

export function formatPrice(product: Product): string {
    return `${product.name} - ₹${product.price}`;
}
