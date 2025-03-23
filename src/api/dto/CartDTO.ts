import mongoose from "mongoose";
import { ICart, ICartProduct } from "../models/carts";

export interface CartDTO {
    totalPrice: number,
    products: ICartProduct[]
}

export const convertToCartDTO = (cart: ICart): CartDTO => ({
    totalPrice: cart.totalPrice,
    products: cart.products
})